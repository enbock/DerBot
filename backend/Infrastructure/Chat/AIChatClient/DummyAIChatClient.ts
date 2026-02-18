import type AIChatClient from '../../../Core/Chat/AIChatClient';
import AIChatResponse from '../../../Core/Chat/AIChatResponse';

export default class DummyAIChatClient implements AIChatClient {
  async reply(sessionId: string, message: string): Promise<AIChatResponse> {
    const reply = `Echo: ${message}`;
    const agentLogs = [
      `session=${sessionId}`,
      `inputLength=${message.length}`,
      'dummy-response-created'
    ];
    return new AIChatResponse(reply, agentLogs);
  }
}
