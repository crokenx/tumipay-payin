# TumiPay PayIn Mobile Application

A cross-platform mobile application for processing and visualizing PayIn transactions, built with React Native and TypeScript.

## Objective

This application demonstrates:
- Cross-platform mobile development (iOS/Android) with React Native
- Clean Architecture principles with clear separation of concerns
- State management with Zustand
- REST API consumption with proper error handling
- Mobile UX best practices (loading, errors, empty states)
- Product-focused mobile development

## Architecture Overview

The application follows **Clean Architecture** principles with clear separation between layers:

```
src/
├── features/payin/              # Feature module (Payins)
│   ├── domain/                  # Business logic & contracts
│   │   ├── entities/            # Data models (PayIn, enums)
│   │   └── repositories/        # Repository interfaces
│   ├── application/             # Use cases (business rules)
│   │   └── useCases/
│   ├── infrastructure/          # External services integration
│   │   ├── api/                 # API adapters (real & mock)
│   │   └── http/                # HTTP client configuration
│   └── presentation/            # UI layer
│       ├── screens/             # Full screens
│       ├── components/          # Reusable UI components
│       └── store/               # Zustand state management
├── shared/                      # Shared utilities & widgets
│   ├── components/              # App-wide components (LoadingOverlay, ErrorMessage, EmptyState)
│   └── utils/                   # Helper functions (error handling)
└── navigation/                  # Navigation setup & routing
```

## Key Design Decisions

### 1. **Clean Architecture**
- **Domain Layer**: Pure business logic, independent of frameworks
- **Application Layer**: Use cases orchestrating domain logic
- **Infrastructure Layer**: External service integrations (API, HTTP)
- **Presentation Layer**: UI components and state management

**Benefit**: Easy to test, maintain, and swap implementations (e.g., API ↔ Mock)

### 2. **Dependency Injection via Constructor**
```typescript
const repository = getRepository(); // Could be real API or mock
const useCase = new CreatePayInUseCase(repository);
```

**Benefit**: Loosely coupled, testable components

### 3. **Repository Pattern**
- Interface: `IPayInRepository` (contracts)
- Implementations:
  - `PayInApiAdapter` - Real API calls
  - `PayInMockAdapter` - Development/testing

**Benefit**: Easy to switch between implementations via environment variables

### 4. **State Management with Zustand**
- Centralized state in `usePayInStore`
- Handles: loading, error, data states
- Integrates directly with use cases

**Benefit**: Simple, performant state management with minimal boilerplate

### 5. **Component Composition**
- **Screens**: Full-page components managing state
- **Components**: Reusable UI pieces (PayInCard, PayInStatusBadge)
- **Shared Components**: App-wide widgets (LoadingOverlay, ErrorMessage, EmptyState)

**Benefit**: Code reusability and consistency

## Features

### 1. **Create PayIn Transaction**
- Form with validation (customer_id, amount, currency, payment_method)
- Real-time validation feedback
- Loading state during submission
- Error handling with user-friendly messages
- Success confirmation

### 2. **View Transaction Detail**
- Search by PayIn ID
- Complete transaction information
- Status visualization with badges
- Error message display for failed transactions
- Refresh capability

### 3. **Transaction List**
- View all transactions for a customer
- Filter by status (CREATED, VALIDATED, PROCESSED, FAILED)
- Pull-to-refresh
- Click to view details
- Transaction count display

### 4. **Error Handling**
- Network errors
- API errors with proper HTTP status codes
- Validation errors with field-level feedback
- User-friendly error messages
- Error recovery actions

### 5. **UX Features**
- Loading overlays during async operations
- Empty states when no data
- Status badges with color coding
- Responsive forms with proper spacing
- Keyboard avoiding (iOS)
- Pull-to-refresh functionality

## PayIn Entity & States

```typescript
enum PayInStatus {
  CREATED = 'CREATED',         // Initial state
  VALIDATED = 'VALIDATED',     // Validation successful
  PROCESSED = 'PROCESSED',     // Transaction completed
  FAILED = 'FAILED',           // Transaction failed
}
```

### PayIn Fields (snake_case for API)
```typescript
interface PayIn {
  id: string;                  // Unique identifier
  customer_id: string;         // Associated customer
  amount: number;              // Transaction amount
  currency: string;            // ISO 4217 currency code
  status: PayInStatus;         // Current status
  payment_method: string;      // Payment type (credit_card, paypal, etc.)
  description?: string;        // Optional description
  created_at: string;          // ISO 8601 timestamp
  updated_at: string;          // ISO 8601 timestamp
  error_message?: string;      // Error details if FAILED
}
```

## API Integration

### Expected Endpoints

```
POST /v1/payins
  Request: CreatePayInRequest
  Response: CreatePayInResponse

GET /v1/payins/{id}
  Response: PayIn

GET /v1/payins?customer_id={id}
  Response: { data: PayIn[] }
```

### Base URL
- Default: `https://api.tumipay.com/v1`
- Configurable via `HttpClient` constructor

### Error Handling
- HTTP errors mapped to `ApiError` with status codes
- Network timeouts (10s default)
- Auth token support (placeholder for secure storage)

## State Management

### usePayInStore Structure
```typescript
{
  // State
  payins: PayIn[];              // List of transactions
  currentPayIn: PayIn | null;   // Selected transaction
  loading: boolean;             // Async operation status
  error: string | null;         // Error message

  // Actions
  createPayIn(request)           // Create new transaction
  getPayInById(id)              // Fetch single transaction
  listPayIns(customerId)        // Fetch customer's transactions
  clearError()                  // Clear error message
  clearCurrentPayIn()           // Clear selected transaction
  reset()                       // Reset all state
}
```

## Development Setup

### Mock vs Real API
Switch between mock and real API via environment variable:

```bash
# Use mock adapter (default for development)
REACT_APP_USE_MOCK_API=true npx expo start

# Use real API
REACT_APP_USE_MOCK_API=false npx expo start
```

### Mock Data
The `PayInMockAdapter` includes sample transactions simulating network delays:
- **payin-001**: 1000 USD - PROCESSED 
- **payin-002**: 500 USD - VALIDATED 
- **payin-003**: 2500 USD - FAILED (with error message)

## Assumptions

1. **Authentication**: Simple bearer token (not implemented, placeholder in HttpClient)
2. **Backend**: REST API with standard request/response format
3. **Timestamps**: ISO 8601 format for all date/time fields
4. **Currency**: ISO 4217 standard (USD, EUR, etc.)
5. **User Context**: Single logged-in user with fixed customer ID (cust-123 for demo)
6. **Validation**: Client-side form validation before API submission

## Identified Risks & Mitigations

### Risks

1. **Network Connectivity**
   - Risk: API calls fail due to poor connection
   - Mitigation: Offline-first cache, retry logic, clear error messages

2. **Token Expiration**
   - Risk: Auth token expires during user session
   - Mitigation: Implement token refresh flow in HttpClient interceptors

3. **Race Conditions**
   - Risk: Multiple simultaneous API requests cause state inconsistencies
   - Mitigation: Loading state prevents concurrent submissions, Zustand prevents duplicate actions

4. **API Response Inconsistency**
   - Risk: Backend response format changes
   - Mitigation: Strong TypeScript types, API versioning (/v1)

5. **Large Transaction Lists**
   - Risk: Performance degradation with many items
   - Mitigation: Implement pagination in API, virtualized list rendering

### Current Mitigations Implemented

- Comprehensive error handling  
- Loading state management  
- Validation before submission  
- Type-safe API contracts  
- Dependency injection for testability  
- Mock adapter for development  
- Empty state UI  

## Code Quality

### Linting & Formatting
```bash
npm run lint       # Run ESLint
npm run format     # Format with Prettier
```

### Testing Strategy (Conceptual)
- **Unit Tests**: Use cases, utilities, error handlers
- **Component Tests**: Screen and component rendering with React Testing Library
- **Integration Tests**: Store + API adapter interactions
- **End-to-End**: Navigation flows with Maestro

### End-to-End Testing with Maestro

Maestro is used for mobile UI testing and automation to verify complete user workflows across the app.

#### Setup & Installation

1. **Install Maestro CLI**:
   ```bash
   curl -Ls "https://get.maestro.mobile.dev" | bash
   ```

2. **Add Maestro to your PATH** (if not already done):
   ```bash
   export PATH="$PATH:~/.maestro/bin"
   ```

3. **Verify installation**:
   ```bash
   maestro --version
   ```

#### Running E2E Tests

1. **Start the app on an emulator or device**:
   ```bash
   npm start  # or npx expo start
   ```

2. **Run all Maestro flows**:
   ```bash
   maestro test maestro/
   ```

3. **Run a specific test**:
   ```bash
   maestro test maestro/create_transaction.yaml
   maestro test maestro/home.yaml
   ```

4. **Run with verbose output**:
   ```bash
   maestro test --debug maestro/create_transaction.yaml
   ```

#### Test Flows

##### 1. **Create Transaction Flow** (`create_transaction.yaml`)
Tests the complete transaction creation workflow:
- Launches the app and verifies home screen loads
- Navigates to Create Transaction screen
- Fills in transaction form:
  - Customer ID: `cust-123`
  - Amount: `500`
  - Currency: `USD`
  - Payment Method: `credit_card`
  - Description: `Test transaction from Maestro`
- Submits the form
- Verifies success and transaction appears in list
- Navigates back home and confirms persistence

**What it validates**:
- ✅ Form field inputs work correctly
- ✅ Form submission succeeds
- ✅ Transaction data persists
- ✅ UI updates after successful creation
- ✅ Navigation flows properly

##### 2. **Home Screen Flow** (`home.yaml`)
Basic smoke test for the home screen:
- Launches app
- Verifies Transactions list is visible
- Confirms app loads without errors

#### Key Features of Maestro Tests

- **No coding required**: YAML-based test definitions
- **Cross-platform**: Run same tests on iOS and Android
- **Visual testing**: Finds UI elements by text, coordinates, or accessibility labels
- **Waits & retries**: Automatically handles async operations
- **Screenshot on failure**: Captures state when tests fail

#### Debugging Failed Tests

If a test fails:

1. **Check test output** for which step failed
2. **Review app UI** - verify element text/layout matches test expectations
3. **Use `--debug` flag** for step-by-step execution
4. **Update selectors** in YAML if UI elements changed
5. **Verify element accessibility** - ensure buttons/inputs are visible and tappable

#### CI/CD Integration

Add to your CI/CD pipeline to run E2E tests automatically:

```yaml
# Example GitHub Actions
- name: Run Maestro Tests
  run: |
    maestro test maestro/
```

### TypeScript
- Strict mode enabled
- Full type coverage for domain and API layer
- Discriminated unions for state management

## CI/CD Pipeline (Conceptual)

```yaml
stages:
  - lint
    - Run ESLint
    - Format check with Prettier
  
  - test
    - Unit tests (Jest)
    - Component tests (React Native Testing Library)
    - Coverage reports
  
  - build
    - TypeScript compilation
    - Bundle analysis
    - Generate APK/IPA
  
  - deploy
    - Internal testing (TestFlight/Firebase App Distribution)
    - Staged rollout
    - Monitor crash reports
    - Production release
```

## File Structure Summary

```
src/features/payin/
├── domain/
│   ├── entities/PayIn.ts                    # Data models
│   ├── repositories/IPayInRepository.ts     # Contracts
├── application/useCases/
│   ├── createPayIn.ts                       # Create use case
│   ├── getPayInById.ts                      # Detail use case
│   ├── listPayIns.ts                        # List use case
├── infrastructure/
│   ├── api/
│   │   ├── payInApiAdapter.ts              # Real API implementation
│   │   ├── payInMockAdapter.ts             # Mock data provider
│   ├── http/
│   │   └── httpClient.ts                   # Axios configuration
├── presentation/
│   ├── screens/
│   │   ├── CreatePayInScreen.tsx           # Form screen
│   │   ├── PayInDetailScreen.tsx           # Detail screen
│   │   ├── PayInListScreen.tsx             # List screen
│   ├── components/
│   │   ├── PayInStatusBadge.tsx            # Status indicator
│   │   ├── PayInCard.tsx                   # Transaction card
│   ├── store/
│   │   └── usePayInStore.ts                # Zustand store
├── index.ts                                 # Barrel exports

src/shared/
├── components/
│   ├── LoadingOverlay.tsx                  # Loading UI
│   ├── ErrorMessage.tsx                    # Error display
│   ├── EmptyState.tsx                      # Empty state UI
├── utils/
│   └── errorHandler.ts                     # Error utilities

src/navigation/
└── AppNavigator.tsx                        # Navigation setup
```

## Quick Start

```bash
# Install dependencies
npm install

# Start development server with mock API
REACT_APP_USE_MOCK_API=true npm start

# Or start with real API
REACT_APP_USE_MOCK_API=false npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Technology Stack

| Technology | Purpose |
|-----------|---------|
| **React Native** | Cross-platform mobile framework |
| **TypeScript** | Type-safe development |
| **Zustand** | State management |
| **React Navigation** | Navigation & routing |
| **Axios** | HTTP client |
| **Expo** | Development & build tool |
| **ESLint + Prettier** | Code quality |

## Future Enhancements

1. **Offline Support**: Cache transactions locally with RTK Query or React Query
2. **Push Notifications**: Real-time transaction status updates
3. **Advanced Filtering**: Date range, amount range filters
4. **Analytics**: Track user interactions, conversion funnel
5. **Localization**: Multi-language support
6. **Accessibility**: a11y improvements (WCAG compliance)
7. **Pagination**: Handle large transaction lists efficiently
8. **Dark Mode**: Theme support

## Demo iOS

https://github.com/user-attachments/assets/dfd2453c-16fd-4363-8242-be16ae7be156

## Demo Android

https://github.com/user-attachments/assets/116d23b4-7e65-455c-9583-989800303860

## Troubleshooting

### Dependencies Issue
```bash
npm install
npm run start
```

### Clear Cache
```bash
npm start -- --clear
```

### Type Errors
Ensure TypeScript version matches (^5.9.2)
```bash
npm install --save-dev typescript@^5.9.2
```

## Support & Documentation

- [React Native Docs](https://reactnative.dev)
- [React Navigation](https://reactnavigation.org)
- [Zustand](https://github.com/pmndrs/zustand)
- [Axios](https://axios-http.com)

---

**Last Updated**: April 2026  
**Version**: 1.0.0  
**Author**: Development Team
