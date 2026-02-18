import type ControllerHandler from '../../ControllerHandler';
import type ChatAdapter from '../Adapter';
import type ChatHandler from './Handler/ChatHandler';

export default class Controller implements ControllerHandler {
  private readonly adapter: ChatAdapter;
  private readonly handlers: ControllerHandler[];
  private readonly chatHandler: ChatHandler;

  constructor(adapter: ChatAdapter, handlers: ControllerHandler[], chatHandler: ChatHandler) {
    this.adapter = adapter;
    this.handlers = handlers;
    this.chatHandler = chatHandler;
  }

  async initialize(): Promise<void> {
    for (const handler of this.handlers) {
      await handler.initialize();
    }
  }

  showChatView(container: HTMLElement): void {
    this.chatHandler.showChatView(container);
  }
}
