import { Module } from '@nestjs/common';
import { BensModule } from '../bens/bens.module';
import { BaixasController } from './baixas.controller';
import { BaixasService } from './baixas.service';
import { BaixasRepository } from './baixas.repository';

@Module({
  imports: [BensModule],
  controllers: [BaixasController],
  providers: [BaixasRepository, BaixasService],
  exports: [BaixasService],
})
export class BaixasModule {}
