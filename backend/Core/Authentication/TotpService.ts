import { authenticator } from 'otplib';
import QRCode from 'qrcode';

/**
 * TOTP Service
 * Verwaltet TOTP-Generierung und -Validierung
 */
export default class TotpService {
  private readonly issuer: string = 'DerBot';

  constructor() {
    // Explizites Zeitfenster: ±1 Step (±30 Sekunden)
    authenticator.options = { window: 1 };
  }

  generateSecret(): string {
    return authenticator.generateSecret();
  }

  async generateQRCode(nickname: string, secret: string): Promise<string> {
    const otpauth = authenticator.keyuri(nickname, this.issuer, secret);
    return await QRCode.toDataURL(otpauth);
  }

  verify(token: string, secret: string): boolean {
    try {
      return authenticator.verify({ token, secret });
    } catch {
      return false;
    }
  }

  getOtpAuthUrl(nickname: string, secret: string): string {
    return authenticator.keyuri(nickname, this.issuer, secret);
  }
}
