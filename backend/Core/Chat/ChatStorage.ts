import type ChatSessionEntity from './ChatSessionEntity';
import type ChatMessageEntity from './ChatMessageEntity';
import type AgentLogEntity from './AgentLogEntity';

export default interface ChatStorage {
  findAllSessions(): Promise<ChatSessionEntity[]>;
  findMessagesBySession(sessionId: string): Promise<ChatMessageEntity[]>;
  findAgentLogsBySession(sessionId: string): Promise<AgentLogEntity[]>;
  saveSession(session: ChatSessionEntity): Promise<void>;
  saveMessage(message: ChatMessageEntity): Promise<void>;
  saveAgentLog(log: AgentLogEntity): Promise<void>;
}
