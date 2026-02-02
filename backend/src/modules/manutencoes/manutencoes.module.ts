import { Module } from '@nestjs/common';
import { BensModule } from '../bens/bens.module';
import { FornecedoresController } from './fornecedores.controller';
import { FornecedoresService } from './fornecedores.service';
import { FornecedoresRepository } from './fornecedores.repository';
import { ManutencoesController } from './manutencoes.controller';
import { ManutencoesService } from './manutencoes.service';
import { ManutencoesRepository } from './manutencoes.repository';

@Module({
  imports: [BensModule],
  controllers: [FornecedoresController, ManutencoesController],
  providers: [
    FornecedoresRepository,
    FornecedoresService,
    ManutencoesRepository,
    ManutencoesService,
  ],
  exports: [FornecedoresService, ManutencoesService],
})
export class ManutencoesModule {}
