/* CARDShield - Authentication & Role Selection Views */

import { Store } from '../store.js';
import { CONFIG } from '../config.js';

export const AuthViews = {
  /**
   * 1. Role Selection / Landing Page
   */
  renderLanding(container) {
    container.innerHTML = `
      <div class="customer-container fade-in" style="max-width: 680px; margin-top: 2rem;">
        <div class="portal-welcome" style="margin-bottom: 2.5rem;">
          <h1 style="font-size: 2.5rem; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 0.5rem; background: linear-gradient(135deg, var(--text-primary), var(--primary-400)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            CardShield
          </h1>
          <p class="text-lg font-semibold" style="color: var(--primary-400); margin-bottom: 1.5rem;">
            Secure Payments. Smarter Fraud Protection.
          </p>
          <h2 style="font-size: 1.25rem; font-weight: 600; color: var(--text-secondary);">
            How would you like to continue?
          </h2>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
          <!-- Customer Role Card -->
          <div class="card role-card" style="display: flex; flex-direction: column; justify-content: space-between; text-align: center; padding: 2rem; cursor: pointer;">
            <div>
              <div style="font-size: 3rem; margin-bottom: 1rem;">👤</div>
              <h3 style="font-size: 1.35rem; margin-bottom: 0.5rem;">Customer</h3>
              <p class="text-sm text-secondary" style="margin-bottom: 1.5rem; min-height: 40px;">
                Make secure payments and manage your card transactions.
              </p>
            </div>
            <button id="btn-role-customer" class="btn btn-primary btn-block">
              <span>Continue as Customer</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>

          <!-- Admin Role Card -->
          <div class="card role-card" style="display: flex; flex-direction: column; justify-content: space-between; text-align: center; padding: 2rem; cursor: pointer;">
            <div>
              <div style="font-size: 3rem; margin-bottom: 1rem;">🛡️</div>
              <h3 style="font-size: 1.35rem; margin-bottom: 0.5rem;">Admin</h3>
              <p class="text-sm text-secondary" style="margin-bottom: 1.5rem; min-height: 40px;">
                Monitor transactions and manage fraud alerts.
              </p>
            </div>
            <button id="btn-role-admin" class="btn btn-secondary btn-block">
              <span>Continue as Admin</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-role-customer').addEventListener('click', () => {
      Store.setView('customer-auth');
    });

    document.getElementById('btn-role-admin').addEventListener('click', () => {
      Store.setView('admin-login');
    });
  },

  /**
   * 2. Customer Auth Screen (Login vs Create Account Tabs)
   */
  renderCustomerAuth(container) {
    let activeTab = 'login'; // 'login' | 'signup'

    const renderForm = () => {
      container.innerHTML = `
        <div class="customer-container fade-in" style="max-width: 480px; margin-top: 1.5rem;">
          <div style="margin-bottom: 1rem;">
            <button id="btn-back-landing" class="btn btn-secondary text-xs" style="padding: 4px 12px;">
              ← Back to Role Selection
            </button>
          </div>

          <div class="card">
            <div class="portal-nav w-full" style="margin-bottom: 1.5rem; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
              <button id="tab-login-btn" class="portal-btn ${activeTab === 'login' ? 'active' : ''}">Existing Customer</button>
              <button id="tab-signup-btn" class="portal-btn ${activeTab === 'signup' ? 'active' : ''}">New Customer</button>
            </div>

            <div id="toast-container"></div>

            ${activeTab === 'login' ? `
              <!-- Existing Customer Login Form -->
              <div class="card-header" style="margin-bottom: 0.5rem;">
                <h3 class="card-title">Customer Login</h3>
              </div>
              <p class="text-sm text-secondary" style="margin-bottom: 1.25rem;">Login to your CardShield account</p>

              <form id="customer-login-form">
                <div class="form-group">
                  <label class="form-label" for="cust-email">Email Address</label>
                  <input type="email" id="cust-email" class="form-input" placeholder="alex.w@cybersec.io" value="alex.w@cybersec.io" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="cust-password">Password</label>
                  <input type="password" id="cust-password" class="form-input" placeholder="••••••••" value="password123" required>
                </div>
                <button type="submit" class="btn btn-primary btn-block" style="margin-top: 1.25rem;">
                  <span>Login</span>
                </button>
              </form>
            ` : `
              <!-- New Customer Sign Up Form -->
              <div class="card-header" style="margin-bottom: 0.5rem;">
                <h3 class="card-title">Create Account</h3>
              </div>
              <p class="text-sm text-secondary" style="margin-bottom: 1.25rem;">Create a new CardShield account</p>

              <form id="customer-signup-form">
                <div class="form-group">
                  <label class="form-label" for="reg-name">Customer Name</label>
                  <input type="text" id="reg-name" class="form-input" placeholder="Full Name" value="Alexander Wright" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="reg-email">Email Address</label>
                  <input type="email" id="reg-email" class="form-input" placeholder="name@domain.com" value="alex.w@cybersec.io" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="reg-phone">Phone Number</label>
                  <input type="tel" id="reg-phone" class="form-input" placeholder="+1 (555) 019-2834" value="+1 (555) 019-2834" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="reg-password">Password</label>
                  <input type="password" id="reg-password" class="form-input" placeholder="••••••••" value="password123" required>
                </div>
                <button type="submit" class="btn btn-primary btn-block" style="margin-top: 1.25rem;">
                  <span>Create Account</span>
                </button>
              </form>
            `}
          </div>
        </div>
      `;

      // Event Bindings
      document.getElementById('btn-back-landing').addEventListener('click', () => {
        Store.setView('landing');
      });

      document.getElementById('tab-login-btn').addEventListener('click', () => {
        activeTab = 'login';
        renderForm();
      });

      document.getElementById('tab-signup-btn').addEventListener('click', () => {
        activeTab = 'signup';
        renderForm();
      });

      if (activeTab === 'login') {
        document.getElementById('customer-login-form').addEventListener('submit', (e) => {
          e.preventDefault();
          const email = document.getElementById('cust-email').value;
          Store.loginCustomer({ email, name: email.split('@')[0] });
        });
      } else {
        document.getElementById('customer-signup-form').addEventListener('submit', (e) => {
          e.preventDefault();
          const name = document.getElementById('reg-name').value;
          const email = document.getElementById('reg-email').value;

          const toast = document.getElementById('toast-container');
          toast.innerHTML = `
            <div class="alert-box alert-warning" style="background: var(--risk-low-bg); border-color: var(--risk-low-border); color: var(--risk-low);">
              ✓ Account created successfully. Redirecting to payment portal...
            </div>
          `;

          setTimeout(() => {
            Store.loginCustomer({ name, email });
          }, 800);
        });
      }
    };

    renderForm();
  },

  /**
   * 3. Admin Login Screen
   */
  renderAdminLogin(container) {
    container.innerHTML = `
      <div class="customer-container fade-in" style="max-width: 440px; margin-top: 2rem;">
        <div style="margin-bottom: 1rem;">
          <button id="btn-back-landing" class="btn btn-secondary text-xs" style="padding: 4px 12px;">
            ← Back to Role Selection
          </button>
        </div>

        <div class="card">
          <div class="card-header" style="margin-bottom: 0.5rem;">
            <h3 class="card-title">Admin Access</h3>
            <span class="badge badge-high"><span class="risk-dot"></span>Restricted</span>
          </div>
          <p class="text-sm text-secondary" style="margin-bottom: 1.25rem;">
            Enter administrative credentials to monitor telemetry and manage fraud alerts.
          </p>

          <form id="admin-login-form">
            <div class="form-group">
              <label class="form-label" for="admin-pass">Admin Password</label>
              <input type="password" id="admin-pass" class="form-input" placeholder="Enter admin password" required autofocus>
            </div>

            <p class="text-xs text-tertiary" style="margin-bottom: 1rem;">
              (Demo Password: <strong>${CONFIG.DEMO_ADMIN_PASSWORD}</strong>)
            </p>

            <div id="admin-error-msg" class="alert-box alert-danger hidden"></div>

            <button type="submit" class="btn btn-primary btn-block" style="margin-top: 0.5rem;">
              <span>Login to Dashboard</span>
            </button>
          </form>
        </div>
      </div>
    `;

    document.getElementById('btn-back-landing').addEventListener('click', () => {
      Store.setView('landing');
    });

    document.getElementById('admin-login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const pass = document.getElementById('admin-pass').value;
      const errorMsg = document.getElementById('admin-error-msg');

      if (pass === CONFIG.DEMO_ADMIN_PASSWORD) {
        errorMsg.classList.add('hidden');
        Store.loginAdmin();
      } else {
        errorMsg.textContent = 'Incorrect password. Please try again.';
        errorMsg.classList.remove('hidden');
        document.getElementById('admin-pass').value = '';
        document.getElementById('admin-pass').focus();
      }
    });
  }
};
