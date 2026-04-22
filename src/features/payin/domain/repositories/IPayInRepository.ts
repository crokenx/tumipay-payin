// Repository Interface - Domain layer
import { PayIn, CreatePayInRequest, CreatePayInResponse } from '../entities/PayIn';

export interface IPayInRepository {
  createPayIn(request: CreatePayInRequest): Promise<CreatePayInResponse>;
  getPayInById(id: string): Promise<PayIn>;
  listPayIns(customerId: string): Promise<PayIn[]>;
}
