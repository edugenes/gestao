import {
  Body,
  Controller,
  Get,
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
import { ManutencoesService, type ManutencaoResponse } from './manutencoes.service';
import { createManutencaoSchema, type CreateManutencaoDto } from './dto/create-manutencao.dto';
import { updateManutencaoSchema, type UpdateManutencaoDto } from './dto/update-manutencao.dto';

@ApiTags('manutencoes')
@Controller('manutencoes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ManutencoesController {
  constructor(private readonly service: ManutencoesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR)
  @ApiOperation({ summary: 'Registrar manutenção (bem passa a EM_MANUTENCAO)' })
  @ApiResponse({ status: 201, description: 'Manutenção registrada' })
  @ApiResponse({ status: 404, description: 'Bem ou fornecedor não encontrado' })
  async create(@Body() body: unknown): Promise<ManutencaoResponse> {
    const dto = createManutencaoSchema.parse(body) as CreateManutencaoDto;
    return this.service.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Listar manutenções (paginado)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'bemId', required: false })
  @ApiResponse({ status: 200, description: 'Lista paginada' })
  async findMany(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('bemId') bemId?: string,
  ): Promise<{ data: ManutencaoResponse[]; total: number }> {
    const pageNum = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNum = limit ? Math.min(100, Math.max(1, parseInt(limit, 10))) : 20;
    return this.service.findMany(pageNum, limitNum, bemId);
  }

  @Get('bem/:bemId')
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Manutenções de um bem' })
  @ApiResponse({ status: 200, description: 'Lista de manutenções' })
  @ApiResponse({ status: 404, description: 'Bem não encontrado' })
  async findByBem(@Param('bemId', ParseUUIDPipe) bemId: string): Promise<ManutencaoResponse[]> {
    return this.service.findByBem(bemId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Buscar manutenção por ID' })
  @ApiResponse({ status: 200, description: 'Manutenção encontrada' })
  @ApiResponse({ status: 404, description: 'Manutenção não encontrada' })
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<ManutencaoResponse> {
    return this.service.findById(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR)
  @ApiOperation({ summary: 'Atualizar manutenção (ex.: data fim; bem volta a EM_USO)' })
  @ApiResponse({ status: 200, description: 'Manutenção atualizada' })
  @ApiResponse({ status: 404, description: 'Manutenção não encontrada' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: unknown,
  ): Promise<ManutencaoResponse> {
    const dto = updateManutencaoSchema.parse(body) as UpdateManutencaoDto;
    return this.service.update(id, dto);
  }
}
