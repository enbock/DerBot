import type ChatSessionEntity from './ChatSessionEntity.ts';
import type ChatMessageEntity from './ChatMessageEntity.ts';
import type AgentLogEntity from './AgentLogEntity.ts';

export default interface ChatClient {
  createSession(): Promise<ChatSessionEntity>;
  listSessions(): Promise<ChatSessionEntity[]>;
  loadSession(sessionId: string): Promise<{ messages: ChatMessageEntity[]; agentLogs: AgentLogEntity[] }>;
  sendMessage(
    sessionId: string,
    content: string
  ): Promise<{ message: ChatMessageEntity; agentMessage: ChatMessageEntity; agentLogs: AgentLogEntity[] }>;
}
