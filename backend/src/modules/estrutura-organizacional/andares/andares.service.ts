import { Injectable, NotFoundException } from '@nestjs/common';
import { AndaresRepository } from './andares.repository';
import { PrediosRepository } from '../predios/predios.repository';
import type { CreateAndarDto } from './dto/create-andar.dto';
import type { UpdateAndarDto } from './dto/update-andar.dto';

@Injectable()
export class AndaresService {
  constructor(
    private readonly repository: AndaresRepository,
    private readonly prediosRepository: PrediosRepository,
  ) {}

  async create(dto: CreateAndarDto): Promise<{ id: string; predioId: string; nome: string; codigo: string | null }> {
    const predio = await this.prediosRepository.findById(dto.predioId);
    if (!predio) throw new NotFoundException('Prédio não encontrado');
    const andar = await this.repository.create({
      predioId: dto.predioId,
      nome: dto.nome,
      codigo: dto.codigo,
    });
    return { id: andar.id, predioId: andar.predioId, nome: andar.nome, codigo: andar.codigo };
  }

  async findMany(page = 1, limit = 20): Promise<{
    data: Array<{ id: string; predioId: string; nome: string; codigo: string | null }>;
    total: number;
  }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.repository.findMany(skip, limit),
      this.repository.count(),
    ]);
    return {
      data: data.map((a) => ({ id: a.id, predioId: a.predioId, nome: a.nome, codigo: a.codigo })),
      total,
    };
  }

  async findById(id: string): Promise<{ id: string; predioId: string; nome: string; codigo: string | null }> {
    const andar = await this.repository.findById(id);
    if (!andar) throw new NotFoundException('Andar não encontrado');
    return { id: andar.id, predioId: andar.predioId, nome: andar.nome, codigo: andar.codigo };
  }

  async findByPredio(predioId: string): Promise<Array<{ id: string; nome: string; codigo: string | null }>> {
    const predio = await this.prediosRepository.findById(predioId);
    if (!predio) throw new NotFoundException('Prédio não encontrado');
    const andares = await this.repository.findManyByPredio(predioId);
    return andares.map((a) => ({ id: a.id, nome: a.nome, codigo: a.codigo }));
  }

  async update(
    id: string,
    dto: UpdateAndarDto,
  ): Promise<{ id: string; predioId: string; nome: string; codigo: string | null }> {
    const andar = await this.repository.findById(id);
    if (!andar) throw new NotFoundException('Andar não encontrado');
    const updated = await this.repository.update(id, dto);
    return { id: updated.id, predioId: updated.predioId, nome: updated.nome, codigo: updated.codigo };
  }

  async softDelete(id: string): Promise<void> {
    const andar = await this.repository.findById(id);
    if (!andar) throw new NotFoundException('Andar não encontrado');
    await this.repository.softDelete(id);
  }
}
