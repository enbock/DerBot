import ChatStateEntity from '../../../Core/Chat/ChatStateEntity.ts';
import type ChatStateStorage from '../../../Core/Chat/ChatStateStorage.ts';

export default class MemoryChatStateStorage implements ChatStateStorage {
  private state: ChatStateEntity = new ChatStateEntity();

  load(): ChatStateEntity {
    return this.state;
  }

  save(state: ChatStateEntity): void {
    this.state = state;
  }
}
