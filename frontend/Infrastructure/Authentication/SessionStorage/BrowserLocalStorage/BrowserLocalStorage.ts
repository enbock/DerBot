import SessionEntity from '../../../../Core/Authentication/SessionEntity.ts';
import type SessionStorage from '../../../../Core/Authentication/SessionStorage.ts';

/**
 * Session Storage - Browser LocalStorage Implementation
 * Persistiert Sessions im Browser localStorage
 */
export default class BrowserLocalStorage implements SessionStorage {
  private readonly storageKey = 'derbot_session';

  save(session: SessionEntity): void {
    localStorage.setItem(this.storageKey, JSON.stringify(session));
  }

  load(): SessionEntity {
    const data = localStorage.getItem(this.storageKey);
    if (!data) return new SessionEntity();

    try {
      const parsed = JSON.parse(data);
      const session = new SessionEntity();
      Object.assign(session, parsed);
      return session;
    } catch {
      return new SessionEntity();
    }
  }

  clear(): void {
    localStorage.removeItem(this.storageKey);
  }

  isValid(): boolean {
    const session = this.load();
    if (!session.token) return false;

    const expiresAt = new Date(session.expiresAt);
    const now = new Date();

    if (now > expiresAt) {
      this.clear();
      return false;
    }

    return true;
  }
}
