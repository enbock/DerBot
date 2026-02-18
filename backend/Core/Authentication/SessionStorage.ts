import type SessionEntity from './SessionEntity';

export default interface SessionStorage {
  findByToken(token: string): Promise<SessionEntity>;
  findByNickname(nickname: string): Promise<SessionEntity>;
  save(session: SessionEntity): Promise<void>;
  delete(token: string): Promise<void>;
  deleteExpired(): Promise<void>;
}
