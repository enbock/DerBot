export default class ChatAdapter {
  public onCreateSession: () => void = () => <never>false;
  public onSelectSession: (sessionId: string) => void = () => <never>false;
  public onSendMessage: (content: string) => void = () => <never>false;
}
