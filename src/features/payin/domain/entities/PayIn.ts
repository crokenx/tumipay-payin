// PayIn Entity - Domain layer with all business logic
export enum PayInStatus {
  CREATED = 'CREATED',
  VALIDATED = 'VALIDATED',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
}

export interface PayIn {
  id: string;
  customer_id: string;
  amount: number;
  currency: string;
  status: PayInStatus;
  payment_method: string;
  description?: string;
  created_at: string;
  updated_at: string;
  error_message?: string;
}

export interface CreatePayInRequest {
  customer_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  description?: string;
}

export interface CreatePayInResponse {
  id: string;
  customer_id: string;
  amount: number;
  currency: string;
  status: PayInStatus;
  payment_method: string;
  description?: string;
  created_at: string;
  updated_at: string;
}
