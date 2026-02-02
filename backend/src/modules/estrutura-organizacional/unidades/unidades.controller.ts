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
import { UnidadesService } from './unidades.service';
import { createUnidadeSchema, type CreateUnidadeDto } from './dto/create-unidade.dto';
import { updateUnidadeSchema, type UpdateUnidadeDto } from './dto/update-unidade.dto';

@ApiTags('estrutura-organizacional')
@Controller('estrutura/unidades')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UnidadesController {
  constructor(private readonly service: UnidadesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.GESTOR)
  @ApiOperation({ summary: 'Criar unidade' })
  @ApiResponse({ status: 201, description: 'Unidade criada' })
  async create(@Body() body: unknown) {
    const dto = createUnidadeSchema.parse(body) as CreateUnidadeDto;
    return this.service.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Listar unidades (paginado)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Lista paginada' })
  async findMany(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNum = limit ? Math.min(100, Math.max(1, parseInt(limit, 10))) : 20;
    return this.service.findMany(pageNum, limitNum);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Buscar unidade por ID' })
  @ApiResponse({ status: 200, description: 'Unidade encontrada' })
  @ApiResponse({ status: 404, description: 'Unidade não encontrada' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.GESTOR)
  @ApiOperation({ summary: 'Atualizar unidade' })
  @ApiResponse({ status: 200, description: 'Unidade atualizada' })
  @ApiResponse({ status: 404, description: 'Unidade não encontrada' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: unknown,
  ) {
    const dto = updateUnidadeSchema.parse(body) as UpdateUnidadeDto;
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN, Role.GESTOR)
  @ApiOperation({ summary: 'Soft delete da unidade' })
  @ApiResponse({ status: 204, description: 'Unidade desativada' })
  @ApiResponse({ status: 404, description: 'Unidade não encontrada' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.service.softDelete(id);
  }
}
