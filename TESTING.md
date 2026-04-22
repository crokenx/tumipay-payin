# Testing Strategy

This document outlines the testing approach for the TumiPay PayIn application.

## Testing Pyramid

```
           ▲
          /\
         /  \ E2E Tests (10-15%)
        /____\
       /  \   /\ Component Tests (30-35%)
      /    \ /  \
     /______/____\
    /      \  /  / Unit Tests (50-60%)
   /        \/  /
  /________/__ /
```

## Test Types

### 1. Unit Tests

**Scope**: Individual functions, utilities, and business logic

**Tools**: Jest

**Coverage Target**: 70%+

#### Domain Layer Tests
```typescript
// createPayIn.ts
describe('CreatePayInUseCase', () => {
  it('should validate required fields', async () => {
    const useCase = new CreatePayInUseCase(mockRepository);
    const request = { customer_id: '', amount: 0, currency: '', payment_method: '' };
    
    await expect(useCase.execute(request)).rejects.toThrow();
  });

  it('should call repository.createPayIn with valid request', async () => {
    const useCase = new CreatePayInUseCase(mockRepository);
    const request = { customer_id: 'cust-123', amount: 100, currency: 'USD', payment_method: 'cc' };
    
    await useCase.execute(request);
    
    expect(mockRepository.createPayIn).toHaveBeenCalledWith(request);
  });
});
```

#### Utility Tests
```typescript
// errorHandler.test.ts
describe('handleError', () => {
  it('should handle ApiError correctly', () => {
    const error = new ApiError('API failed', 500);
    const result = handleError(error);
    
    expect(result.title).toBe('Oops!');
    expect(result.message).toContain('Something went wrong');
  });

  it('should handle network errors', () => {
    const error = new Error('Network error');
    const result = handleError(error);
    
    expect(result.title).toBe('Connection Error');
  });
});
```

### 2. Component Tests

**Scope**: React component functionality and UI interactions

**Tools**: React Testing Library, React Native Testing Library

**Coverage Target**: 60%+

#### Screen Component Tests
```typescript
// CreatePayInScreen.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { CreatePayInScreen } from './CreatePayInScreen';

describe('CreatePayInScreen', () => {
  it('should render form fields', () => {
    render(<CreatePayInScreen />);
    
    expect(screen.getByPlaceholderText('Enter customer ID')).toBeTruthy();
    expect(screen.getByPlaceholderText('0.00')).toBeTruthy();
    expect(screen.getByText('Create Payment')).toBeTruthy();
  });

  it('should show validation errors for empty fields', async () => {
    render(<CreatePayInScreen />);
    
    fireEvent.press(screen.getByText('Create Payment'));
    
    await waitFor(() => {
      expect(screen.getByText('customer_id is required')).toBeTruthy();
      expect(screen.getByText('amount must be greater than 0')).toBeTruthy();
    });
  });

  it('should call createPayIn when form is valid', async () => {
    const mockCreatePayIn = jest.fn().mockResolvedValue({});
    
    render(<CreatePayInScreen />);
    
    fireEvent.changeText(screen.getByPlaceholderText('Enter customer ID'), 'cust-123');
    fireEvent.changeText(screen.getByPlaceholderText('0.00'), '100');
    fireEvent.press(screen.getByText('Create Payment'));
    
    await waitFor(() => {
      expect(mockCreatePayIn).toHaveBeenCalled();
    });
  });
});
```

#### Component Tests
```typescript
// PayInCard.test.tsx
describe('PayInCard', () => {
  it('should render PayIn information', () => {
    const payIn = {
      id: 'payin-001',
      customer_id: 'cust-123',
      amount: 1000,
      currency: 'USD',
      status: PayInStatus.PROCESSED,
      payment_method: 'credit_card',
      created_at: '2026-04-20T10:00:00Z',
      updated_at: '2026-04-20T10:05:00Z',
    };
    
    render(<PayInCard payIn={payIn} />);
    
    expect(screen.getByText('payin-001')).toBeTruthy();
    expect(screen.getByText('$1,000.00')).toBeTruthy();
    expect(screen.getByText('PROCESSED')).toBeTruthy();
  });

  it('should call onPress when tapped', () => {
    const mockOnPress = jest.fn();
    const payIn = { /* ... */ };
    
    render(<PayInCard payIn={payIn} onPress={mockOnPress} />);
    
    fireEvent.press(screen.getByTestId('payInCard'));
    
    expect(mockOnPress).toHaveBeenCalled();
  });
});
```

### 3. Integration Tests

**Scope**: Component + Store interactions, API calls

**Tools**: Jest + mocked API

**Coverage Target**: 40-50%

#### Store + API Integration Tests
```typescript
// usePayInStore.test.ts
describe('usePayInStore', () => {
  it('should create PayIn and update state', async () => {
    const mockRepository = new PayInMockAdapter();
    const store = usePayInStore();
    
    const request = {
      customer_id: 'cust-123',
      amount: 100,
      currency: 'USD',
      payment_method: 'cc',
    };
    
    await store.createPayIn(request);
    
    expect(store.getState().payins.length).toBeGreaterThan(0);
    expect(store.getState().currentPayIn).toBeTruthy();
    expect(store.getState().loading).toBe(false);
  });

  it('should handle errors in createPayIn', async () => {
    const mockRepository = {
      createPayIn: jest.fn().mockRejectedValue(new Error('API Error')),
    };
    
    const store = usePayInStore();
    
    try {
      await store.createPayIn(validRequest);
    } catch {
      expect(store.getState().error).toBeTruthy();
    }
  });
});
```

### 4. End-to-End Tests (E2E)

**Scope**: Full user flows across multiple screens

**Tools**: Detox (for React Native)

**Coverage Target**: Key user journeys (5-10% of codebase)

#### Example E2E Test
```typescript
// e2e/createAndViewPayIn.e2e.ts
describe('Create and View PayIn', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should create a PayIn and view its details', async () => {
    // Navigate to create screen
    await element(by.text('Create')).tap();

    // Fill form
    await element(by.placeholder('Enter customer ID')).typeText('cust-123');
    await element(by.placeholder('0.00')).typeText('1000');
    await element(by.placeholder('e.g., credit_card')).typeText('credit_card');
    await element(by.text('Create Payment')).tap();

    // Wait for success
    await waitFor(element(by.text('PayIn created successfully!')))
      .toExist()
      .withTimeout(5000);

    await element(by.text('OK')).tap();

    // Navigate to transactions
    await element(by.text('Transactions')).tap();

    // View newly created transaction
    await waitFor(element(by.text('cust-123')))
      .toExist()
      .withTimeout(5000);

    await element(by.text('cust-123')).atIndex(0).tap();

    // Verify details
    await expect(element(by.text('$1,000.00'))).toBeVisible();
  });
});
```

## Mock Strategies

### 1. Mock API Adapter
```typescript
// Use PayInMockAdapter for testing
const mockRepository = new PayInMockAdapter();

// Simulates network delays and real-world data
await mockRepository.createPayIn(request); // Returns fake PayIn
```

### 2. Mock Store (Zustand)
```typescript
// For component testing, mock the store
jest.mock('../store/usePayInStore', () => ({
  usePayInStore: jest.fn(() => ({
    payins: [mockPayIn],
    currentPayIn: mockPayIn,
    loading: false,
    error: null,
    createPayIn: jest.fn(),
    getPayInById: jest.fn(),
    listPayIns: jest.fn(),
  })),
}));
```

### 3. Mock HTTP Client
```typescript
// For API adapter testing
jest.mock('../http/httpClient', () => ({
  httpClient: {
    post: jest.fn().mockResolvedValue({ data: mockResponse }),
    get: jest.fn().mockResolvedValue({ data: mockResponse }),
  },
}));
```

## Test File Organization

```
src/
├── features/payin/
│   ├── domain/
│   │   ├── entities/
│   │   │   └── PayIn.ts
│   │   │   └── PayIn.test.ts
│   │   └── repositories/
│   │       └── IPayInRepository.ts
│   ├── application/useCases/
│   │   ├── createPayIn.ts
│   │   └── createPayIn.test.ts
│   ├── infrastructure/
│   │   ├── api/
│   │   │   ├── payInApiAdapter.ts
│   │   │   └── payInApiAdapter.test.ts
│   │   └── http/
│   │       ├── httpClient.ts
│   │       └── httpClient.test.ts
│   └── presentation/
│       ├── screens/
│       │   ├── CreatePayInScreen.tsx
│       │   └── CreatePayInScreen.test.tsx
│       └── components/
│           ├── PayInCard.tsx
│           └── PayInCard.test.tsx
└── shared/
    ├── utils/
    │   ├── errorHandler.ts
    │   └── errorHandler.test.ts
    └── components/
        ├── ErrorMessage.tsx
        └── ErrorMessage.test.tsx
```

## Coverage Requirements

```
Target: 70% global coverage

Domain Layer:      90% (business logic is critical)
Application Layer: 85% (use cases are core)
Infrastructure:    70% (depends on external services)
Presentation:      60% (UI components harder to test)
Shared Utils:      85% (utilities should be well-tested)
```

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- PayInCard.test.tsx

# Watch mode
npm test -- --watch

# Update snapshots
npm test -- --updateSnapshot
```

## Continuous Integration

Tests are automatically run on:
- Pull requests
- Pushes to main/develop
- Scheduled (nightly builds)

See `.github/workflows/ci-cd.yml` for details.

## Key Testing Principles

1. **Isolation**: Each test should be independent
2. **Clarity**: Test names clearly describe what's being tested
3. **Coverage**: Aim for high coverage but focus on critical paths
4. **Maintainability**: Tests should be as easy to maintain as production code
5. **Performance**: Tests should run fast (< 30 seconds total)
6. **Determinism**: Tests should not be flaky or timing-dependent

## Resources

- [Jest Documentation](https://jestjs.io)
- [React Testing Library](https://testing-library.com/react)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Detox (E2E for RN)](https://detox.e2e.dev)

---

**Last Updated**: April 2026
