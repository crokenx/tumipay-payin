import { CreatePayInUseCase } from '../../src/features/payin/application/useCases/createPayIn';
import { IPayInRepository } from '../../src/features/payin/domain/repositories/IPayInRepository';
import {
  CreatePayInRequest,
  CreatePayInResponse,
  PayInStatus,
} from '../../src/features/payin/domain/entities/PayIn';

describe('CreatePayInUseCase', () => {
  let useCase: CreatePayInUseCase;
  let mockRepository: jest.Mocked<IPayInRepository>;

  beforeEach(() => {
    mockRepository = {
      createPayIn: jest.fn(),
      getPayInById: jest.fn(),
      listPayIns: jest.fn(),
    };
    useCase = new CreatePayInUseCase(mockRepository);
  });

  describe('execute', () => {
    const validRequest: CreatePayInRequest = {
      customer_id: 'cust-123',
      amount: 500,
      currency: 'USD',
      payment_method: 'credit_card',
      description: 'Test payment',
    };

    const mockResponse: CreatePayInResponse = {
      id: 'payin-001',
      customer_id: 'cust-123',
      amount: 500,
      currency: 'USD',
      payment_method: 'credit_card',
      description: 'Test payment',
      status: PayInStatus.CREATED,
      created_at: '2026-04-29T10:00:00Z',
      updated_at: '2026-04-29T10:00:00Z',
    };

    test('successfully creates a PayIn with valid request', async () => {
      mockRepository.createPayIn.mockResolvedValue(mockResponse);

      const result = await useCase.execute(validRequest);

      expect(result).toEqual(mockResponse);
      expect(mockRepository.createPayIn).toHaveBeenCalledWith(validRequest);
      expect(mockRepository.createPayIn).toHaveBeenCalledTimes(1);
    });

    test('throws error when customer_id is missing', async () => {
      const invalidRequest: CreatePayInRequest = {
        ...validRequest,
        customer_id: '',
      };

      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        'customer_id is required'
      );
      expect(mockRepository.createPayIn).not.toHaveBeenCalled();
    });

    test('throws error when amount is missing or zero', async () => {
      const invalidRequest: CreatePayInRequest = {
        ...validRequest,
        amount: 0,
      };

      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        'amount must be greater than 0'
      );
      expect(mockRepository.createPayIn).not.toHaveBeenCalled();
    });

    test('throws error when amount is negative', async () => {
      const invalidRequest: CreatePayInRequest = {
        ...validRequest,
        amount: -100,
      };

      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        'amount must be greater than 0'
      );
      expect(mockRepository.createPayIn).not.toHaveBeenCalled();
    });

    test('throws error when currency is missing', async () => {
      const invalidRequest: CreatePayInRequest = {
        ...validRequest,
        currency: '',
      };

      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        'currency is required'
      );
      expect(mockRepository.createPayIn).not.toHaveBeenCalled();
    });

    test('throws error when payment_method is missing', async () => {
      const invalidRequest: CreatePayInRequest = {
        ...validRequest,
        payment_method: '',
      };

      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        'payment_method is required'
      );
      expect(mockRepository.createPayIn).not.toHaveBeenCalled();
    });

    test('supports optional description field', async () => {
      const requestWithoutDescription: CreatePayInRequest = {
        customer_id: 'cust-123',
        amount: 500,
        currency: 'USD',
        payment_method: 'credit_card',
      };

      mockRepository.createPayIn.mockResolvedValue(mockResponse);

      const result = await useCase.execute(requestWithoutDescription);

      expect(result).toEqual(mockResponse);
      expect(mockRepository.createPayIn).toHaveBeenCalledWith(
        requestWithoutDescription
      );
    });

    test('creates PayIn with large amount', async () => {
      const largeRequest: CreatePayInRequest = {
        ...validRequest,
        amount: 999999.99,
      };

      mockRepository.createPayIn.mockResolvedValue({
        ...mockResponse,
        amount: 999999.99,
      });

      const result = await useCase.execute(largeRequest);

      expect(result.amount).toBe(999999.99);
      expect(mockRepository.createPayIn).toHaveBeenCalledWith(largeRequest);
    });

    test('creates PayIn with different currencies', async () => {
      const currencies = ['EUR', 'GBP', 'JPY'];

      for (const currency of currencies) {
        const request: CreatePayInRequest = {
          ...validRequest,
          currency,
        };

        mockRepository.createPayIn.mockResolvedValue({
          ...mockResponse,
          currency,
        });

        const result = await useCase.execute(request);

        expect(result.currency).toBe(currency);
        expect(mockRepository.createPayIn).toHaveBeenCalledWith(request);
      }
    });

    test('creates PayIn with different payment methods', async () => {
      const methods = ['paypal', 'bank_transfer', 'wallet'];

      for (const method of methods) {
        const request: CreatePayInRequest = {
          ...validRequest,
          payment_method: method,
        };

        mockRepository.createPayIn.mockResolvedValue({
          ...mockResponse,
          payment_method: method,
        });

        const result = await useCase.execute(request);

        expect(result.payment_method).toBe(method);
      }
    });

    test('propagates repository errors', async () => {
      const error = new Error('Database error');
      mockRepository.createPayIn.mockRejectedValue(error);

      await expect(useCase.execute(validRequest)).rejects.toThrow(
        'Database error'
      );
    });
  });
});
