import type ChatSessionEntity from '../ChatSessionEntity';

export default class ListSessionsResponse {
  public readonly sessions: ChatSessionEntity[];

  constructor(sessions: ChatSessionEntity[]) {
    this.sessions = sessions;
  }
}
