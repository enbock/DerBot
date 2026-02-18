import UserEntity from '../../Core/Authentication/UserEntity';
import type UserStorage from '../../Core/Authentication/UserStorage';
import { promises as fs } from 'fs';
import path from 'path';

export default class FileUserStorage implements UserStorage {
  private readonly filePath: string;
  private users: UserEntity[] = [];

  constructor(dataDir: string = '.data') {
    this.filePath = path.join(dataDir, 'users.json');
  }

  async initialize(): Promise<void> {
    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true });
    
    try {
      const content = await fs.readFile(this.filePath, 'utf-8');
      this.users = JSON.parse(content);
    } catch (error) {
      // File doesn't exist yet, start with empty array
      this.users = [];
      await this.persist();
    }
  }

  async findByNickname(nickname: string): Promise<UserEntity> {
    const user = this.users.find(u => u.nickname === nickname);
    return user || new UserEntity();
  }

  async findAll(): Promise<UserEntity[]> {
    return [...this.users];
  }

  async save(user: UserEntity): Promise<void> {
    const index = this.users.findIndex(u => u.nickname === user.nickname);
    if (index >= 0) {
      this.users[index] = user;
    } else {
      this.users.push(user);
    }
    await this.persist();
  }

  async exists(nickname: string): Promise<boolean> {
    return this.users.some(u => u.nickname === nickname);
  }

  private async persist(): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(this.users, null, 2), 'utf-8');
  }
}
