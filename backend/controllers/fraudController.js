const db = require("../config/db");

async function getFraudAlerts(req, res) {
    try {
        const [rows] = await db.query(`
            SELECT
                f.Alert_ID,
                f.Transaction_ID,
                f.Fraud_Reason,
                f.Risk_Level,
                f.Alert_Time,
                t.Amount,
                t.Merchant,
                t.Location,
                t.Risk_Score,
                t.Status,
                cc.Card_Number,
                c.Customer_Name
            FROM FRAUD_ALERT f
            JOIN \`TRANSACTION\` t
                ON f.Transaction_ID = t.Transaction_ID
            JOIN CREDIT_CARD cc
                ON t.Card_ID = cc.Card_ID
            JOIN CUSTOMER c
                ON cc.Customer_ID = c.Customer_ID
            ORDER BY f.Alert_Time DESC
        `);

        return res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });

    } catch (error) {
        console.error("Fraud alerts error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve fraud alerts",
            error: error.message
        });
    }
}

module.exports = {
    getFraudAlerts
};