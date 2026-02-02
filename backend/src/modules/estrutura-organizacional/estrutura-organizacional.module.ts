import { Module } from '@nestjs/common';
import { UnidadesController } from './unidades/unidades.controller';
import { UnidadesService } from './unidades/unidades.service';
import { UnidadesRepository } from './unidades/unidades.repository';
import { PrediosController } from './predios/predios.controller';
import { PrediosService } from './predios/predios.service';
import { PrediosRepository } from './predios/predios.repository';
import { AndaresController } from './andares/andares.controller';
import { AndaresService } from './andares/andares.service';
import { AndaresRepository } from './andares/andares.repository';
import { SetoresController } from './setores/setores.controller';
import { SetoresService } from './setores/setores.service';
import { SetoresRepository } from './setores/setores.repository';
import { CentrosCustoController } from './centros-custo/centros-custo.controller';
import { CentrosCustoService } from './centros-custo/centros-custo.service';
import { CentrosCustoRepository } from './centros-custo/centros-custo.repository';

@Module({
  imports: [],
  controllers: [
    UnidadesController,
    PrediosController,
    AndaresController,
    SetoresController,
    CentrosCustoController,
  ],
  providers: [
    UnidadesRepository,
    UnidadesService,
    PrediosRepository,
    PrediosService,
    AndaresRepository,
    AndaresService,
    SetoresRepository,
    SetoresService,
    CentrosCustoRepository,
    CentrosCustoService,
  ],
  exports: [
    UnidadesService,
    PrediosService,
    AndaresService,
    SetoresService,
    CentrosCustoService,
  ],
})
export class EstruturaOrganizacionalModule {}
