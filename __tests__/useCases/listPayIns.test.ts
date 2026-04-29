import { ListPayInsUseCase } from '../../src/features/payin/application/useCases/listPayIns';
import { IPayInRepository } from '../../src/features/payin/domain/repositories/IPayInRepository';
import { PayIn, PayInStatus } from '../../src/features/payin/domain/entities/PayIn';

describe('ListPayInsUseCase', () => {
  let useCase: ListPayInsUseCase;
  let mockRepository: jest.Mocked<IPayInRepository>;

  beforeEach(() => {
    mockRepository = {
      createPayIn: jest.fn(),
      getPayInById: jest.fn(),
      listPayIns: jest.fn(),
    };
    useCase = new ListPayInsUseCase(mockRepository);
  });

  describe('execute', () => {
    const mockPayIns: PayIn[] = [
      {
        id: 'payin-001',
        customer_id: 'cust-123',
        amount: 500,
        currency: 'USD',
        payment_method: 'credit_card',
        description: 'First payment',
        status: PayInStatus.PROCESSED,
        created_at: '2026-04-29T10:00:00Z',
        updated_at: '2026-04-29T10:05:00Z',
      },
      {
        id: 'payin-002',
        customer_id: 'cust-123',
        amount: 1000,
        currency: 'USD',
        payment_method: 'bank_transfer',
        description: 'Second payment',
        status: PayInStatus.CREATED,
        created_at: '2026-04-28T15:00:00Z',
        updated_at: '2026-04-28T15:00:00Z',
      },
      {
        id: 'payin-003',
        customer_id: 'cust-123',
        amount: 750,
        currency: 'EUR',
        payment_method: 'credit_card',
        description: 'Third payment',
        status: PayInStatus.FAILED,
        error_message: 'Card declined',
        created_at: '2026-04-27T12:00:00Z',
        updated_at: '2026-04-27T12:05:00Z',
      },
    ];

    test('successfully lists PayIns for a customer', async () => {
      mockRepository.listPayIns.mockResolvedValue(mockPayIns);

      const result = await useCase.execute('cust-123');

      expect(result).toEqual(mockPayIns);
      expect(result).toHaveLength(3);
      expect(mockRepository.listPayIns).toHaveBeenCalledWith('cust-123');
      expect(mockRepository.listPayIns).toHaveBeenCalledTimes(1);
    });

    test('returns empty array when customer has no PayIns', async () => {
      mockRepository.listPayIns.mockResolvedValue([]);

      const result = await useCase.execute('cust-123');

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(mockRepository.listPayIns).toHaveBeenCalledWith('cust-123');
    });

    test('throws error when customerId is empty string', async () => {
      await expect(useCase.execute('')).rejects.toThrow(
        'customerId is required'
      );
      expect(mockRepository.listPayIns).not.toHaveBeenCalled();
    });

    test('throws error when customerId is null', async () => {
      await expect(useCase.execute(null as any)).rejects.toThrow(
        'customerId is required'
      );
      expect(mockRepository.listPayIns).not.toHaveBeenCalled();
    });

    test('throws error when customerId is undefined', async () => {
      await expect(useCase.execute(undefined as any)).rejects.toThrow(
        'customerId is required'
      );
      expect(mockRepository.listPayIns).not.toHaveBeenCalled();
    });

    test('returns PayIns with different statuses', async () => {
      mockRepository.listPayIns.mockResolvedValue(mockPayIns);

      const result = await useCase.execute('cust-123');

      const statuses = result.map((p) => p.status);
      expect(statuses).toContain(PayInStatus.PROCESSED);
      expect(statuses).toContain(PayInStatus.CREATED);
      expect(statuses).toContain(PayInStatus.FAILED);
    });

    test('returns PayIns with different currencies', async () => {
      mockRepository.listPayIns.mockResolvedValue(mockPayIns);

      const result = await useCase.execute('cust-123');

      const currencies = result.map((p) => p.currency);
      expect(currencies).toContain('USD');
      expect(currencies).toContain('EUR');
    });

    test('returns PayIns with different payment methods', async () => {
      mockRepository.listPayIns.mockResolvedValue(mockPayIns);

      const result = await useCase.execute('cust-123');

      const methods = result.map((p) => p.payment_method);
      expect(methods).toContain('credit_card');
      expect(methods).toContain('bank_transfer');
    });

    test('returns PayIns with different amounts', async () => {
      mockRepository.listPayIns.mockResolvedValue(mockPayIns);

      const result = await useCase.execute('cust-123');

      const amounts = result.map((p) => p.amount);
      expect(amounts).toContain(500);
      expect(amounts).toContain(1000);
      expect(amounts).toContain(750);
    });

    test('returns PayIns only for the specified customer', async () => {
      const payInForOtherCustomer: PayIn = {
        ...mockPayIns[0],
        id: 'payin-999',
        customer_id: 'cust-999',
      };

      mockRepository.listPayIns.mockResolvedValue([]);

      const result = await useCase.execute('cust-456');

      expect(result).toEqual([]);
      expect(mockRepository.listPayIns).toHaveBeenCalledWith('cust-456');
    });

    test('returns PayIns with all fields populated', async () => {
      mockRepository.listPayIns.mockResolvedValue(mockPayIns);

      const result = await useCase.execute('cust-123');

      result.forEach((payIn) => {
        expect(payIn.id).toBeDefined();
        expect(payIn.customer_id).toBeDefined();
        expect(payIn.amount).toBeDefined();
        expect(payIn.currency).toBeDefined();
        expect(payIn.payment_method).toBeDefined();
        expect(payIn.status).toBeDefined();
        expect(payIn.created_at).toBeDefined();
        expect(payIn.updated_at).toBeDefined();
      });
    });

    test('preserves error_message for failed PayIns', async () => {
      mockRepository.listPayIns.mockResolvedValue(mockPayIns);

      const result = await useCase.execute('cust-123');

      const failedPayIn = result.find((p) => p.status === PayInStatus.FAILED);
      expect(failedPayIn?.error_message).toBe('Card declined');
    });

    test('propagates repository errors', async () => {
      const error = new Error('Database connection failed');
      mockRepository.listPayIns.mockRejectedValue(error);

      await expect(useCase.execute('cust-123')).rejects.toThrow(
        'Database connection failed'
      );
    });

    test('handles different error types from repository', async () => {
      const networkError = new Error('Network timeout');
      mockRepository.listPayIns.mockRejectedValue(networkError);

      await expect(useCase.execute('cust-123')).rejects.toThrow(
        'Network timeout'
      );
    });

    test('returns single PayIn when customer has only one', async () => {
      const singlePayIn = [mockPayIns[0]];
      mockRepository.listPayIns.mockResolvedValue(singlePayIn);

      const result = await useCase.execute('cust-123');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockPayIns[0]);
    });

    test('handles large number of PayIns', async () => {
      const manyPayIns = Array.from({ length: 100 }, (_, i) => ({
        ...mockPayIns[0],
        id: `payin-${i}`,
      }));
      mockRepository.listPayIns.mockResolvedValue(manyPayIns);

      const result = await useCase.execute('cust-123');

      expect(result).toHaveLength(100);
      expect(mockRepository.listPayIns).toHaveBeenCalledWith('cust-123');
    });
  });
});
