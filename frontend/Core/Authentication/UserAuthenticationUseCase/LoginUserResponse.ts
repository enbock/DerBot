export default class LoginUserResponse {
  readonly nickname: string;

  constructor(nickname: string) {
    this.nickname = nickname;
  }
}
