declare const process:
  | {
      env?: Record<string, string | undefined>;
    }
  | undefined;

const getEnvValue = (key: string): string | undefined => {
  if (typeof process === 'undefined') {
    return undefined;
  }

  return process.env?.[key];
};

export const ENV = {
  API_BASE_URL:
    getEnvValue('EXPO_PUBLIC_API_BASE_URL') ?? 'https://api.tumipay.com/v1',
  USE_MOCK_API: getEnvValue('EXPO_PUBLIC_USE_MOCK_API') !== 'false',
} as const;
