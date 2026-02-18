import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import Ajax from './AuthenticationClient/Ajax/Ajax.ts';
import { createSpy } from '../../test/mock.ts';

const fetchSpy = createSpy<typeof fetch>();

beforeEach(() => {
  // @ts-ignore
  global.fetch = fetchSpy;
});

afterEach(() => {
  // @ts-ignore
  delete global.fetch;
});

describe('Ajax', () => {
  let client: Ajax;

  beforeEach(() => {
    client = new Ajax();
  });

  describe('register', () => {
    it('should send register request and return secret + QR code', async () => {
      fetchSpy.and.resolveTo({
        ok: true,
        json: async () => ({
          secret: 'SECRET123',
          qrCodeDataUrl: 'data:image/png;base64,test'
        })
      } as Response);

      const result = await client.register('newuser');

      assert.strictEqual(result.secret, 'SECRET123');
      assert.strictEqual(result.qrCodeDataUrl, 'data:image/png;base64,test');
    });

    it('should throw on registration failure', async () => {
      fetchSpy.and.resolveTo({
        ok: false,
        json: async () => ({ error: 'Nickname already taken' })
      } as Response);

      await assert.rejects(
        async () => client.register('taken'),
        /Nickname already taken/
      );
    });

    it('should throw with default message on error without error field', async () => {
      fetchSpy.and.resolveTo({
        ok: false,
        json: async () => ({})
      } as Response);

      await assert.rejects(
        async () => client.register('user'),
        /Registration failed/
      );
    });
  });

  describe('login', () => {
    it('should send login request and return token + nickname', async () => {
      const expiresAt = new Date(Date.now() + 3600000).toISOString();
      
      fetchSpy.and.resolveTo({
        ok: true,
        json: async () => ({
          token: 'token-123',
          nickname: 'testuser',
          expiresAt
        })
      } as Response);

      const result = await client.login('123456');

      assert.strictEqual(result.token, 'token-123');
      assert.strictEqual(result.nickname, 'testuser');
      assert.strictEqual(result.expiresAt, expiresAt);
    });

    it('should throw on login failure', async () => {
      fetchSpy.and.resolveTo({
        ok: false,
        json: async () => ({ error: 'Invalid TOTP' })
      } as Response);

      await assert.rejects(
        async () => client.login('000000'),
        /Invalid TOTP/
      );
    });

    it('should throw with default message on error without error field', async () => {
      fetchSpy.and.resolveTo({
        ok: false,
        json: async () => ({})
      } as Response);

      await assert.rejects(
        async () => client.login('123456'),
        /Login failed/
      );
    });
  });

  describe('logout', () => {
    it('should send logout request', async () => {
      fetchSpy.and.resolveTo({
        ok: true,
        json: async () => ({ success: true })
      } as Response);

      await client.logout('token-123');

      assert.ok(fetchSpy.mock.calls.length > 0);
    });

    it('should throw on logout failure', async () => {
      fetchSpy.and.resolveTo({
        ok: false,
        json: async () => ({ error: 'Invalid token' })
      } as Response);

      await assert.rejects(
        async () => client.logout('invalid-token'),
        /Invalid token/
      );
    });

    it('should throw with default message on error without error field', async () => {
      fetchSpy.and.resolveTo({
        ok: false,
        json: async () => ({})
      } as Response);

      await assert.rejects(
        async () => client.logout('token'),
        /Logout failed/
      );
    });
  });

  describe('verify', () => {
    it('should send verify request with Bearer token', async () => {
      fetchSpy.and.resolveTo({
        ok: true,
        json: async () => ({
          valid: true,
          nickname: 'testuser'
        })
      } as Response);

      const result = await client.verify('token-123');

      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.nickname, 'testuser');
    });

    it('should return valid false on verification failure', async () => {
      fetchSpy.and.resolveTo({
        ok: false,
        json: async () => ({})
      } as Response);

      const result = await client.verify('invalid-token');

      assert.strictEqual(result.valid, false);
    });

    it('should use GET method for verify', async () => {
      fetchSpy.and.resolveTo({
        ok: true,
        json: async () => ({ valid: true, nickname: 'user' })
      } as Response);

      await client.verify('token');

      const lastCall = fetchSpy.mock.calls[fetchSpy.mock.calls.length - 1];
      const options = lastCall.arguments[1] as Record<string, any>;
      assert.strictEqual(options.method, 'GET');
    });

    it('should use POST method for register and login', async () => {
      fetchSpy.and.resolveTo({
        ok: true,
        json: async () => ({
          secret: 'test',
          qrCodeDataUrl: 'test',
          token: 'test',
          nickname: 'test',
          expiresAt: new Date().toISOString()
        })
      } as Response);

      await client.register('user');
      let lastCall = fetchSpy.mock.calls[fetchSpy.mock.calls.length - 1];
      let options = lastCall.arguments[1] as Record<string, any>;
      assert.strictEqual(options.method, 'POST');

      await client.login('123456');
      lastCall = fetchSpy.mock.calls[fetchSpy.mock.calls.length - 1];
      options = lastCall.arguments[1] as Record<string, any>;
      assert.strictEqual(options.method, 'POST');
    });
  });
});
