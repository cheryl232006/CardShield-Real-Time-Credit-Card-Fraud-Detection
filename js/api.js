/* CARDShield - REST API Service Layer */

import { CONFIG } from './config.js';

export const API = {

  // --------------------------------------------------
  // POST /api/pay
  // --------------------------------------------------
  async pay(paymentData) {

    const response = await fetch(
      `${CONFIG.API_BASE_URL}/pay`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cardNumber: paymentData.cardNumber,
          amount: Number(paymentData.amount),
          merchant: paymentData.merchant,
          location: paymentData.location
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || `Payment failed: HTTP ${response.status}`
      );
    }

    // Convert backend response into the format
    // expected by the existing customer UI.
    const transaction = {
      id: String(result.transaction_id),
      transactionId: result.transaction_id,

      cardNumber: paymentData.cardNumber,
      amount: Number(paymentData.amount),
      merchant: paymentData.merchant,
      location: paymentData.location,

      riskScore: result.risk_score,
      riskLevel: result.risk_level,
      status: result.status === 'Approved'
        ? 'APPROVED'
        : result.status === 'OTP Verification'
          ? 'OTP_REQUIRED'
          : 'BLOCKED',

      fraudReason: result.reasons?.length
        ? result.reasons.join('; ')
        : 'No suspicious activity detected',

      timestamp: new Date().toLocaleString(),

      otpRequired: result.otp_required,
      demoOtp: result.demo_otp || null
    };

    return {
      success: true,
      transaction
    };
  },


  // --------------------------------------------------
  // POST /api/verify-otp
  // --------------------------------------------------
  async verifyOTP(payload) {

    const response = await fetch(
      `${CONFIG.API_BASE_URL}/verify-otp`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transaction_id: Number(
            payload.transactionId || payload.transaction_id
          ),
          otp: payload.otp
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {

      return {
        success: false,
        attemptsRemaining:
          result.remaining_attempts ?? 0,
        message: result.message,
        transaction: null
      };
    }

    return {
      success: true,
      status: 'APPROVED',
      message: result.message,

      transaction: {
        id: String(result.transaction_id),
        transactionId: result.transaction_id,
        status: 'APPROVED'
      }
    };
  },


  // --------------------------------------------------
  // GET /api/transactions
  // --------------------------------------------------
  async getTransactions() {

  const [transactionsResponse, alertsResponse] = await Promise.all([
    fetch(`${CONFIG.API_BASE_URL}/transactions`),
    fetch(`${CONFIG.API_BASE_URL}/fraud-alerts`)
  ]);

  const transactionsResult = await transactionsResponse.json();
  const alertsResult = await alertsResponse.json();

  if (!transactionsResponse.ok) {
    throw new Error(
      transactionsResult.message || 'Failed to retrieve transactions'
    );
  }

  if (!alertsResponse.ok) {
    throw new Error(
      alertsResult.message || 'Failed to retrieve fraud alerts'
    );
  }

  const alerts = alertsResult.data || [];

  const data = (transactionsResult.data || []).map(transaction => {

    const alert = alerts.find(
      a =>
        Number(a.Transaction_ID ?? a.transaction_id) ===
        Number(transaction.Transaction_ID ?? transaction.transaction_id)
    );

    return {
      ...transaction,

      // Attach fraud-alert information to the transaction
      fraudReason:
        alert?.Fraud_Reason ??
        alert?.fraud_reason ??
        '',

      isFraudAlert: !!alert
    };
  });

  return {
    ...transactionsResult,
    data
  };
},


  // --------------------------------------------------
  // GET /api/fraud-alerts
  // --------------------------------------------------
  async getFraudAlerts() {

    const response = await fetch(
      `${CONFIG.API_BASE_URL}/fraud-alerts`
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || 'Failed to retrieve fraud alerts'
      );
    }

    return result;
  },


  // --------------------------------------------------
  // GET /api/dashboard-stats
  // --------------------------------------------------
  async getDashboardStats() {

    const response = await fetch(
      `${CONFIG.API_BASE_URL}/dashboard-stats`
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || 'Failed to retrieve dashboard statistics'
      );
    }

    return result;
  },


  // --------------------------------------------------
  // GET /api/customer/:id/transactions
  // --------------------------------------------------
  async getCustomerTransactions(customerId) {

    const response = await fetch(
      `${CONFIG.API_BASE_URL}/customer/${customerId}/transactions`
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || 'Failed to retrieve customer transactions'
      );
    }

    return result;
  }

};