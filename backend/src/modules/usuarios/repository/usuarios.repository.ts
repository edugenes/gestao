import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Role, User } from '@prisma/client';

export interface CreateUserData {
  email: string;
  name: string;
  passwordHash: string;
  role?: Role;
}

export interface UpdateUserData {
  name?: string;
  passwordHash?: string;
  role?: Role;
  active?: boolean;
}

@Injectable()
export class UsuariosRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: data.passwordHash,
        role: data.role ?? 'OPERADOR',
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
    });
  }

  async findByEmailWithPassword(email: string): Promise<(User & { password: string }) | null> {
    const user = await this.prisma.user.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
    });
    return user as (User & { password: string }) | null;
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findMany(skip?: number, take?: number): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      skip,
      take,
    });
  }

  async count(): Promise<number> {
    return this.prisma.user.count({
      where: { deletedAt: null },
    });
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.passwordHash !== undefined && { password: data.passwordHash }),
        ...(data.role !== undefined && { role: data.role }),
        ...(data.active !== undefined && { active: data.active }),
      },
    });
  }

  async softDelete(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), active: false },
    });
  }
}
