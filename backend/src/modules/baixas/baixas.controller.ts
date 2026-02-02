import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../shared/auth/jwt-auth.guard';
import { RolesGuard } from '../../shared/auth/roles.guard';
import { Roles, CurrentUser } from '../../shared/auth/decorators';
import type { RequestUser } from '../../shared/auth/decorators';
import { Role } from '@prisma/client';
import { BaixasService, type BaixaResponse } from './baixas.service';
import { createBaixaSchema, type CreateBaixaDto } from './dto/create-baixa.dto';

@ApiTags('baixas')
@Controller('baixas')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BaixasController {
  constructor(private readonly service: BaixasService) {}

  @Post()
  @Roles(Role.ADMIN, Role.GESTOR)
  @ApiOperation({ summary: 'Registrar baixa patrimonial (irreversível; bem passa a BAIXADO)' })
  @ApiResponse({ status: 201, description: 'Baixa registrada' })
  @ApiResponse({ status: 404, description: 'Bem não encontrado' })
  @ApiResponse({ status: 400, description: 'Bem já possui baixa' })
  async create(
    @Body() body: unknown,
    @CurrentUser() user: RequestUser,
  ): Promise<BaixaResponse> {
    const dto = createBaixaSchema.parse(body) as CreateBaixaDto;
    return this.service.create(dto, user?.id ?? null);
  }

  @Get()
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Listar baixas (paginado)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Lista paginada' })
  async findMany(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{ data: BaixaResponse[]; total: number }> {
    const pageNum = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNum = limit ? Math.min(100, Math.max(1, parseInt(limit, 10))) : 20;
    return this.service.findMany(pageNum, limitNum);
  }

  @Get('bem/:bemId')
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Baixa de um bem (se existir)' })
  @ApiResponse({ status: 200, description: 'Baixa do bem ou null' })
  @ApiResponse({ status: 404, description: 'Bem não encontrado' })
  async findByBem(@Param('bemId', ParseUUIDPipe) bemId: string): Promise<BaixaResponse | null> {
    return this.service.findByBem(bemId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Buscar baixa por ID' })
  @ApiResponse({ status: 200, description: 'Baixa encontrada' })
  @ApiResponse({ status: 404, description: 'Baixa não encontrada' })
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<BaixaResponse> {
    return this.service.findById(id);
  }
}
