import {
  ApiError,
  ValidationError,
  getErrorMessage,
  handleError,
} from '../../src/shared/utils/errorHandler';

describe('errorHandler utilities', () => {
  describe('ApiError', () => {
    test('creates an ApiError with message, status code, and details', () => {
      const details = { requestId: 'req-123' };
      const error = new ApiError('API failed', 422, details);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe('API failed');
      expect(error.statusCode).toBe(422);
      expect(error.details).toBe(details);
    });

    test('uses status 500 by default', () => {
      const error = new ApiError('Unexpected API failure');

      expect(error.statusCode).toBe(500);
      expect(error.details).toBeUndefined();
    });
  });

  describe('ValidationError', () => {
    test('creates a ValidationError with message and details', () => {
      const details = { amount: 'must be positive' };
      const error = new ValidationError('Invalid input', details);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('Invalid input');
      expect(error.details).toBe(details);
    });

    test('supports missing validation details', () => {
      const error = new ValidationError('Invalid input');

      expect(error.details).toBeUndefined();
    });
  });

  describe('handleError', () => {
    test('returns retry response for ApiError', () => {
      expect(handleError(new ApiError('Payment failed', 400))).toEqual({
        title: 'Oops!',
        message: 'Payment failed',
        actionLabel: 'Retry',
      });
    });

    test('uses fallback message for ApiError without message', () => {
      expect(handleError(new ApiError('', 500))).toEqual({
        title: 'Oops!',
        message: 'Something went wrong. Please try again later.',
        actionLabel: 'Retry',
      });
    });

    test('returns invalid input response for ValidationError', () => {
      expect(handleError(new ValidationError('Amount is required'))).toEqual({
        title: 'Invalid Input',
        message: 'Amount is required',
      });
    });

    test('uses fallback message for ValidationError without message', () => {
      expect(handleError(new ValidationError(''))).toEqual({
        title: 'Invalid Input',
        message: 'Please check your information and try again.',
      });
    });

    test('returns connection response for network errors', () => {
      expect(handleError(new Error('Network request failed'))).toEqual({
        title: 'Connection Error',
        message: 'Check your internet connection and try again.',
        actionLabel: 'Retry',
      });
    });

    test('returns generic response for regular errors', () => {
      expect(handleError(new Error('Something specific failed'))).toEqual({
        title: 'Error',
        message: 'Something specific failed',
      });
    });

    test('returns generic fallback response for unknown values', () => {
      expect(handleError('plain string error')).toEqual({
        title: 'Error',
        message: 'An unknown error occurred',
      });
    });
  });

  describe('getErrorMessage', () => {
    test('returns message from Error instances', () => {
      expect(getErrorMessage(new Error('Readable error'))).toBe(
        'Readable error'
      );
    });

    test('returns fallback message for unknown values', () => {
      expect(getErrorMessage({ message: 'not an Error instance' })).toBe(
        'An unknown error occurred'
      );
    });
  });
});
