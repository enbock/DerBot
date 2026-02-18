export default class RegisterUserResponse {
  public readonly secret: string = '';
  public readonly qrCodeDataUrl: string = '';

  constructor(secret: string, qrCodeDataUrl: string) {
    this.secret = secret;
    this.qrCodeDataUrl = qrCodeDataUrl;
  }
}
