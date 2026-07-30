import { User } from '../../models/user.model';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: { email: string; password_hash: string; first_name?: string; last_name?: string }): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User | null>;
}
