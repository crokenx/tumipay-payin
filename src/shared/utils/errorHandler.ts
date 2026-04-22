// Error Handler Utility - Shared layer
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, statusCode: number = 500, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export class ValidationError extends Error {
  public readonly details?: Record<string, string>;

  constructor(message: string, details?: Record<string, string>) {
    super(message);
    this.details = details;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export interface ErrorResponse {
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
}

export const handleError = (error: unknown): ErrorResponse => {
  if (error instanceof ApiError) {
    return {
      title: 'Oops!',
      message:
        error.message || 'Something went wrong. Please try again later.',
      actionLabel: 'Retry',
    };
  }

  if (error instanceof ValidationError) {
    return {
      title: 'Invalid Input',
      message: error.message || 'Please check your information and try again.',
    };
  }

  if (error instanceof Error && error.message.includes('Network')) {
    return {
      title: 'Connection Error',
      message:
        'Check your internet connection and try again.',
      actionLabel: 'Retry',
    };
  }

  return {
    title: 'Error',
    message: error instanceof Error ? error.message : 'An unknown error occurred',
  };
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};
