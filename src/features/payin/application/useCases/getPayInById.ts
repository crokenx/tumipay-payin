// Get PayIn By ID Use Case
import { IPayInRepository } from '../../domain/repositories/IPayInRepository';
import { PayIn } from '../../domain/entities/PayIn';

export class GetPayInByIdUseCase {
  constructor(private payInRepository: IPayInRepository) {}

  async execute(id: string): Promise<PayIn> {
    if (!id) {
      throw new Error('id is required');
    }

    return this.payInRepository.getPayInById(id);
  }
}
