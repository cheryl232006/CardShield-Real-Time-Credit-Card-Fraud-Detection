const express = require("express");

const {
    getFraudAlerts
} = require("../controllers/fraudController");

const router = express.Router();

router.get("/fraud-alerts", getFraudAlerts);

module.exports = router;