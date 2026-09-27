const express = require("express");

const {
    getTransactions,
    getCustomerTransactions
} = require("../controllers/transactionController");

const router = express.Router();

router.get("/transactions", getTransactions);

router.get("/customer/:id/transactions", getCustomerTransactions);

module.exports = router;