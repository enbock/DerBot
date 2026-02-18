import type UserEntity from './UserEntity';

export default interface UserStorage {
  findByNickname(nickname: string): Promise<UserEntity>;
  findAll(): Promise<UserEntity[]>;
  save(user: UserEntity): Promise<void>;
  exists(nickname: string): Promise<boolean>;
}
