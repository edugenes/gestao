import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';

export interface CreateAuditLogData {
  entity: string;
  entityId?: string | null;
  action: string;
  userId?: string | null;
  metadata?: Record<string, unknown> | null;
}

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Apenas inserção – logs são imutáveis. */
  async create(data: CreateAuditLogData): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        entity: data.entity,
        entityId: data.entityId ?? null,
        action: data.action,
        userId: data.userId ?? null,
        metadata: data.metadata == null ? undefined : (data.metadata as object),
      },
    });
  }
}
