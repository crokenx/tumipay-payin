import { PayInMockAdapter } from '../../src/features/payin/infrastructure/api/payInMockAdapter';
import {
  PayIn,
  PayInStatus,
  CreatePayInRequest,
} from '../../src/features/payin/domain/entities/PayIn';

describe('PayInMockAdapter', () => {
  let adapter: PayInMockAdapter;

  beforeEach(() => {
    adapter = new PayInMockAdapter();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('createPayIn', () => {
    const mockRequest: CreatePayInRequest = {
      customer_id: 'cust-created',
      amount: 500,
      currency: 'USD',
      payment_method: 'credit_card',
      description: 'Test payment',
    };

    test('successfully creates a PayIn with mock data', async () => {
      const promise = adapter.createPayIn(mockRequest);
      jest.runAllTimers();
      const result = await promise;

      expect(result).toBeDefined();
      expect(result.customer_id).toBe('cust-created');
      expect(result.amount).toBe(500);
      expect(result.currency).toBe('USD');
      expect(result.payment_method).toBe('credit_card');
      expect(result.description).toBe('Test payment');
      expect(result.status).toBe(PayInStatus.CREATED);
    });

    test('generates unique id for each created PayIn', async () => {
      const promise1 = adapter.createPayIn(mockRequest);
      jest.runAllTimers();
      const result1 = await promise1;

      const promise2 = adapter.createPayIn(mockRequest);
      jest.runAllTimers();
      const result2 = await promise2;

      expect(result1.id).not.toBe(result2.id);
      expect(result1.id).toMatch(/payin-\d+/);
      expect(result2.id).toMatch(/payin-\d+/);
    });

    test('simulates 500ms network delay', async () => {
      const start = jest.now();
      const promise = adapter.createPayIn(mockRequest);
      jest.runAllTimers();
      await promise;
      const elapsed = jest.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(500);
    });

    test('sets status to CREATED for new PayIns', async () => {
      const promise = adapter.createPayIn(mockRequest);
      jest.runAllTimers();
      const result = await promise;

      expect(result.status).toBe(PayInStatus.CREATED);
    });

    test('creates PayIn with optional description', async () => {
      const requestWithDescription = {
        ...mockRequest,
        description: 'Custom description',
      };
      const promise = adapter.createPayIn(requestWithDescription);
      jest.runAllTimers();
      const result = await promise;

      expect(result.description).toBe('Custom description');
    });

    test('creates PayIn without description when not provided', async () => {
      const requestWithoutDescription = {
        customer_id: 'cust-created',
        amount: 500,
        currency: 'USD',
        payment_method: 'credit_card',
      };
      const promise = adapter.createPayIn(requestWithoutDescription);
      jest.runAllTimers();
      const result = await promise;

      expect(result.description).toBeUndefined();
    });

    test('creates PayIn with different amounts', async () => {
      const amounts = [100, 500, 1000, 5000];

      for (const amount of amounts) {
        const promise = adapter.createPayIn({ ...mockRequest, amount });
        jest.runAllTimers();
        const result = await promise;

        expect(result.amount).toBe(amount);
      }
    });

    test('creates PayIn with different currencies', async () => {
      const currencies = ['USD', 'EUR', 'GBP', 'JPY'];

      for (const currency of currencies) {
        const promise = adapter.createPayIn({ ...mockRequest, currency });
        jest.runAllTimers();
        const result = await promise;

        expect(result.currency).toBe(currency);
      }
    });

    test('creates PayIn with different payment methods', async () => {
      const methods = ['credit_card', 'bank_transfer', 'paypal', 'wallet'];

      for (const method of methods) {
        const promise = adapter.createPayIn({
          ...mockRequest,
          payment_method: method,
        });
        jest.runAllTimers();
        const result = await promise;

        expect(result.payment_method).toBe(method);
      }
    });

    test('includes created_at and updated_at timestamps', async () => {
      const promise = adapter.createPayIn(mockRequest);
      jest.runAllTimers();
      const result = await promise;

      expect(result.created_at).toBeDefined();
      expect(result.updated_at).toBeDefined();
      expect(typeof result.created_at).toBe('string');
      expect(typeof result.updated_at).toBe('string');
    });

    test('returns PayIn with all required fields', async () => {
      const promise = adapter.createPayIn(mockRequest);
      jest.runAllTimers();
      const result = await promise;

      expect(result.id).toBeDefined();
      expect(result.customer_id).toBeDefined();
      expect(result.amount).toBeDefined();
      expect(result.currency).toBeDefined();
      expect(result.payment_method).toBeDefined();
      expect(result.status).toBeDefined();
      expect(result.created_at).toBeDefined();
      expect(result.updated_at).toBeDefined();
    });
  });

  describe('getPayInById', () => {
    test('successfully retrieves an existing PayIn by id', async () => {
      const promise = adapter.getPayInById('payin-001');
      jest.runAllTimers();
      const result = await promise;

      expect(result).toBeDefined();
      expect(result.id).toBe('payin-001');
      expect(result.customer_id).toBe('cust-123');
      expect(result.amount).toBe(1000);
    });

    test('simulates 300ms network delay', async () => {
      const start = jest.now();
      const promise = adapter.getPayInById('payin-001');
      jest.runAllTimers();
      await promise;
      const elapsed = jest.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(300);
    });

    test('throws error when PayIn not found', async () => {
      const promise = adapter.getPayInById('payin-999');
      jest.runAllTimers();

      await expect(promise).rejects.toThrow('PayIn with id payin-999 not found');
    });

    test('retrieves PayIn with PROCESSED status', async () => {
      const promise = adapter.getPayInById('payin-001');
      jest.runAllTimers();
      const result = await promise;

      expect(result.status).toBe(PayInStatus.PROCESSED);
    });

    test('retrieves PayIn with VALIDATED status', async () => {
      const promise = adapter.getPayInById('payin-002');
      jest.runAllTimers();
      const result = await promise;

      expect(result.status).toBe(PayInStatus.VALIDATED);
    });

    test('retrieves PayIn with FAILED status and error message', async () => {
      const promise = adapter.getPayInById('payin-003');
      jest.runAllTimers();
      const result = await promise;

      expect(result.status).toBe(PayInStatus.FAILED);
      expect(result.error_message).toBe('Insufficient funds');
    });

    test('retrieves all mock PayIns', async () => {
      const mockIds = ['payin-001', 'payin-002', 'payin-003'];

      for (const id of mockIds) {
        const promise = adapter.getPayInById(id);
        jest.runAllTimers();
        const result = await promise;

        expect(result.id).toBe(id);
      }
    });

    test('returns PayIn with all fields populated', async () => {
      const promise = adapter.getPayInById('payin-001');
      jest.runAllTimers();
      const result = await promise;

      expect(result.id).toBeDefined();
      expect(result.customer_id).toBeDefined();
      expect(result.amount).toBeDefined();
      expect(result.currency).toBeDefined();
      expect(result.payment_method).toBeDefined();
      expect(result.status).toBeDefined();
      expect(result.created_at).toBeDefined();
      expect(result.updated_at).toBeDefined();
    });

    test('throws error with descriptive message for invalid id', async () => {
      const promise = adapter.getPayInById('invalid-id');
      jest.runAllTimers();

      await expect(promise).rejects.toThrow(/not found/);
    });
  });

  describe('listPayIns', () => {
    test('successfully lists PayIns for a customer', async () => {
      const promise = adapter.listPayIns('cust-123');
      jest.runAllTimers();
      const result = await promise;

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      result.forEach((payin) => {
        expect(payin.customer_id).toBe('cust-123');
      });
    });

    test('simulates 400ms network delay', async () => {
      const start = jest.now();
      const promise = adapter.listPayIns('cust-123');
      jest.runAllTimers();
      await promise;
      const elapsed = jest.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(400);
    });

    test('returns empty array for customer with no PayIns', async () => {
      const promise = adapter.listPayIns('cust-999');
      jest.runAllTimers();
      const result = await promise;

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    test('returns all PayIns for customer cust-123', async () => {
      const promise = adapter.listPayIns('cust-123');
      jest.runAllTimers();
      const result = await promise;

      expect(result).toHaveLength(3);
      expect(result.map((p) => p.id)).toContain('payin-001');
      expect(result.map((p) => p.id)).toContain('payin-002');
      expect(result.map((p) => p.id)).toContain('payin-003');
    });

    test('returns PayIns with different statuses', async () => {
      const promise = adapter.listPayIns('cust-123');
      jest.runAllTimers();
      const result = await promise;

      const statuses = result.map((p) => p.status);
      expect(statuses).toContain(PayInStatus.PROCESSED);
      expect(statuses).toContain(PayInStatus.VALIDATED);
      expect(statuses).toContain(PayInStatus.FAILED);
    });

    test('returns PayIns with different payment methods', async () => {
      const promise = adapter.listPayIns('cust-123');
      jest.runAllTimers();
      const result = await promise;

      const methods = result.map((p) => p.payment_method);
      expect(methods).toContain('credit_card');
      expect(methods).toContain('paypal');
      expect(methods).toContain('bank_transfer');
    });

    test('returns PayIns with error messages for failed ones', async () => {
      const promise = adapter.listPayIns('cust-123');
      jest.runAllTimers();
      const result = await promise;

      const failedPayIn = result.find((p) => p.status === PayInStatus.FAILED);
      expect(failedPayIn?.error_message).toBe('Insufficient funds');
    });

    test('filters PayIns by customer_id correctly', async () => {
      const customerIds = ['cust-123', 'cust-999'];

      for (const customerId of customerIds) {
        const promise = adapter.listPayIns(customerId);
        jest.runAllTimers();
        const result = await promise;

        result.forEach((payin) => {
          expect(payin.customer_id).toBe(customerId);
        });
      }
    });

    test('returns PayIns with all fields populated', async () => {
      const promise = adapter.listPayIns('cust-123');
      jest.runAllTimers();
      const result = await promise;

      result.forEach((payin) => {
        expect(payin.id).toBeDefined();
        expect(payin.customer_id).toBeDefined();
        expect(payin.amount).toBeDefined();
        expect(payin.currency).toBeDefined();
        expect(payin.payment_method).toBeDefined();
        expect(payin.status).toBeDefined();
        expect(payin.created_at).toBeDefined();
        expect(payin.updated_at).toBeDefined();
      });
    });

    test('logs API request with customer_id', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const promise = adapter.listPayIns('cust-123');
      jest.runAllTimers();
      await promise;

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('customer_id=cust-123')
      );
      consoleSpy.mockRestore();
    });

    test('handles multiple list requests sequentially', async () => {
      const promise1 = adapter.listPayIns('cust-123');
      jest.runAllTimers();
      const result1 = await promise1;

      const promise2 = adapter.listPayIns('cust-999');
      jest.runAllTimers();
      const result2 = await promise2;

      expect(result1).toHaveLength(3);
      expect(result2).toHaveLength(0);
    });
  });

  describe('PayIn persistence in mock data', () => {
    test('preserves created PayIns in subsequent requests', async () => {
      const newRequest: CreatePayInRequest = {
        customer_id: 'cust-new',
        amount: 750,
        currency: 'EUR',
        payment_method: 'paypal',
        description: 'New payment',
      };

      const createPromise = adapter.createPayIn(newRequest);
      jest.runAllTimers();
      const created = await createPromise;

      const listPromise = adapter.listPayIns('cust-new');
      jest.runAllTimers();
      const listed = await listPromise;

      expect(listed).toContainEqual(
        expect.objectContaining({
          id: created.id,
          customer_id: 'cust-new',
        })
      );
    });

    test('retrieves newly created PayIn by id', async () => {
      const newRequest: CreatePayInRequest = {
        customer_id: 'cust-new2',
        amount: 900,
        currency: 'GBP',
        payment_method: 'credit_card',
      };

      const createPromise = adapter.createPayIn(newRequest);
      jest.runAllTimers();
      const created = await createPromise;

      const getPromise = adapter.getPayInById(created.id);
      jest.runAllTimers();
      const retrieved = await getPromise;

      expect(retrieved).toEqual(created);
    });

    test('persists multiple created PayIns', async () => {
      const request1: CreatePayInRequest = {
        customer_id: 'cust-multi1',
        amount: 100,
        currency: 'USD',
        payment_method: 'credit_card',
      };

      const request2: CreatePayInRequest = {
        customer_id: 'cust-multi1',
        amount: 200,
        currency: 'USD',
        payment_method: 'paypal',
      };

      const create1 = adapter.createPayIn(request1);
      jest.runAllTimers();
      await create1;

      const create2 = adapter.createPayIn(request2);
      jest.runAllTimers();
      await create2;

      const listPromise = adapter.listPayIns('cust-multi1');
      jest.runAllTimers();
      const result = await listPromise;

      expect(result.length).toBeGreaterThanOrEqual(2);
    });
  });
});
