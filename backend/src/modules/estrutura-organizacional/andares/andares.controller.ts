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
import { AndaresService } from './andares.service';
import { createAndarSchema, type CreateAndarDto } from './dto/create-andar.dto';
import { updateAndarSchema, type UpdateAndarDto } from './dto/update-andar.dto';

@ApiTags('estrutura-organizacional')
@Controller('estrutura/andares')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AndaresController {
  constructor(private readonly service: AndaresService) {}

  @Post()
  @Roles(Role.ADMIN, Role.GESTOR)
  @ApiOperation({ summary: 'Criar andar' })
  @ApiResponse({ status: 201, description: 'Andar criado' })
  @ApiResponse({ status: 404, description: 'Prédio não encontrado' })
  async create(@Body() body: unknown) {
    const dto = createAndarSchema.parse(body) as CreateAndarDto;
    return this.service.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Listar andares (paginado)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Lista paginada' })
  async findMany(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNum = limit ? Math.min(100, Math.max(1, parseInt(limit, 10))) : 20;
    return this.service.findMany(pageNum, limitNum);
  }

  @Get('predio/:predioId')
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Listar andares por prédio' })
  @ApiResponse({ status: 200, description: 'Lista de andares do prédio' })
  @ApiResponse({ status: 404, description: 'Prédio não encontrado' })
  async findByPredio(@Param('predioId', ParseUUIDPipe) predioId: string) {
    return this.service.findByPredio(predioId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Buscar andar por ID' })
  @ApiResponse({ status: 200, description: 'Andar encontrado' })
  @ApiResponse({ status: 404, description: 'Andar não encontrado' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.GESTOR)
  @ApiOperation({ summary: 'Atualizar andar' })
  @ApiResponse({ status: 200, description: 'Andar atualizado' })
  @ApiResponse({ status: 404, description: 'Andar não encontrado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: unknown,
  ) {
    const dto = updateAndarSchema.parse(body) as UpdateAndarDto;
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN, Role.GESTOR)
  @ApiOperation({ summary: 'Soft delete do andar' })
  @ApiResponse({ status: 204, description: 'Andar desativado' })
  @ApiResponse({ status: 404, description: 'Andar não encontrado' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.service.softDelete(id);
  }
}
