
import type RegisterEntity from './RegisterEntity.ts';
import type SessionEntity from './SessionEntity.ts';
import type VerificationEntity from './VerificationEntity.ts';

export default interface AuthenticationClient {
  register(nickname: string): Promise<RegisterEntity>;
  login(totp: string): Promise<SessionEntity>;
  logout(token: string): Promise<void>;
  verify(token: string): Promise<VerificationEntity>;
}
