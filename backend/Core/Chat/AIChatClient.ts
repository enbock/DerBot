import type AIChatResponse from './AIChatResponse';

export default interface AIChatClient {
  reply(sessionId: string, message: string): Promise<AIChatResponse>;
}
