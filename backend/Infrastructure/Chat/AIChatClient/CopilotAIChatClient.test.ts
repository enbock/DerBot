import { describe, test, beforeEach, mock as nodeMock } from 'node:test';
import assert from 'node:assert';
import { EventEmitter } from 'events';
import { mock } from '../../../test/mock.js';
import CopilotAIChatClient from './CopilotAIChatClient.js';
import AIChatResponse from '../../../Core/Chat/AIChatResponse.js';
import type CopilotClientFactory from './CopilotClientFactory.js';

describe('CopilotAIChatClient', () => {
  let client: CopilotAIChatClient;
  let mockCopilotClient: any;
  let mockSession: any;
  let mockFactory: CopilotClientFactory;

  beforeEach(() => {
    mockFactory = {
      create: () => mockCopilotClient
    };
    
    client = new CopilotAIChatClient(mockFactory);
    
    mockSession = new EventEmitter();
    mockSession.send = nodeMock.fn(async function() {
      const self = this as any;
      setImmediate(() => {
        self.emit('assistant.message', { data: { content: 'Test response' } });
        self.emit('session.idle');
      });
    });
    mockSession.end = nodeMock.fn(async () => {});
    
    mockCopilotClient = {
      start: nodeMock.fn(async () => {}),
      stop: nodeMock.fn(async () => {}),
      createSession: nodeMock.fn(async () => mockSession)
    };
    
    (client as any).client = null;
    (client as any).sessions = new Map();
  });

  test('reply() creates session on first call', async () => {
    (client as any).client = mockCopilotClient;

    const response = await client.reply('session-1', 'Hello');

    assert.strictEqual(mockCopilotClient.createSession.mock.calls.length, 1);
    assert.deepStrictEqual(mockCopilotClient.createSession.mock.calls[0].arguments[0], {
      model: 'auto'
    });
    assert.ok(response instanceof AIChatResponse);
    assert.strictEqual(response.reply, 'Test response');
  });

  test('reply() reuses existing session', async () => {
    (client as any).client = mockCopilotClient;

    await client.reply('session-1', 'First');
    await client.reply('session-1', 'Second');

    assert.strictEqual(mockCopilotClient.createSession.mock.calls.length, 1);
    assert.strictEqual((mockSession.send as any).mock.calls.length, 2);
  });

  test('reply() collects agent logs from events', async () => {
    (client as any).client = mockCopilotClient;

    (mockSession.send as any) = nodeMock.fn(async function() {
      const self = this as any;
      setImmediate(() => {
        self.emit('assistant.message', { data: { content: 'Response' } });
        self.emit('tool.execution_complete', { data: { tool_name: 'search' } });
        self.emit('session.idle');
      });
    });

    const response = await client.reply('session-1', 'Hello');

    assert.ok(response.agentLogs.length >= 3);
    assert.ok(response.agentLogs[0].includes('Sending message'));
    assert.ok(response.agentLogs[response.agentLogs.length - 1].includes('Received response'));
  });

  test('reply() throws error if not initialized', async () => {
    await assert.rejects(
      async () => await client.reply('session-1', 'Hello'),
      /CopilotAIChatClient not initialized/
    );
  });

  test('cleanup() ends all sessions and stops client', async () => {
    (client as any).client = mockCopilotClient;
    (client as any).sessions.set('session-1', mockSession);
    (client as any).sessions.set('session-2', mockSession);

    await client.cleanup();

    assert.strictEqual((mockSession.end as any).mock.calls.length, 2);
    assert.strictEqual(mockCopilotClient.stop.mock.calls.length, 1);
    assert.strictEqual((client as any).client, null);
  });

  test('cleanup() handles errors gracefully', async () => {
    (client as any).client = mockCopilotClient;
    mockCopilotClient.stop = nodeMock.fn(async () => {
      throw new Error('Stop failed');
    });

    await assert.doesNotReject(async () => await client.cleanup());
    assert.strictEqual(mockCopilotClient.stop.mock.calls.length, 1);
  });
});
