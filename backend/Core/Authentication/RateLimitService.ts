/**
 * Rate Limiting Service
 * Implementiert In-Memory Rate-Limiting für Login-Versuche
 */
export default class RateLimitService {
  private readonly attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts: number = 5;
  private readonly windowMs: number = 60000; // 1 minute

  isAllowed(identifier: string): boolean {
    this.cleanup(identifier);
    
    const attemptTimestamps = this.attempts.get(identifier) || [];
    return attemptTimestamps.length < this.maxAttempts;
  }

  recordAttempt(identifier: string): void {
    const now = Date.now();
    const attemptTimestamps = this.attempts.get(identifier) || [];
    attemptTimestamps.push(now);
    this.attempts.set(identifier, attemptTimestamps);
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }

  private cleanup(identifier: string): void {
    const attemptTimestamps = this.attempts.get(identifier);
    if (!attemptTimestamps) return;

    const now = Date.now();
    const validAttempts = attemptTimestamps.filter(
      timestamp => now - timestamp < this.windowMs
    );

    if (validAttempts.length === 0) {
      this.attempts.delete(identifier);
    } else {
      this.attempts.set(identifier, validAttempts);
    }
  }
}
