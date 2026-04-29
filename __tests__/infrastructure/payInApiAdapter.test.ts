import { PayInApiAdapter } from '../../src/features/payin/infrastructure/api/payInApiAdapter';
import { httpClient } from '../../src/features/payin/infrastructure/http/httpClient';
import {
  PayIn,
  PayInStatus,
  CreatePayInRequest,
} from '../../src/features/payin/domain/entities/PayIn';
import { ApiError } from '../../src/shared';

jest.mock('../../src/features/payin/infrastructure/http/httpClient');
const mockedHttpClient = httpClient as jest.Mocked<typeof httpClient>;

const createAxiosError = (
  status: number | undefined,
  data?: { message?: string; [key: string]: unknown }
) => {
  const error = new Error(data?.message || 'API Error') as Error & {
    response: {
      status?: number;
      data?: { message?: string; [key: string]: unknown };
    };
  };
  error.response = { status, data };
  return error;
};

describe('PayInApiAdapter', () => {
  let adapter: PayInApiAdapter;

  beforeEach(() => {
    adapter = new PayInApiAdapter();
    jest.clearAllMocks();
  });

  describe('createPayIn', () => {
    const mockRequest: CreatePayInRequest = {
      customer_id: 'cust-123',
      amount: 500,
      currency: 'USD',
      payment_method: 'credit_card',
      description: 'Test payment',
    };

    const mockResponse = {
      data: {
        id: 'payin-001',
        customer_id: 'cust-123',
        amount: 500,
        currency: 'USD',
        payment_method: 'credit_card',
        description: 'Test payment',
        status: PayInStatus.CREATED,
        created_at: '2026-04-29T10:00:00Z',
        updated_at: '2026-04-29T10:00:00Z',
      },
    };

    test('successfully creates a PayIn via API', async () => {
      mockedHttpClient.post.mockResolvedValue(mockResponse);

      const result = await adapter.createPayIn(mockRequest);

      expect(result).toEqual(mockResponse.data);
      expect(mockedHttpClient.post).toHaveBeenCalledWith('/payins', mockRequest);
      expect(mockedHttpClient.post).toHaveBeenCalledTimes(1);
    });

    test('uses correct API endpoint for createPayIn', async () => {
      mockedHttpClient.post.mockResolvedValue(mockResponse);

      await adapter.createPayIn(mockRequest);

      expect(mockedHttpClient.post).toHaveBeenCalledWith(
        '/payins',
        expect.any(Object)
      );
    });

    test('creates PayIn with different amounts', async () => {
      const amounts = [100, 500, 1000, 5000];

      for (const amount of amounts) {
        const response = { ...mockResponse, data: { ...mockResponse.data, amount } };
        mockedHttpClient.post.mockResolvedValue(response);

        const result = await adapter.createPayIn({ ...mockRequest, amount });

        expect(result.amount).toBe(amount);
      }
    });

    test('creates PayIn with different currencies', async () => {
      const currencies = ['USD', 'EUR', 'GBP', 'JPY'];

      for (const currency of currencies) {
        const response = { ...mockResponse, data: { ...mockResponse.data, currency } };
        mockedHttpClient.post.mockResolvedValue(response);

        const result = await adapter.createPayIn({ ...mockRequest, currency });

        expect(result.currency).toBe(currency);
      }
    });

    test('creates PayIn with different payment methods', async () => {
      const methods = ['credit_card', 'bank_transfer', 'paypal', 'wallet'];

      for (const method of methods) {
        const response = { ...mockResponse, data: { ...mockResponse.data, payment_method: method } };
        mockedHttpClient.post.mockResolvedValue(response);

        const result = await adapter.createPayIn({ ...mockRequest, payment_method: method });

        expect(result.payment_method).toBe(method);
      }
    });

    test('includes optional description in request', async () => {
      mockedHttpClient.post.mockResolvedValue(mockResponse);

      const requestWithDescription = { ...mockRequest, description: 'Custom description' };
      await adapter.createPayIn(requestWithDescription);

      expect(mockedHttpClient.post).toHaveBeenCalledWith('/payins', requestWithDescription);
    });

    test('throws ApiError when POST fails', async () => {
      const axiosError = createAxiosError(400, { message: 'Invalid request' });
      mockedHttpClient.post.mockRejectedValue(axiosError);

      await expect(adapter.createPayIn(mockRequest)).rejects.toThrow(
        ApiError
      );
    });

    test('throws ApiError with status code on failure', async () => {
      const axiosError = createAxiosError(500, { message: 'Server error' });
      mockedHttpClient.post.mockRejectedValue(axiosError);

      try {
        await adapter.createPayIn(mockRequest);
      } catch (error) {
        expect((error as ApiError).statusCode).toBe(500);
      }
    });

    test('returns CREATED status for new PayIn', async () => {
      mockedHttpClient.post.mockResolvedValue(mockResponse);

      const result = await adapter.createPayIn(mockRequest);

      expect(result.status).toBe(PayInStatus.CREATED);
    });
  });

  describe('getPayInById', () => {
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

    const mockResponse = { data: mockPayIn };

    test('successfully retrieves a PayIn by id', async () => {
      mockedHttpClient.get.mockResolvedValue(mockResponse);

      const result = await adapter.getPayInById('payin-001');

      expect(result).toEqual(mockPayIn);
      expect(mockedHttpClient.get).toHaveBeenCalledWith('/payins/payin-001');
      expect(mockedHttpClient.get).toHaveBeenCalledTimes(1);
    });

    test('uses correct API endpoint for getPayInById', async () => {
      mockedHttpClient.get.mockResolvedValue(mockResponse);

      await adapter.getPayInById('payin-001');

      expect(mockedHttpClient.get).toHaveBeenCalledWith('/payins/payin-001');
    });

    test('retrieves PayIn with different ids', async () => {
      const ids = ['payin-001', 'payin-123', 'transaction-abc'];

      for (const id of ids) {
        mockedHttpClient.get.mockResolvedValue(mockResponse);

        await adapter.getPayInById(id);

        expect(mockedHttpClient.get).toHaveBeenCalledWith(`/payins/${id}`);
      }
    });

    test('retrieves PayIn with different statuses', async () => {
      const statuses = [
        PayInStatus.CREATED,
        PayInStatus.VALIDATED,
        PayInStatus.PROCESSED,
        PayInStatus.FAILED,
      ];

      for (const status of statuses) {
        const response = { data: { ...mockPayIn, status } };
        mockedHttpClient.get.mockResolvedValue(response);

        const result = await adapter.getPayInById('payin-001');

        expect(result.status).toBe(status);
      }
    });

    test('retrieves PayIn with error message when FAILED', async () => {
      const failedPayIn = {
        ...mockPayIn,
        status: PayInStatus.FAILED,
        error_message: 'Card declined',
      };
      mockedHttpClient.get.mockResolvedValue({ data: failedPayIn });

      const result = await adapter.getPayInById('payin-001');

      expect(result.error_message).toBe('Card declined');
    });

    test('throws ApiError when GET fails with 404', async () => {
      const axiosError = createAxiosError(404, { message: 'PayIn not found' });
      mockedHttpClient.get.mockRejectedValue(axiosError);

      await expect(adapter.getPayInById('payin-999')).rejects.toThrow(
        ApiError
      );
    });

    test('throws ApiError with 500 status on server error', async () => {
      const axiosError = createAxiosError(500, {
        message: 'Internal server error',
      });
      mockedHttpClient.get.mockRejectedValue(axiosError);

      try {
        await adapter.getPayInById('payin-001');
      } catch (error) {
        expect((error as ApiError).statusCode).toBe(500);
      }
    });

    test('retrieves PayIn with all fields populated', async () => {
      mockedHttpClient.get.mockResolvedValue(mockResponse);

      const result = await adapter.getPayInById('payin-001');

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

  describe('listPayIns', () => {
    const mockPayIns: PayIn[] = [
      {
        id: 'payin-001',
        customer_id: 'cust-123',
        amount: 500,
        currency: 'USD',
        payment_method: 'credit_card',
        description: 'Payment 1',
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
        description: 'Payment 2',
        status: PayInStatus.CREATED,
        created_at: '2026-04-28T15:00:00Z',
        updated_at: '2026-04-28T15:00:00Z',
      },
    ];

    const mockResponse = { data: { data: mockPayIns } };

    test('successfully lists PayIns for a customer', async () => {
      mockedHttpClient.get.mockResolvedValue(mockResponse);

      const result = await adapter.listPayIns('cust-123');

      expect(result).toEqual(mockPayIns);
      expect(mockedHttpClient.get).toHaveBeenCalledWith(
        '/payins?customer_id=cust-123'
      );
    });

    test('uses correct API endpoint with customer_id query param', async () => {
      mockedHttpClient.get.mockResolvedValue(mockResponse);

      await adapter.listPayIns('cust-123');

      expect(mockedHttpClient.get).toHaveBeenCalledWith(
        '/payins?customer_id=cust-123'
      );
    });

    test('returns empty array when customer has no PayIns', async () => {
      mockedHttpClient.get.mockResolvedValue({ data: { data: [] } });

      const result = await adapter.listPayIns('cust-123');

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    test('lists PayIns for different customer ids', async () => {
      const customerIds = ['cust-123', 'cust-456', 'customer-abc'];

      for (const customerId of customerIds) {
        mockedHttpClient.get.mockResolvedValue(mockResponse);

        await adapter.listPayIns(customerId);

        expect(mockedHttpClient.get).toHaveBeenCalledWith(
          `/payins?customer_id=${customerId}`
        );
      }
    });

    test('returns PayIns with different statuses', async () => {
      const payInsWithStatuses = mockPayIns.map((p, i) => ({
        ...p,
        status: [
          PayInStatus.CREATED,
          PayInStatus.PROCESSED,
        ][i],
      }));
      mockedHttpClient.get.mockResolvedValue({
        data: { data: payInsWithStatuses },
      });

      const result = await adapter.listPayIns('cust-123');

      expect(result.map((p) => p.status)).toContain(PayInStatus.CREATED);
      expect(result.map((p) => p.status)).toContain(PayInStatus.PROCESSED);
    });

    test('returns PayIns with different currencies', async () => {
      const payInsWithCurrencies = mockPayIns.map((p, i) => ({
        ...p,
        currency: ['USD', 'EUR'][i],
      }));
      mockedHttpClient.get.mockResolvedValue({
        data: { data: payInsWithCurrencies },
      });

      const result = await adapter.listPayIns('cust-123');

      expect(result.map((p) => p.currency)).toContain('USD');
      expect(result.map((p) => p.currency)).toContain('EUR');
    });

    test('throws ApiError when GET fails', async () => {
      const axiosError = createAxiosError(500, { message: 'Server error' });
      mockedHttpClient.get.mockRejectedValue(axiosError);

      await expect(adapter.listPayIns('cust-123')).rejects.toThrow(
        ApiError
      );
    });

    test('handles large list of PayIns', async () => {
      const manyPayIns = Array.from({ length: 100 }, (_, i) => ({
        ...mockPayIns[0],
        id: `payin-${i}`,
      }));
      mockedHttpClient.get.mockResolvedValue({ data: { data: manyPayIns } });

      const result = await adapter.listPayIns('cust-123');

      expect(result).toHaveLength(100);
    });

    test('logs API request with customer_id', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      mockedHttpClient.get.mockResolvedValue(mockResponse);

      await adapter.listPayIns('cust-123');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('customer_id=cust-123')
      );
      consoleSpy.mockRestore();
    });
  });

  describe('error handling', () => {
    test('handles network errors without response object', async () => {
      const networkError = new Error('Network timeout');
      mockedHttpClient.post.mockRejectedValue(networkError);

      await expect(
        adapter.createPayIn({
          customer_id: 'cust-123',
          amount: 500,
          currency: 'USD',
          payment_method: 'credit_card',
        })
      ).rejects.toThrow(ApiError);
    });

    test('handles unknown error types', async () => {
      mockedHttpClient.post.mockRejectedValue('Unknown error string');

      await expect(
        adapter.createPayIn({
          customer_id: 'cust-123',
          amount: 500,
          currency: 'USD',
          payment_method: 'credit_card',
        })
      ).rejects.toThrow(ApiError);
    });

    test('uses default status 500 for errors without response', async () => {
      const error = new Error('Generic error');
      mockedHttpClient.post.mockRejectedValue(error);

      try {
        await adapter.createPayIn({
          customer_id: 'cust-123',
          amount: 500,
          currency: 'USD',
          payment_method: 'credit_card',
        });
      } catch (err) {
        expect((err as ApiError).statusCode).toBe(500);
      }
    });

    test('uses API Error as default message when response has no message', async () => {
      mockedHttpClient.get.mockRejectedValue(createAxiosError(502, {}));

      await expect(adapter.getPayInById('payin-001')).rejects.toMatchObject({
        message: 'API Error',
        statusCode: 502,
      });
    });

    test('keeps error details from failed API responses', async () => {
      const details = {
        message: 'Validation failed',
        errors: { amount: 'must be positive' },
      };
      mockedHttpClient.post.mockRejectedValue(createAxiosError(422, details));

      await expect(
        adapter.createPayIn({
          customer_id: 'cust-123',
          amount: -1,
          currency: 'USD',
          payment_method: 'credit_card',
        })
      ).rejects.toMatchObject({
        message: 'Validation failed',
        statusCode: 422,
        details,
      });
    });

    test('uses default status 500 when API response has no status', async () => {
      mockedHttpClient.get.mockRejectedValue(
        createAxiosError(undefined, { message: 'Gateway failed' })
      );

      await expect(adapter.getPayInById('payin-001')).rejects.toMatchObject({
        message: 'Gateway failed',
        statusCode: 500,
      });
    });
  });
});
