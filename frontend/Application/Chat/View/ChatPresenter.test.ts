import { describe, it } from 'node:test';
import assert from 'node:assert';
import ChatPresenter from './ChatPresenter.ts';
import ChatStateResponse from '../../../Core/Chat/ChatUseCase/ChatStateResponse.ts';
import ChatSessionEntity from '../../../Core/Chat/ChatSessionEntity.ts';

describe('ChatPresenter', () => {
  it('creates view model from response', () => {
    const presenter = new ChatPresenter();
    const session = new ChatSessionEntity();
    const response = new ChatStateResponse([session], [], [], 's1');

    const model = presenter.createModel(response);

    assert.strictEqual(model.sessions.length, 1);
    assert.strictEqual(model.currentSessionId, 's1');
  });
});
