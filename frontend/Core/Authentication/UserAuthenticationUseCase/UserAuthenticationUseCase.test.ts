import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import UserAuthenticationUseCase from './UserAuthenticationUseCase.ts';
import type AuthenticationClient from '../AuthenticationClient.ts';
import type SessionStorage from '../SessionStorage.ts';
import type RegisterUserRequest from './RegisterUserRequest.ts';
import type LoginUserRequest from './LoginUserRequest.ts';
import SessionEntity from '../SessionEntity.ts';
import { mock } from '../../../test/mock.ts';

describe('UserAuthenticationUseCase', () => {
  let useCase: UserAuthenticationUseCase;
  let mockClient: any;
  let mockStorage: any;

  beforeEach(() => {
    mockClient = mock<AuthenticationClient>();
    mockStorage = mock<SessionStorage>();
  });

  describe('register', () => {
    it('should register user and return QR code', async () => {
      mockClient.register.and.resolveTo({
        qrCodeDataUrl: 'data:image/png;base64,test',
        secret: 'SECRET123'
      });
      useCase = new UserAuthenticationUseCase(mockClient, mockStorage);
      
      const request: RegisterUserRequest = { nickname: 'newuser' };
      const response = await useCase.register(request);

      assert.strictEqual(response.qrCodeDataUrl, 'data:image/png;base64,test');
      assert.strictEqual(response.secret, 'SECRET123');
    });

    it('should propagate client errors', async () => {
      mockClient.register.and.callFake(async () => {
        throw new Error('Registration failed');
      });
      useCase = new UserAuthenticationUseCase(mockClient, mockStorage);
      
      await assert.rejects(
        async () => useCase.register({ nickname: 'user' }),
        /Registration failed/
      );
    });
  });

  describe('login', () => {
    it('should login user and save session', async () => {
      mockClient.login.and.resolveTo({
        token: 'token-123',
        nickname: 'testuser',
        expiresAt: new Date(Date.now() + 3600000).toISOString()
      });
      useCase = new UserAuthenticationUseCase(mockClient, mockStorage);
      
      const request: LoginUserRequest = { totp: '123456' };
      const response = await useCase.login(request);

      assert.strictEqual(response.nickname, 'testuser');
      assert.ok(mockStorage.save.mock.calls.length > 0);
    });

    it('should reject invalid TOTP', async () => {
      mockClient.login.and.callFake(async () => {
        throw new Error('Invalid TOTP');
      });
      useCase = new UserAuthenticationUseCase(mockClient, mockStorage);
      
      await assert.rejects(
        async () => useCase.login({ totp: '000000' }),
        /Invalid TOTP/
      );
    });

    it('should not save session on login failure', async () => {
      mockClient.login.and.callFake(async () => {
        throw new Error('Invalid TOTP');
      });
      useCase = new UserAuthenticationUseCase(mockClient, mockStorage);
      
      try {
        await useCase.login({ totp: '000000' });
      } catch {
        // Expected to fail
      }
      
      assert.strictEqual(mockStorage.save.mock.calls.length, 0);
    });
  });

  describe('logout', () => {
    it('should logout user and clear session', async () => {
      mockClient.logout.and.resolveTo({ success: true });
      const session = new SessionEntity();
      Object.assign(session, { token: 'token-123', nickname: 'user', expiresAt: new Date(Date.now() + 3600000).toISOString() });
      mockStorage.load.and.returnValue(session);
      useCase = new UserAuthenticationUseCase(mockClient, mockStorage);
      
      await useCase.logout();
      
      assert.ok(mockStorage.clear.mock.calls.length > 0);
    });

    it('should handle logout without session token', async () => {
      mockStorage.load.and.returnValue(new SessionEntity());
      useCase = new UserAuthenticationUseCase(mockClient, mockStorage);
      
      await useCase.logout();
      
      assert.ok(mockStorage.clear.mock.calls.length > 0);
    });

    it('should log API errors but still clear session', async () => {
      mockClient.logout.and.callFake(async () => {
        throw new Error('API error');
      });
      const session = new SessionEntity();
      Object.assign(session, { token: 'invalid', nickname: 'user', expiresAt: new Date(Date.now() + 3600000).toISOString() });
      mockStorage.load.and.returnValue(session);
      useCase = new UserAuthenticationUseCase(mockClient, mockStorage);
      
      await useCase.logout();
      
      assert.ok(mockStorage.clear.mock.calls.length > 0);
    });
  });

  describe('verifySession', () => {
    it('should return session nickname if valid', async () => {
      const expiresAt = new Date(Date.now() + 3600000).toISOString();
      mockStorage.isValid.and.returnValue(true);
      const session = new SessionEntity();
      Object.assign(session, { token: 'valid-token', nickname: 'testuser', expiresAt });
      mockStorage.load.and.returnValue(session);
      mockClient.verify.and.resolveTo({ valid: true, nickname: 'testuser' });
      useCase = new UserAuthenticationUseCase(mockClient, mockStorage);
      
      const response = await useCase.verifySession();
      
      assert.strictEqual(response.nickname, 'testuser');
    });

    it('should return null if no session', async () => {
      mockStorage.isValid.and.returnValue(false);
      useCase = new UserAuthenticationUseCase(mockClient, mockStorage);
      
      const response = await useCase.verifySession();
      
      assert.strictEqual(response.nickname, null);
    });

    it('should clear invalid session from API', async () => {
      const expiresAt = new Date(Date.now() + 3600000).toISOString();
      mockStorage.isValid.and.returnValue(true);
      const session = new SessionEntity();
      Object.assign(session, { token: 'invalid', nickname: 'testuser', expiresAt });
      mockStorage.load.and.returnValue(session);
      mockClient.verify.and.resolveTo({ valid: false, nickname: null });
      useCase = new UserAuthenticationUseCase(mockClient, mockStorage);
      
      const response = await useCase.verifySession();
      
      assert.strictEqual(response.nickname, null);
      assert.ok(mockStorage.clear.mock.calls.length > 0);
    });

    it('should handle API errors and clear session', async () => {
      const expiresAt = new Date(Date.now() + 3600000).toISOString();
      mockStorage.isValid.and.returnValue(true);
      const session = new SessionEntity();
      Object.assign(session, { token: 'token', nickname: 'user', expiresAt });
      mockStorage.load.and.returnValue(session);
      mockClient.verify.and.callFake(async () => {
        throw new Error('API error');
      });
      useCase = new UserAuthenticationUseCase(mockClient, mockStorage);
      
      const response = await useCase.verifySession();
      
      assert.strictEqual(response.nickname, null);
      assert.ok(mockStorage.clear.mock.calls.length > 0);
    });
  });
});
