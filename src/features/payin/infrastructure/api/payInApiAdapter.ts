// PayIn API Adapter - Real implementation
import { IPayInRepository } from '../../domain/repositories/IPayInRepository';
import {
  PayIn,
  CreatePayInRequest,
  CreatePayInResponse,
} from '../../domain/entities/PayIn';
import { httpClient } from '../http/httpClient';
import { ApiError } from '../../../../shared';

export class PayInApiAdapter implements IPayInRepository {
  private readonly basePath = '/payins';

  async createPayIn(request: CreatePayInRequest): Promise<CreatePayInResponse> {
    try {
      const response = await httpClient.post<CreatePayInResponse>(
        this.basePath,
        request
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPayInById(id: string): Promise<PayIn> {
    try {
      const response = await httpClient.get<PayIn>(`${this.basePath}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async listPayIns(customerId: string): Promise<PayIn[]> {
    console.log(`API Adapter: Listing PayIns for customer_id=${customerId}`);
    try {
      const response = await httpClient.get<{ data: PayIn[] }>(
        `${this.basePath}?customer_id=${customerId}`
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): ApiError {
    if (error instanceof Error) {
      if ('response' in error) {
        const axiosError = error as any;
        const status = axiosError.response?.status;
        const errorData = axiosError.response?.data;

        return new ApiError(
          errorData?.message || 'API Error',
          status || 500,
          errorData
        );
      }
      return new ApiError(error.message, 500);
    }
    return new ApiError('Unknown error', 500);
  }
}
