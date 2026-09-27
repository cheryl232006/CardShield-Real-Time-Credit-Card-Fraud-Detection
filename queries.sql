USE cardshield_db;
-- 1. View all customers
SELECT *
FROM CUSTOMER;


-- 2. View all cards with customer details
SELECT
    C.Customer_ID,
    C.Customer_Name,
    CC.Card_ID,
    CC.Card_Number,
    CC.Expiry_Date,
    CC.Credit_Limit,
    CC.Card_Status
FROM CUSTOMER C
INNER JOIN CREDIT_CARD CC
    ON C.Customer_ID = CC.Customer_ID;


-- 3. Get transaction history for a specific card
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
WHERE Card_ID = 2
ORDER BY Transaction_Time;


-- 4. Get all high-risk transactions
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


-- 5. Detect transactions using the same card in different cities within 10 minutes
SELECT
    T1.Card_ID,
    T1.Transaction_ID AS Transaction_1,
    T1.Location AS Location_1,
    T1.Transaction_Time AS Time_1,
    T2.Transaction_ID AS Transaction_2,
    T2.Location AS Location_2,
    T2.Transaction_Time AS Time_2
FROM `TRANSACTION` T1
INNER JOIN `TRANSACTION` T2
    ON T1.Card_ID = T2.Card_ID
    AND T1.Transaction_ID < T2.Transaction_ID
WHERE T1.Location <> T2.Location
AND TIMESTAMPDIFF(MINUTE, T1.Transaction_Time, T2.Transaction_Time) <= 10;


-- 6. Detect more than 5 transactions within 5 minutes
SELECT
    T1.Card_ID,
    T1.Transaction_ID AS Starting_Transaction,
    T1.Transaction_Time AS Starting_Time,
    COUNT(T2.Transaction_ID) AS Transactions_Within_5_Minutes
FROM `TRANSACTION` T1
INNER JOIN `TRANSACTION` T2
    ON T1.Card_ID = T2.Card_ID
    AND T2.Transaction_Time BETWEEN T1.Transaction_Time
    AND DATE_ADD(T1.Transaction_Time, INTERVAL 5 MINUTE)
GROUP BY
    T1.Card_ID,
    T1.Transaction_ID,
    T1.Transaction_Time
HAVING COUNT(T2.Transaction_ID) > 5;


-- 7. Detect high-value transactions
SELECT
    Transaction_ID,
    Card_ID,
    Amount,
    Merchant,
    Location,
    Transaction_Time
FROM `TRANSACTION`
WHERE Amount >= 50000;


-- 8. Detect high-value transactions during unusual hours
SELECT
    Transaction_ID,
    Card_ID,
    Amount,
    Merchant,
    Location,
    Transaction_Time
FROM `TRANSACTION`
WHERE Amount >= 50000
AND TIME(Transaction_Time) BETWEEN '00:00:00' AND '05:00:00';


-- 9. View OTP verification records
SELECT
    OTP_ID,
    Transaction_ID,
    Attempts,
    Verification_Status,
    Expiry_Time
FROM OTP_VERIFICATION
ORDER BY OTP_ID;


-- 10. Detect OTP records with 3 or more failed attempts
SELECT
    OTP_ID,
    Transaction_ID,
    Attempts,
    Verification_Status,
    CASE
        WHEN Attempts >= 3 THEN 'Blocked'
        ELSE Verification_Status
    END AS Result
FROM OTP_VERIFICATION;


-- 11. View fraud alerts with transaction details
SELECT
    F.Alert_ID,
    F.Transaction_ID,
    T.Card_ID,
    T.Amount,
    T.Merchant,
    T.Location,
    F.Fraud_Reason,
    F.Risk_Level,
    F.Alert_Time
FROM FRAUD_ALERT F
INNER JOIN `TRANSACTION` T
    ON F.Transaction_ID = T.Transaction_ID
ORDER BY F.Alert_Time DESC;


-- 12. Calculate transaction risk score
SELECT
    Transaction_ID,
    Card_ID,
    Amount,
    Risk_Score,
    CASE
        WHEN Risk_Score >= 60 THEN 'Blocked'
        WHEN Risk_Score >= 30 THEN 'OTP Verification'
        ELSE 'Approved'
    END AS Calculated_Status
FROM `TRANSACTION`
ORDER BY Transaction_ID;


-- 13. Customer transaction summary
SELECT
    C.Customer_ID,
    C.Customer_Name,
    COUNT(T.Transaction_ID) AS Total_Transactions,
    COALESCE(SUM(T.Amount), 0) AS Total_Amount,
    COALESCE(AVG(T.Amount), 0) AS Average_Amount
FROM CUSTOMER C
LEFT JOIN CREDIT_CARD CC
    ON C.Customer_ID = CC.Customer_ID
LEFT JOIN `TRANSACTION` T
    ON CC.Card_ID = T.Card_ID
GROUP BY
    C.Customer_ID,
    C.Customer_Name
ORDER BY Total_Amount DESC;


-- 14. Transaction count by card
SELECT
    Card_ID,
    COUNT(*) AS Transaction_Count
FROM `TRANSACTION`
GROUP BY Card_ID
ORDER BY Transaction_Count DESC;


-- 15. Total transaction amount
SELECT
    SUM(Amount) AS Total_Transaction_Amount
FROM `TRANSACTION`;


-- 16. Insert a new transaction
-- Backend can provide these values dynamically.
INSERT INTO `TRANSACTION`
(Card_ID, Amount, Merchant, Location, Transaction_Time, Risk_Score, Status)
VALUES
(2, 2500.00, 'Amazon', 'Pune', NOW(), 0, 'Pending');


-- 17. Update transaction risk score
UPDATE `TRANSACTION`
SET Risk_Score = 40
WHERE Transaction_ID = 12;


-- 18. Update transaction status based on risk score
UPDATE `TRANSACTION`
SET Status =
    CASE
        WHEN Risk_Score >= 60 THEN 'Blocked'
        WHEN Risk_Score >= 30 THEN 'OTP Verification'
        ELSE 'Approved'
    END
WHERE Transaction_ID IS NOT NULL;


-- 19. View complete customer transaction details
SELECT
    C.Customer_Name,
    C.Email,
    CC.Card_ID,
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
    ON CC.Card_ID = T.Card_ID
ORDER BY T.Transaction_Time DESC;


-- 20. View blocked transactions
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
WHERE Status = 'Blocked'
ORDER BY Transaction_Time DESC;