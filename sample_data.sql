USE cardshield_db;


-- 1. CUSTOMER DATA
INSERT INTO CUSTOMER
(Customer_Name, Email, Phone)
VALUES
('Aarav Sharma', 'aarav.sharma@gmail.com', '9876543210'),
('Riya Mehta', 'riya.mehta@gmail.com', '9823456710'),
('Ananya Iyer', 'ananya.iyer@gmail.com', '9876501234'),
('Kabir Shah', 'kabir.shah@gmail.com', '9898765432'),
('Sneha Patil', 'sneha.patil@gmail.com', '9812345678');


-- 2. CREDIT CARD DATA
INSERT INTO CREDIT_CARD
(Customer_ID, Card_Number, Expiry_Date, Credit_Limit, Card_Status)
VALUES
(1, '4532123456789012', '2028-06-30', 100000.00, 'Active'),
(2, '5210987654321098', '2027-11-30', 75000.00, 'Active'),
(3, '4111567890123456', '2029-03-31', 120000.00, 'Active'),
(4, '378245678901234', '2028-09-30', 50000.00, 'Active'),
(5, '6011123456789012', '2027-12-31', 80000.00, 'Active');


-- 3. TRANSACTION DATA
INSERT INTO `TRANSACTION`
(Card_ID, Amount, Merchant, Location, Transaction_Time, Risk_Score, Status)
VALUES
(1, 2500.00, 'Amazon', 'Pune', '2026-09-20 10:00:00', 0, 'Approved'),
(2, 5000.00, 'Reliance Digital', 'Mumbai', '2026-09-20 14:00:00', 40, 'OTP Verification'),
(2, 4500.00, 'Apple Store', 'London', '2026-09-20 14:07:00', 40, 'Blocked'),
(3, 1000.00, 'Starbucks', 'Pune', '2026-09-20 15:00:00', 30, 'OTP Verification'),
(3, 1200.00, 'BookMyShow', 'Pune', '2026-09-20 15:01:00', 0, 'Approved'),
(3, 800.00, 'Swiggy', 'Pune', '2026-09-20 15:02:00', 0, 'Approved'),
(3, 1500.00, 'Myntra', 'Pune', '2026-09-20 15:03:00', 0, 'Approved'),
(3, 900.00, 'Uber', 'Pune', '2026-09-20 15:04:00', 0, 'Approved'),
(3, 1100.00, 'Flipkart', 'Pune', '2026-09-20 15:05:00', 0, 'Approved'),
(4, 60000.00, 'Croma', 'Pune', '2026-09-20 18:00:00', 30, 'OTP Verification'),
(5, 75000.00, 'International Electronics', 'Dubai', '2026-09-20 02:15:00', 50, 'OTP Verification');


-- 4. OTP DATA
INSERT INTO OTP_VERIFICATION
(Transaction_ID, OTP, Expiry_Time, Attempts, Verification_Status)
VALUES
(3, '482716', '2026-09-20 14:10:00', 3, 'Failed'),
(10, '735291', '2026-09-20 18:10:00', 0, 'Pending');


-- 5. FRAUD ALERT DATA
INSERT INTO FRAUD_ALERT
(Transaction_ID, Fraud_Reason, Risk_Level, Alert_Time)
VALUES
(3, 'Same card used in different cities within 10 minutes', 'High', '2026-09-20 14:07:00'),
(11, 'High-value transaction during unusual hours', 'High', '2026-09-20 02:15:00');