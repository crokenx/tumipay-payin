import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';

export class HttpClient {
  private instance: AxiosInstance;

  constructor(baseURL: string = 'https://api.tumipay.com/v1') {
    this.instance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Handle common errors
        console.error('HTTP Error:', error.response?.status, error.message);
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    // TODO: Implement auth token retrieval from secure storage
    return null;
  }

  async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.get<T>(url, config);
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data, config);
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(url, data, config);
  }

  async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url, config);
  }

  setAuthToken(token: string): void {
    this.instance.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  clearAuthToken(): void {
    delete this.instance.defaults.headers.common.Authorization;
  }
}

// Singleton instance
export const httpClient = new HttpClient();
