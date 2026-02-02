import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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
import { StatusInventario } from '@prisma/client';
import { InventariosService, type InventarioResponse, type InventarioItemResponse } from './inventarios.service';
import { createInventarioSchema, type CreateInventarioDto } from './dto/create-inventario.dto';
import { createInventarioItemSchema, type CreateInventarioItemDto } from './dto/create-inventario-item.dto';
import { updateInventarioItemSchema, type UpdateInventarioItemDto } from './dto/update-inventario-item.dto';

@ApiTags('inventarios')
@Controller('inventarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InventariosController {
  constructor(private readonly service: InventariosService) {}

  @Post()
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR)
  @ApiOperation({ summary: 'Abrir inventário' })
  @ApiResponse({ status: 201, description: 'Inventário criado' })
  async createInventario(@Body() body: unknown): Promise<InventarioResponse> {
    const dto = createInventarioSchema.parse(body) as CreateInventarioDto;
    return this.service.createInventario(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Listar inventários (paginado)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false, enum: StatusInventario })
  @ApiResponse({ status: 200, description: 'Lista paginada' })
  async findInventarios(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: StatusInventario,
  ): Promise<{ data: InventarioResponse[]; total: number }> {
    const pageNum = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNum = limit ? Math.min(100, Math.max(1, parseInt(limit, 10))) : 20;
    return this.service.findInventarios(pageNum, limitNum, status);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Buscar inventário por ID' })
  @ApiResponse({ status: 200, description: 'Inventário encontrado' })
  @ApiResponse({ status: 404, description: 'Inventário não encontrado' })
  async findInventarioById(@Param('id') id: string): Promise<InventarioResponse> {
    return this.service.findInventarioById(id);
  }

  @Post(':id/fechar')
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR)
  @ApiOperation({ summary: 'Fechar inventário' })
  @ApiResponse({ status: 200, description: 'Inventário fechado' })
  @ApiResponse({ status: 404, description: 'Inventário não encontrado' })
  async closeInventario(@Param('id') id: string): Promise<InventarioResponse> {
    return this.service.closeInventario(id);
  }

  @Post('itens')
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR)
  @ApiOperation({ summary: 'Adicionar bem ao inventário' })
  @ApiResponse({ status: 201, description: 'Item adicionado' })
  @ApiResponse({ status: 404, description: 'Inventário ou bem não encontrado' })
  async addItem(
    @Body() body: unknown,
    @CurrentUser() user: RequestUser,
  ): Promise<InventarioItemResponse> {
    const dto = createInventarioItemSchema.parse(body) as CreateInventarioItemDto;
    return this.service.addItem(dto, user?.id ?? null);
  }

  @Get(':id/itens')
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Itens do inventário' })
  @ApiResponse({ status: 200, description: 'Lista de itens' })
  @ApiResponse({ status: 404, description: 'Inventário não encontrado' })
  async findItensByInventario(@Param('id') id: string): Promise<InventarioItemResponse[]> {
    return this.service.findItensByInventario(id);
  }

  @Patch('itens/:itemId')
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR)
  @ApiOperation({ summary: 'Atualizar item (conferir, divergência)' })
  @ApiResponse({ status: 200, description: 'Item atualizado' })
  @ApiResponse({ status: 404, description: 'Item não encontrado' })
  async updateItem(
    @Param('itemId') itemId: string,
    @Body() body: unknown,
    @CurrentUser() user: RequestUser,
  ): Promise<InventarioItemResponse> {
    const dto = updateInventarioItemSchema.parse(body) as UpdateInventarioItemDto;
    return this.service.updateItem(itemId, dto, user?.id ?? null);
  }
}
