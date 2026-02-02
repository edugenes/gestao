import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../shared/auth/jwt-auth.guard';
import { RolesGuard } from '../../shared/auth/roles.guard';
import { Roles } from '../../shared/auth/decorators';
import { Role } from '@prisma/client';
import { UsuariosService } from './usuarios.service';
import { createUserSchema, type CreateUserDto } from './dto/create-user.dto';
import { updateUserSchema, type UpdateUserDto } from './dto/update-user.dto';

@ApiTags('usuarios')
@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Criar usuário (apenas ADMIN)' })
  @ApiResponse({ status: 201, description: 'Usuário criado' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado' })
  async create(@Body() body: unknown) {
    const dto = createUserSchema.parse(body) as CreateUserDto;
    return this.usuariosService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.GESTOR)
  @ApiOperation({ summary: 'Listar usuários com paginação' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista paginada' })
  async findMany(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNum = limit ? Math.min(100, Math.max(1, parseInt(limit, 10))) : 20;
    return this.usuariosService.findMany(pageNum, limitNum);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GESTOR)
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.usuariosService.findById(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Atualizar usuário (apenas ADMIN)' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: unknown,
  ) {
    const dto = updateUserSchema.parse(body) as UpdateUserDto;
    return this.usuariosService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Soft delete do usuário (apenas ADMIN)' })
  @ApiResponse({ status: 204, description: 'Usuário desativado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.usuariosService.softDelete(id);
  }
}
