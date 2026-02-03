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
import { Roles } from '../../shared/auth/decorators';
import { Role } from '@prisma/client';
import { DepreciacoesService, type DepreciacaoResponse } from './depreciacoes.service';
import { createDepreciacaoSchema, type CreateDepreciacaoDto } from './dto/create-depreciacao.dto';

@ApiTags('depreciacoes')
@Controller('depreciacoes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DepreciacoesController {
  constructor(private readonly service: DepreciacoesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR)
  @ApiOperation({ summary: 'Registrar depreciação mensal (histórico)' })
  @ApiResponse({ status: 201, description: 'Depreciação registrada' })
  @ApiResponse({ status: 404, description: 'Bem não encontrado' })
  @ApiResponse({ status: 400, description: 'Já existe depreciação para este bem neste mês' })
  async create(@Body() body: unknown): Promise<DepreciacaoResponse> {
    const dto = createDepreciacaoSchema.parse(body) as CreateDepreciacaoDto;
    return this.service.create(dto);
  }

  @Post('calcular-mensal')
  @Roles(Role.ADMIN, Role.GESTOR)
  @ApiOperation({ summary: 'Calcular e registrar depreciação mensal para todos os bens elegíveis (job/cron)' })
  @ApiResponse({ status: 201, description: 'Quantidade processada e registros criados' })
  async calcularMensal(@Body() body: { mesReferencia: string; metodo?: 'LINEAR' | 'ACELERADA' }): Promise<{ processados: number; criados: number }> {
    const mesReferencia = typeof body?.mesReferencia === 'string' ? body.mesReferencia : '';
    const metodo = body?.metodo ?? 'LINEAR';
    return this.service.calcularMensal(mesReferencia, metodo);
  }

  @Get()
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Listar depreciações (paginado)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'bemId', required: false })
  @ApiResponse({ status: 200, description: 'Lista paginada' })
  async findMany(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('bemId') bemId?: string,
  ): Promise<{ data: DepreciacaoResponse[]; total: number }> {
    const pageNum = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNum = limit ? Math.min(100, Math.max(1, parseInt(limit, 10))) : 20;
    return this.service.findMany(pageNum, limitNum, bemId);
  }

  @Get('bem/:bemId')
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Depreciações de um bem' })
  @ApiResponse({ status: 200, description: 'Lista de depreciações' })
  @ApiResponse({ status: 404, description: 'Bem não encontrado' })
  async findByBem(@Param('bemId', ParseUUIDPipe) bemId: string): Promise<DepreciacaoResponse[]> {
    return this.service.findByBem(bemId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Buscar depreciação por ID' })
  @ApiResponse({ status: 200, description: 'Depreciação encontrada' })
  @ApiResponse({ status: 404, description: 'Depreciação não encontrada' })
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<DepreciacaoResponse> {
    return this.service.findById(id);
  }
}
