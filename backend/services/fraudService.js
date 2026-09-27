function calculateRiskScore({
    highValue = false,
    differentCitiesWithin10Minutes = false,
    moreThanFiveTransactionsWithin5Minutes = false,
    highValueDuringUnusualHours = false
}) {

    let score = 0;
    let reasons = [];

    // Rule 1: High-value transaction
    if (highValue) {
        score += 30;
        reasons.push("High transaction amount");
    }

    // Rule 2: Same card used in different cities within 10 minutes
    if (differentCitiesWithin10Minutes) {
        score += 40;
        reasons.push("Same card used in different cities within 10 minutes");
    }

    // Rule 3: More than 5 transactions within 5 minutes
    if (moreThanFiveTransactionsWithin5Minutes) {
        score += 20;
        reasons.push("More than 5 transactions within 5 minutes");
    }

    // Rule 4: High-value transaction during unusual hours
    if (highValueDuringUnusualHours) {
        score += 10;
        reasons.push("High-value transaction during unusual hours");
    }

    // Maximum risk score is 100
    if (score > 100) {
        score = 100;
    }

    let riskLevel;
    let action;

    if (score <= 29) {
        riskLevel = "LOW";
        action = "APPROVE";
    }
    else if (score <= 59) {
        riskLevel = "MEDIUM";
        action = "OTP";
    }
    else {
        riskLevel = "HIGH";
        action = "BLOCK";
    }

    return {
        score,
        riskLevel,
        action,
        reasons
    };
}

module.exports = {
    calculateRiskScore
};