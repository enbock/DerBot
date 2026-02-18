import type ChatSessionEntity from '../ChatSessionEntity.ts';
import type ChatMessageEntity from '../ChatMessageEntity.ts';
import type AgentLogEntity from '../AgentLogEntity.ts';

export default class ChatStateResponse {
  public readonly sessions: ChatSessionEntity[];
  public readonly messages: ChatMessageEntity[];
  public readonly agentLogs: AgentLogEntity[];
  public readonly currentSessionId: string;

  constructor(
    sessions: ChatSessionEntity[],
    messages: ChatMessageEntity[],
    agentLogs: AgentLogEntity[],
    currentSessionId: string
  ) {
    this.sessions = sessions;
    this.messages = messages;
    this.agentLogs = agentLogs;
    this.currentSessionId = currentSessionId;
  }
}
