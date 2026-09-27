const db = require("../config/db");

const {
    calculateRiskScore
} = require("../services/fraudService");

const {
    generateOTP
} = require("../services/otpService");


async function pay(req, res) {

    const {
        card_id,
        cardNumber,
        amount,
        merchant,
        location
    } = req.body;


    // Accept either card_id or cardNumber
    const cardIdentifier = card_id || cardNumber;


    // Basic validation
    if (
        cardIdentifier === undefined ||
        amount === undefined ||
        merchant === undefined ||
        location === undefined
    ) {
        return res.status(400).json({
            success: false,
            message: "Card, amount, merchant and location are required"
        });
    }


    // Validate amount
    if (Number(amount) <= 0) {
        return res.status(400).json({
            success: false,
            message: "Amount must be greater than 0"
        });
    }


    const connection = await db.getConnection();


    try {

        await connection.beginTransaction();


        // --------------------------------------------------
        // 1. Find the card
        // --------------------------------------------------

        let cardQuery;
        let cardParams;


        if (card_id !== undefined) {

            cardQuery = `
                SELECT
                    Card_ID,
                    Customer_ID,
                    Card_Number,
                    Card_Status
                FROM CREDIT_CARD
                WHERE Card_ID = ?
            `;

            cardParams = [card_id];

        } else {

            cardQuery = `
                SELECT
                    Card_ID,
                    Customer_ID,
                    Card_Number,
                    Card_Status
                FROM CREDIT_CARD
                WHERE Card_Number = ?
            `;

            cardParams = [cardNumber];
        }


        const [cards] = await connection.query(
            cardQuery,
            cardParams
        );


        if (cards.length === 0) {

            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Card not found"
            });
        }


        const card = cards[0];


        // --------------------------------------------------
        // 2. Check card status
        // --------------------------------------------------

        if (card.Card_Status &&
            card.Card_Status.toLowerCase() !== "active") {

            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "Card is not active"
            });
        }


        // --------------------------------------------------
        // 3. Calculate fraud-rule conditions
        // --------------------------------------------------

        const currentTime = new Date();

        const numericAmount = Number(amount);


        // Prototype threshold from project specification
        const highValue = numericAmount >= 50000;


        // Unusual hours: 12 AM - 5 AM
        const currentHour = currentTime.getHours();

        const unusualHour =
            currentHour >= 0 &&
            currentHour < 5;


        const highValueDuringUnusualHours =
            highValue && unusualHour;


        // --------------------------------------------------
        // Rule: Same card used in different cities
        // within the previous 10 minutes
        // --------------------------------------------------

        const [cityMatches] = await connection.query(`
            SELECT Transaction_ID
            FROM \`TRANSACTION\`
            WHERE Card_ID = ?
              AND Location <> ?
              AND Transaction_Time >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)
              AND Transaction_Time <= NOW()
            LIMIT 1
        `, [
            card.Card_ID,
            location
        ]);


        const differentCitiesWithin10Minutes =
            cityMatches.length > 0;


        // --------------------------------------------------
        // Rule: More than 5 transactions within 5 minutes
        // --------------------------------------------------

        const [recentTransactions] = await connection.query(`
            SELECT COUNT(*) AS transaction_count
            FROM \`TRANSACTION\`
            WHERE Card_ID = ?
              AND Transaction_Time >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
              AND Transaction_Time <= NOW()
        `, [
            card.Card_ID
        ]);


        const moreThanFiveTransactionsWithin5Minutes =
            recentTransactions[0].transaction_count >= 5;


        // --------------------------------------------------
        // 4. Calculate risk score
        // --------------------------------------------------

        const riskResult = calculateRiskScore({
            highValue,
            differentCitiesWithin10Minutes,
            moreThanFiveTransactionsWithin5Minutes,
            highValueDuringUnusualHours
        });


        let status;


        if (riskResult.action === "APPROVE") {
            status = "Approved";
        }
        else if (riskResult.action === "OTP") {
            status = "OTP Verification";
        }
        else {
            status = "Blocked";
        }


        // --------------------------------------------------
        // 5. Insert transaction
        // --------------------------------------------------

        const fraudReason =
    riskResult.reasons.length > 0
        ? riskResult.reasons.join("; ")
        : null;


const [transactionResult] = await connection.query(`
    INSERT INTO \`TRANSACTION\`
    (
        Card_ID,
        Amount,
        Merchant,
        Location,
        Transaction_Time,
        Risk_Score,
        Status,
        Fraud_Reason
    )
    VALUES (?, ?, ?, ?, NOW(), ?, ?, ?)
`, [
    card.Card_ID,
    numericAmount,
    merchant,
    location,
    riskResult.score,
    status,
    fraudReason
]);


        const transactionId =
            transactionResult.insertId;


        // --------------------------------------------------
        // 6. Create OTP if required
        // --------------------------------------------------

        let otp = null;


        if (riskResult.action === "OTP") {

            otp = generateOTP();


            await connection.query(`
                INSERT INTO OTP_VERIFICATION
                (
                    Transaction_ID,
                    OTP,
                    Expiry_Time,
                    Attempts,
                    Verification_Status
                )
                VALUES (
                    ?,
                    ?,
                    DATE_ADD(NOW(), INTERVAL 10 MINUTE),
                    0,
                    'Pending'
                )
            `, [
                transactionId,
                otp
            ]);
        }


        // --------------------------------------------------
        // 7. Create fraud alert for high-risk transaction
        // --------------------------------------------------

        if (riskResult.action === "BLOCK") {

            await connection.query(`
                INSERT INTO FRAUD_ALERT
                (
                    Transaction_ID,
                    Fraud_Reason,
                    Risk_Level,
                    Alert_Time
                )
                VALUES (?, ?, ?, NOW())
            `, [
                transactionId,
                riskResult.reasons.join("; "),
                riskResult.riskLevel
            ]);
        }


        await connection.commit();


        // --------------------------------------------------
        // 8. Return result to frontend
        // --------------------------------------------------

        return res.status(200).json({
            success: true,
            transaction_id: transactionId,
            risk_score: riskResult.score,
            risk_level: riskResult.riskLevel,
            action: riskResult.action,
            status,
            reasons: riskResult.reasons,
            otp_required: riskResult.action === "OTP",

            // Demo/testing only.
            // In a real system the OTP would be sent securely.
            ...(otp ? { demo_otp: otp } : {})
        });


    } catch (error) {

        await connection.rollback();

        console.error("Payment processing error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Payment processing failed",
            error: error.message
        });

    } finally {

        connection.release();
    }
}


module.exports = {
    pay
};