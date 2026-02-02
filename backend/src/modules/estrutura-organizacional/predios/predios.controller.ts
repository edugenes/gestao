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
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';
import { RolesGuard } from '../../../shared/auth/roles.guard';
import { Roles } from '../../../shared/auth/decorators';
import { Role } from '@prisma/client';
import { PrediosService } from './predios.service';
import { createPredioSchema, type CreatePredioDto } from './dto/create-predio.dto';
import { updatePredioSchema, type UpdatePredioDto } from './dto/update-predio.dto';

@ApiTags('estrutura-organizacional')
@Controller('estrutura/predios')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PrediosController {
  constructor(private readonly service: PrediosService) {}

  @Post()
  @Roles(Role.ADMIN, Role.GESTOR)
  @ApiOperation({ summary: 'Criar prédio' })
  @ApiResponse({ status: 201, description: 'Prédio criado' })
  @ApiResponse({ status: 404, description: 'Unidade não encontrada' })
  async create(@Body() body: unknown) {
    const dto = createPredioSchema.parse(body) as CreatePredioDto;
    return this.service.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Listar prédios (paginado)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Lista paginada' })
  async findMany(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNum = limit ? Math.min(100, Math.max(1, parseInt(limit, 10))) : 20;
    return this.service.findMany(pageNum, limitNum);
  }

  @Get('unidade/:unidadeId')
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Listar prédios por unidade' })
  @ApiResponse({ status: 200, description: 'Lista de prédios da unidade' })
  @ApiResponse({ status: 404, description: 'Unidade não encontrada' })
  async findByUnidade(@Param('unidadeId', ParseUUIDPipe) unidadeId: string) {
    return this.service.findByUnidade(unidadeId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Buscar prédio por ID' })
  @ApiResponse({ status: 200, description: 'Prédio encontrado' })
  @ApiResponse({ status: 404, description: 'Prédio não encontrado' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.GESTOR)
  @ApiOperation({ summary: 'Atualizar prédio' })
  @ApiResponse({ status: 200, description: 'Prédio atualizado' })
  @ApiResponse({ status: 404, description: 'Prédio não encontrado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: unknown,
  ) {
    const dto = updatePredioSchema.parse(body) as UpdatePredioDto;
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN, Role.GESTOR)
  @ApiOperation({ summary: 'Soft delete do prédio' })
  @ApiResponse({ status: 204, description: 'Prédio desativado' })
  @ApiResponse({ status: 404, description: 'Prédio não encontrado' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.service.softDelete(id);
  }
}
