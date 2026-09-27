/* CARDShield - Application Entry Point & Router */

import { Store } from './store.js';
import { AuthViews } from './views/authViews.js';
import { CustomerViews } from './views/customerViews.js';
import { AdminViews } from './views/adminViews.js';

class AppController {
  constructor() {
    this.appContent = document.getElementById('app-content');
    this.navCustomerBtn = document.getElementById('nav-customer-btn');
    this.navAdminBtn = document.getElementById('nav-admin-btn');
    this.themeBtn = document.getElementById('theme-toggle-btn');
    this.themeIcon = document.getElementById('theme-icon');
    this.brandLink = document.getElementById('brand-link');
    this.logoutBtn = document.getElementById('logout-btn');
  }

  init() {
    // Initialize Theme
    Store.initTheme();
    this.updateThemeIcon(Store.getState().theme);

    // Bind Header Controls
    this.bindHeaderEvents();

    // Subscribe to State Mutations
    Store.subscribe((state) => this.render(state));

    // Initial View Render
    this.render(Store.getState());
  }

  bindHeaderEvents() {
    // Theme Toggle
    this.themeBtn.addEventListener('click', () => {
      Store.toggleTheme();
      this.updateThemeIcon(Store.getState().theme);
    });

    // Logout Button
    this.logoutBtn.addEventListener('click', () => {
      Store.logout();
    });

    // Portal Navigation Buttons
    this.navCustomerBtn.addEventListener('click', () => {
      if (Store.getState().isAuthenticated) {
        Store.setPortal('customer');
      } else {
        Store.setView('customer-auth');
      }
    });

    this.navAdminBtn.addEventListener('click', () => {
      if (Store.getState().isAuthenticated && Store.getState().userRole === 'admin') {
        Store.setPortal('admin');
      } else {
        Store.setView('admin-login');
      }
    });

    this.brandLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (!Store.getState().isAuthenticated) {
        Store.setView('landing');
      } else {
        Store.setPortal(Store.getState().userRole || 'customer');
      }
    });
  }

  updateThemeIcon(theme) {
    if (this.themeIcon) {
      this.themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
  }

  render(state) {
    // Update Logout Button Visibility
    if (this.logoutBtn) {
      if (state.isAuthenticated) {
        this.logoutBtn.classList.remove('hidden');
      } else {
        this.logoutBtn.classList.add('hidden');
      }
    }

    // Update Header Navigation Active State
    const navBar = document.querySelector('.portal-nav');
    if (navBar) {
      if (!state.isAuthenticated) {
        // Hide/dim portal navigation when not authenticated
        navBar.style.opacity = '0.7';
      } else {
        navBar.style.opacity = '1';
      }
    }

    if (state.activePortal === 'customer') {
      this.navCustomerBtn.classList.add('active');
      this.navAdminBtn.classList.remove('active');
    } else if (state.activePortal === 'admin') {
      this.navCustomerBtn.classList.remove('active');
      this.navAdminBtn.classList.add('active');
    } else {
      this.navCustomerBtn.classList.remove('active');
      this.navAdminBtn.classList.remove('active');
    }

    // Clear Container
    this.appContent.innerHTML = '';

    // Unauthenticated Views Router
    if (!state.isAuthenticated && ['landing', 'customer-auth', 'admin-login'].includes(state.activeView)) {
      switch (state.activeView) {
        case 'customer-auth':
          AuthViews.renderCustomerAuth(this.appContent);
          break;
        case 'admin-login':
          AuthViews.renderAdminLogin(this.appContent);
          break;
        case 'landing':
        default:
          AuthViews.renderLanding(this.appContent);
          break;
      }
      return;
    }

    // Guard: Redirect to landing if not authenticated
    if (!state.isAuthenticated) {
      AuthViews.renderLanding(this.appContent);
      return;
    }

    // Authenticated Views Router
    if (state.activePortal === 'customer') {
      switch (state.activeView) {
        case 'payment-portal':
          CustomerViews.renderPaymentPortal(this.appContent);
          break;
        case 'otp-verification':
          CustomerViews.renderOTP(this.appContent);
          break;
        case 'payment-result':
          CustomerViews.renderResult(this.appContent);
          break;
        default:
          CustomerViews.renderPaymentPortal(this.appContent);
      }
    } else if (state.activePortal === 'admin') {
      AdminViews.renderDashboard(this.appContent);
    }
  }
}

// Initialize Application when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new AppController();
  app.init();
});
