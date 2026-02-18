import type ControllerHandler from '../../../ControllerHandler';
import type ChatAdapter from '../../Adapter';
import type ChatUseCase from '../../../../Core/Chat/ChatUseCase/ChatUseCase';
import type ChatStateResponse from '../../../../Core/Chat/ChatUseCase/ChatStateResponse';
import type ChatView from '../../View/ChatView';
import type ChatPresenter from '../../View/ChatPresenter';

export default class ChatHandler implements ControllerHandler {
  private readonly adapter: ChatAdapter;
  private readonly useCase: ChatUseCase;
  private readonly view: ChatView;
  private readonly presenter: ChatPresenter;
  private container: HTMLElement | null = null;

  constructor(adapter: ChatAdapter, useCase: ChatUseCase, view: ChatView, presenter: ChatPresenter) {
    this.adapter = adapter;
    this.useCase = useCase;
    this.view = view;
    this.presenter = presenter;
  }

  async initialize(): Promise<void> {
    this.bindActions();
    try {
      await this.useCase.listSessions();
    } catch {
      return;
    }
  }

  showChatView(container: HTMLElement): void {
    this.container = container;
    this.render(this.useCase.getState());
  }

  private bindActions(): void {
    this.adapter.onCreateSession = async () => {
      await this.handleCreateSession();
    };

    this.adapter.onSelectSession = async (sessionId: string) => {
      await this.handleSelectSession(sessionId);
    };

    this.adapter.onSendMessage = async (content: string) => {
      await this.handleSendMessage(content);
    };
  }

  private async handleCreateSession(): Promise<void> {
    await this.handleResponse(async () => this.useCase.createSession({}));
  }

  private async handleSelectSession(sessionId: string): Promise<void> {
    await this.handleResponse(async () => this.useCase.loadSession({ sessionId }));
  }

  private async handleSendMessage(content: string): Promise<void> {
    await this.handleResponse(async () => {
      const sessionId = this.useCase.getState().currentSessionId;
      return this.useCase.sendMessage({ sessionId, content });
    });
  }

  private async handleResponse(action: () => Promise<ChatStateResponse>): Promise<void> {
    if (!this.container) {
      return;
    }

    try {
      const response = await action();
      this.render(response);
    } catch {
      this.render(this.useCase.getState());
    }
  }

  private render(response: ChatStateResponse): void {
    if (!this.container) {
      return;
    }
    const model = this.presenter.createModel(response);
    this.view.render(this.container, model);
  }
}
