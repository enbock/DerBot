import { describe, it } from 'node:test';
import assert from 'node:assert';
import TotpService from './TotpService.ts';
import { authenticator } from 'otplib';

describe('TotpService', () => {
  it('should generate a valid secret', () => {
    const service = new TotpService();
    const secret = service.generateSecret();

    assert.ok(secret);
    assert.ok(secret.length > 0);
  });

  it('should verify a valid TOTP token', () => {
    const service = new TotpService();
    const secret = service.generateSecret();
    const token = authenticator.generate(secret);

    const isValid = service.verify(token, secret);
    assert.ok(isValid);
  });

  it('should reject an invalid TOTP token', () => {
    const service = new TotpService();
    const secret = service.generateSecret();

    const isValid = service.verify('000000', secret);
    assert.strictEqual(isValid, false);
  });

  it('should generate QR code data URL', async () => {
    const service = new TotpService();
    const secret = service.generateSecret();
    const qrCode = await service.generateQRCode('testuser', secret);

    assert.ok(qrCode.startsWith('data:image/png;base64,'));
  });

  it('should generate correct otpauth URL', () => {
    const service = new TotpService();
    const secret = 'TESTSECRET123';
    const url = service.getOtpAuthUrl('testuser', secret);

    assert.ok(url.includes('otpauth://totp/'));
    assert.ok(url.includes('DerBot:testuser'));
    assert.ok(url.includes('secret=TESTSECRET123'));
    assert.ok(url.includes('issuer=DerBot'));
  });
});
