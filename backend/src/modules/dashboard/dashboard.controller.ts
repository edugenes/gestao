import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../shared/auth/jwt-auth.guard';
import { RolesGuard } from '../../shared/auth/roles.guard';
import { Roles } from '../../shared/auth/decorators';
import { Role } from '@prisma/client';
import { DashboardService, type DashboardStats } from './dashboard.service';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('stats')
  @Roles(Role.ADMIN, Role.GESTOR, Role.OPERADOR, Role.CONSULTA)
  @ApiOperation({ summary: 'Estatísticas para o dashboard' })
  @ApiResponse({ status: 200, description: 'Total de bens, valor patrimonial, depreciação mensal e pendências' })
  async getStats(): Promise<DashboardStats> {
    return this.service.getStats();
  }
}
