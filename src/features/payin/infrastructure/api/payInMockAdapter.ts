// PayIn Mock Adapter - For development and testing
import { IPayInRepository } from '../../domain/repositories/IPayInRepository';
import {
  PayIn,
  PayInStatus,
  CreatePayInRequest,
  CreatePayInResponse,
} from '../../domain/entities/PayIn';

const MOCK_PAYINS: Record<string, PayIn> = {
  'payin-001': {
    id: 'payin-001',
    customer_id: 'cust-123',
    amount: 1000,
    currency: 'USD',
    status: PayInStatus.PROCESSED,
    payment_method: 'credit_card',
    description: 'Test transaction 1',
    created_at: '2026-04-20T10:00:00Z',
    updated_at: '2026-04-20T10:05:00Z',
  },
  'payin-002': {
    id: 'payin-002',
    customer_id: 'cust-123',
    amount: 500,
    currency: 'USD',
    status: PayInStatus.VALIDATED,
    payment_method: 'paypal',
    description: 'Test transaction 2',
    created_at: '2026-04-19T15:30:00Z',
    updated_at: '2026-04-19T15:35:00Z',
  },
  'payin-003': {
    id: 'payin-003',
    customer_id: 'cust-123',
    amount: 2500,
    currency: 'USD',
    status: PayInStatus.FAILED,
    payment_method: 'bank_transfer',
    description: 'Test transaction 3',
    created_at: '2026-04-18T08:20:00Z',
    updated_at: '2026-04-18T08:25:00Z',
    error_message: 'Insufficient funds',
  },
};

export class PayInMockAdapter implements IPayInRepository {
  async createPayIn(request: CreatePayInRequest): Promise<CreatePayInResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newId = `payin-${Date.now()}`;

    const newPayin: PayIn = {
      id: newId,
      customer_id: request.customer_id,
      amount: request.amount,
      currency: request.currency,
      status: PayInStatus.CREATED,
      payment_method: request.payment_method,
      description: request.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    MOCK_PAYINS[newId] = newPayin;
    
    return newPayin;
  }

  async getPayInById(id: string): Promise<PayIn> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const payin = MOCK_PAYINS[id];
    if (!payin) {
      throw new Error(`PayIn with id ${id} not found`);
    }
    return payin;
  }

  async listPayIns(customerId: string): Promise<PayIn[]> {
    console.log(`Mock API: Listing PayIns for customer_id=${customerId}`);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    return Object.values(MOCK_PAYINS).filter(
      (p) => p.customer_id === customerId
    );
  }
}
