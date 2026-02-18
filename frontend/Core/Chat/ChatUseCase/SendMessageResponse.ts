import type ChatMessageEntity from '../ChatMessageEntity.ts';
import type AgentLogEntity from '../AgentLogEntity.ts';

export default class SendMessageResponse {
  public readonly message: ChatMessageEntity;
  public readonly agentMessage: ChatMessageEntity;
  public readonly agentLogs: AgentLogEntity[];

  constructor(
    message: ChatMessageEntity,
    agentMessage: ChatMessageEntity,
    agentLogs: AgentLogEntity[]
  ) {
    this.message = message;
    this.agentMessage = agentMessage;
    this.agentLogs = agentLogs;
  }
}
