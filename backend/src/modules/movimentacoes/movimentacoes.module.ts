import { Module } from '@nestjs/common';
import { BensModule } from '../bens/bens.module';
import { EstruturaOrganizacionalModule } from '../estrutura-organizacional/estrutura-organizacional.module';
import { MovimentacoesController } from './movimentacoes.controller';
import { MovimentacoesService } from './movimentacoes.service';
import { MovimentacoesRepository } from './movimentacoes.repository';

@Module({
  imports: [BensModule, EstruturaOrganizacionalModule],
  controllers: [MovimentacoesController],
  providers: [MovimentacoesRepository, MovimentacoesService],
  exports: [MovimentacoesService],
})
export class MovimentacoesModule {}
