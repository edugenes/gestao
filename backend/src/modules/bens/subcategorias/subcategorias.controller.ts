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
import { SubcategoriasService } from './subcategorias.service';
import {
  createSubcategoriaSchema,
  type CreateSubcategoriaDto,
} from './dto/create-subcategoria.dto';
import {
  updateSubcategoriaSchema,
  type UpdateSubcategoriaDto,
} from './dto/update-subcategoria.dto';

@ApiTags('bens')
@Controller('bens/subcategorias')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SubcategoriasController {
  constructor(private readonly service: SubcategoriasService) {}

  @Post()
  @Roles(Role.ADMIN, Role.GESTOR)
  @ApiOperation({ summary: 'Criar subcategoria de bem' })
  @ApiResponse({ status: 201, description: 'Subcategoria criada' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  async create(@Body() body: unknown) {
    const dto = createSubcategoriaSchema.parse(body) as CreateSubcategoriaDto;
    return this.service.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Listar subcategorias (paginado)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Lista paginada' })
  async findMany(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNum = limit ? Math.min(100, Math.max(1, parseInt(limit, 10))) : 50;
    return this.service.findMany(pageNum, limitNum);
  }

  @Get('categoria/:categoriaId')
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Listar subcategorias por categoria' })
  @ApiResponse({ status: 200, description: 'Lista de subcategorias' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  async findByCategoria(@Param('categoriaId', ParseUUIDPipe) categoriaId: string) {
    return this.service.findByCategoria(categoriaId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Buscar subcategoria por ID' })
  @ApiResponse({ status: 200, description: 'Subcategoria encontrada' })
  @ApiResponse({ status: 404, description: 'Subcategoria não encontrada' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.GESTOR)
  @ApiOperation({ summary: 'Atualizar subcategoria' })
  @ApiResponse({ status: 200, description: 'Subcategoria atualizada' })
  @ApiResponse({ status: 404, description: 'Subcategoria não encontrada' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: unknown,
  ) {
    const dto = updateSubcategoriaSchema.parse(body) as UpdateSubcategoriaDto;
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN, Role.GESTOR)
  @ApiOperation({ summary: 'Soft delete da subcategoria' })
  @ApiResponse({ status: 204, description: 'Subcategoria desativada' })
  @ApiResponse({ status: 404, description: 'Subcategoria não encontrada' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.service.softDelete(id);
  }
}
