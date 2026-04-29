// cypress/e2e/auth.cy.js
// Authentication Tests using Page Object Model

import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';

describe('Authentication', () => {

  beforeEach(() => {
    cy.clearAllSessionStorage();
  });

  // ─────────────────────────────────────────────────────────
  // LOGIN PAGE UI
  // ─────────────────────────────────────────────────────────
  describe('Login Page UI', () => {
    beforeEach(() => {
      LoginPage.visit();
    });

    it('should display login page correctly', () => {
      LoginPage.shouldBeVisible();
    });

    it('should display email input', () => {
      LoginPage.emailInput.should('be.visible');
    });

    it('should display password input', () => {
      LoginPage.passwordInput.should('be.visible');
    });

    it('should display sign in button', () => {
      LoginPage.submitButton.should('be.visible').and('contain', 'Sign in');
    });

    it('should display demo credentials section', () => {
      LoginPage.demoManager.should('be.visible');
      LoginPage.demoViewer.should('be.visible');
    });

    it('should not show error on initial load', () => {
      LoginPage.shouldNotShowError();
    });
  });

  // ─────────────────────────────────────────────────────────
  // PASSWORD TOGGLE
  // ─────────────────────────────────────────────────────────
  describe('Password Visibility Toggle', () => {
    beforeEach(() => {
      LoginPage.visit();
    });

    it('should mask password by default', () => {
      LoginPage.shouldShowPasswordMasked();
    });

    it('should show password when toggle clicked', () => {
      LoginPage.togglePasswordVisibility();
      LoginPage.shouldShowPasswordText();
    });

    it('should hide password when toggle clicked again', () => {
      LoginPage.togglePasswordVisibility();
      LoginPage.togglePasswordVisibility();
      LoginPage.shouldShowPasswordMasked();
    });
  });

  // ─────────────────────────────────────────────────────────
  // DEMO CREDENTIALS
  // ─────────────────────────────────────────────────────────
  describe('Demo Credentials', () => {
    beforeEach(() => {
      LoginPage.visit();
    });

    it('should fill manager credentials when manager demo clicked', () => {
      LoginPage.clickDemoManager();
      LoginPage.shouldHaveEmailFilled('manager@fleetpulse.com');
      LoginPage.shouldHavePasswordFilled('manager123');
    });

    it('should fill viewer credentials when viewer demo clicked', () => {
      LoginPage.clickDemoViewer();
      LoginPage.shouldHaveEmailFilled('viewer@fleetpulse.com');
      LoginPage.shouldHavePasswordFilled('viewer123');
    });
  });

  // ─────────────────────────────────────────────────────────
  // LOGIN VALIDATION
  // ─────────────────────────────────────────────────────────
  describe('Login Validation', () => {
    beforeEach(() => {
      LoginPage.visit();
    });

    it('should show error when submitting empty form', () => {
      LoginPage.submit();
      LoginPage.shouldShowError('Please enter both email and password');
    });

    it('should show error with wrong credentials', () => {
      LoginPage.login('wrong@email.com', 'wrongpassword');
      LoginPage.shouldShowError('Invalid email or password');
    });

    it('should show error with correct email but wrong password', () => {
      LoginPage.login('manager@fleetpulse.com', 'wrongpassword');
      LoginPage.shouldShowError('Invalid email or password');
    });

    it('should show loading state while logging in', () => {
      LoginPage.typeEmail('manager@fleetpulse.com');
      LoginPage.typePassword('manager123');
      LoginPage.submit();
      LoginPage.shouldBeLoading();
    });
  });

  // ─────────────────────────────────────────────────────────
  // SUCCESSFUL LOGIN
  // ─────────────────────────────────────────────────────────
  describe('Successful Login', () => {
    it('should login as manager and redirect to dashboard', () => {
      LoginPage.visit();
      LoginPage.loginAsManager();
      DashboardPage.shouldBeVisible();
    });

    it('should login as viewer and redirect to dashboard', () => {
      LoginPage.visit();
      LoginPage.loginAsViewer();
      DashboardPage.shouldBeVisible();
    });

    it('should show logout button after login', () => {
      LoginPage.visit();
      LoginPage.loginAsManager();
      DashboardPage.shouldShowLogoutButton();
    });

    it('should show manager name after login', () => {
      LoginPage.visit();
      LoginPage.loginAsManager();
      DashboardPage.shouldShowUserName('Fleet Manager');
    });

    it('should show manager role badge', () => {
      LoginPage.visit();
      LoginPage.loginAsManager();
      DashboardPage.shouldShowUserRole('manager');
    });

    it('should redirect to dashboard if already logged in', () => {
      LoginPage.visit();
      LoginPage.loginAsManager();
      DashboardPage.shouldBeVisible();
      cy.visit('/login');
      DashboardPage.shouldBeVisible();
    });
  });

  // ─────────────────────────────────────────────────────────
  // PROTECTED ROUTES
  // ─────────────────────────────────────────────────────────
  describe('Protected Routes', () => {
    it('should redirect to login when accessing dashboard without auth', () => {
      DashboardPage.visit();
      DashboardPage.shouldRedirectToLogin();
    });

    it('should redirect to login when accessing root without auth', () => {
      cy.visit('/');
      DashboardPage.shouldRedirectToLogin();
    });
  });

  // ─────────────────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────────────────
  describe('Logout', () => {
    beforeEach(() => {
      LoginPage.visit();
      LoginPage.loginAsManager();
      DashboardPage.shouldBeVisible();
    });

    it('should logout and redirect to login page', () => {
      DashboardPage.logout();
      LoginPage.shouldBeVisible();
    });

    it('should redirect to login when accessing dashboard after logout', () => {
      DashboardPage.logout();
      DashboardPage.visit();
      DashboardPage.shouldRedirectToLogin();
    });
  });

  // ─────────────────────────────────────────────────────────
  // SESSION SECURITY
  // ─────────────────────────────────────────────────────────
  describe('Session Security', () => {

    it('should redirect to login with tampered session data - KNOWN SECURITY ISSUE: app accepts tampered session without server validation', () => {
      cy.window().then((win) => {
        win.sessionStorage.setItem('fleetpulse_user',
          '{"id":999,"email":"hacker@evil.com","role":"manager","name":"Hacker"}');
      });
      DashboardPage.visit();
      DashboardPage.shouldRedirectToLogin();
    });

    it('should redirect to login with invalid JSON in session', () => {
      cy.window().then((win) => {
        win.sessionStorage.setItem('fleetpulse_user', 'invalid_json_data');
      });
      DashboardPage.visit();
      DashboardPage.shouldRedirectToLogin();
    });

    it('should clear session storage on logout', () => {
      LoginPage.visit();
      LoginPage.loginAsManager();
      DashboardPage.shouldBeVisible();
      DashboardPage.logout();
      cy.window().then((win) => {
        expect(win.sessionStorage.getItem('fleetpulse_user')).to.be.null;
      });
    });

    it('should not store password in session storage', () => {
      LoginPage.visit();
      LoginPage.loginAsManager();
      DashboardPage.shouldBeVisible();
      cy.window().then((win) => {
        const stored = win.sessionStorage.getItem('fleetpulse_user');
        expect(stored).to.not.be.null;
        const userData = JSON.parse(stored);
        expect(userData).to.not.have.property('password');
        expect(stored).to.not.include('manager123');
      });
    });

    it('should not elevate viewer role to manager', () => {
      LoginPage.visit();
      LoginPage.loginAsViewer();
      DashboardPage.shouldBeVisible();
      cy.window().then((win) => {
        const stored = win.sessionStorage.getItem('fleetpulse_user');
        expect(stored).to.not.be.null;
        const userData = JSON.parse(stored);
        expect(userData.role).to.equal('viewer');
        expect(userData.role).to.not.equal('manager');
      });
    });

  });
});