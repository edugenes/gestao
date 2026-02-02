import { Module } from '@nestjs/common';
import { BensModule } from '../bens/bens.module';
import { InventariosController } from './inventarios.controller';
import { InventariosService } from './inventarios.service';
import { InventariosRepository } from './inventarios.repository';

@Module({
  imports: [BensModule],
  controllers: [InventariosController],
  providers: [InventariosRepository, InventariosService],
  exports: [InventariosService],
})
export class InventariosModule {}
