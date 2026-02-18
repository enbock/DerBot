import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import FileChatStorage from './FileChatStorage.ts';
import ChatSessionEntity from '../../Core/Chat/ChatSessionEntity.ts';
import ChatMessageEntity from '../../Core/Chat/ChatMessageEntity.ts';
import AgentLogEntity from '../../Core/Chat/AgentLogEntity.ts';
import os from 'node:os';

let tempDir = '';
let storage: FileChatStorage;

describe('FileChatStorage', () => {
  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'derbot-chat-'));
    storage = new FileChatStorage(tempDir);
    await storage.initialize();
  });

  afterEach(async () => {
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  it('stores and loads sessions', async () => {
    const session = new ChatSessionEntity();
    Object.assign(session, { id: 's1', createdAt: new Date().toISOString() });

    await storage.saveSession(session);

    const sessions = await storage.findAllSessions();
    assert.strictEqual(sessions.length, 1);
    assert.strictEqual(sessions[0].id, 's1');
  });

  it('stores and loads messages per session', async () => {
    const message = new ChatMessageEntity();
    Object.assign(message, { id: 'm1', sessionId: 's1', role: 'user', content: 'hello', createdAt: new Date().toISOString() });

    await storage.saveMessage(message);

    const messages = await storage.findMessagesBySession('s1');
    assert.strictEqual(messages.length, 1);
    assert.strictEqual(messages[0].id, 'm1');
  });

  it('stores and loads agent logs per session', async () => {
    const log = new AgentLogEntity();
    Object.assign(log, { id: 'l1', sessionId: 's1', message: 'log', createdAt: new Date().toISOString() });

    await storage.saveAgentLog(log);

    const logs = await storage.findAgentLogsBySession('s1');
    assert.strictEqual(logs.length, 1);
    assert.strictEqual(logs[0].id, 'l1');
  });
});
