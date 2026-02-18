import type ChatMessageEntity from '../ChatMessageEntity';
import type AgentLogEntity from '../AgentLogEntity';

export default class LoadSessionResponse {
  public readonly messages: ChatMessageEntity[];
  public readonly agentLogs: AgentLogEntity[];

  constructor(messages: ChatMessageEntity[], agentLogs: AgentLogEntity[]) {
    this.messages = messages;
    this.agentLogs = agentLogs;
  }
}
