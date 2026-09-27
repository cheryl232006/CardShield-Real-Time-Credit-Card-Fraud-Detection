const db = require("../config/db");

// ============================================================
// Get all transactions
// ============================================================

async function getTransactions(req, res) {
    try {

        const [rows] = await db.query(`
            SELECT
    t.Transaction_ID,
    t.Card_ID,
    c.Customer_ID,
    c.Customer_Name,
    cc.Card_Number,
    t.Amount,
    t.Merchant,
    t.Location,
    t.Transaction_Time,
    t.Risk_Score,
    t.Status,
    t.Fraud_Reason,

    fa.Fraud_Reason AS Alert_Fraud_Reason,
    fa.Risk_Level AS Alert_Risk_Level,
    fa.Alert_Time

            FROM \`TRANSACTION\` t

            JOIN CREDIT_CARD cc
                ON t.Card_ID = cc.Card_ID

            JOIN CUSTOMER c
                ON cc.Customer_ID = c.Customer_ID

            LEFT JOIN FRAUD_ALERT fa
                ON t.Transaction_ID = fa.Transaction_ID

            ORDER BY t.Transaction_Time DESC
        `);

        res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });

    } catch (error) {

        console.error(
            "Error retrieving transactions:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to retrieve transactions",
            error: error.message
        });
    }
}


// ============================================================
// Get transactions for a specific customer
// ============================================================

async function getCustomerTransactions(req, res) {

    const customerId = req.params.id;

    if (!customerId) {
        return res.status(400).json({
            success: false,
            message: "Customer ID is required"
        });
    }

    try {

        const [rows] = await db.query(`
            SELECT
                t.Transaction_ID,
                t.Card_ID,

                cc.Card_Number,

                t.Amount,
                t.Merchant,
                t.Location,
                t.Transaction_Time,
                t.Risk_Score,
                t.Status,

                fa.Fraud_Reason,
                fa.Risk_Level AS Alert_Risk_Level,
                fa.Alert_Time

            FROM \`TRANSACTION\` t

            JOIN CREDIT_CARD cc
                ON t.Card_ID = cc.Card_ID

            LEFT JOIN FRAUD_ALERT fa
                ON t.Transaction_ID = fa.Transaction_ID

            WHERE cc.Customer_ID = ?

            ORDER BY t.Transaction_Time DESC
        `, [customerId]);

        return res.status(200).json({
            success: true,
            customer_id: customerId,
            count: rows.length,
            data: rows
        });

    } catch (error) {

        console.error(
            "Customer transaction history error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve customer transactions",
            error: error.message
        });
    }
}


// ============================================================
// Export Controllers
// ============================================================

module.exports = {
    getTransactions,
    getCustomerTransactions
};