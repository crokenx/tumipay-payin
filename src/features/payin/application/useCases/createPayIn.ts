// Create PayIn Use Case
import { IPayInRepository } from '../../domain/repositories/IPayInRepository';
import {
  CreatePayInRequest,
  CreatePayInResponse,
} from '../../domain/entities/PayIn';

export class CreatePayInUseCase {
  constructor(private payInRepository: IPayInRepository) {}

  async execute(request: CreatePayInRequest): Promise<CreatePayInResponse> {
    // Validate required fields
    if (!request.customer_id) {
      throw new Error('customer_id is required');
    }
    if (!request.amount || request.amount <= 0) {
      throw new Error('amount must be greater than 0');
    }
    if (!request.currency) {
      throw new Error('currency is required');
    }
    if (!request.payment_method) {
      throw new Error('payment_method is required');
    }

    // Call repository
    return this.payInRepository.createPayIn(request);
  }
}
