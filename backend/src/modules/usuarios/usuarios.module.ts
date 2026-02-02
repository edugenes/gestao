import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { UsuariosRepository } from './repository/usuarios.repository';

@Module({
  imports: [],
  controllers: [UsuariosController],
  providers: [UsuariosRepository, UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
