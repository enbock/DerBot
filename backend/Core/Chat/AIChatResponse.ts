export default class AIChatResponse {
  public readonly reply: string;
  public readonly agentLogs: string[];

  constructor(reply: string, agentLogs: string[]) {
    this.reply = reply;
    this.agentLogs = agentLogs;
  }
}
