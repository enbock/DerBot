import { describe, test } from 'node:test';
import assert from 'node:assert';
import DefaultCopilotClientFactory from './DefaultCopilotClientFactory.js';
import { CopilotClient } from '@github/copilot-sdk';

describe('DefaultCopilotClientFactory', () => {
  test('create() returns CopilotClient instance', () => {
    const factory = new DefaultCopilotClientFactory();
    
    const client = factory.create();
    
    assert.ok(client instanceof CopilotClient);
  });

  test('create() returns new instance each time', () => {
    const factory = new DefaultCopilotClientFactory();
    
    const client1 = factory.create();
    const client2 = factory.create();
    
    assert.notStrictEqual(client1, client2);
  });
});
