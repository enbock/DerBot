export default class RegisterUserResponse {
  readonly qrCodeDataUrl: string;
  readonly secret: string;

  constructor(qrCodeDataUrl: string, secret: string) {
    this.qrCodeDataUrl = qrCodeDataUrl;
    this.secret = secret;
  }
}
