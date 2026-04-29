import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { PayInDetailScreen } from '../../src/features/payin/presentation/screens/PayInDetailScreen';
import { PayIn, PayInStatus } from '../../src/features/payin/domain/entities/PayIn';

const mockGetPayInById = jest.fn();
const mockClearError = jest.fn();

const mockStoreState = {
  getPayInById: mockGetPayInById,
  currentPayIn: null as PayIn | null,
  loading: false,
  error: null as string | null,
  clearError: mockClearError,
};

const mockRoute = {
  params: undefined as { payInId: string } | undefined,
};

jest.mock('@react-navigation/native', () => ({
  useRoute: () => mockRoute,
}));

jest.mock('../../src/features/payin/presentation/store/usePayInStore', () => ({
  usePayInStore: () => mockStoreState,
}));

const payin: PayIn = {
  id: 'payin-001',
  customer_id: 'cust-123',
  amount: 1234.56,
  currency: 'USD',
  status: PayInStatus.FAILED,
  payment_method: 'credit_card',
  description: 'Detailed payment',
  created_at: '2026-04-20T10:00:00Z',
  updated_at: '2026-04-20T10:05:00Z',
  error_message: 'Card declined',
};

describe('PayInDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRoute.params = undefined;
    mockStoreState.currentPayIn = null;
    mockStoreState.loading = false;
    mockStoreState.error = null;
    mockGetPayInById.mockResolvedValue(payin);
  });

  test('renders empty state when no transaction is selected', () => {
    const { getByText, getByPlaceholderText } = render(<PayInDetailScreen />);

    expect(getByText('Transaction Detail')).toBeTruthy();
    expect(getByText('Search by PayIn ID')).toBeTruthy();
    expect(getByPlaceholderText('Enter PayIn ID (e.g., payin-001)').props.value).toBe(
      'payin-001'
    );
    expect(getByText('No Transaction Found')).toBeTruthy();
  });

  test('loads payin from route params on mount', async () => {
    mockRoute.params = { payInId: 'payin-route' };
    render(<PayInDetailScreen />);

    await waitFor(() => {
      expect(mockGetPayInById).toHaveBeenCalledWith('payin-route');
    });
  });

  test('loads payin from initial prop on mount', async () => {
    render(<PayInDetailScreen payInId="payin-prop" />);

    await waitFor(() => {
      expect(mockGetPayInById).toHaveBeenCalledWith('payin-prop');
    });
  });

  test('renders current payin details with description and error section', () => {
    mockStoreState.currentPayIn = payin;
    const { getByText } = render(<PayInDetailScreen />);

    expect(getByText('PayIn #payin-001')).toBeTruthy();
    expect(getByText(PayInStatus.FAILED)).toBeTruthy();
    expect(getByText('Transaction Information')).toBeTruthy();
    expect(getByText('cust-123')).toBeTruthy();
    expect(getByText('$1,234.56')).toBeTruthy();
    expect(getByText('Detailed payment')).toBeTruthy();
    expect(getByText('Error Details')).toBeTruthy();
    expect(getByText('Card declined')).toBeTruthy();
  });

  test('renders payin details without optional description or error section', () => {
    mockStoreState.currentPayIn = {
      ...payin,
      status: PayInStatus.PROCESSED,
      description: undefined,
      error_message: undefined,
    };
    const { getByText, queryByText } = render(<PayInDetailScreen />);

    expect(getByText('PayIn #payin-001')).toBeTruthy();
    expect(getByText(PayInStatus.PROCESSED)).toBeTruthy();
    expect(queryByText('Description')).toBeNull();
    expect(queryByText('Error Details')).toBeNull();
  });

  test('searches for trimmed payin id', async () => {
    const { getByPlaceholderText, getByText } = render(<PayInDetailScreen />);

    fireEvent.changeText(
      getByPlaceholderText('Enter PayIn ID (e.g., payin-001)'),
      '  payin-777  '
    );

    await act(async () => {
      fireEvent.press(getByText('Search'));
    });

    expect(mockGetPayInById).toHaveBeenCalledWith('payin-777');
  });

  test('does not search when id is blank', () => {
    const { getByPlaceholderText, getByText } = render(<PayInDetailScreen />);

    fireEvent.changeText(
      getByPlaceholderText('Enter PayIn ID (e.g., payin-001)'),
      '   '
    );
    fireEvent.press(getByText('Search'));

    expect(mockGetPayInById).not.toHaveBeenCalled();
  });

  test('shows fetch error when loading payin fails and dismisses it', async () => {
    mockGetPayInById.mockRejectedValueOnce(new Error('PayIn not found'));
    const { getByPlaceholderText, getByText } = render(<PayInDetailScreen />);

    fireEvent.changeText(
      getByPlaceholderText('Enter PayIn ID (e.g., payin-001)'),
      'missing'
    );

    await act(async () => {
      fireEvent.press(getByText('Search'));
    });

    expect(getByText('PayIn not found')).toBeTruthy();
    fireEvent.press(getByText('Dismiss'));

    expect(mockClearError).toHaveBeenCalledTimes(1);
  });

  test('shows generic fetch error for non-error rejections', async () => {
    mockGetPayInById.mockRejectedValueOnce('nope');
    const { getByText } = render(<PayInDetailScreen payInId="payin-404" />);

    await waitFor(() => {
      expect(getByText('Failed to fetch PayIn')).toBeTruthy();
    });
  });

  test('shows store error and dismisses it', () => {
    mockStoreState.error = 'Store failed';
    const { getByText } = render(<PayInDetailScreen />);

    expect(getByText('Store failed')).toBeTruthy();
    fireEvent.press(getByText('Dismiss'));

    expect(mockClearError).toHaveBeenCalledTimes(1);
  });

  test('refreshes the current payin', async () => {
    mockStoreState.currentPayIn = payin;
    const { getByText } = render(<PayInDetailScreen />);

    await act(async () => {
      fireEvent.press(getByText('Refresh'));
    });

    expect(mockGetPayInById).toHaveBeenCalledWith('payin-001');
  });

  test('shows loading button state', () => {
    mockStoreState.loading = true;
    mockStoreState.currentPayIn = payin;
    const { getByText } = render(<PayInDetailScreen />);

    expect(getByText('Refreshing...')).toBeTruthy();
  });

  test('does not show empty state while loading without a current payin', () => {
    mockStoreState.loading = true;
    const { queryByText } = render(<PayInDetailScreen />);

    expect(queryByText('No Transaction Found')).toBeNull();
    expect(queryByText('Search')).toBeNull();
  });
});
