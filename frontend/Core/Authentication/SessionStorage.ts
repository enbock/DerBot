import type SessionEntity from './SessionEntity.ts';

export default interface SessionStorage {
  save(session: SessionEntity): void;
  load(): SessionEntity;
  clear(): void;
  isValid(): boolean;
}
