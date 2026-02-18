/**
 * Verification Authentication Entity
 * Rückgabewert beim Verify einer Session
 */
export default class VerificationEntity {
  public readonly valid: boolean = false;
  public readonly nickname: string = '';
}
