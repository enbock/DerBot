import type ChatClient from '../ChatClient.ts';
import type ChatStateStorage from '../ChatStateStorage.ts';
import ChatStateEntity from '../ChatStateEntity.ts';
import type CreateSessionRequest from './CreateSessionRequest.ts';
import ChatStateResponse from './ChatStateResponse.ts';
import type LoadSessionRequest from './LoadSessionRequest.ts';
import type SendMessageRequest from './SendMessageRequest.ts';

export default class ChatUseCase {
  private readonly client: ChatClient;
  private readonly storage: ChatStateStorage;

  constructor(client: ChatClient, storage: ChatStateStorage) {
    this.client = client;
    this.storage = storage;
  }

  getState(): ChatStateResponse {
    const state = this.storage.load();
    return this.toResponse(state);
  }

  async createSession(request: CreateSessionRequest): Promise<ChatStateResponse> {
    const session = await this.client.createSession();
    const state = this.storage.load();
    const next = new ChatStateEntity();
    Object.assign(next, {
      sessions: [session, ...state.sessions],
      messages: [],
      agentLogs: [],
      currentSessionId: session.id
    });
    this.storage.save(next);
    return this.toResponse(next);
  }

  async listSessions(): Promise<ChatStateResponse> {
    const sessions = await this.client.listSessions();
    const currentState = this.storage.load();
    const next = new ChatStateEntity();
    let currentSessionId = currentState.currentSessionId;
    let messages = currentState.messages;
    let agentLogs = currentState.agentLogs;

    if (!currentSessionId && sessions.length > 0) {
      currentSessionId = sessions[0].id;
      const result = await this.client.loadSession(currentSessionId);
      messages = result.messages;
      agentLogs = result.agentLogs;
    }

    if (!currentSessionId) {
      messages = [];
      agentLogs = [];
    }

    Object.assign(next, {
      sessions,
      messages,
      agentLogs,
      currentSessionId
    });
    this.storage.save(next);
    return this.toResponse(next);
  }

  async loadSession(request: LoadSessionRequest): Promise<ChatStateResponse> {
    const result = await this.client.loadSession(request.sessionId);
    const state = this.storage.load();
    const next = new ChatStateEntity();
    Object.assign(next, {
      sessions: state.sessions,
      messages: result.messages,
      agentLogs: result.agentLogs,
      currentSessionId: request.sessionId
    });
    this.storage.save(next);
    return this.toResponse(next);
  }

  async sendMessage(request: SendMessageRequest): Promise<ChatStateResponse> {
    const sessionId = request.sessionId || (await this.ensureSession());
    const result = await this.client.sendMessage(sessionId, request.content);
    const state = this.storage.load();
    const next = new ChatStateEntity();
    Object.assign(next, {
      sessions: state.sessions,
      messages: [...state.messages, result.message, result.agentMessage],
      agentLogs: [...state.agentLogs, ...result.agentLogs],
      currentSessionId: sessionId
    });
    this.storage.save(next);
    return this.toResponse(next);
  }

  private async ensureSession(): Promise<string> {
    const state = this.storage.load();
    if (state.currentSessionId) {
      return state.currentSessionId;
    }

    const session = await this.client.createSession();
    const next = new ChatStateEntity();
    Object.assign(next, {
      sessions: [session, ...state.sessions],
      messages: [],
      agentLogs: [],
      currentSessionId: session.id
    });
    this.storage.save(next);
    return session.id;
  }

  private toResponse(state: ChatStateEntity): ChatStateResponse {
    return new ChatStateResponse(
      state.sessions,
      state.messages,
      state.agentLogs,
      state.currentSessionId
    );
  }
}
