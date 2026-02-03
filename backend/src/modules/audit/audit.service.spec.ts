import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { AuditRepository } from './audit.repository';

describe('AuditService', () => {
  let service: AuditService;
  let repository: AuditRepository;

  const mockRepository = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: AuditRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    repository = module.get<AuditRepository>(AuditRepository);
    jest.clearAllMocks();
  });

  it('deve registrar log ao chamar log()', async () => {
    mockRepository.create.mockResolvedValue(undefined);

    await service.log({
      entity: 'Bem',
      entityId: 'id-1',
      action: 'CREATE',
      userId: 'user-1',
      metadata: { numeroPatrimonial: 'PAT-001' },
    });

    expect(mockRepository.create).toHaveBeenCalledWith({
      entity: 'Bem',
      entityId: 'id-1',
      action: 'CREATE',
      userId: 'user-1',
      metadata: { numeroPatrimonial: 'PAT-001' },
    });
  });
});
