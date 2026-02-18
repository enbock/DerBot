import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import ChatUseCase from './ChatUseCase.ts';
import type ChatClient from '../ChatClient.ts';
import ChatSessionEntity from '../ChatSessionEntity.ts';
import ChatMessageEntity from '../ChatMessageEntity.ts';
import AgentLogEntity from '../AgentLogEntity.ts';
import ChatStateEntity from '../ChatStateEntity.ts';
import type ChatStateStorage from '../ChatStateStorage.ts';
import { mock } from '../../../test/mock.ts';

describe('ChatUseCase', () => {
  let useCase: ChatUseCase;
  let client: any;
  let storage: any;
  let state: ChatStateEntity;

  beforeEach(() => {
    client = mock<ChatClient>();
    state = new ChatStateEntity();
    storage = mock<ChatStateStorage>();
    storage.load.and.callFake(() => state);
    storage.save.and.callFake((next: ChatStateEntity) => {
      state = next;
    });
    useCase = new ChatUseCase(client, storage);
  });

  it('creates session via client', async () => {
    const session = new ChatSessionEntity();
    Object.assign(session, { id: 's1', createdAt: new Date().toISOString() });
    client.createSession.and.resolveTo(session);

    const response = await useCase.createSession({});

    assert.strictEqual(response.currentSessionId, 's1');
    assert.strictEqual(response.sessions.length, 1);
  });

  it('lists sessions via client', async () => {
    const session = new ChatSessionEntity();
    Object.assign(session, { id: 's2', createdAt: new Date().toISOString() });
    const message = new ChatMessageEntity();
    Object.assign(message, { id: 'm1', sessionId: 's2', role: 'user', content: 'hi', createdAt: new Date().toISOString() });

    client.listSessions.and.resolveTo([session]);
    client.loadSession.and.resolveTo({ messages: [message], agentLogs: [] });

    const response = await useCase.listSessions();

    assert.strictEqual(response.sessions.length, 1);
    assert.strictEqual(response.currentSessionId, 's2');
    assert.strictEqual(response.messages.length, 1);
  });

  it('loads session content via client', async () => {
    const message = new ChatMessageEntity();
    Object.assign(message, { id: 'm1', sessionId: 's1', role: 'user', content: 'hi', createdAt: new Date().toISOString() });
    const log = new AgentLogEntity();
    Object.assign(log, { id: 'l1', sessionId: 's1', message: 'log', createdAt: new Date().toISOString() });

    client.loadSession.and.resolveTo({ messages: [message], agentLogs: [log] });

    const response = await useCase.loadSession({ sessionId: 's1' });

    assert.strictEqual(response.currentSessionId, 's1');
    assert.strictEqual(response.messages.length, 1);
    assert.strictEqual(response.agentLogs.length, 1);
  });

  it('sends message via client', async () => {
    const session = new ChatSessionEntity();
    Object.assign(session, { id: 's1', createdAt: new Date().toISOString() });
    const message = new ChatMessageEntity();
    Object.assign(message, { id: 'm1', sessionId: 's1', role: 'user', content: 'hi', createdAt: new Date().toISOString() });
    const agentMessage = new ChatMessageEntity();
    Object.assign(agentMessage, { id: 'm2', sessionId: 's1', role: 'assistant', content: 'ok', createdAt: new Date().toISOString() });

    client.createSession.and.resolveTo(session);
    client.sendMessage.and.resolveTo({ message, agentMessage, agentLogs: [] });

    const response = await useCase.sendMessage({ sessionId: '', content: 'hi' });

    assert.strictEqual(response.currentSessionId, 's1');
    assert.strictEqual(response.messages.length, 2);
  });
});
