import * as SecureStore from 'expo-secure-store';
import { authTokenStorage } from '../../src/shared/storage/authTokenStorage';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const mockedSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe('authTokenStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('gets the access token from secure storage', async () => {
    mockedSecureStore.getItemAsync.mockResolvedValue('access-token');

    await expect(authTokenStorage.getAccessToken()).resolves.toBe(
      'access-token'
    );
    expect(mockedSecureStore.getItemAsync).toHaveBeenCalledWith(
      'tumipay.accessToken'
    );
  });

  test('sets the access token in secure storage', async () => {
    mockedSecureStore.setItemAsync.mockResolvedValue();

    await authTokenStorage.setAccessToken('access-token');

    expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(
      'tumipay.accessToken',
      'access-token'
    );
  });

  test('gets the refresh token from secure storage', async () => {
    mockedSecureStore.getItemAsync.mockResolvedValue('refresh-token');

    await expect(authTokenStorage.getRefreshToken()).resolves.toBe(
      'refresh-token'
    );
    expect(mockedSecureStore.getItemAsync).toHaveBeenCalledWith(
      'tumipay.refreshToken'
    );
  });

  test('sets the refresh token in secure storage', async () => {
    mockedSecureStore.setItemAsync.mockResolvedValue();

    await authTokenStorage.setRefreshToken('refresh-token');

    expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(
      'tumipay.refreshToken',
      'refresh-token'
    );
  });

  test('clears both tokens from secure storage', async () => {
    mockedSecureStore.deleteItemAsync.mockResolvedValue();

    await authTokenStorage.clear();

    expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith(
      'tumipay.accessToken'
    );
    expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith(
      'tumipay.refreshToken'
    );
  });
});
