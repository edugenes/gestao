import { Injectable } from '@nestjs/common';
import { AuditRepository } from './audit.repository';

export interface AuditLogParams {
  entity: string;
  entityId?: string | null;
  action: string;
  userId?: string | null;
  metadata?: Record<string, unknown> | null;
}

@Injectable()
export class AuditService {
  constructor(private readonly repository: AuditRepository) {}

  /**
   * Registra um evento de auditoria. Logs são imutáveis (apenas inserção).
   * Não inclua senhas ou dados sensíveis em metadata.
   */
  async log(params: AuditLogParams): Promise<void> {
    await this.repository.create(params);
  }
}
