import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import BrowserLocalStorage from '../../Infrastructure/Authentication/SessionStorage/BrowserLocalStorage/BrowserLocalStorage.ts';
import { createSpy } from '../../test/mock.ts';

const localStorageMock: Record<string, string> = {};

const mockLocalStorage = {
  getItem: createSpy<(key: string) => string | null>(),
  setItem: createSpy<(key: string, value: string) => void>(),
  removeItem: createSpy<(key: string) => void>(),
  clear: createSpy<() => void>()
};

beforeEach(() => {
  localStorageMock.derbot_session = '';
  
  mockLocalStorage.getItem.and.callFake((key: string) => {
    return localStorageMock[key] ?? null;
  });
  
  mockLocalStorage.setItem.and.callFake((key: string, value: string) => {
    localStorageMock[key] = value;
  });
  
  mockLocalStorage.removeItem.and.callFake((key: string) => {
    delete localStorageMock[key];
  });
  
  // @ts-ignore
  global.localStorage = mockLocalStorage;
});

afterEach(() => {
  // @ts-ignore
  delete global.localStorage;
});

describe('BrowserLocalStorage', () => {
  let storage: BrowserLocalStorage;

  beforeEach(() => {
    storage = new BrowserLocalStorage();
  });

  describe('save', () => {
    it('should save session to localStorage', () => {
      const session = { token: 'test-token', nickname: 'user', expiresAt: new Date().toISOString() };
      storage.save(session);

      assert.ok(mockLocalStorage.setItem.mock.calls.length > 0);
      const savedValue = localStorageMock['derbot_session'];
      const parsed = JSON.parse(savedValue);
      assert.strictEqual(parsed.token, 'test-token');
    });

    it('should overwrite previous session', () => {
      const session1 = { token: 'token1', nickname: 'user1', expiresAt: new Date().toISOString() };
      const session2 = { token: 'token2', nickname: 'user2', expiresAt: new Date().toISOString() };
      
      storage.save(session1);
      storage.save(session2);

      const savedValue = localStorageMock['derbot_session'];
      const parsed = JSON.parse(savedValue);
      assert.strictEqual(parsed.token, 'token2');
    });
  });

  describe('load', () => {
    it('should load session from localStorage', () => {
      const session = { token: 'test-token', nickname: 'user', expiresAt: new Date().toISOString() };
      storage.save(session);

      const loaded = storage.load();
      assert.strictEqual(loaded.token, 'test-token');
      assert.strictEqual(loaded.nickname, 'user');
    });

    it('should return empty session if no session stored', () => {
      const loaded = storage.load();
      assert.strictEqual(loaded.token, '');
      assert.strictEqual(loaded.nickname, '');
    });

    it('should return empty session on corrupted data', () => {
      localStorageMock['derbot_session'] = 'invalid json';
      
      const loaded = storage.load();
      assert.strictEqual(loaded.token, '');
      assert.strictEqual(loaded.nickname, '');
    });
  });

  describe('clear', () => {
    it('should remove session from localStorage', () => {
      const session = { token: 'test-token', nickname: 'user', expiresAt: new Date().toISOString() };
      storage.save(session);
      assert.ok(storage.load().token);

      storage.clear();
      const loaded = storage.load();
      assert.strictEqual(loaded.token, '');
    });

    it('should handle clearing when nothing is stored', () => {
      assert.doesNotThrow(() => {
        storage.clear();
      });
    });
  });

  describe('isValid', () => {
    it('should return true for valid non-expired session', () => {
      const session = { 
        token: 'token', 
        nickname: 'user', 
        expiresAt: new Date(Date.now() + 3600000).toISOString() 
      };
      storage.save(session);

      assert.strictEqual(storage.isValid(), true);
    });

    it('should return false for expired session', () => {
      const session = { 
        token: 'token', 
        nickname: 'user', 
        expiresAt: new Date(Date.now() - 3600000).toISOString() 
      };
      storage.save(session);

      assert.strictEqual(storage.isValid(), false);
    });

    it('should return false if no session', () => {
      assert.strictEqual(storage.isValid(), false);
    });

    it('should clear expired session', () => {
      const session = { 
        token: 'token', 
        nickname: 'user', 
        expiresAt: new Date(Date.now() - 3600000).toISOString() 
      };
      storage.save(session);
      assert.ok(storage.load().token);

      const isValid = storage.isValid();
      assert.strictEqual(isValid, false);
      const loaded = storage.load();
      assert.strictEqual(loaded.token, '');
    });

    it('should return true for session expiring in future', () => {
      const session = { 
        token: 'token', 
        nickname: 'user', 
        expiresAt: new Date(Date.now() + 86400000).toISOString() 
      };
      storage.save(session);

      assert.strictEqual(storage.isValid(), true);
    });
  });
});
