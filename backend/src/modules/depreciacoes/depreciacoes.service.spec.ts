import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Decimal } from '@prisma/client/runtime/library';
import { DepreciacoesService } from './depreciacoes.service';
import { DepreciacoesRepository } from './depreciacoes.repository';
import { BensService } from '../bens/bens.service';

describe('DepreciacoesService', () => {
  let service: DepreciacoesService;
  let repository: DepreciacoesRepository;
  let bensService: BensService;

  const mockRepository = {
    create: jest.fn(),
    findByBemAndMes: jest.fn(),
  };

  const mockBensService = {
    findManyEligibleForDepreciacao: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepreciacoesService,
        { provide: DepreciacoesRepository, useValue: mockRepository },
        { provide: BensService, useValue: mockBensService },
      ],
    }).compile();

    service = module.get<DepreciacoesService>(DepreciacoesService);
    repository = module.get<DepreciacoesRepository>(DepreciacoesRepository);
    bensService = module.get<BensService>(BensService);
    jest.clearAllMocks();
  });

  describe('calcularMensal', () => {
    it('deve rejeitar mesReferencia inválido', async () => {
      await expect(service.calcularMensal('')).rejects.toThrow(BadRequestException);
      await expect(service.calcularMensal('2024-13')).rejects.toThrow(BadRequestException);
      await expect(service.calcularMensal('2024-00')).rejects.toThrow(BadRequestException);
    });

    it('deve retornar processados e criados quando há bens elegíveis sem depreciação', async () => {
      mockBensService.findManyEligibleForDepreciacao.mockResolvedValue([
        { id: 'bem-1', valorAquisicao: new Decimal(1200), vidaUtilMeses: 60 },
        { id: 'bem-2', valorAquisicao: new Decimal(600), vidaUtilMeses: 36 },
      ]);
      mockRepository.findByBemAndMes.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue({});

      const result = await service.calcularMensal('2024-06');

      expect(result).toEqual({ processados: 2, criados: 2 });
      expect(mockRepository.create).toHaveBeenCalledTimes(2);
    });

    it('não deve criar depreciação para bem que já possui no mês', async () => {
      mockBensService.findManyEligibleForDepreciacao.mockResolvedValue([
        { id: 'bem-1', valorAquisicao: new Decimal(1200), vidaUtilMeses: 60 },
      ]);
      mockRepository.findByBemAndMes.mockResolvedValue({ id: 'dep-1' });

      const result = await service.calcularMensal('2024-06');

      expect(result).toEqual({ processados: 1, criados: 0 });
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });
});
