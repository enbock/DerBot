import type ChatClient from '../../../../Core/Chat/ChatClient.ts';
import ChatSessionEntity from '../../../../Core/Chat/ChatSessionEntity.ts';
import ChatMessageEntity from '../../../../Core/Chat/ChatMessageEntity.ts';
import AgentLogEntity from '../../../../Core/Chat/AgentLogEntity.ts';

export default class Ajax implements ChatClient {
  private readonly baseUrl: string = '/api/chat';

  async createSession(): Promise<ChatSessionEntity> {
    const response = await fetch(`${this.baseUrl}/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Create session failed');
    }

    const data = await response.json();
    const entity = new ChatSessionEntity();
    Object.assign(entity, { id: data.sessionId, createdAt: data.createdAt });
    return entity;
  }

  async listSessions(): Promise<ChatSessionEntity[]> {
    const response = await fetch(`${this.baseUrl}/sessions`, {
      method: 'GET'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Load sessions failed');
    }

    const data = await response.json();
    const sessions = Array.isArray(data.sessions) ? data.sessions : [];
    return sessions.map((item: any) => {
      const entity = new ChatSessionEntity();
      Object.assign(entity, { id: item.id, createdAt: item.createdAt });
      return entity;
    });
  }

  async loadSession(sessionId: string): Promise<{ messages: ChatMessageEntity[]; agentLogs: AgentLogEntity[] }> {
    const response = await fetch(`${this.baseUrl}/session?sessionId=${encodeURIComponent(sessionId)}`, {
      method: 'GET'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Load session failed');
    }

    const data = await response.json();
    const messages = Array.isArray(data.messages) ? data.messages : [];
    const agentLogs = Array.isArray(data.agentLogs) ? data.agentLogs : [];

    return {
      messages: messages.map((item: any) => {
        const entity = new ChatMessageEntity();
        Object.assign(entity, {
          id: item.id,
          sessionId: item.sessionId,
          role: item.role,
          content: item.content,
          createdAt: item.createdAt
        });
        return entity;
      }),
      agentLogs: agentLogs.map((item: any) => {
        const entity = new AgentLogEntity();
        Object.assign(entity, {
          id: item.id,
          sessionId: item.sessionId,
          message: item.message,
          createdAt: item.createdAt
        });
        return entity;
      })
    };
  }

  async sendMessage(
    sessionId: string,
    content: string
  ): Promise<{ message: ChatMessageEntity; agentMessage: ChatMessageEntity; agentLogs: AgentLogEntity[] }> {
    const response = await fetch(`${this.baseUrl}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, content })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Send message failed');
    }

    const data = await response.json();
    const message = new ChatMessageEntity();
    Object.assign(message, data.message);
    const agentMessage = new ChatMessageEntity();
    Object.assign(agentMessage, data.agentMessage);
    const agentLogs = Array.isArray(data.agentLogs) ? data.agentLogs : [];

    return {
      message,
      agentMessage,
      agentLogs: agentLogs.map((item: any) => {
        const entity = new AgentLogEntity();
        Object.assign(entity, item);
        return entity;
      })
    };
  }
}
