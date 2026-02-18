import type UserStorage from '../UserStorage';
import type SessionStorage from '../SessionStorage';
import SessionEntity from '../SessionEntity';
import UserEntity from '../UserEntity';
import TotpService from '../TotpService';
import RateLimitService from '../RateLimitService';
import type RegisterUserRequest from './RegisterUserRequest';
import RegisterUserResponse from './RegisterUserResponse';
import type LoginUserRequest from './LoginUserRequest';
import LoginUserResponse from './LoginUserResponse';
import type LogoutUserRequest from './LogoutUserRequest';
import type VerifySessionRequest from './VerifySessionRequest';
import VerifySessionResponse from './VerifySessionResponse';
import { randomBytes } from 'crypto';

export default class UserAuthenticationUseCase {
  private readonly sessionDurationMs = 7 * 24 * 60 * 60 * 1000;
  private readonly userStorage: UserStorage;
  private readonly sessionStorage: SessionStorage;
  private readonly totpService: TotpService;
  private readonly rateLimitService: RateLimitService;

  constructor(
    userStorage: UserStorage,
    sessionStorage: SessionStorage,
    totpService: TotpService,
    rateLimitService: RateLimitService
  ) {
    this.userStorage = userStorage;
    this.sessionStorage = sessionStorage;
    this.totpService = totpService;
    this.rateLimitService = rateLimitService;
  }

  async register(request: RegisterUserRequest): Promise<RegisterUserResponse> {
    if (!this.isValidNickname(request.nickname)) {
      throw new Error('Invalid nickname. Must be 3-20 alphanumeric characters or underscores.');
    }

    if (await this.userStorage.exists(request.nickname)) {
      throw new Error('Nickname already exists');
    }

    const secret = this.totpService.generateSecret();
    const qrCodeDataUrl = await this.totpService.generateQRCode(request.nickname, secret);

    const user = new UserEntity();
    Object.assign(user, {
      nickname: request.nickname,
      secret,
      createdAt: new Date().toISOString()
    });

    await this.userStorage.save(user);

    return new RegisterUserResponse(secret, qrCodeDataUrl);
  }

  async login(request: LoginUserRequest): Promise<LoginUserResponse> {
    const rateLimitKey = 'global_login';
    
    if (!this.rateLimitService.isAllowed(rateLimitKey)) {
      throw new Error('Too many login attempts. Please try again later.');
    }

    this.rateLimitService.recordAttempt(rateLimitKey);

    const matchedNickname = await this.findUserByTotp(request.totp);
    
    if (!matchedNickname) {
      throw new Error('Invalid TOTP code');
    }

    this.rateLimitService.reset(rateLimitKey);

    const existingSession = await this.sessionStorage.findByNickname(matchedNickname);
    if (existingSession.token) {
      const expiresAt = new Date(existingSession.expiresAt);
      const now = new Date();
      
      if (expiresAt > now) {
        return new LoginUserResponse(
          existingSession.token,
          matchedNickname,
          existingSession.expiresAt
        );
      }
      
      await this.sessionStorage.delete(existingSession.token);
    }

    const token = this.generateToken();
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + this.sessionDurationMs);

    const session = new SessionEntity();
    Object.assign(session, {
      token,
      nickname: matchedNickname,
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString()
    });

    await this.sessionStorage.save(session);

    return new LoginUserResponse(
      token,
      matchedNickname,
      session.expiresAt
    );
  }

  async logout(request: LogoutUserRequest): Promise<void> {
    await this.sessionStorage.delete(request.token);
  }

  async verify(request: VerifySessionRequest): Promise<VerifySessionResponse> {
    const session = await this.sessionStorage.findByToken(request.token);
    
    if (!session.token) {
      return new VerifySessionResponse(false);
    }

    const now = new Date();
    const expiresAt = new Date(session.expiresAt);

    if (now > expiresAt) {
      await this.sessionStorage.delete(request.token);
      return new VerifySessionResponse(false);
    }

    return new VerifySessionResponse(true, session.nickname);
  }

  private async findUserByTotp(totp: string): Promise<string | null> {
    const users = await this.userStorage.findAll();
    let matchedNickname: string | null = null;
    
    for (const user of users) {
      const isValid = this.totpService.verify(totp, user.secret);
      if (isValid && !matchedNickname) {
        matchedNickname = user.nickname;
      }
    }
    
    return matchedNickname;
  }

  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  private isValidNickname(nickname: string): boolean {
    const nicknameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return nicknameRegex.test(nickname);
  }
}
