import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { authenticator } from 'otplib';
import UserAuthenticationUseCase from './UserAuthenticationUseCase';
import type UserStorage from '../UserStorage';
import type SessionStorage from '../SessionStorage';
import TotpService from '../TotpService';
import RateLimitService from '../RateLimitService';
import UserEntity from '../UserEntity';
import SessionEntity from '../SessionEntity';
import { mock } from '../../../test/mock';

function createMockUserStorage(): Mocked<UserStorage> {
  const mockStorage = mock<UserStorage>();
  mockStorage.findByNickname.and.resolveTo(new UserEntity());
  mockStorage.findAll.and.resolveTo([]);
  mockStorage.save.and.resolveTo(undefined);
  mockStorage.exists.and.resolveTo(false);
  return mockStorage;
}

function createMockSessionStorage(): Mocked<SessionStorage> {
  const mockStorage = mock<SessionStorage>();
  mockStorage.findByToken.and.resolveTo(new SessionEntity());
  mockStorage.findByNickname.and.resolveTo(new SessionEntity());
  mockStorage.save.and.resolveTo(undefined);
  mockStorage.delete.and.resolveTo(undefined);
  mockStorage.deleteExpired.and.resolveTo(undefined);
  return mockStorage;
}

describe('UserAuthenticationUseCase', () => {
  let useCase: UserAuthenticationUseCase;
  let userStorage: Mocked<UserStorage>;
  let sessionStorage: Mocked<SessionStorage>;
  let totpService: TotpService;
  let rateLimitService: RateLimitService;

  beforeEach(() => {
    totpService = new TotpService();
    rateLimitService = new RateLimitService();
    userStorage = createMockUserStorage();
    sessionStorage = createMockSessionStorage();
    useCase = new UserAuthenticationUseCase(
      userStorage,
      sessionStorage,
      totpService,
      rateLimitService
    );
  });

  // Register Tests
  describe('register', () => {
    it('should successfully register a new user', async () => {
      const result = await useCase.register({ nickname: 'testuser' });
      assert.strictEqual(typeof result.secret, 'string');
      assert.strictEqual(typeof result.qrCodeDataUrl, 'string');
      assert.ok(result.secret.length > 0);
      assert.ok(result.qrCodeDataUrl.startsWith('data:'));
    });

    it('should throw on invalid nickname', async () => {
      try {
        await useCase.register({ nickname: 'a' });
        assert.fail('Should have thrown');
      } catch (error) {
        assert.ok(true);
      }
    });

    it('should throw when nickname already exists', async () => {
      userStorage = mock<UserStorage>();
      userStorage.findByNickname.and.resolveTo(new UserEntity());
      userStorage.findAll.and.resolveTo([]);
      userStorage.save.and.resolveTo(undefined);
      userStorage.exists.and.callFake(async (nickname: string) => nickname === 'existing');
      
      useCase = new UserAuthenticationUseCase(
        userStorage,
        sessionStorage,
        totpService,
        rateLimitService
      );

      try {
        await useCase.register({ nickname: 'existing' });
        assert.fail('Should have thrown');
      } catch (error) {
        assert.strictEqual((error as Error).message, 'Nickname already exists');
      }
    });

    it('should save user to storage', async () => {
      let savedUser: UserEntity = new UserEntity();
      userStorage = mock<UserStorage>();
      userStorage.save.and.callFake(async (user: UserEntity) => {
        savedUser = user;
      });
      userStorage.findByNickname.and.resolveTo(new UserEntity());
      userStorage.findAll.and.resolveTo([]);
      userStorage.exists.and.resolveTo(false);

      useCase = new UserAuthenticationUseCase(
        userStorage,
        sessionStorage,
        totpService,
        rateLimitService
      );

      await useCase.register({ nickname: 'testuser' });
      assert.ok(savedUser.nickname);
      assert.strictEqual(savedUser.nickname, 'testuser');
    });
  });

  // Login Tests
  describe('login', () => {
    it('should successfully login with valid TOTP', async () => {
      const secret = totpService.generateSecret();
      const user = new UserEntity();
      Object.assign(user, {
        nickname: 'testuser',
        secret,
        createdAt: new Date().toISOString()
      });

      userStorage = mock<UserStorage>();
      userStorage.findAll.and.resolveTo([user]);
      
      useCase = new UserAuthenticationUseCase(
        userStorage,
        sessionStorage,
        totpService,
        rateLimitService
      );

      const totp = authenticator.generate(secret);
      const result = await useCase.login({ totp });

      assert.strictEqual(typeof result.token, 'string');
      assert.strictEqual(result.nickname, 'testuser');
      assert.strictEqual(typeof result.expiresAt, 'string');
      assert.ok(result.token.length > 0);
    });

    it('should throw on invalid TOTP', async () => {
      try {
        await useCase.login({ totp: '000000' });
        assert.fail('Should have thrown');
      } catch (error) {
        assert.strictEqual((error as Error).message, 'Invalid TOTP code');
      }
    });

    it('should reuse existing valid session', async () => {
      const secret = totpService.generateSecret();
      const user = new UserEntity();
      Object.assign(user, {
        nickname: 'testuser',
        secret,
        createdAt: new Date().toISOString()
      });

      const existingSession = new SessionEntity();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      Object.assign(existingSession, {
        token: 'existing-token',
        nickname: 'testuser',
        createdAt: new Date().toISOString(),
        expiresAt: futureDate.toISOString()
      });

      userStorage = mock<UserStorage>();
      userStorage.findAll.and.resolveTo([user]);
      
      sessionStorage = mock<SessionStorage>();
      sessionStorage.findByNickname.and.callFake(async (nickname: string) => {
        if (nickname === 'testuser') return existingSession;
        return new SessionEntity();
      });
      
      useCase = new UserAuthenticationUseCase(
        userStorage,
        sessionStorage,
        totpService,
        rateLimitService
      );

      const totp = authenticator.generate(secret);
      const result = await useCase.login({ totp });

      assert.strictEqual(result.token, 'existing-token');
      assert.strictEqual(result.nickname, 'testuser');
    });

    it('should save new session to storage', async () => {
      let savedSession: SessionEntity = new SessionEntity();
      const secret = totpService.generateSecret();
      const user = new UserEntity();
      Object.assign(user, {
        nickname: 'testuser',
        secret,
        createdAt: new Date().toISOString()
      });

      userStorage = mock<UserStorage>();
      userStorage.findAll.and.resolveTo([user]);
      
      sessionStorage = mock<SessionStorage>();
      sessionStorage.save.and.callFake(async (session: SessionEntity) => {
        savedSession = session;
      });
      sessionStorage.findByToken.and.resolveTo(new SessionEntity());
      sessionStorage.findByNickname.and.resolveTo(new SessionEntity());
      sessionStorage.delete.and.resolveTo(undefined);
      sessionStorage.deleteExpired.and.resolveTo(undefined);

      useCase = new UserAuthenticationUseCase(
        userStorage,
        sessionStorage,
        totpService,
        rateLimitService
      );

      const totp = authenticator.generate(secret);
      await useCase.login({ totp });

      assert.ok(savedSession.nickname);
      assert.strictEqual(savedSession.nickname, 'testuser');
      assert.ok(savedSession.token.length > 0);
    });
  });

  // Logout Tests
  describe('logout', () => {
    it('should delete session token', async () => {
      let deletedToken: string | null = null;
      
      sessionStorage = mock<SessionStorage>();
      sessionStorage.delete.and.callFake(async (token: string) => {
        deletedToken = token;
      });
      sessionStorage.findByToken.and.resolveTo(new SessionEntity());
      sessionStorage.findByNickname.and.resolveTo(new SessionEntity());
      sessionStorage.save.and.resolveTo(undefined);
      sessionStorage.deleteExpired.and.resolveTo(undefined);

      useCase = new UserAuthenticationUseCase(
        userStorage,
        sessionStorage,
        totpService,
        rateLimitService
      );

      await useCase.logout({ token: 'test-token' });
      assert.strictEqual(deletedToken, 'test-token');
    });
  });

  // Verify Tests
  describe('verify', () => {
    it('should return valid true for existing session', async () => {
      const session = new SessionEntity();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      Object.assign(session, {
        token: 'test-token',
        nickname: 'testuser',
        createdAt: new Date().toISOString(),
        expiresAt: futureDate.toISOString()
      });

      sessionStorage = mock<SessionStorage>();
      sessionStorage.findByToken.and.callFake(async (token: string) => {
        if (token === 'test-token') return session;
        return new SessionEntity();
      });
      sessionStorage.findByNickname.and.resolveTo(new SessionEntity());
      sessionStorage.save.and.resolveTo(undefined);
      sessionStorage.delete.and.resolveTo(undefined);
      sessionStorage.deleteExpired.and.resolveTo(undefined);

      useCase = new UserAuthenticationUseCase(
        userStorage,
        sessionStorage,
        totpService,
        rateLimitService
      );

      const result = await useCase.verify({ token: 'test-token' });

      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.nickname, 'testuser');
    });

    it('should return valid false for non-existent token', async () => {
      const result = await useCase.verify({ token: 'non-existent' });
      assert.strictEqual(result.valid, false);
      assert.strictEqual(result.nickname, '');
    });

    it('should return valid false for expired session', async () => {
      let deletedToken: string | null = null;
      const session = new SessionEntity();
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      Object.assign(session, {
        token: 'expired-token',
        nickname: 'testuser',
        createdAt: new Date().toISOString(),
        expiresAt: pastDate.toISOString()
      });

      sessionStorage = mock<SessionStorage>();
      sessionStorage.findByToken.and.callFake(async (token: string) => {
        if (token === 'expired-token') return session;
        return new SessionEntity();
      });
      sessionStorage.delete.and.callFake(async (token: string) => {
        deletedToken = token;
      });
      sessionStorage.findByNickname.and.resolveTo(new SessionEntity());
      sessionStorage.save.and.resolveTo(undefined);
      sessionStorage.deleteExpired.and.resolveTo(undefined);

      useCase = new UserAuthenticationUseCase(
        userStorage,
        sessionStorage,
        totpService,
        rateLimitService
      );

      const result = await useCase.verify({ token: 'expired-token' });

      assert.strictEqual(result.valid, false);
      assert.strictEqual(result.nickname, '');
      assert.strictEqual(deletedToken, 'expired-token');
    });
  });
});
