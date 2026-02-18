import type AuthenticationAdapter from '../Adapter';

/**
 * Login View
 * Formular für Benutzer-Login mit TOTP
 */
export default class LoginView {
  constructor(private readonly adapter: AuthenticationAdapter) {}

  render(container: HTMLElement): void {
    container.innerHTML = `
      <div class="auth-container">
        <h1>DerBot - Login</h1>
        <form id="loginForm" class="auth-form">
          <div class="form-group">
            <label>TOTP Code:</label>
            <div class="totp-input-container">
              <input type="text" class="totp-digit" maxlength="1" pattern="[0-9]" inputmode="numeric" data-index="0" autocomplete="off" />
              <input type="text" class="totp-digit" maxlength="1" pattern="[0-9]" inputmode="numeric" data-index="1" autocomplete="off" />
              <input type="text" class="totp-digit" maxlength="1" pattern="[0-9]" inputmode="numeric" data-index="2" autocomplete="off" />
              <input type="text" class="totp-digit" maxlength="1" pattern="[0-9]" inputmode="numeric" data-index="3" autocomplete="off" />
              <input type="text" class="totp-digit" maxlength="1" pattern="[0-9]" inputmode="numeric" data-index="4" autocomplete="off" />
              <input type="text" class="totp-digit" maxlength="1" pattern="[0-9]" inputmode="numeric" data-index="5" autocomplete="off" />
            </div>
            <small>Enter the 6-digit code from Google Authenticator</small>
          </div>
          <button type="submit" class="btn-primary">Login</button>
          <button type="button" id="showRegisterBtn" class="btn-secondary">Don't have an account? Register</button>
        </form>
        <div id="loginResult" class="result-container"></div>
      </div>
    `;

    this.attachEvents();
  }

  private attachEvents(): void {
    const form = document.getElementById('loginForm') as HTMLFormElement;
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const totpInputs = document.querySelectorAll('.totp-digit') as NodeListOf<HTMLInputElement>;

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const totp = this.getTotpCode();
        if (totp.length === 6) {
          this.adapter.onLogin?.(totp);
        }
      });
    }

    if (showRegisterBtn) {
      showRegisterBtn.addEventListener('click', () => {
        this.adapter.onShowRegister?.();
      });
    }

    this.attachTotpInputEvents(totpInputs);
    
    // Auto-focus auf erstes Feld
    if (totpInputs.length > 0) {
      totpInputs[0].focus();
    }
  }

  private attachTotpInputEvents(inputs: NodeListOf<HTMLInputElement>): void {
    inputs.forEach((input, index) => {
      // Input Event: Auto-Focus auf nächstes Feld
      input.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const value = target.value;

        // Nur Ziffern erlauben
        if (value && !/^[0-9]$/.test(value)) {
          target.value = '';
          return;
        }

        // Zum nächsten Feld springen
        if (value && index < inputs.length - 1) {
          inputs[index + 1].focus();
        }

        // Auto-Submit nach 6. Ziffer
        if (index === inputs.length - 1 && value) {
          const totp = this.getTotpCode();
          if (totp.length === 6) {
            this.adapter.onLogin?.(totp);
          }
        }
      });

      // KeyDown Event: Backspace-Handling
      input.addEventListener('keydown', (e) => {
        const target = e.target as HTMLInputElement;
        
        if (e.key === 'Backspace' && !target.value && index > 0) {
          inputs[index - 1].focus();
          inputs[index - 1].value = '';
        }
      });

      // Paste Event: 6-stelligen Code verteilen
      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData?.getData('text') || '';
        const digits = pastedData.replace(/\D/g, '').slice(0, 6);

        if (digits.length === 6) {
          inputs.forEach((inp, idx) => {
            inp.value = digits[idx] || '';
          });
          inputs[5].focus();
          
          // Auto-Submit nach Paste
          const totp = this.getTotpCode();
          if (totp.length === 6) {
            this.adapter.onLogin?.(totp);
          }
        }
      });

      // Select content on focus
      input.addEventListener('focus', (e) => {
        const target = e.target as HTMLInputElement;
        target.select();
      });
    });
  }

  private getTotpCode(): string {
    const inputs = document.querySelectorAll('.totp-digit') as NodeListOf<HTMLInputElement>;
    return Array.from(inputs).map(input => input.value).join('');
  }

  private clearTotpInputs(): void {
    const inputs = document.querySelectorAll('.totp-digit') as NodeListOf<HTMLInputElement>;
    inputs.forEach(input => {
      input.value = '';
      input.classList.remove('error');
    });
    if (inputs.length > 0) {
      inputs[0].focus();
    }
  }

  showError(message: string): void {
    const resultContainer = document.getElementById('loginResult');
    if (!resultContainer) return;

    resultContainer.innerHTML = `
      <div class="error-message">
        <p>❌ ${message}</p>
      </div>
    `;

    // Felder rot markieren und leeren
    const inputs = document.querySelectorAll('.totp-digit') as NodeListOf<HTMLInputElement>;
    inputs.forEach(input => {
      input.classList.add('error');
    });
    
    // Nach kurzer Verzögerung Felder leeren und Focus setzen
    setTimeout(() => {
      this.clearTotpInputs();
    }, 1000);
  }

  clearError(): void {
    const resultContainer = document.getElementById('loginResult');
    if (resultContainer) {
      resultContainer.innerHTML = '';
    }
    
    // Error-Styling von Inputs entfernen
    const inputs = document.querySelectorAll('.totp-digit') as NodeListOf<HTMLInputElement>;
    inputs.forEach(input => {
      input.classList.remove('error');
    });
  }
}
