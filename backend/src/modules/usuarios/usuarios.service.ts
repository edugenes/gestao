import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { UsuariosRepository } from './repository/usuarios.repository';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class UsuariosService {
  constructor(private readonly repository: UsuariosRepository) {}

  /** Usado apenas pelo AuthService para validação de login. */
  async findByEmailForAuth(email: string): Promise<{
    id: string;
    email: string;
    password: string;
    role: Role;
    active: boolean;
  } | null> {
    const user = await this.repository.findByEmailWithPassword(email.toLowerCase());
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      role: user.role,
      active: user.active,
    };
  }

  /** Usado apenas pelo AuthService no refresh. */
  async findByIdForAuth(id: string): Promise<{ id: string; email: string; role: Role; active: boolean } | null> {
    const user = await this.repository.findById(id);
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      active: user.active,
    };
  }

  async create(dto: CreateUserDto): Promise<{ id: string; email: string; name: string; role: string }> {
    const existing = await this.repository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('E-mail já cadastrado');
    }
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.repository.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
      role: dto.role,
    });
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  async findMany(page = 1, limit = 20): Promise<{
    data: Array<{ id: string; email: string; name: string; role: string; active: boolean }>;
    total: number;
  }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.repository.findMany(skip, limit),
      this.repository.count(),
    ]);
    return {
      data: data.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        active: u.active,
      })),
      total,
    };
  }

  async findById(id: string): Promise<{ id: string; email: string; name: string; role: string; active: boolean }> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      active: user.active,
    };
  }

  async update(
    id: string,
    dto: UpdateUserDto,
  ): Promise<{ id: string; email: string; name: string; role: string; active: boolean }> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    const updateData: Parameters<UsuariosRepository['update']>[1] = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.role !== undefined) updateData.role = dto.role;
    if (dto.active !== undefined) updateData.active = dto.active;
    if (dto.password !== undefined) {
      updateData.passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    }
    const updated = await this.repository.update(id, updateData);
    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      active: updated.active,
    };
  }

  async softDelete(id: string): Promise<void> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    await this.repository.softDelete(id);
  }
}
