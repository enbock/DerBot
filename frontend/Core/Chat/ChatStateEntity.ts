import type ChatSessionEntity from './ChatSessionEntity.ts';
import type ChatMessageEntity from './ChatMessageEntity.ts';
import type AgentLogEntity from './AgentLogEntity.ts';

export default class ChatStateEntity {
  public readonly sessions: ChatSessionEntity[] = [];
  public readonly messages: ChatMessageEntity[] = [];
  public readonly agentLogs: AgentLogEntity[] = [];
  public readonly currentSessionId: string = '';
}
