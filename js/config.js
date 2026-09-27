/* CARDShield - Global Configuration */
export const CONFIG = {
  // When set to true, api.js uses simulated in-memory REST responses.
  // Set to false when connecting to Node.js/Express REST server.
  USE_MOCK_DATA: false,
  API_BASE_URL: 'http://localhost:5000/api',
  DEFAULT_OTP: '123456',
  MAX_OTP_ATTEMPTS: 3,
  DEMO_ADMIN_PASSWORD: 'admin123'
};