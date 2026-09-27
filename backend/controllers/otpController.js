const db = require("../config/db");

const {
    isOTPExpired,
    isMaximumAttemptsReached
} = require("../services/otpService");


async function verifyOtp(req, res) {

    const {
        transaction_id,
        otp
    } = req.body;


    if (
        transaction_id === undefined ||
        otp === undefined
    ) {
        return res.status(400).json({
            success: false,
            message: "Transaction ID and OTP are required"
        });
    }


    const connection = await db.getConnection();


    try {

        await connection.beginTransaction();


        // Get OTP record
        const [otpRecords] = await connection.query(`
            SELECT
                OTP_ID,
                Transaction_ID,
                OTP,
                Expiry_Time,
                Attempts,
                Verification_Status
            FROM OTP_VERIFICATION
            WHERE Transaction_ID = ?
            ORDER BY OTP_ID DESC
            LIMIT 1
        `, [transaction_id]);


        if (otpRecords.length === 0) {

            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "OTP record not found"
            });
        }


        const otpRecord = otpRecords[0];


        // Check whether OTP has already been completed
        if (otpRecord.Verification_Status === "Verified") {

            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "OTP has already been verified"
            });
        }


        // Check whether OTP is already blocked
        if (otpRecord.Verification_Status === "Blocked") {

            await connection.rollback();

            return res.status(403).json({
                success: false,
                message: "OTP verification is blocked"
            });
        }


        // Check expiry
        if (isOTPExpired(otpRecord.Expiry_Time)) {

            await connection.query(`
                UPDATE OTP_VERIFICATION
                SET Verification_Status = 'Expired'
                WHERE OTP_ID = ?
            `, [otpRecord.OTP_ID]);


            await connection.commit();

            return res.status(400).json({
                success: false,
                message: "OTP has expired"
            });
        }


        // Check maximum attempts
        if (isMaximumAttemptsReached(otpRecord.Attempts)) {

            await connection.query(`
                UPDATE OTP_VERIFICATION
                SET Verification_Status = 'Blocked'
                WHERE OTP_ID = ?
            `, [otpRecord.OTP_ID]);


            await connection.query(`
                UPDATE \`TRANSACTION\`
                SET Status = 'Blocked'
                WHERE Transaction_ID = ?
            `, [transaction_id]);


            await connection.commit();

            return res.status(403).json({
                success: false,
                message: "Maximum OTP attempts reached. Transaction blocked."
            });
        }


        // Check OTP
        if (String(otp) !== String(otpRecord.OTP)) {

            const newAttempts = otpRecord.Attempts + 1;


            if (newAttempts >= 3) {

                await connection.query(`
                    UPDATE OTP_VERIFICATION
                    SET
                        Attempts = ?,
                        Verification_Status = 'Blocked'
                    WHERE OTP_ID = ?
                `, [
                    newAttempts,
                    otpRecord.OTP_ID
                ]);


                // Block transaction
                await connection.query(`
                    UPDATE \`TRANSACTION\`
                    SET Status = 'Blocked'
                    WHERE Transaction_ID = ?
                `, [transaction_id]);


                // Create fraud alert
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
                    transaction_id,
                    "Three incorrect OTP attempts",
                    "HIGH"
                ]);


                await connection.commit();


                return res.status(403).json({
                    success: false,
                    message: "Incorrect OTP. Maximum attempts reached. Transaction blocked.",
                    attempts: newAttempts
                });
            }


            // Incorrect OTP but attempts remain
            await connection.query(`
                UPDATE OTP_VERIFICATION
                SET
                    Attempts = ?,
                    Verification_Status = 'Pending'
                WHERE OTP_ID = ?
            `, [
                newAttempts,
                otpRecord.OTP_ID
            ]);


            await connection.commit();


            return res.status(400).json({
                success: false,
                message: "Incorrect OTP",
                attempts: newAttempts,
                remaining_attempts: 3 - newAttempts
            });
        }


        // Correct OTP
        await connection.query(`
            UPDATE OTP_VERIFICATION
            SET
                Verification_Status = 'Verified'
            WHERE OTP_ID = ?
        `, [otpRecord.OTP_ID]);


        await connection.query(`
            UPDATE \`TRANSACTION\`
            SET Status = 'Approved'
            WHERE Transaction_ID = ?
        `, [transaction_id]);


        await connection.commit();


        return res.status(200).json({
            success: true,
            message: "OTP verified successfully. Transaction approved.",
            transaction_id: transaction_id,
            status: "Approved"
        });


    } catch (error) {

        await connection.rollback();

        console.error("OTP verification error:", error.message);

        return res.status(500).json({
            success: false,
            message: "OTP verification failed",
            error: error.message
        });

    } finally {

        connection.release();
    }
}


module.exports = {
    verifyOtp
};