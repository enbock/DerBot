import { describe, it } from 'node:test';
import assert from 'node:assert';
import RateLimitService from './RateLimitService.ts';

describe('RateLimitService', () => {
  it('should allow first 5 attempts', () => {
    const service = new RateLimitService();
    const identifier = 'testuser';

    for (let i = 0; i < 5; i++) {
      assert.ok(service.isAllowed(identifier));
      service.recordAttempt(identifier);
    }
  });

  it('should block after 5 attempts', () => {
    const service = new RateLimitService();
    const identifier = 'testuser';

    for (let i = 0; i < 5; i++) {
      service.recordAttempt(identifier);
    }

    assert.strictEqual(service.isAllowed(identifier), false);
  });

  it('should reset attempts', () => {
    const service = new RateLimitService();
    const identifier = 'testuser';

    for (let i = 0; i < 5; i++) {
      service.recordAttempt(identifier);
    }

    assert.strictEqual(service.isAllowed(identifier), false);

    service.reset(identifier);
    assert.ok(service.isAllowed(identifier));
  });

  it('should allow attempts from different identifiers independently', () => {
    const service = new RateLimitService();

    for (let i = 0; i < 5; i++) {
      service.recordAttempt('user1');
    }

    assert.strictEqual(service.isAllowed('user1'), false);
    assert.ok(service.isAllowed('user2'));
  });
});
