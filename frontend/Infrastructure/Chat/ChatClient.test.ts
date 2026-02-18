import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import Ajax from './ChatClient/Ajax/Ajax.ts';
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

describe('Chat Ajax', () => {
  let client: Ajax;

  beforeEach(() => {
    client = new Ajax();
  });

  it('creates a session', async () => {
    fetchSpy.and.resolveTo({
      ok: true,
      json: async () => ({ sessionId: 's1', createdAt: 'now' })
    } as Response);

    const session = await client.createSession();

    assert.strictEqual(session.id, 's1');
  });

  it('lists sessions', async () => {
    fetchSpy.and.resolveTo({
      ok: true,
      json: async () => ({ sessions: [{ id: 's1', createdAt: 'now' }] })
    } as Response);

    const sessions = await client.listSessions();

    assert.strictEqual(sessions.length, 1);
  });

  it('loads a session', async () => {
    fetchSpy.and.resolveTo({
      ok: true,
      json: async () => ({ messages: [], agentLogs: [] })
    } as Response);

    const result = await client.loadSession('s1');

    assert.strictEqual(result.messages.length, 0);
    assert.strictEqual(result.agentLogs.length, 0);
  });

  it('sends a message', async () => {
    fetchSpy.and.resolveTo({
      ok: true,
      json: async () => ({
        message: { id: 'm1', sessionId: 's1', role: 'user', content: 'hi', createdAt: 'now' },
        agentMessage: { id: 'm2', sessionId: 's1', role: 'assistant', content: 'ok', createdAt: 'now' },
        agentLogs: []
      })
    } as Response);

    const result = await client.sendMessage('s1', 'hi');

    assert.strictEqual(result.message.role, 'user');
    assert.strictEqual(result.agentMessage.role, 'assistant');
  });

  it('throws on errors', async () => {
    fetchSpy.and.resolveTo({
      ok: false,
      json: async () => ({ error: 'Failure' })
    } as Response);

    await assert.rejects(async () => client.listSessions(), /Failure/);
  });
});
