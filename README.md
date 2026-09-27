# CardShield
The Real-Time Credit Card Fraud Detection and Risk Assessment System is a database-driven web application designed to identify potentially fraudulent credit card transactions before they are completed. The system simulates an online banking environment where customers perform credit card transactions through a secure payment portal while an administrator monitors all transactions through a dedicated dashboard.

Whenever a customer initiates a transaction, the system records the transaction details in a MySQL database and immediately evaluates it using predefined fraud detection rules inspired by real banking practices. Based on the calculated risk, the system either approves the transaction, requests OTP-based Two-Factor Authentication (2FA), or blocks the transaction and generates a fraud alert for the administrator.

The project demonstrates how modern database systems can be used to improve transaction security through real-time monitoring, automated rule evaluation, and secure authentication mechanisms.

