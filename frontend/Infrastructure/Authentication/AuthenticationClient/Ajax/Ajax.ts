import type AuthenticationClient from '../../../../Core/Authentication/AuthenticationClient.ts';
import RegisterEntity from '../../../../Core/Authentication/RegisterEntity.ts';
import SessionEntity from '../../../../Core/Authentication/SessionEntity.ts';
import VerificationEntity from '../../../../Core/Authentication/VerificationEntity.ts';

/**
 * Authentication Client - Ajax Implementation
 * Kommuniziert mit Backend Authentication Endpoints über HTTP
 */
export default class Ajax implements AuthenticationClient {
  private readonly baseUrl: string = '/api/auth';

  async register(nickname: string): Promise<RegisterEntity> {
    const response = await fetch(`${this.baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data = await response.json();
    const entity = new RegisterEntity();
    Object.assign(entity, { secret: data.secret, qrCodeDataUrl: data.qrCodeDataUrl });
    return entity;
  }

  async login(totp: string): Promise<SessionEntity> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ totp })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    const entity = new SessionEntity();
    Object.assign(entity, { token: data.token, nickname: data.nickname, expiresAt: data.expiresAt });
    return entity;
  }

  async logout(token: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Logout failed');
    }
  }

  async verify(token: string): Promise<VerificationEntity> {
    const response = await fetch(`${this.baseUrl}/verify`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      return new VerificationEntity();
    }

    const data = await response.json();
    const entity = new VerificationEntity();
    Object.assign(entity, { valid: data.valid, nickname: data.nickname });
    return entity;
  }
}
