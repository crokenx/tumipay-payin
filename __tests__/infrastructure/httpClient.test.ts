import type axios from 'axios';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
  },
}));

type MockAxiosInstance = {
  defaults: {
    headers: {
      common: Record<string, string>;
    };
  };
  interceptors: {
    request: {
      use: jest.Mock;
    };
    response: {
      use: jest.Mock;
    };
  };
  get: jest.Mock;
  post: jest.Mock;
  put: jest.Mock;
  delete: jest.Mock;
};

const createMockAxiosInstance = (): MockAxiosInstance => ({
  defaults: {
    headers: {
      common: {},
    },
  },
  interceptors: {
    request: {
      use: jest.fn(),
    },
    response: {
      use: jest.fn(),
    },
  },
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
});

const loadHttpClient = (mockInstance: MockAxiosInstance) => {
  jest.resetModules();
  const axiosMock = require('axios').default as jest.Mocked<typeof axios>;
  axiosMock.create.mockReturnValue(mockInstance as any);
  const httpClientModule = require('../../src/features/payin/infrastructure/http/httpClient');

  return {
    ...httpClientModule,
    axiosMock,
  };
};

describe('HttpClient', () => {
  let mockInstance: MockAxiosInstance;

  beforeEach(() => {
    mockInstance = createMockAxiosInstance();
    jest.clearAllMocks();
  });

  test('creates axios instance with default API configuration', () => {
    const { axiosMock } = loadHttpClient(mockInstance);

    expect(axiosMock.create).toHaveBeenCalledWith({
      baseURL: 'https://api.tumipay.com/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  test('creates axios instance with custom base URL', () => {
    const { HttpClient, axiosMock } = loadHttpClient(mockInstance);

    new HttpClient('https://api.example.com');

    expect(axiosMock.create).toHaveBeenLastCalledWith({
      baseURL: 'https://api.example.com',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  test('registers request and response interceptors', () => {
    loadHttpClient(mockInstance);

    expect(mockInstance.interceptors.request.use).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function)
    );
    expect(mockInstance.interceptors.response.use).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function)
    );
  });

  test('request interceptor returns config unchanged when there is no auth token', () => {
    loadHttpClient(mockInstance);
    const [onRequest] = mockInstance.interceptors.request.use.mock.calls[0];
    const config = { headers: {} };

    expect(onRequest(config)).toBe(config);
    expect(config.headers).toEqual({});
  });

  test('request interceptor adds bearer token when one is available', () => {
    const { HttpClient } = loadHttpClient(mockInstance);
    const client = new HttpClient('https://api.example.com');
    (client as any).getAuthToken = jest.fn(() => 'secure-token');

    const [onRequest] = mockInstance.interceptors.request.use.mock.calls[1];
    const config = { headers: {} };

    expect(onRequest(config)).toBe(config);
    expect(config.headers).toEqual({
      Authorization: 'Bearer secure-token',
    });
  });

  test('request interceptor rejects request errors', async () => {
    loadHttpClient(mockInstance);
    const [, onRequestError] = mockInstance.interceptors.request.use.mock.calls[0];
    const error = new Error('Request failed');

    await expect(onRequestError(error)).rejects.toBe(error);
  });

  test('response interceptor returns successful responses unchanged', () => {
    loadHttpClient(mockInstance);
    const [onResponse] = mockInstance.interceptors.response.use.mock.calls[0];
    const response = { data: { ok: true } };

    expect(onResponse(response)).toBe(response);
  });

  test('response interceptor logs and rejects response errors', async () => {
    loadHttpClient(mockInstance);
    const [, onResponseError] = mockInstance.interceptors.response.use.mock.calls[0];
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const error = {
      response: { status: 503 },
      message: 'Service unavailable',
    };

    await expect(onResponseError(error)).rejects.toBe(error);
    expect(consoleSpy).toHaveBeenCalledWith(
      'HTTP Error:',
      503,
      'Service unavailable'
    );

    consoleSpy.mockRestore();
  });

  test('delegates GET requests to axios instance', async () => {
    const { HttpClient } = loadHttpClient(mockInstance);
    const client = new HttpClient();
    const response = { data: { id: 'payin-001' } };
    const config = { params: { customer_id: 'cust-123' } };
    mockInstance.get.mockResolvedValue(response);

    await expect(client.get('/payins', config)).resolves.toBe(response);
    expect(mockInstance.get).toHaveBeenCalledWith('/payins', config);
  });

  test('delegates POST requests to axios instance', async () => {
    const { HttpClient } = loadHttpClient(mockInstance);
    const client = new HttpClient();
    const payload = { amount: 500 };
    const config = { headers: { 'Idempotency-Key': 'abc' } };
    const response = { data: { id: 'payin-001' } };
    mockInstance.post.mockResolvedValue(response);

    await expect(client.post('/payins', payload, config)).resolves.toBe(
      response
    );
    expect(mockInstance.post).toHaveBeenCalledWith('/payins', payload, config);
  });

  test('delegates PUT requests to axios instance', async () => {
    const { HttpClient } = loadHttpClient(mockInstance);
    const client = new HttpClient();
    const payload = { status: 'VALIDATED' };
    const config = { timeout: 2000 };
    const response = { data: { ok: true } };
    mockInstance.put.mockResolvedValue(response);

    await expect(client.put('/payins/payin-001', payload, config)).resolves.toBe(
      response
    );
    expect(mockInstance.put).toHaveBeenCalledWith(
      '/payins/payin-001',
      payload,
      config
    );
  });

  test('delegates DELETE requests to axios instance', async () => {
    const { HttpClient } = loadHttpClient(mockInstance);
    const client = new HttpClient();
    const config = { headers: { Authorization: 'Bearer token' } };
    const response = { data: undefined };
    mockInstance.delete.mockResolvedValue(response);

    await expect(client.delete('/payins/payin-001', config)).resolves.toBe(
      response
    );
    expect(mockInstance.delete).toHaveBeenCalledWith(
      '/payins/payin-001',
      config
    );
  });

  test('sets and clears authorization header', () => {
    const { HttpClient } = loadHttpClient(mockInstance);
    const client = new HttpClient();

    client.setAuthToken('new-token');
    expect(mockInstance.defaults.headers.common.Authorization).toBe(
      'Bearer new-token'
    );

    client.clearAuthToken();
    expect(mockInstance.defaults.headers.common.Authorization).toBeUndefined();
  });

  test('exports a singleton httpClient instance', () => {
    const { HttpClient, httpClient } = loadHttpClient(mockInstance);

    expect(httpClient).toBeInstanceOf(HttpClient);
  });
});
