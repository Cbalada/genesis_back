import { User } from '../../users/entities/user.entity';

export class UserResponseDto {
  id!: string;
  name!: string;
  email!: string;
  role!: string;
  avatarUrl!: string | null;
  createdAt!: Date;
  updatedAt!: Date;

  static fromEntity(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.name = user.name;
    dto.email = user.email;
    dto.role = user.role;
    dto.avatarUrl = user.avatarUrl;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }
}
