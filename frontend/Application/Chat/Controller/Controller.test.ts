import { describe, it } from 'node:test';
import assert from 'node:assert';
import Controller from './Controller.ts';
import ChatAdapter from '../Adapter.ts';
import type ControllerHandler from '../../ControllerHandler';
import { mock } from '../../../test/mock.ts';
import type ChatHandler from './Handler/ChatHandler';

describe('ChatController', () => {
  it('initializes handlers', async () => {
    const handler = mock<ControllerHandler>();
    handler.initialize.and.resolveTo(undefined);

    const chatHandler = mock<ChatHandler>();
    const controller = new Controller(new ChatAdapter(), [handler], chatHandler);

    await controller.initialize();

    assert.strictEqual(handler.initialize.mock.calls.length, 1);
  });

  it('delegates view rendering to chat handler', () => {
    const handler = mock<ControllerHandler>();
    handler.initialize.and.resolveTo(undefined);

    const chatHandler = mock<ChatHandler>();
    const controller = new Controller(new ChatAdapter(), [handler], chatHandler);
    const container = {} as HTMLElement;

    controller.showChatView(container);

    assert.strictEqual(chatHandler.showChatView.mock.calls.length, 1);
  });
});
