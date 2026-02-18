import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import ChatHandler from './ChatHandler.ts';
import ChatAdapter from '../../Adapter.ts';
import ChatSessionEntity from '../../../../Core/Chat/ChatSessionEntity.ts';
import ChatMessageEntity from '../../../../Core/Chat/ChatMessageEntity.ts';
import AgentLogEntity from '../../../../Core/Chat/AgentLogEntity.ts';
import { createSpy, mock } from '../../../../test/mock.ts';
import type ChatUseCase from '../../../../Core/Chat/ChatUseCase/ChatUseCase.ts';
import type ChatView from '../../View/ChatView.ts';
import ChatPresenter from '../../View/ChatPresenter.ts';
import ChatStateResponse from '../../../../Core/Chat/ChatUseCase/ChatStateResponse.ts';

const createContainer = (): HTMLElement => ({ innerHTML: '' } as unknown as HTMLElement);

describe('ChatHandler', () => {
  let adapter: ChatAdapter;
  let useCase: any;
  let renderSpy: any;
  let view: ChatView;
  let presenter: ChatPresenter;

  beforeEach(() => {
    adapter = new ChatAdapter();
    useCase = mock<ChatUseCase>();
    renderSpy = createSpy();
    view = { render: renderSpy } as unknown as ChatView;
    presenter = new ChatPresenter();
  });

  it('loads sessions and selects the first one', async () => {
    const session = new ChatSessionEntity();
    Object.assign(session, { id: 's1', createdAt: new Date().toISOString() });

    const message = new ChatMessageEntity();
    Object.assign(message, {
      id: 'm1',
      sessionId: 's1',
      role: 'user',
      content: 'hello',
      createdAt: new Date().toISOString()
    });

    const log = new AgentLogEntity();
    Object.assign(log, {
      id: 'l1',
      sessionId: 's1',
      message: 'log',
      createdAt: new Date().toISOString()
    });

    const state = new ChatStateResponse([session], [message], [log], 's1');
    useCase.listSessions.and.resolveTo(state);
    useCase.getState.and.returnValue(state);

    const handler = new ChatHandler(adapter, useCase, view, presenter);
    handler.showChatView(createContainer());

    await handler.initialize();

    const lastCall = renderSpy.mock.calls[renderSpy.mock.calls.length - 1];
    const model = lastCall.arguments[1];

    assert.strictEqual(model.currentSessionId, 's1');
    assert.strictEqual(model.messages.length, 1);
    assert.strictEqual(model.agentLogs.length, 1);
  });

  it('creates a session when sending without one', async () => {
    const session = new ChatSessionEntity();
    Object.assign(session, { id: 's2', createdAt: new Date().toISOString() });

    const userMessage = new ChatMessageEntity();
    Object.assign(userMessage, {
      id: 'm1',
      sessionId: 's2',
      role: 'user',
      content: 'hi',
      createdAt: new Date().toISOString()
    });

    const assistantMessage = new ChatMessageEntity();
    Object.assign(assistantMessage, {
      id: 'm2',
      sessionId: 's2',
      role: 'assistant',
      content: 'ok',
      createdAt: new Date().toISOString()
    });

    const log = new AgentLogEntity();
    Object.assign(log, {
      id: 'l1',
      sessionId: 's2',
      message: 'log',
      createdAt: new Date().toISOString()
    });

    const initialState = new ChatStateResponse([], [], [], '');
    const finalState = new ChatStateResponse([session], [userMessage, assistantMessage], [log], 's2');
    useCase.listSessions.and.resolveTo(initialState);
    useCase.getState.and.returnValue(initialState);
    useCase.sendMessage.and.resolveTo(finalState);

    const handler = new ChatHandler(adapter, useCase, view, presenter);
    handler.showChatView(createContainer());

    await handler.initialize();
    await adapter.onSendMessage('hi');

    assert.strictEqual(useCase.sendMessage.mock.calls.length, 1);

    const lastCall = renderSpy.mock.calls[renderSpy.mock.calls.length - 1];
    const model = lastCall.arguments[1];

    assert.strictEqual(model.currentSessionId, 's2');
    assert.strictEqual(model.messages.length, 2);
    assert.strictEqual(model.agentLogs.length, 1);
  });
});
