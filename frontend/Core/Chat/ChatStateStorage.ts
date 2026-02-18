import type ChatStateEntity from './ChatStateEntity.ts';

export default interface ChatStateStorage {
  load(): ChatStateEntity;
  save(state: ChatStateEntity): void;
}
