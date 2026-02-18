export default class LoginUserResponse {
  public readonly token: string = '';
  public readonly nickname: string = '';
  public readonly expiresAt: string = '';

  constructor(token: string, nickname: string, expiresAt: string) {
    this.token = token;
    this.nickname = nickname;
    this.expiresAt = expiresAt;
  }
}
