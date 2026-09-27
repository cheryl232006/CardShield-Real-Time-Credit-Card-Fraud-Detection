/* CARDShield - Mock Data & Rule-Based Risk Engine */

export const MOCK_CUSTOMERS = [
  { id: 'CUST-8801', name: 'Alexander Wright', email: 'alex.w@cybersec.io', status: 'Active' },
  { id: 'CUST-8802', name: 'Sophia Chen', email: 'sophia.c@techcorp.com', status: 'Active' },
  { id: 'CUST-8803', name: 'Marcus Vance', email: 'm.vance@investments.org', status: 'Flagged' },
  { id: 'CUST-8804', name: 'Elena Rostova', email: 'elena@globaltrade.de', status: 'Blocked' }
];

export const INITIAL_TRANSACTIONS = [
  {
    id: 'TXN-904812',
    customerId: 'CUST-8801',
    customerName: 'Alexander Wright',
    cardNumber: '•••• •••• •••• 4242',
    amount: 145.50,
    merchant: 'Amazon US',
    location: 'New York, USA',
    timestamp: '2026-09-21 23:45:10',
    riskScore: 12,
    riskLevel: 'LOW',
    status: 'APPROVED',
    fraudReason: 'Normal spending pattern & trusted location',
    otpRequired: false
  },
  {
    id: 'TXN-904813',
    customerId: 'CUST-8802',
    customerName: 'Sophia Chen',
    cardNumber: '•••• •••• •••• 8819',
    amount: 850.00,
    merchant: 'Crypto Exchange Pro',
    location: 'Singapore',
    timestamp: '2026-09-21 23:12:05',
    riskScore: 48,
    riskLevel: 'MEDIUM',
    status: 'OTP_VERIFIED',
    fraudReason: 'Elevated transaction amount & foreign IP',
    otpRequired: true
  },
  {
    id: 'TXN-904814',
    customerId: 'CUST-8803',
    customerName: 'Marcus Vance',
    cardNumber: '•••• •••• •••• 3012',
    amount: 12499.00,
    merchant: 'Luxury Watches Zurich',
    location: 'Lagos, Nigeria',
    timestamp: '2026-09-21 22:50:33',
    riskScore: 92,
    riskLevel: 'HIGH',
    status: 'BLOCKED',
    fraudReason: 'High amount anomaly & high-risk geographic origin',
    otpRequired: false
  },
  {
    id: 'TXN-904815',
    customerId: 'CUST-8804',
    customerName: 'Elena Rostova',
    cardNumber: '•••• •••• •••• 9901',
    amount: 3400.00,
    merchant: 'DarkNet Market Outlet',
    location: 'Moscow, Russia',
    timestamp: '2026-09-21 21:15:42',
    riskScore: 88,
    riskLevel: 'HIGH',
    status: 'BLOCKED',
    fraudReason: 'Blacklisted merchant domain & rapid velocity',
    otpRequired: false
  },
  {
    id: 'TXN-904816',
    customerId: 'CUST-8801',
    customerName: 'Alexander Wright',
    cardNumber: '•••• •••• •••• 4242',
    amount: 29.99,
    merchant: 'Netflix Subscription',
    location: 'New York, USA',
    timestamp: '2026-09-21 19:02:18',
    riskScore: 5,
    riskLevel: 'LOW',
    status: 'APPROVED',
    fraudReason: 'Recurring trusted billing',
    otpRequired: false
  },
  {
    id: 'TXN-904817',
    customerId: 'CUST-8802',
    customerName: 'Sophia Chen',
    cardNumber: '•••• •••• •••• 8819',
    amount: 450.00,
    merchant: 'Apple Store Online',
    location: 'San Francisco, USA',
    timestamp: '2026-09-21 18:30:00',
    riskScore: 35,
    riskLevel: 'MEDIUM',
    status: 'OTP_VERIFIED',
    fraudReason: 'New device hardware fingerprint',
    otpRequired: true
  }
];

/**
 * Calculates risk score (0-100) based on transaction input attributes.
 */
export function evaluateTransactionRisk(data) {
  let score = 10; // baseline
  const reasons = [];

  const amt = parseFloat(data.amount) || 0;
  const location = (data.location || '').toLowerCase();
  const merchant = (data.merchant || '').toLowerCase();

  // Rule 1: High Amount Thresholds
  if (amt > 10000) {
    score += 55;
    reasons.push('Extreme high transaction amount (> $10,000)');
  } else if (amt > 2000) {
    score += 35;
    reasons.push('Elevated transaction amount (> $2,000)');
  } else if (amt > 500) {
    score += 20;
    reasons.push('Moderate transaction amount (> $500)');
  }

  // Rule 2: High Risk Geographic Locations
  const highRiskLocations = ['nigeria', 'russia', 'cayman', 'north korea', 'unknown', 'lagos', 'moscow'];
  if (highRiskLocations.some(loc => location.includes(loc))) {
    score += 40;
    reasons.push(`High-risk geographic location flag (${data.location})`);
  }

  // Rule 3: High Risk / Crypto / Luxury Merchants
  const highRiskMerchants = ['crypto', 'darknet', 'casino', 'betting', 'luxury', 'pawn', 'wire transfer'];
  if (highRiskMerchants.some(m => merchant.includes(m))) {
    score += 25;
    reasons.push(`Merchant category risk flag (${data.merchant})`);
  }

  // Cap score between 0 and 100
  score = Math.min(100, Math.max(0, score));

  // Determine Category based on SPEC rules:
  // 0–29 = LOW → APPROVED
  // 30–59 = MEDIUM → OTP VERIFICATION
  // 60–100 = HIGH → BLOCKED + FRAUD ALERT
  let riskLevel = 'LOW';
  let status = 'APPROVED';
  let otpRequired = false;

  if (score >= 60) {
    riskLevel = 'HIGH';
    status = 'BLOCKED';
    otpRequired = false;
  } else if (score >= 30) {
    riskLevel = 'MEDIUM';
    status = 'OTP_REQUIRED';
    otpRequired = true;
  }

  return {
    riskScore: score,
    riskLevel,
    status,
    otpRequired,
    fraudReason: reasons.length > 0 ? reasons.join('; ') : 'Normal transaction profile'
  };
}
