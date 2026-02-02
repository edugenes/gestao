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
import { MovimentacoesService, type MovimentacaoResponse } from './movimentacoes.service';
import { createMovimentacaoSchema, type CreateMovimentacaoDto } from './dto/create-movimentacao.dto';

@ApiTags('movimentacoes')
@Controller('movimentacoes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MovimentacoesController {
  constructor(private readonly service: MovimentacoesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR)
  @ApiOperation({ summary: 'Registrar movimentação (transferência altera setor do bem)' })
  @ApiResponse({ status: 201, description: 'Movimentação registrada' })
  @ApiResponse({ status: 404, description: 'Bem ou setor não encontrado' })
  async create(
    @Body() body: unknown,
    @CurrentUser() user: RequestUser,
  ): Promise<MovimentacaoResponse> {
    const dto = createMovimentacaoSchema.parse(body) as CreateMovimentacaoDto;
    return this.service.create(dto, user?.id ?? null);
  }

  @Get()
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Listar movimentações (paginado)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'bemId', required: false })
  @ApiResponse({ status: 200, description: 'Lista paginada' })
  async findMany(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('bemId') bemId?: string,
  ): Promise<{ data: MovimentacaoResponse[]; total: number }> {
    const pageNum = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNum = limit ? Math.min(100, Math.max(1, parseInt(limit, 10))) : 20;
    return this.service.findMany(pageNum, limitNum, bemId);
  }

  @Get('bem/:bemId')
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Movimentações de um bem' })
  @ApiResponse({ status: 200, description: 'Lista de movimentações' })
  @ApiResponse({ status: 404, description: 'Bem não encontrado' })
  async findByBem(
    @Param('bemId', ParseUUIDPipe) bemId: string,
    @Query('limit') limit?: string,
  ): Promise<MovimentacaoResponse[]> {
    const limitNum = limit ? Math.min(100, Math.max(1, parseInt(limit, 10))) : 50;
    return this.service.findByBem(bemId, limitNum);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Buscar movimentação por ID' })
  @ApiResponse({ status: 200, description: 'Movimentação encontrada' })
  @ApiResponse({ status: 404, description: 'Movimentação não encontrada' })
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<MovimentacaoResponse> {
    return this.service.findById(id);
  }
}
