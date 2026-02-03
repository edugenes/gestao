import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../shared/auth/jwt-auth.guard';
import { RolesGuard } from '../../shared/auth/roles.guard';
import { Roles, CurrentUser } from '../../shared/auth/decorators';
import type { RequestUser } from '../../shared/auth/decorators';
import { Role } from '@prisma/client';
import { BensService, type BemResponse, type BemEtiquetaItem, type HistoricoItem } from './bens.service';
import { createBemSchema, type CreateBemDto } from './dto/create-bem.dto';
import { updateBemSchema, type UpdateBemDto } from './dto/update-bem.dto';

@ApiTags('bens')
@Controller('bens')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BensController {
  constructor(private readonly service: BensService) {}

  @Post()
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR)
  @ApiOperation({ summary: 'Cadastrar bem patrimonial' })
  @ApiResponse({ status: 201, description: 'Bem criado' })
  @ApiResponse({ status: 409, description: 'Número patrimonial já cadastrado' })
  @ApiResponse({ status: 404, description: 'Setor ou subcategoria não encontrado' })
  async create(@Body() body: unknown, @CurrentUser() user?: RequestUser): Promise<BemResponse> {
    const dto = createBemSchema.parse(body) as CreateBemDto;
    return this.service.create(dto, user?.id ?? null);
  }

  @Get()
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Listar bens (paginado, com filtros)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'setorId', required: false })
  @ApiQuery({ name: 'situacao', required: false })
  @ApiQuery({ name: 'numeroPatrimonial', required: false, description: 'Busca parcial' })
  @ApiResponse({ status: 200, description: 'Lista paginada' })
  async findMany(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('setorId') setorId?: string,
    @Query('situacao') situacao?: string,
    @Query('numeroPatrimonial') numeroPatrimonial?: string,
  ): Promise<{ data: BemResponse[]; total: number }> {
    const pageNum = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNum = limit ? Math.min(100, Math.max(1, parseInt(limit, 10))) : 20;
    return this.service.findMany(
      { setorId, situacao, numeroPatrimonial },
      pageNum,
      limitNum,
    );
  }

  @Get('etiquetas')
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Listar bens para geração de etiquetas em lote (dados mínimos)' })
  @ApiQuery({ name: 'setorId', required: false })
  @ApiQuery({ name: 'situacao', required: false })
  @ApiQuery({ name: 'numeroPatrimonial', required: false })
  @ApiQuery({ name: 'limit', required: false, description: 'Máx. 2000' })
  @ApiResponse({ status: 200, description: 'Lista de bens para etiquetas' })
  async findForEtiquetas(
    @Query('setorId') setorId?: string,
    @Query('situacao') situacao?: string,
    @Query('numeroPatrimonial') numeroPatrimonial?: string,
    @Query('limit') limit?: string,
  ): Promise<BemEtiquetaItem[]> {
    const limitNum = limit
      ? Math.min(2000, Math.max(1, parseInt(limit, 10)))
      : 500;
    return this.service.findManyForEtiquetas(
      { setorId, situacao, numeroPatrimonial },
      limitNum,
    );
  }

  @Get(':id/historico')
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Histórico de alterações do bem' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Lista de alterações' })
  @ApiResponse({ status: 404, description: 'Bem não encontrado' })
  async findHistorico(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('limit') limit?: string,
  ): Promise<HistoricoItem[]> {
    const limitNum = limit ? Math.min(200, Math.max(1, parseInt(limit, 10))) : 100;
    return this.service.findHistorico(id, limitNum);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Buscar bem por ID' })
  @ApiResponse({ status: 200, description: 'Bem encontrado' })
  @ApiResponse({ status: 404, description: 'Bem não encontrado' })
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<BemResponse> {
    return this.service.findById(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR)
  @ApiOperation({ summary: 'Atualizar bem (número patrimonial é imutável)' })
  @ApiResponse({ status: 200, description: 'Bem atualizado' })
  @ApiResponse({ status: 404, description: 'Bem não encontrado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: unknown,
    @CurrentUser() user: RequestUser,
  ): Promise<BemResponse> {
    const dto = updateBemSchema.parse(body) as UpdateBemDto;
    return this.service.update(id, dto, user?.id ?? null);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN, Role.GESTOR)
  @ApiOperation({ summary: 'Soft delete do bem' })
  @ApiResponse({ status: 204, description: 'Bem desativado' })
  @ApiResponse({ status: 404, description: 'Bem não encontrado' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user?: RequestUser): Promise<void> {
    await this.service.softDelete(id, user?.id ?? null);
  }
}
