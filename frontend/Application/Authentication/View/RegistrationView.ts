import type AuthenticationAdapter from '../Adapter';

/**
 * Registration View
 * Formular für Benutzerregistrierung
 */
export default class RegistrationView {
  constructor(private readonly adapter: AuthenticationAdapter) {}

  render(container: HTMLElement): void {
    container.innerHTML = `
      <div class="auth-container">
        <h1>DerBot - Registration</h1>
        <form id="registrationForm" class="auth-form">
          <div class="form-group">
            <label for="nickname">Nickname:</label>
            <input 
              type="text" 
              id="nickname" 
              name="nickname" 
              placeholder="Enter nickname (3-20 characters)"
              pattern="[a-zA-Z0-9_]{3,20}"
              required
            />
            <small>Alphanumeric characters and underscores only</small>
          </div>
          <button type="submit" class="btn-primary">Register</button>
          <button type="button" id="showLoginBtn" class="btn-secondary">Already have an account? Login</button>
        </form>
        <div id="registrationResult" class="result-container"></div>
      </div>
    `;

    this.attachEvents();
  }

  private attachEvents(): void {
    const form = document.getElementById('registrationForm') as HTMLFormElement;
    const showLoginBtn = document.getElementById('showLoginBtn');

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const nickname = formData.get('nickname') as string;
        this.adapter.onRegister?.(nickname);
      });
    }

    if (showLoginBtn) {
      showLoginBtn.addEventListener('click', () => {
        this.adapter.onShowLogin?.();
      });
    }
  }

  showQRCode(qrCodeDataUrl: string, secret: string, nickname: string): void {
    const resultContainer = document.getElementById('registrationResult');
    if (!resultContainer) return;

    resultContainer.innerHTML = `
      <div class="qr-code-container">
        <h2>Registration Successful!</h2>
        <p>Scan this QR code with Google Authenticator:</p>
        <img src="${qrCodeDataUrl}" alt="QR Code" />
        <p class="secret-info">
          <strong>Secret (for manual entry):</strong><br/>
          <code>${secret}</code>
        </p>
        <p class="info">After scanning, use the login form to authenticate.</p>
        <button id="proceedToLoginBtn" class="btn-primary">Proceed to Login</button>
      </div>
    `;

    const proceedBtn = document.getElementById('proceedToLoginBtn');
    if (proceedBtn) {
      proceedBtn.addEventListener('click', () => {
        this.adapter.onShowLogin?.();
      });
    }
  }

  showError(message: string): void {
    const resultContainer = document.getElementById('registrationResult');
    if (!resultContainer) return;

    resultContainer.innerHTML = `
      <div class="error-message">
        <p>❌ ${message}</p>
      </div>
    `;
  }

  clearError(): void {
    const resultContainer = document.getElementById('registrationResult');
    if (resultContainer) {
      resultContainer.innerHTML = '';
    }
  }
}
