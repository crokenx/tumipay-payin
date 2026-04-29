import React from 'react';
import { Alert, Platform } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { CreatePayInScreen } from '../../src/features/payin/presentation/screens/CreatePayInScreen';

const mockCreatePayIn = jest.fn();
const mockClearError = jest.fn();

const mockStoreState = {
  createPayIn: mockCreatePayIn,
  loading: false,
  error: null as string | null,
  clearError: mockClearError,
};

jest.mock('../../src/features/payin/presentation/store/usePayInStore', () => ({
  usePayInStore: () => mockStoreState,
}));

describe('CreatePayInScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStoreState.loading = false;
    mockStoreState.error = null;
    jest.spyOn(Alert, 'alert').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders the create payment form with defaults', () => {
    const { getAllByText, getByText, getByTestId, getByPlaceholderText } = render(
      <CreatePayInScreen />
    );

    expect(getAllByText('Create Payment')).toHaveLength(2);
    expect(getByText('Enter payment details below')).toBeTruthy();
    expect(getByTestId('input-customer-id').props.value).toBe('cust-123');
    expect(getByPlaceholderText('USD').props.value).toBe('USD');
    expect(getByTestId('btn-create-payment')).toBeTruthy();
  });

  test('shows validation errors and does not submit invalid form', () => {
    const { getByText, getByTestId } = render(<CreatePayInScreen />);

    fireEvent.changeText(getByTestId('input-customer-id'), '');
    fireEvent.press(getByTestId('btn-create-payment'));

    expect(getByText('Customer ID is required')).toBeTruthy();
    expect(getByText('Amount must be greater than 0')).toBeTruthy();
    expect(getByText('Payment method is required')).toBeTruthy();
    expect(mockCreatePayIn).not.toHaveBeenCalled();
  });

  test('validates missing currency', () => {
    const { getByText, getByTestId, getByPlaceholderText } = render(
      <CreatePayInScreen />
    );

    fireEvent.changeText(getByTestId('input-amount'), '25');
    fireEvent.changeText(getByTestId('input-payment-method'), 'credit_card');
    fireEvent.changeText(getByPlaceholderText('USD'), '');
    fireEvent.press(getByTestId('btn-create-payment'));

    expect(mockCreatePayIn).not.toHaveBeenCalled();
  });

  test('clears amount back to zero when amount input is emptied', () => {
    const { getByTestId } = render(<CreatePayInScreen />);

    fireEvent.changeText(getByTestId('input-amount'), '25');
    fireEvent.changeText(getByTestId('input-amount'), '');
    fireEvent.changeText(getByTestId('input-payment-method'), 'credit_card');
    fireEvent.press(getByTestId('btn-create-payment'));

    expect(mockCreatePayIn).not.toHaveBeenCalled();
    expect(getByTestId('input-amount').props.value).toBe('');
  });

  test('uses ios keyboard avoiding behavior on ios', () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: 'ios',
    });

    const { getByTestId } = render(<CreatePayInScreen />);

    expect(getByTestId('btn-create-payment')).toBeTruthy();

    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: originalOS,
    });
  });

  test('submits valid form data and runs success callback from alert', async () => {
    const onSuccess = jest.fn();
    mockCreatePayIn.mockResolvedValue({
      id: 'payin-100',
      customer_id: 'cust-999',
      amount: 125.5,
      currency: 'EUR',
      payment_method: 'paypal',
      description: 'Invoice payment',
    });
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(
      (_title, _message, buttons) => {
        buttons?.[0]?.onPress?.();
      }
    );

    const { getByTestId, getByPlaceholderText } = render(
      <CreatePayInScreen onSuccess={onSuccess} />
    );

    fireEvent.changeText(getByTestId('input-customer-id'), 'cust-999');
    fireEvent.changeText(getByTestId('input-amount'), '125.50');
    fireEvent.changeText(getByPlaceholderText('USD'), 'eur');
    fireEvent.changeText(getByTestId('input-payment-method'), 'paypal');
    fireEvent.changeText(getByTestId('input-description'), 'Invoice payment');

    await act(async () => {
      fireEvent.press(getByTestId('btn-create-payment'));
    });

    await waitFor(() => {
      expect(mockCreatePayIn).toHaveBeenCalledWith({
        customer_id: 'cust-999',
        amount: 125.5,
        currency: 'EUR',
        payment_method: 'paypal',
        description: 'Invoice payment',
      });
    });
    expect(alertSpy).toHaveBeenCalledWith(
      'Success',
      'PayIn created successfully!',
      expect.any(Array)
    );
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  test('logs failed submit errors from the store', async () => {
    const error = new Error('Create failed');
    mockCreatePayIn.mockRejectedValue(error);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const { getByTestId } = render(<CreatePayInScreen />);

    fireEvent.changeText(getByTestId('input-amount'), '10');
    fireEvent.changeText(getByTestId('input-payment-method'), 'wallet');

    await act(async () => {
      fireEvent.press(getByTestId('btn-create-payment'));
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to create PayIn:', error);
    });
  });

  test('renders store error and dismisses it', () => {
    mockStoreState.error = 'Backend unavailable';
    const { getByText } = render(<CreatePayInScreen />);

    expect(getByText('Backend unavailable')).toBeTruthy();
    fireEvent.press(getByText('Dismiss'));

    expect(mockClearError).toHaveBeenCalledTimes(1);
  });

  test('disables inputs and button while loading', () => {
    mockStoreState.loading = true;
    const { getByText, getByTestId } = render(<CreatePayInScreen />);

    expect(getByText('Creating...')).toBeTruthy();
    expect(getByTestId('input-customer-id').props.editable).toBe(false);
    expect(getByTestId('btn-create-payment').props.accessibilityState.disabled).toBe(
      true
    );
  });
});
