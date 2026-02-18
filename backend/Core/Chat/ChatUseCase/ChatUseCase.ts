import { randomBytes } from 'crypto';
import type ChatStorage from '../ChatStorage';
import type AIChatClient from '../AIChatClient';
import ChatSessionEntity from '../ChatSessionEntity';
import ChatMessageEntity from '../ChatMessageEntity';
import AgentLogEntity from '../AgentLogEntity';
import type CreateSessionRequest from './CreateSessionRequest';
import CreateSessionResponse from './CreateSessionResponse';
import ListSessionsResponse from './ListSessionsResponse';
import type LoadSessionRequest from './LoadSessionRequest';
import LoadSessionResponse from './LoadSessionResponse';
import type SendMessageRequest from './SendMessageRequest';
import SendMessageResponse from './SendMessageResponse';

export default class ChatUseCase {
  private readonly storage: ChatStorage;
  private readonly client: AIChatClient;

  constructor(storage: ChatStorage, client: AIChatClient) {
    this.storage = storage;
    this.client = client;
  }

  async createSession(request: CreateSessionRequest): Promise<CreateSessionResponse> {
    const sessionId = this.generateId();
    const createdAt = new Date().toISOString();
    const session = new ChatSessionEntity();
    Object.assign(session, { id: sessionId, createdAt });
    await this.storage.saveSession(session);
    return new CreateSessionResponse(sessionId, createdAt);
  }

  async listSessions(): Promise<ListSessionsResponse> {
    const sessions = await this.storage.findAllSessions();
    return new ListSessionsResponse(sessions);
  }

  async loadSession(request: LoadSessionRequest): Promise<LoadSessionResponse> {
    if (!request.sessionId) {
      throw new Error('SessionId is required');
    }
    const messages = await this.storage.findMessagesBySession(request.sessionId);
    const agentLogs = await this.storage.findAgentLogsBySession(request.sessionId);
    return new LoadSessionResponse(messages, agentLogs);
  }

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    if (!request.sessionId) {
      throw new Error('SessionId is required');
    }
    if (!request.content || !request.content.trim()) {
      throw new Error('Message content is required');
    }

    const timestamp = new Date().toISOString();
    const userMessage = new ChatMessageEntity();
    Object.assign(userMessage, {
      id: this.generateId(),
      sessionId: request.sessionId,
      role: 'user',
      content: request.content,
      createdAt: timestamp
    });

    await this.storage.saveMessage(userMessage);

    const response = await this.client.reply(request.sessionId, request.content);

    const assistantMessage = new ChatMessageEntity();
    Object.assign(assistantMessage, {
      id: this.generateId(),
      sessionId: request.sessionId,
      role: 'assistant',
      content: response.reply,
      createdAt: new Date().toISOString()
    });

    await this.storage.saveMessage(assistantMessage);

    const agentLogs: AgentLogEntity[] = response.agentLogs.map((entry) => {
      const log = new AgentLogEntity();
      Object.assign(log, {
        id: this.generateId(),
        sessionId: request.sessionId,
        message: entry,
        createdAt: new Date().toISOString()
      });
      return log;
    });

    for (const log of agentLogs) {
      await this.storage.saveAgentLog(log);
    }

    return new SendMessageResponse(userMessage, assistantMessage, agentLogs);
  }

  private generateId(): string {
    return randomBytes(16).toString('hex');
  }
}
