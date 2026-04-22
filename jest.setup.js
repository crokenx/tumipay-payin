// Jest setup file
// Add any global test setup here

// Mock axios if needed
jest.mock('axios');

// Setup for React Native Testing Library
import '@testing-library/react-native/extend-expect';

// Mock console methods to avoid cluttering test output
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};

// Mock environment variables
process.env.REACT_APP_USE_MOCK_API = 'true';
process.env.REACT_APP_API_URL = 'https://api.tumipay.com/v1';
