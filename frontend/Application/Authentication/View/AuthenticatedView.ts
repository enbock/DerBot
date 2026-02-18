import type AuthenticationAdapter from '../Adapter';

/**
 * Authenticated View
 * Hauptansicht für eingeloggte Benutzer
 */
export default class AuthenticatedView {
  constructor(private readonly adapter: AuthenticationAdapter) {}

  render(container: HTMLElement, nickname: string): void {
    container.innerHTML = `
      <div class="app-shell">
        <header class="app-header">
          <div class="app-title">
            <h1>Welcome, ${nickname}</h1>
            <p>Session active</p>
          </div>
          <button id="logoutBtn" class="btn-danger">Logout</button>
        </header>
        <div id="chatRoot"></div>
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
