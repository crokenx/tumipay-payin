import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'tumipay.accessToken';
const REFRESH_TOKEN_KEY = 'tumipay.refreshToken';

export const authTokenStorage = {
  getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  },

  setAccessToken(token: string): Promise<void> {
    return SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  },

  getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  setRefreshToken(token: string): Promise<void> {
    return SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  },

  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};
