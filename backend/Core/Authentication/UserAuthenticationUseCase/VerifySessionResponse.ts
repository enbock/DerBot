export default class VerifySessionResponse {
  public readonly valid: boolean = false;
  public readonly nickname: string = '';

  constructor(valid: boolean, nickname?: string) {
    this.valid = valid;
    this.nickname = nickname || '';
  }
}
