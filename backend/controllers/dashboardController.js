const db = require("../config/db");

async function getDashboardStats(req, res) {
    try {
        const [total] = await db.query(`
            SELECT COUNT(*) AS total
            FROM \`TRANSACTION\`
        `);

        const [approved] = await db.query(`
            SELECT COUNT(*) AS approved
            FROM \`TRANSACTION\`
            WHERE Status = 'Approved'
        `);

        const [otp] = await db.query(`
            SELECT COUNT(*) AS otp_required
            FROM \`TRANSACTION\`
            WHERE Status = 'OTP Verification'
        `);

        const [blocked] = await db.query(`
            SELECT COUNT(*) AS blocked
            FROM \`TRANSACTION\`
            WHERE Status = 'Blocked'
        `);

        const [alerts] = await db.query(`
            SELECT COUNT(*) AS fraud_alerts
            FROM FRAUD_ALERT
        `);

        return res.status(200).json({
            success: true,
            data: {
                total_transactions: total[0].total,
                approved: approved[0].approved,
                otp_required: otp[0].otp_required,
                blocked: blocked[0].blocked,
                fraud_alerts: alerts[0].fraud_alerts
            }
        });

    } catch (error) {
        console.error("Dashboard stats error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve dashboard statistics",
            error: error.message
        });
    }
}

module.exports = {
    getDashboardStats
};