import SessionEntity from '../../Core/Authentication/SessionEntity';
import type SessionStorage from '../../Core/Authentication/SessionStorage';
import { promises as fs } from 'fs';
import path from 'path';

export default class FileSessionStorage implements SessionStorage {
  private readonly filePath: string;
  private sessions: SessionEntity[] = [];

  constructor(dataDir: string = '.data') {
    this.filePath = path.join(dataDir, 'sessions.json');
  }

  async initialize(): Promise<void> {
    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true });
    
    try {
      const content = await fs.readFile(this.filePath, 'utf-8');
      this.sessions = JSON.parse(content);
    } catch (error) {
      // File doesn't exist yet, start with empty array
      this.sessions = [];
      await this.persist();
    }
  }

  async findByToken(token: string): Promise<SessionEntity> {
    const session = this.sessions.find(s => s.token === token);
    return session || new SessionEntity();
  }

  async findByNickname(nickname: string): Promise<SessionEntity> {
    const session = this.sessions.find(s => s.nickname === nickname);
    return session || new SessionEntity();
  }

  async save(session: SessionEntity): Promise<void> {
    this.sessions = this.sessions.filter(s => s.nickname !== session.nickname);
    this.sessions.push(session);
    await this.persist();
  }

  async delete(token: string): Promise<void> {
    this.sessions = this.sessions.filter(s => s.token !== token);
    await this.persist();
  }

  async deleteExpired(): Promise<void> {
    const now = new Date().toISOString();
    this.sessions = this.sessions.filter(s => s.expiresAt > now);
    await this.persist();
  }

  private async persist(): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(this.sessions, null, 2), 'utf-8');
  }
}
