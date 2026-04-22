// List PayIns Use Case
import { IPayInRepository } from '../../domain/repositories/IPayInRepository';
import { PayIn } from '../../domain/entities/PayIn';

export class ListPayInsUseCase {
  constructor(private payInRepository: IPayInRepository) {}

  async execute(customerId: string): Promise<PayIn[]> {
    if (!customerId) {
      throw new Error('customerId is required');
    }

    return this.payInRepository.listPayIns(customerId);
  }
}
