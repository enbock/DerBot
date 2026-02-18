import type AuthenticationAdapter from '../Adapter';

/**
 * Authenticated View
 * Hauptansicht für eingeloggte Benutzer
 */
export default class AuthenticatedView {
  constructor(private readonly adapter: AuthenticationAdapter) {}

  render(container: HTMLElement, nickname: string): void {
    container.innerHTML = `
      <div class="auth-container authenticated">
        <h1>Welcome to DerBot, ${nickname}!</h1>
        <div class="user-info">
          <p>You are successfully logged in.</p>
          <p>Your session is valid for 7 days.</p>
        </div>
        <button id="logoutBtn" class="btn-danger">Logout</button>
      </div>
    `;

    this.attachEvents();
  }

  private attachEvents(): void {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.adapter.onLogout?.();
      });
    }
  }
}
