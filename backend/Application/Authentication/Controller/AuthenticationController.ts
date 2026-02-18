import http from 'http';
import UserAuthenticationUseCase from '../../../Core/Authentication/UserAuthenticationUseCase/UserAuthenticationUseCase';
import type RegisterUserRequest from '../../../Core/Authentication/UserAuthenticationUseCase/RegisterUserRequest';
import type LoginUserRequest from '../../../Core/Authentication/UserAuthenticationUseCase/LoginUserRequest';
import type LogoutUserRequest from '../../../Core/Authentication/UserAuthenticationUseCase/LogoutUserRequest';
import type VerifySessionRequest from '../../../Core/Authentication/UserAuthenticationUseCase/VerifySessionRequest';
import { HttpRouter, RequestHelper } from '../../Http/HttpServer';

export default class AuthenticationController {
  private readonly useCase: UserAuthenticationUseCase;

  constructor(useCase: UserAuthenticationUseCase) {
    this.useCase = useCase;
  }

  registerRoutes(router: HttpRouter): void {
    router.post('/api/auth/register', this.register.bind(this));
    router.post('/api/auth/login', this.login.bind(this));
    router.post('/api/auth/logout', this.logout.bind(this));
    router.get('/api/auth/verify', this.verify.bind(this));
  }

  private async register(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    try {
      const body = await RequestHelper.getJSONBody(req);
      const { nickname } = body;

      if (!nickname) {
        RequestHelper.writeJSON(res, 400, { error: 'Nickname is required' });
        return;
      }

      const request: RegisterUserRequest = { nickname };
      const result = await this.useCase.register(request);
      RequestHelper.writeJSON(res, 201, result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      RequestHelper.writeJSON(res, 400, { error: message });
    }
  }

  private async login(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    try {
      const body = await RequestHelper.getJSONBody(req);
      const { totp } = body;

      if (!totp) {
        RequestHelper.writeJSON(res, 400, { error: 'TOTP code is required' });
        return;
      }

      const request: LoginUserRequest = { totp };
      const result = await this.useCase.login(request);
      RequestHelper.writeJSON(res, 200, result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      RequestHelper.writeJSON(res, 401, { error: message });
    }
  }

  private async logout(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    try {
      const body = await RequestHelper.getJSONBody(req);
      const { token } = body;

      if (!token) {
        RequestHelper.writeJSON(res, 400, { error: 'Token is required' });
        return;
      }

      const request: LogoutUserRequest = { token };
      await this.useCase.logout(request);
      RequestHelper.writeJSON(res, 200, { success: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      RequestHelper.writeJSON(res, 400, { error: message });
    }
  }

  private async verify(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        RequestHelper.writeJSON(res, 400, { error: 'Token is required' });
        return;
      }

      const request: VerifySessionRequest = { token };
      const result = await this.useCase.verify(request);
      RequestHelper.writeJSON(res, 200, result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      RequestHelper.writeJSON(res, 400, { error: message });
    }
  }
}
