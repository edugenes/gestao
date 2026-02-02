import { Module } from '@nestjs/common';
import { BensModule } from '../bens/bens.module';
import { DepreciacoesController } from './depreciacoes.controller';
import { DepreciacoesService } from './depreciacoes.service';
import { DepreciacoesRepository } from './depreciacoes.repository';

@Module({
  imports: [BensModule],
  controllers: [DepreciacoesController],
  providers: [DepreciacoesRepository, DepreciacoesService],
  exports: [DepreciacoesService],
})
export class DepreciacoesModule {}
