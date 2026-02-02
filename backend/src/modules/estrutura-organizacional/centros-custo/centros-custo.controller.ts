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
import { CentrosCustoService } from './centros-custo.service';
import {
  createCentroCustoSchema,
  type CreateCentroCustoDto,
} from './dto/create-centro-custo.dto';
import {
  updateCentroCustoSchema,
  type UpdateCentroCustoDto,
} from './dto/update-centro-custo.dto';

@ApiTags('estrutura-organizacional')
@Controller('estrutura/centros-custo')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CentrosCustoController {
  constructor(private readonly service: CentrosCustoService) {}

  @Post()
  @Roles(Role.ADMIN, Role.GESTOR)
  @ApiOperation({ summary: 'Criar centro de custo' })
  @ApiResponse({ status: 201, description: 'Centro de custo criado' })
  @ApiResponse({ status: 409, description: 'Código já utilizado' })
  async create(@Body() body: unknown) {
    const dto = createCentroCustoSchema.parse(body) as CreateCentroCustoDto;
    return this.service.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Listar centros de custo (paginado)' })
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
  @ApiOperation({ summary: 'Buscar centro de custo por ID' })
  @ApiResponse({ status: 200, description: 'Centro de custo encontrado' })
  @ApiResponse({ status: 404, description: 'Centro de custo não encontrado' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.GESTOR)
  @ApiOperation({ summary: 'Atualizar centro de custo' })
  @ApiResponse({ status: 200, description: 'Centro de custo atualizado' })
  @ApiResponse({ status: 404, description: 'Centro de custo não encontrado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: unknown,
  ) {
    const dto = updateCentroCustoSchema.parse(body) as UpdateCentroCustoDto;
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN, Role.GESTOR)
  @ApiOperation({ summary: 'Soft delete do centro de custo' })
  @ApiResponse({ status: 204, description: 'Centro de custo desativado' })
  @ApiResponse({ status: 404, description: 'Centro de custo não encontrado' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.service.softDelete(id);
  }
}
