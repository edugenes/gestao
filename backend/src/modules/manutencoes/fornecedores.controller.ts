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
import { Roles } from '../../shared/auth/decorators';
import { Role } from '@prisma/client';
import { FornecedoresService } from './fornecedores.service';
import { createFornecedorSchema, type CreateFornecedorDto } from './dto/create-fornecedor.dto';
import { updateFornecedorSchema, type UpdateFornecedorDto } from './dto/update-fornecedor.dto';

@ApiTags('manutencoes')
@Controller('manutencoes/fornecedores')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FornecedoresController {
  constructor(private readonly service: FornecedoresService) {}

  @Post()
  @Roles(Role.ADMIN, Role.GESTOR)
  @ApiOperation({ summary: 'Criar fornecedor' })
  @ApiResponse({ status: 201, description: 'Fornecedor criado' })
  async create(@Body() body: unknown) {
    const dto = createFornecedorSchema.parse(body) as CreateFornecedorDto;
    return this.service.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Listar fornecedores (paginado)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Lista paginada' })
  async findMany(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNum = limit ? Math.min(100, Math.max(1, parseInt(limit, 10))) : 50;
    return this.service.findMany(pageNum, limitNum);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Buscar fornecedor por ID' })
  @ApiResponse({ status: 200, description: 'Fornecedor encontrado' })
  @ApiResponse({ status: 404, description: 'Fornecedor não encontrado' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.GESTOR)
  @ApiOperation({ summary: 'Atualizar fornecedor' })
  @ApiResponse({ status: 200, description: 'Fornecedor atualizado' })
  @ApiResponse({ status: 404, description: 'Fornecedor não encontrado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: unknown,
  ) {
    const dto = updateFornecedorSchema.parse(body) as UpdateFornecedorDto;
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN, Role.GESTOR)
  @ApiOperation({ summary: 'Soft delete do fornecedor' })
  @ApiResponse({ status: 204, description: 'Fornecedor desativado' })
  @ApiResponse({ status: 404, description: 'Fornecedor não encontrado' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.service.softDelete(id);
  }
}
