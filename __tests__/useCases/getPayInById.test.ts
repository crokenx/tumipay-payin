import { GetPayInByIdUseCase } from '../../src/features/payin/application/useCases/getPayInById';
import { IPayInRepository } from '../../src/features/payin/domain/repositories/IPayInRepository';
import { PayIn, PayInStatus } from '../../src/features/payin/domain/entities/PayIn';

describe('GetPayInByIdUseCase', () => {
  let useCase: GetPayInByIdUseCase;
  let mockRepository: jest.Mocked<IPayInRepository>;

  beforeEach(() => {
    mockRepository = {
      createPayIn: jest.fn(),
      getPayInById: jest.fn(),
      listPayIns: jest.fn(),
    };
    useCase = new GetPayInByIdUseCase(mockRepository);
  });

  describe('execute', () => {
    const mockPayIn: PayIn = {
      id: 'payin-001',
      customer_id: 'cust-123',
      amount: 500,
      currency: 'USD',
      payment_method: 'credit_card',
      description: 'Test payment',
      status: PayInStatus.PROCESSED,
      created_at: '2026-04-29T10:00:00Z',
      updated_at: '2026-04-29T10:05:00Z',
    };

    test('successfully retrieves a PayIn by id', async () => {
      mockRepository.getPayInById.mockResolvedValue(mockPayIn);

      const result = await useCase.execute('payin-001');

      expect(result).toEqual(mockPayIn);
      expect(mockRepository.getPayInById).toHaveBeenCalledWith('payin-001');
      expect(mockRepository.getPayInById).toHaveBeenCalledTimes(1);
    });

    test('throws error when id is empty string', async () => {
      await expect(useCase.execute('')).rejects.toThrow('id is required');
      expect(mockRepository.getPayInById).not.toHaveBeenCalled();
    });

    test('throws error when id is null', async () => {
      await expect(useCase.execute(null as any)).rejects.toThrow(
        'id is required'
      );
      expect(mockRepository.getPayInById).not.toHaveBeenCalled();
    });

    test('throws error when id is undefined', async () => {
      await expect(useCase.execute(undefined as any)).rejects.toThrow(
        'id is required'
      );
      expect(mockRepository.getPayInById).not.toHaveBeenCalled();
    });

    test('retrieves PayIn with different statuses', async () => {
      const statuses = [
        PayInStatus.CREATED,
        PayInStatus.VALIDATED,
        PayInStatus.PROCESSED,
        PayInStatus.FAILED,
      ];

      for (const status of statuses) {
        const payInWithStatus: PayIn = { ...mockPayIn, status };
        mockRepository.getPayInById.mockResolvedValue(payInWithStatus);

        const result = await useCase.execute('payin-001');

        expect(result.status).toBe(status);
        expect(mockRepository.getPayInById).toHaveBeenCalledWith('payin-001');
      }
    });

    test('retrieves PayIn with error message when status is FAILED', async () => {
      const failedPayIn: PayIn = {
        ...mockPayIn,
        status: PayInStatus.FAILED,
        error_message: 'Insufficient funds',
      };
      mockRepository.getPayInById.mockResolvedValue(failedPayIn);

      const result = await useCase.execute('payin-001');

      expect(result.error_message).toBe('Insufficient funds');
      expect(result.status).toBe(PayInStatus.FAILED);
    });

    test('retrieves PayIn with different ids', async () => {
      const ids = ['payin-001', 'payin-123', 'transaction-abc'];

      for (const id of ids) {
        mockRepository.getPayInById.mockResolvedValue({
          ...mockPayIn,
          id,
        });

        const result = await useCase.execute(id);

        expect(result.id).toBe(id);
        expect(mockRepository.getPayInById).toHaveBeenCalledWith(id);
      }
    });

    test('returns PayIn with all fields populated', async () => {
      mockRepository.getPayInById.mockResolvedValue(mockPayIn);

      const result = await useCase.execute('payin-001');

      expect(result.id).toBeDefined();
      expect(result.customer_id).toBeDefined();
      expect(result.amount).toBeDefined();
      expect(result.currency).toBeDefined();
      expect(result.payment_method).toBeDefined();
      expect(result.status).toBeDefined();
      expect(result.created_at).toBeDefined();
      expect(result.updated_at).toBeDefined();
    });

    test('propagates repository errors', async () => {
      const error = new Error('PayIn not found');
      mockRepository.getPayInById.mockRejectedValue(error);

      await expect(useCase.execute('payin-001')).rejects.toThrow(
        'PayIn not found'
      );
    });

    test('handles different error types from repository', async () => {
      const apiError = new Error('API Error: 500 Internal Server Error');
      mockRepository.getPayInById.mockRejectedValue(apiError);

      await expect(useCase.execute('payin-001')).rejects.toThrow(
        'API Error: 500'
      );
    });
  });
});
