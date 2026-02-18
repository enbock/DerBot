import type ChatMessageEntity from '../ChatMessageEntity.ts';
import type AgentLogEntity from '../AgentLogEntity.ts';

export default class LoadSessionResponse {
  public readonly messages: ChatMessageEntity[];
  public readonly agentLogs: AgentLogEntity[];

  constructor(messages: ChatMessageEntity[], agentLogs: AgentLogEntity[]) {
    this.messages = messages;
    this.agentLogs = agentLogs;
  }
}
