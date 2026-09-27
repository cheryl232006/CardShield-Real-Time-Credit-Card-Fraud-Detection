CREATE DATABASE IF NOT EXISTS cardshield_db;
USE cardshield_db;

-- 1. CUSTOMER TABLE
CREATE TABLE CUSTOMER (
    Customer_ID INT PRIMARY KEY AUTO_INCREMENT,
    Customer_Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Phone VARCHAR(15) NOT NULL
);


-- 2. CREDIT_CARD TABLE
CREATE TABLE CREDIT_CARD (
    Card_ID INT PRIMARY KEY AUTO_INCREMENT,
    Customer_ID INT NOT NULL,
    Card_Number VARCHAR(16) UNIQUE NOT NULL,
    Expiry_Date DATE NOT NULL,
    Credit_Limit DECIMAL(10,2) NOT NULL,
    Card_Status VARCHAR(20) NOT NULL,
    FOREIGN KEY (Customer_ID)
        REFERENCES CUSTOMER(Customer_ID)
);


-- 3. TRANSACTION TABLE
CREATE TABLE `TRANSACTION` (
    Transaction_ID INT PRIMARY KEY AUTO_INCREMENT,
    Card_ID INT NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    Merchant VARCHAR(100) NOT NULL,
    Location VARCHAR(50) NOT NULL,
    Transaction_Time DATETIME NOT NULL,
    Risk_Score INT NOT NULL,
    Status VARCHAR(30) NOT NULL,
    FOREIGN KEY (Card_ID)
        REFERENCES CREDIT_CARD(Card_ID)
);


-- 4. OTP_VERIFICATION TABLE
CREATE TABLE OTP_VERIFICATION (
    OTP_ID INT PRIMARY KEY AUTO_INCREMENT,
    Transaction_ID INT NOT NULL,
    OTP CHAR(6) NOT NULL,
    Expiry_Time DATETIME NOT NULL,
    Attempts INT DEFAULT 0,
    Verification_Status VARCHAR(20) NOT NULL,
    FOREIGN KEY (Transaction_ID)
        REFERENCES `TRANSACTION`(Transaction_ID)
);


-- 5. FRAUD_ALERT TABLE
CREATE TABLE FRAUD_ALERT (
    Alert_ID INT PRIMARY KEY AUTO_INCREMENT,
    Transaction_ID INT NOT NULL,
    Fraud_Reason VARCHAR(255) NOT NULL,
    Risk_Level VARCHAR(20) NOT NULL,
    Alert_Time DATETIME NOT NULL,
    FOREIGN KEY (Transaction_ID)
        REFERENCES `TRANSACTION`(Transaction_ID)
);


-- 6. INDEXES
CREATE INDEX idx_transaction_card
ON `TRANSACTION` (Card_ID);

CREATE INDEX idx_transaction_time
ON `TRANSACTION` (Transaction_Time);

CREATE INDEX idx_transaction_risk
ON `TRANSACTION` (Risk_Score);


-- 7. VIEWS
CREATE VIEW CustomerTransactionView AS
SELECT
    C.Customer_ID,
    C.Customer_Name,
    C.Email,
    CC.Card_ID,
    CC.Card_Number,
    T.Transaction_ID,
    T.Amount,
    T.Merchant,
    T.Location,
    T.Transaction_Time,
    T.Risk_Score,
    T.Status
FROM CUSTOMER C
INNER JOIN CREDIT_CARD CC
    ON C.Customer_ID = CC.Customer_ID
INNER JOIN `TRANSACTION` T
    ON CC.Card_ID = T.Card_ID;

CREATE VIEW FraudAlertView AS
SELECT
    C.Customer_Name,
    CC.Card_Number,
    T.Transaction_ID,
    T.Amount,
    T.Merchant,
    T.Location,
    T.Transaction_Time,
    T.Risk_Score,
    T.Status,
    F.Fraud_Reason,
    F.Risk_Level,
    F.Alert_Time
FROM CUSTOMER C
INNER JOIN CREDIT_CARD CC
    ON C.Customer_ID = CC.Customer_ID
INNER JOIN `TRANSACTION` T
    ON CC.Card_ID = T.Card_ID
INNER JOIN FRAUD_ALERT F
    ON T.Transaction_ID = F.Transaction_ID;


-- 8. STORED PROCEDURES
DELIMITER //
CREATE PROCEDURE GetCardTransactions(IN p_Card_ID INT)
BEGIN
    SELECT
        Transaction_ID,
        Card_ID,
        Amount,
        Merchant,
        Location,
        Transaction_Time,
        Risk_Score,
        Status
    FROM `TRANSACTION`
    WHERE Card_ID = p_Card_ID
    ORDER BY Transaction_Time;
END //

CREATE PROCEDURE GetHighRiskTransactions()
BEGIN
    SELECT
        Transaction_ID,
        Card_ID,
        Amount,
        Merchant,
        Location,
        Transaction_Time,
        Risk_Score,
        Status
    FROM `TRANSACTION`
    WHERE Risk_Score >= 30
    ORDER BY Risk_Score DESC;
END //
DELIMITER ;