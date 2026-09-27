/* CARDShield - Central State Store & Theme Engine */

class AppStore {
  constructor() {
    this.listeners = [];
    const savedRole = sessionStorage.getItem('cardshield_user_role');
    const isAuth = sessionStorage.getItem('cardshield_authenticated') === 'true';

    this.state = {
      theme: localStorage.getItem('cardshield_theme') || 'dark',
      isAuthenticated: isAuth,
      userRole: savedRole || null, // 'customer' | 'admin' | null
      activePortal: savedRole || 'landing', // 'landing' | 'customer' | 'admin'
      activeView: isAuth 
        ? (savedRole === 'admin' ? 'admin-dashboard' : 'payment-portal')
        : 'landing', // 'landing', 'customer-auth', 'admin-login', 'payment-portal', etc.
      adminTab: 'all', // 'all', 'suspicious', 'blocked', 'alerts'
      pendingTransaction: null,
      lastTransaction: null,
      otpAttemptsLeft: 3,
      customerUser: JSON.parse(sessionStorage.getItem('cardshield_customer_user')) || {
        id: 'CUST-8801',
        name: 'Alexander Wright',
        email: 'alex.w@cybersec.io',
        cardNumber: '4242 •••• •••• 4242'
      },
      searchQuery: ''
    };
  }

  getState() {
    return this.state;
  }

  setState(partialState) {
    this.state = { ...this.state, ...partialState };
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Theme Management
  initTheme() {
    document.documentElement.setAttribute('data-theme', this.state.theme);
  }

  toggleTheme() {
    const nextTheme = this.state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('cardshield_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    this.setState({ theme: nextTheme });
  }

  // Authentication Helpers
  loginCustomer(userObj) {
    const user = {
      id: userObj.id || 'CUST-8801',
      name: userObj.name || userObj.email.split('@')[0],
      email: userObj.email || 'customer@cardshield.io',
      cardNumber: userObj.cardNumber || '4242 •••• •••• 4242'
    };
    sessionStorage.setItem('cardshield_user_role', 'customer');
    sessionStorage.setItem('cardshield_authenticated', 'true');
    sessionStorage.setItem('cardshield_customer_user', JSON.stringify(user));

    this.setState({
      isAuthenticated: true,
      userRole: 'customer',
      activePortal: 'customer',
      activeView: 'payment-portal',
      customerUser: user
    });
  }

  loginAdmin() {
    sessionStorage.setItem('cardshield_user_role', 'admin');
    sessionStorage.setItem('cardshield_authenticated', 'true');

    this.setState({
      isAuthenticated: true,
      userRole: 'admin',
      activePortal: 'admin',
      activeView: 'admin-dashboard'
    });
  }

  logout() {
    sessionStorage.removeItem('cardshield_user_role');
    sessionStorage.removeItem('cardshield_authenticated');
    sessionStorage.removeItem('cardshield_customer_user');

    this.setState({
      isAuthenticated: false,
      userRole: null,
      activePortal: 'landing',
      activeView: 'landing',
      pendingTransaction: null,
      lastTransaction: null
    });
  }

  // Navigation Helpers
  setPortal(portal) {
    if (!this.state.isAuthenticated) {
      this.setState({ activePortal: 'landing', activeView: 'landing' });
      return;
    }
    const defaultView = portal === 'admin' ? 'admin-dashboard' : 'payment-portal';
    this.setState({
      activePortal: portal,
      activeView: defaultView
    });
  }

  setView(viewName) {
    this.setState({ activeView: viewName });
  }

  resetOTP() {
    this.setState({ otpAttemptsLeft: 3 });
  }
}

export const Store = new AppStore();
