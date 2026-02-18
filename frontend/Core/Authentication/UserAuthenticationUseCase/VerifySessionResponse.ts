export default class VerifySessionResponse {
  readonly nickname: string | null;

  constructor(nickname: string | null) {
    this.nickname = nickname;
  }
}
