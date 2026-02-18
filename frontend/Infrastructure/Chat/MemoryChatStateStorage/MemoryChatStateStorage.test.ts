import { describe, it } from 'node:test';
import assert from 'node:assert';
import MemoryChatStateStorage from './MemoryChatStateStorage.ts';
import ChatStateEntity from '../../../Core/Chat/ChatStateEntity.ts';

describe('MemoryChatStateStorage', () => {
  it('stores and loads state', () => {
    const storage = new MemoryChatStateStorage();
    const state = new ChatStateEntity();
    const next = new ChatStateEntity();
    Object.assign(next, { currentSessionId: 's1' });

    assert.strictEqual(storage.load().currentSessionId, state.currentSessionId);

    storage.save(next);

    assert.strictEqual(storage.load().currentSessionId, 's1');
  });
});
