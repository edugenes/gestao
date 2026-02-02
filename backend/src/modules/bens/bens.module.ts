import { Module } from '@nestjs/common';
import { EstruturaOrganizacionalModule } from '../estrutura-organizacional/estrutura-organizacional.module';
import { CategoriasController } from './categorias/categorias.controller';
import { CategoriasService } from './categorias/categorias.service';
import { CategoriasRepository } from './categorias/categorias.repository';
import { SubcategoriasController } from './subcategorias/subcategorias.controller';
import { SubcategoriasService } from './subcategorias/subcategorias.service';
import { SubcategoriasRepository } from './subcategorias/subcategorias.repository';
import { BensController } from './bens.controller';
import { BensService } from './bens.service';
import { BensRepository } from './bens.repository';
import { BensHistoricoRepository } from './bens-historico.repository';

@Module({
  imports: [EstruturaOrganizacionalModule],
  controllers: [CategoriasController, SubcategoriasController, BensController],
  providers: [
    CategoriasRepository,
    CategoriasService,
    SubcategoriasRepository,
    SubcategoriasService,
    BensRepository,
    BensHistoricoRepository,
    BensService,
  ],
  exports: [BensService, CategoriasService, SubcategoriasService],
})
export class BensModule {}
