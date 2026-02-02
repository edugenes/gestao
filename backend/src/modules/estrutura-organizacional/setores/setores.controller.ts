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
import { SetoresService } from './setores.service';
import { createSetorSchema, type CreateSetorDto } from './dto/create-setor.dto';
import { updateSetorSchema, type UpdateSetorDto } from './dto/update-setor.dto';

@ApiTags('estrutura-organizacional')
@Controller('estrutura/setores')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SetoresController {
  constructor(private readonly service: SetoresService) {}

  @Post()
  @Roles(Role.ADMIN, Role.GESTOR)
  @ApiOperation({ summary: 'Criar setor' })
  @ApiResponse({ status: 201, description: 'Setor criado' })
  @ApiResponse({ status: 404, description: 'Andar ou centro de custo não encontrado' })
  async create(@Body() body: unknown) {
    const dto = createSetorSchema.parse(body) as CreateSetorDto;
    return this.service.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Listar setores (paginado)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Lista paginada' })
  async findMany(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNum = limit ? Math.min(100, Math.max(1, parseInt(limit, 10))) : 20;
    return this.service.findMany(pageNum, limitNum);
  }

  @Get('andar/:andarId')
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Listar setores por andar' })
  @ApiResponse({ status: 200, description: 'Lista de setores do andar' })
  @ApiResponse({ status: 404, description: 'Andar não encontrado' })
  async findByAndar(@Param('andarId', ParseUUIDPipe) andarId: string) {
    return this.service.findByAndar(andarId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Buscar setor por ID' })
  @ApiResponse({ status: 200, description: 'Setor encontrado' })
  @ApiResponse({ status: 404, description: 'Setor não encontrado' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.GESTOR)
  @ApiOperation({ summary: 'Atualizar setor' })
  @ApiResponse({ status: 200, description: 'Setor atualizado' })
  @ApiResponse({ status: 404, description: 'Setor não encontrado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: unknown,
  ) {
    const dto = updateSetorSchema.parse(body) as UpdateSetorDto;
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN, Role.GESTOR)
  @ApiOperation({ summary: 'Soft delete do setor' })
  @ApiResponse({ status: 204, description: 'Setor desativado' })
  @ApiResponse({ status: 404, description: 'Setor não encontrado' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.service.softDelete(id);
  }
}
