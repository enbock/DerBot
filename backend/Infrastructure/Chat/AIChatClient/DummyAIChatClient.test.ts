import { describe, it } from 'node:test';
import assert from 'node:assert';
import DummyAIChatClient from './DummyAIChatClient.ts';

describe('DummyAIChatClient', () => {
  it('returns echo reply and logs', async () => {
    const client = new DummyAIChatClient();
    const result = await client.reply('session-1', 'hello');

    assert.ok(result.reply.includes('hello'));
    assert.ok(result.agentLogs.length >= 1);
  });
});
