export default class CreateSessionResponse {
  public readonly sessionId: string;
  public readonly createdAt: string;

  constructor(sessionId: string, createdAt: string) {
    this.sessionId = sessionId;
    this.createdAt = createdAt;
  }
}
