/* CARDShield - Admin Dashboard Renderer */

import { Store } from '../store.js';
import { API } from '../api.js';

// Normalize backend transaction fields into the format used by the Admin UI.
function normalizeTransaction(t = {}) {
  const amount = Number(
    t.amount ??
    t.Amount ??
    0
  );

  const riskScore = Number(
    t.riskScore ??
    t.Risk_Score ??
    t.risk_score ??
    0
  );

  const statusRaw =
    t.status ??
    t.Status ??
    "";

  const status = String(statusRaw);

  const riskLevel =
    t.riskLevel ??
    t.Risk_Level ??
    (
      riskScore >= 60
        ? "HIGH"
        : riskScore >= 30
          ? "MEDIUM"
          : "LOW"
    );

  return {
    ...t,

    id: String(
      t.id ??
      t.Transaction_ID ??
      t.transaction_id ??
      ""
    ),

    customerId:
      t.customerId ??
      t.Customer_ID ??
      t.customer_id ??
      "",

    customerName:
      t.customerName ??
      t.Customer_Name ??
      t.customer_name ??
      "Unknown Customer",

    merchant:
      t.merchant ??
      t.Merchant ??
      "Unknown Merchant",

    amount,

    location:
      t.location ??
      t.Location ??
      "Unknown",

    riskScore,

    riskLevel,

    status,

   fraudReason: (() => {
  const existingReason =
    t.fraudReason ??
    t.Fraud_Reason ??
    t.fraud_reason ??
    t.Alert_Fraud_Reason ??
    t.alert_fraud_reason ??
    "";

  if (existingReason) {
    return existingReason;
  }

  const score = Number(
    t.riskScore ??
    t.Risk_Score ??
    t.risk_score ??
    0
  );

  const amount = Number(
    t.amount ??
    t.Amount ??
    0
  );

  if (score >= 30 && score < 60) {
    if (amount >= 50000) {
      return "High transaction amount";
    }

    return "Additional verification required";
  }

  if (score === 0) {
    return "No suspicious activity";
  }

  return "N/A";
})(),

    cardNumber:
      t.cardNumber ??
      t.Card_Number ??
      t.card_number ??
      "••••"
  };
}

export const AdminViews = {
  /**
   * Main Admin Dashboard View
   */
  async renderDashboard(container) {
    const state = Store.getState();

    // Initial Loading Skeleton
    container.innerHTML = `
      <div class="admin-layout fade-in">
        <div class="card flex justify-between items-center" style="padding: 1.25rem 1.5rem;">
          <div>
            <h2>Admin Monitoring Dashboard</h2>
            <p class="text-sm text-secondary">Real-Time Credit Card Fraud Detection & Risk Assessment Engine</p>
          </div>
          <button id="refresh-admin-btn" class="btn btn-secondary text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            <span>Refresh Stream</span>
          </button>
        </div>

        <!-- Metrics Overview Grid -->
        <div class="stats-grid" id="admin-stats-grid">
          <div class="stat-card"><span class="spinner"></span></div>
          <div class="stat-card"><span class="spinner"></span></div>
          <div class="stat-card"><span class="spinner"></span></div>
          <div class="stat-card"><span class="spinner"></span></div>
          <div class="stat-card"><span class="spinner"></span></div>
        </div>

        <!-- Dashboard Toolbar with Tabs & Search -->
        <div class="tabs-toolbar">

  <div class="tabs-group">
    <button class="tab-btn ${state.adminTab === 'all' ? 'active' : ''}" data-tab="all">All Transactions</button>
    <button class="tab-btn ${state.adminTab === 'approved' ? 'active' : ''}" data-tab="approved">Approved</button>
    <button class="tab-btn ${state.adminTab === 'otp' ? 'active' : ''}" data-tab="otp">OTP Verification</button>
    <button class="tab-btn ${state.adminTab === 'blocked' ? 'active' : ''}" data-tab="blocked">Blocked</button>
    <button class="tab-btn ${state.adminTab === 'alerts' ? 'active' : ''}" data-tab="alerts">Fraud Alerts</button>
  </div>

  <div class="filter-controls">
    <div class="search-input-wrapper">
      <span class="search-icon">🔍</span>
      <input
  type="text"
  id="admin-search-input"
  class="form-input text-sm"
  placeholder="Search merchant, card, location..."
  autocomplete="off"
  style="color: #ffffff !important; caret-color: #ffffff;"
/>
    </div>
  </div>

</div>

        <!-- Data Table Container -->
        <div class="card" style="padding: 0; overflow: hidden;">
          <div class="table-container" id="admin-table-container">
            <div class="empty-state">
              <div class="spinner"></div>
              <p>Fetching transaction telemetry from API...</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Customer Detail Inspector Modal Container -->
      <div id="customer-modal-root"></div>
    `;

    // Fetch Stats & Transactions in parallel
    const [statsRes, txnsRes] = await Promise.all([
      API.getDashboardStats(),
      API.getTransactions()
    ]);

    if (statsRes.success) {
      this._renderStatsCards(statsRes.data);
    }

    if (txnsRes.success) {
      txnsRes.data = txnsRes.data.map(normalizeTransaction);
      this._renderTable(txnsRes.data);
    }

    // Attach Event Handlers
    document.getElementById('refresh-admin-btn').addEventListener('click', () => {
      this.renderDashboard(container);
    });

    const tabButtons = container.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.target.getAttribute('data-tab');
        Store.setState({ adminTab: tab });
        this.renderDashboard(container);
      });
    });

    const searchInput = document.getElementById('admin-search-input');
searchInput.addEventListener('input', (e) => {
    const searchValue = e.target.value.trim().toLowerCase();

    if (!txnsRes.success) return;

    const filteredTransactions = txnsRes.data
        .filter(txn => {
            const searchableText = [
                txn.customerName,
                txn.cardNumber,
                txn.merchant,
                txn.location,
                txn.id
            ].join(' ').toLowerCase();

            return searchableText.includes(searchValue);
        });

    this._renderTable(filteredTransactions);
});
},

  /**
   * Render Top Metric Summary Cards
   */
  _renderStatsCards(stats) {
    const container = document.getElementById('admin-stats-grid');
    if (!container) return;

    const totalTransactions =
      stats.totalTransactions ??
      stats.total ??
      stats.total_transactions ??
      0;

    const approvedCount =
      stats.approvedCount ??
      stats.approved ??
      stats.approved_count ??
      0;

    const otpRequiredCount =
      stats.otpRequiredCount ??
      stats.otp_required ??
      stats.otp_required_count ??
      0;

    const blockedCount =
      stats.blockedCount ??
      stats.blocked ??
      stats.blocked_count ??
      0;

    const fraudAlertsCount =
      stats.fraudAlertsCount ??
      stats.fraud_alerts ??
      stats.fraud_alerts_count ??
      0;

    container.innerHTML = `
      <!-- Total Transactions -->
      <div class="stat-card">
        <div class="stat-card-header">
          <span class="stat-title">Total Processed</span>
          <div class="stat-icon stat-icon-total">📊</div>
        </div>
        <div class="stat-value">${totalTransactions}</div>
        <div class="stat-subtext">GET /api/dashboard-stats</div>
      </div>

      <!-- Approved -->
      <div class="stat-card">
        <div class="stat-card-header">
          <span class="stat-title">Approved (Low)</span>
          <div class="stat-icon stat-icon-approved">✓</div>
        </div>
        <div class="stat-value" style="color: var(--risk-low);">${approvedCount}</div>
        <div class="stat-subtext">Low Risk (0–29)</div>
      </div>

      <!-- OTP Required -->
      <div class="stat-card">
        <div class="stat-card-header">
          <span class="stat-title">OTP Required</span>
          <div class="stat-icon stat-icon-otp">🔑</div>
        </div>
        <div class="stat-value" style="color: var(--risk-medium);">${otpRequiredCount}</div>
        <div class="stat-subtext">Medium Risk (30–59)</div>
      </div>

      <!-- Blocked -->
      <div class="stat-card">
        <div class="stat-card-header">
          <span class="stat-title">Blocked (High)</span>
          <div class="stat-icon stat-icon-blocked">🛡️</div>
        </div>
        <div class="stat-value" style="color: var(--risk-high);">${blockedCount}</div>
        <div class="stat-subtext">High Risk (60–100)</div>
      </div>

      <!-- Active Fraud Alerts -->
      <div class="stat-card">
        <div class="stat-card-header">
          <span class="stat-title">Fraud Alerts</span>
          <div class="stat-icon stat-icon-fraud">⚠️</div>
        </div>
        <div class="stat-value" style="color: var(--risk-high);">${fraudAlertsCount}</div>
        <div class="stat-subtext">Critical Suspicious Items</div>
      </div>
    `;
  },

  /**
   * Render Filtered Data Table
   */
  _renderTable(transactions) {
    const tableContainer = document.getElementById('admin-table-container');
    if (!tableContainer) return;

    const state = Store.getState();
    const query = state.searchQuery || '';
    const tab = state.adminTab;

    // Filter Logic based on active Tab & Search string
    let filtered = transactions.filter(t => {
      // Tab Filter
      // Tab Filter — aligned with database transaction status
if (tab === 'approved' && t.status.toLowerCase() !== 'approved') {
  return false;
}

if (tab === 'otp' && t.status.toLowerCase() !== 'otp verification') {
  return false;
}

if (tab === 'blocked' && t.status.toLowerCase() !== 'blocked') {
  return false;
}

if (
  tab === 'alerts' &&
  !(
    t.Alert_Fraud_Reason ||
    t.alert_fraud_reason
  )
) {
  return false;
}

      // Search Filter
      if (query) {
        const matchesQuery =
          t.merchant.toLowerCase().includes(query) ||
          t.customerName.toLowerCase().includes(query) ||
          t.location.toLowerCase().includes(query) ||
          t.cardNumber.includes(query) ||
          t.id.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      tableContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>No Matching Transactions Found</h3>
          <p class="text-sm text-secondary">Try adjusting your active filter tabs or search keywords.</p>
        </div>
      `;
      return;
    }

    tableContainer.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Txn ID</th>
            <th>Customer</th>
            <th>Merchant</th>
            <th>Amount</th>
            <th>Location</th>
            <th>Risk Score</th>
            <th>Status</th>
            <th>Fraud Reason</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(t => {
            let badgeClass = 'badge-low';
            let barFill = 'var(--risk-low)';

            if (t.riskLevel === 'MEDIUM') {
              badgeClass = 'badge-medium';
              barFill = 'var(--risk-medium)';
            } else if (t.riskLevel === 'HIGH' || t.status === 'BLOCKED') {
              badgeClass = 'badge-high';
              barFill = 'var(--risk-high)';
            }

            return `
              <tr>
                <td class="font-mono font-semibold" style="color: var(--primary-400);">${t.id}</td>
                <td>
                  <a href="#" class="customer-link font-semibold" data-cust-id="${t.customerId}" title="View Customer History">
                    ${t.customerName}
                  </a>
                  <div class="text-xs text-tertiary font-mono">${t.cardNumber}</div>
                </td>
                <td class="font-semibold">${t.merchant}</td>
                <td class="font-mono font-bold">₹${t.amount.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}</td>
                <td class="text-secondary">${t.location}</td>
                <td>
                  <div class="risk-score-meter">
                    <span class="risk-score-num" style="color: ${barFill};">${t.riskScore}</span>
                    <div class="risk-bar-mini">
                      <div class="risk-bar-mini-fill" style="width: ${t.riskScore}%; background: ${barFill};"></div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge ${badgeClass}">
                    <span class="risk-dot"></span>
                    ${t.status}
                  </span>
                </td>
                <td class="text-xs text-secondary" style="max-width: 200px; white-space: normal;">
                  ${t.fraudReason || 'N/A'}
                </td>
                <td>
                  <button class="btn btn-secondary text-xs view-history-btn" data-cust-id="${t.customerId}">
                    History
                  </button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;

    // Attach Customer History Modal Listeners
    tableContainer.querySelectorAll('.customer-link, .view-history-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const custId = btn.getAttribute('data-cust-id');
        this.openCustomerHistoryModal(custId);
      });
    });
  },

  /**
   * Customer History Inspector Modal (GET /api/customer/:id/transactions)
   */
  async openCustomerHistoryModal(customerId) {
    const modalRoot = document.getElementById('customer-modal-root');
    if (!modalRoot) return;

    modalRoot.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content fade-in" style="max-width: 700px;">
          <button class="modal-close" id="close-modal-btn">✕</button>
          <h3>Customer History Telemetry</h3>
          <p class="text-sm text-secondary" style="margin-top: 0.25rem;">
            Consuming endpoint: <code>GET /api/customer/${customerId}/transactions</code>
          </p>

          <div id="modal-body-content" style="margin-top: 1.5rem;">
            <div class="empty-state">
              <div class="spinner"></div>
              <p>Loading customer profile and transaction ledger...</p>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('close-modal-btn').addEventListener('click', () => {
      modalRoot.innerHTML = '';
    });

    const res = await API.getCustomerTransactions(customerId);
    const modalBody = document.getElementById('modal-body-content');

    if (res.success && res.data.length > 0) {
      const history = res.data.map(normalizeTransaction);
      const totalSpent = history.reduce((sum, item) => sum + item.amount, 0);
      const highRiskCount = history.filter(item => item.riskLevel === 'HIGH').length;

      modalBody.innerHTML = `
        <div class="customer-stats-summary">
          <div>
            <div class="text-xs text-secondary">Total Transactions</div>
            <div class="font-bold text-lg">${history.length}</div>
          </div>
          <div>
            <div class="text-xs text-secondary">Aggregate Volume</div>
            <div class="font-bold text-lg font-mono">₹${totalSpent.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}</div>
          </div>
          <div>
            <div class="text-xs text-secondary">High Risk Count</div>
            <div class="font-bold text-lg" style="color: var(--risk-high);">${highRiskCount}</div>
          </div>
        </div>

        <div class="customer-history-list">
          <table class="data-table">
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>Merchant</th>
                <th>Amount</th>
                <th>Risk Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${history.map(item => `
                <tr>
                  <td class="font-mono text-xs">${item.id}</td>
                  <td>${item.merchant}</td>
                  <td class="font-mono font-bold">₹${item.amount.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}</td>
                  <td>
                    <span class="font-mono font-bold">${item.riskScore}</span>/100
                  </td>
                  <td>
                    <span class="badge ${item.status === 'BLOCKED' ? 'badge-high' : 'badge-low'}">
                      ${item.status}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else {
      modalBody.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📂</div>
          <p>No transactions found for Customer ID <strong>${customerId}</strong>.</p>
        </div>
      `;
    }
  }
};