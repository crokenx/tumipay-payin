import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { PayInListScreen } from '../../src/features/payin/presentation/screens/PayInListScreen';
import { PayIn, PayInStatus } from '../../src/features/payin/domain/entities/PayIn';

const mockNavigate = jest.fn();
const mockListPayIns = jest.fn();
const mockClearError = jest.fn();

const mockStoreState = {
  listPayIns: mockListPayIns,
  payins: [] as PayIn[],
  loading: false,
  error: null as string | null,
  clearError: mockClearError,
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('../../src/features/payin/presentation/store/usePayInStore', () => ({
  usePayInStore: () => mockStoreState,
}));

const payins: PayIn[] = [
  {
    id: 'payin-001',
    customer_id: 'cust-123',
    amount: 100,
    currency: 'USD',
    status: PayInStatus.CREATED,
    payment_method: 'credit_card',
    description: 'First payment',
    created_at: '2026-04-20T10:00:00Z',
    updated_at: '2026-04-20T10:05:00Z',
  },
  {
    id: 'payin-002',
    customer_id: 'cust-123',
    amount: 250,
    currency: 'USD',
    status: PayInStatus.FAILED,
    payment_method: 'paypal',
    description: 'Failed payment',
    created_at: '2026-04-21T10:00:00Z',
    updated_at: '2026-04-21T10:05:00Z',
    error_message: 'Insufficient funds',
  },
];

describe('PayInListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStoreState.payins = payins;
    mockStoreState.loading = false;
    mockStoreState.error = null;
    mockListPayIns.mockResolvedValue(undefined);
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('loads and renders payins for the customer', async () => {
    const { getByText } = render(<PayInListScreen customerId="cust-abc" />);

    await waitFor(() => {
      expect(mockListPayIns).toHaveBeenCalledWith('cust-abc');
    });
    expect(getByText('Transactions')).toBeTruthy();
    expect(getByText('Customer: cust-abc')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
    expect(getByText(/ID: payin-001/)).toBeTruthy();
    expect(getByText(/ID: payin-002/)).toBeTruthy();
  });

  test('shows loading state when loading without data', () => {
    mockStoreState.payins = [];
    mockStoreState.loading = true;
    const { getByText } = render(<PayInListScreen />);

    expect(getByText('Loading transactions...')).toBeTruthy();
  });

  test('shows loading overlay when refreshing existing data', () => {
    mockStoreState.loading = true;
    const { getByText, queryByText } = render(<PayInListScreen />);

    expect(queryByText('Loading transactions...')).toBeNull();
    expect(getByText(/ID: payin-001/)).toBeTruthy();
  });

  test('filters payins by transaction id search', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
      <PayInListScreen />
    );

    fireEvent.changeText(getByPlaceholderText('Search by Transaction ID'), '002');

    expect(queryByText(/ID: payin-001/)).toBeNull();
    expect(getByText(/ID: payin-002/)).toBeTruthy();
  });

  test('filters payins by status', () => {
    const { getByText, queryByText } = render(<PayInListScreen />);

    fireEvent.press(getByText('Failed'));

    expect(queryByText(/ID: payin-001/)).toBeNull();
    expect(getByText(/ID: payin-002/)).toBeTruthy();
  });

  test('shows status-specific empty state when filter has no matches', () => {
    const { getByText, queryByText } = render(<PayInListScreen />);

    fireEvent.press(getByText('Validated'));

    expect(queryByText(/ID: payin-001/)).toBeNull();
    expect(queryByText(/ID: payin-002/)).toBeNull();
    expect(getByText('No validated transactions found')).toBeTruthy();
  });

  test('shows empty state and refresh action when no payins exist', async () => {
    mockStoreState.payins = [];
    const { getByText } = render(<PayInListScreen customerId="cust-empty" />);

    expect(getByText('No Transactions')).toBeTruthy();
    expect(getByText('No transactions found for this customer')).toBeTruthy();

    await act(async () => {
      fireEvent.press(getByText('Refresh'));
    });

    expect(mockListPayIns).toHaveBeenCalledWith('cust-empty');
  });

  test('shows error and retries after clearing it', async () => {
    mockStoreState.error = 'Unable to list transactions';
    const { getByText } = render(<PayInListScreen customerId="cust-123" />);

    expect(getByText('Unable to list transactions')).toBeTruthy();

    await act(async () => {
      fireEvent.press(getByText('Retry'));
    });

    expect(mockClearError).toHaveBeenCalledTimes(1);
    expect(mockListPayIns).toHaveBeenCalledWith('cust-123');
  });

  test('logs load errors from initial fetch', async () => {
    const error = new Error('List failed');
    mockListPayIns.mockRejectedValueOnce(error);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<PayInListScreen />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load PayIns:', error);
    });
  });

  test('uses callback when selecting a payin', () => {
    const onSelectPayIn = jest.fn();
    const { getByText } = render(
      <PayInListScreen onSelectPayIn={onSelectPayIn} />
    );

    fireEvent.press(getByText(/ID: payin-001/));

    expect(onSelectPayIn).toHaveBeenCalledWith('payin-001');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('navigates to detail screen when selecting a payin without callback', () => {
    const { getByText } = render(<PayInListScreen />);

    fireEvent.press(getByText(/ID: payin-002/));

    expect(mockNavigate).toHaveBeenCalledWith('PayInDetail', {
      payInId: 'payin-002',
    });
  });
});
