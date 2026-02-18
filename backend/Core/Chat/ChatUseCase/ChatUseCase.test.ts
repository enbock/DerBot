import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import ChatUseCase from './ChatUseCase.ts';
import type ChatStorage from '../ChatStorage.ts';
import type AIChatClient from '../AIChatClient.ts';
import ChatSessionEntity from '../ChatSessionEntity.ts';
import ChatMessageEntity from '../ChatMessageEntity.ts';
import AgentLogEntity from '../AgentLogEntity.ts';
import { mock } from '../../../test/mock.ts';

describe('ChatUseCase', () => {
  let useCase: ChatUseCase;
  let storage: any;
  let client: any;

  beforeEach(() => {
    storage = mock<ChatStorage>();
    client = mock<AIChatClient>();
    useCase = new ChatUseCase(storage, client);
  });

  it('creates a new session and stores it', async () => {
    await useCase.createSession({});
    assert.ok(storage.saveSession.mock.calls.length > 0);
  });

  it('lists sessions from storage', async () => {
    const session = new ChatSessionEntity();
    Object.assign(session, { id: 's1', createdAt: new Date().toISOString() });
    storage.findAllSessions.and.resolveTo([session]);

    const result = await useCase.listSessions();

    assert.strictEqual(result.sessions.length, 1);
    assert.strictEqual(result.sessions[0].id, 's1');
  });

  it('loads messages and logs for a session', async () => {
    const message = new ChatMessageEntity();
    Object.assign(message, { id: 'm1', sessionId: 's1', role: 'user', content: 'hi', createdAt: new Date().toISOString() });
    const log = new AgentLogEntity();
    Object.assign(log, { id: 'l1', sessionId: 's1', message: 'log', createdAt: new Date().toISOString() });

    storage.findMessagesBySession.and.resolveTo([message]);
    storage.findAgentLogsBySession.and.resolveTo([log]);

    const result = await useCase.loadSession({ sessionId: 's1' });

    assert.strictEqual(result.messages.length, 1);
    assert.strictEqual(result.agentLogs.length, 1);
  });

  it('sends a message and stores agent response', async () => {
    client.reply.and.resolveTo({ reply: 'echo', agentLogs: ['log1', 'log2'] });

    const result = await useCase.sendMessage({ sessionId: 's1', content: 'hello' });

    assert.strictEqual(result.message.role, 'user');
    assert.strictEqual(result.agentMessage.role, 'assistant');
    assert.strictEqual(result.agentLogs.length, 2);
    assert.ok(storage.saveMessage.mock.calls.length >= 2);
    assert.strictEqual(storage.saveAgentLog.mock.calls.length, 2);
  });
});
