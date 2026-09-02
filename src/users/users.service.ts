import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserResponseDto } from '../common/dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return UserResponseDto.fromEntity(user);
  }

  async updateProfile(
    userId: string,
    dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.usersRepository.update(userId, dto);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return UserResponseDto.fromEntity(user);
  }

  async findByIdOrFail(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  ensureOwnership(userId: string, resourceOwnerId: string): void {
    if (userId !== resourceOwnerId) {
      throw new ForbiddenException('You do not have permission for this resource');
    }
  }
}
