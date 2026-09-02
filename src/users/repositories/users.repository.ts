import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  create(data: Partial<User>): User {
    return this.repository.create(data);
  }

  async save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email },
      select: [
        'id',
        'name',
        'email',
        'password',
        'role',
        'avatarUrl',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async findByEmailPublic(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findAll(page: number, limit: number): Promise<[User[], number]> {
    return this.repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async count(): Promise<number> {
    return this.repository.count();
  }
}
