export default class ChatMessageEntity {
  public readonly id: string = '';
  public readonly sessionId: string = '';
  public readonly role: 'user' | 'assistant' = 'user';
  public readonly content: string = '';
  public readonly createdAt: string = '';
}
