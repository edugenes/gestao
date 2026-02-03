import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './shared/database/prisma.module';
import { JwtAuthGuard } from './shared/auth';
import { AuthModule } from './modules/auth/auth.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { EstruturaOrganizacionalModule } from './modules/estrutura-organizacional/estrutura-organizacional.module';
import { BensModule } from './modules/bens/bens.module';
import { MovimentacoesModule } from './modules/movimentacoes/movimentacoes.module';
import { InventariosModule } from './modules/inventarios/inventarios.module';
import { ManutencoesModule } from './modules/manutencoes/manutencoes.module';
import { DepreciacoesModule } from './modules/depreciacoes/depreciacoes.module';
import { BaixasModule } from './modules/baixas/baixas.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    AuthModule,
    UsuariosModule,
    EstruturaOrganizacionalModule,
    BensModule,
    MovimentacoesModule,
    InventariosModule,
    ManutencoesModule,
    DepreciacoesModule,
    BaixasModule,
    DashboardModule,
    AuditModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
