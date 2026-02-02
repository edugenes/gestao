import { Injectable, NotFoundException } from '@nestjs/common';
import { FornecedoresRepository } from './fornecedores.repository';
import type { CreateFornecedorDto } from './dto/create-fornecedor.dto';
import type { UpdateFornecedorDto } from './dto/update-fornecedor.dto';

@Injectable()
export class FornecedoresService {
  constructor(private readonly repository: FornecedoresRepository) {}

  async create(dto: CreateFornecedorDto): Promise<{ id: string; nome: string; contato: string | null }> {
    const f = await this.repository.create({ nome: dto.nome, contato: dto.contato ?? null });
    return { id: f.id, nome: f.nome, contato: f.contato };
  }

  async findMany(page = 1, limit = 50): Promise<{ data: Array<{ id: string; nome: string; contato: string | null }>; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.repository.findMany(skip, limit),
      this.repository.count(),
    ]);
    return {
      data: data.map((f) => ({ id: f.id, nome: f.nome, contato: f.contato })),
      total,
    };
  }

  async findById(id: string): Promise<{ id: string; nome: string; contato: string | null }> {
    const f = await this.repository.findById(id);
    if (!f) throw new NotFoundException('Fornecedor não encontrado');
    return { id: f.id, nome: f.nome, contato: f.contato };
  }

  async update(id: string, dto: UpdateFornecedorDto): Promise<{ id: string; nome: string; contato: string | null }> {
    const f = await this.repository.findById(id);
    if (!f) throw new NotFoundException('Fornecedor não encontrado');
    const updated = await this.repository.update(id, dto);
    return { id: updated.id, nome: updated.nome, contato: updated.contato };
  }

  async softDelete(id: string): Promise<void> {
    const f = await this.repository.findById(id);
    if (!f) throw new NotFoundException('Fornecedor não encontrado');
    await this.repository.softDelete(id);
  }
}
