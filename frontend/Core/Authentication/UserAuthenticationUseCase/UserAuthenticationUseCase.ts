import type AuthenticationClient from '../AuthenticationClient.ts';
import type SessionStorage from '../SessionStorage.ts';
import type RegisterUserRequest from './RegisterUserRequest.ts';
import RegisterUserResponse from './RegisterUserResponse.ts';
import type LoginUserRequest from './LoginUserRequest.ts';
import LoginUserResponse from './LoginUserResponse.ts';
import VerifySessionResponse from './VerifySessionResponse.ts';

export default class UserAuthenticationUseCase {
  private readonly client: AuthenticationClient;
  private readonly sessionStorage: SessionStorage;

  constructor(client: AuthenticationClient, sessionStorage: SessionStorage) {
    this.client = client;
    this.sessionStorage = sessionStorage;
  }

  async register(request: RegisterUserRequest): Promise<RegisterUserResponse> {
    const result = await this.client.register(request.nickname);
    return new RegisterUserResponse(result.qrCodeDataUrl, result.secret);
  }

  async login(request: LoginUserRequest): Promise<LoginUserResponse> {
    const result = await this.client.login(request.totp);
    
    this.sessionStorage.save(result);

    return new LoginUserResponse(result.nickname);
  }

  async logout(): Promise<void> {
    const session = this.sessionStorage.load();
    
    try {
      if (session.token) {
        await this.client.logout(session.token);
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      this.sessionStorage.clear();
    }
  }

  async verifySession(): Promise<VerifySessionResponse> {
    if (!this.sessionStorage.isValid()) {
      return new VerifySessionResponse(null);
    }

    const session = this.sessionStorage.load();

    try {
      const result = await this.client.verify(session.token);
      if (result.valid && result.nickname) {
        return new VerifySessionResponse(result.nickname);
      } else {
        this.sessionStorage.clear();
        return new VerifySessionResponse(null);
      }
    } catch {
      this.sessionStorage.clear();
      return new VerifySessionResponse(null);
    }
  }
}
