import axios from 'axios';

/**
 * Extract error message from Axios error or generic error
 * Handles backend responses that may be JSON, HTML, or plain text
 */
export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const data = err.response?.data;

    // Try to extract message from various response formats
    if (typeof data === 'string') {
      // Backend sent HTML or plain text
      return data.slice(0, 200); // Truncate long responses
    }

    if (data && typeof data === 'object') {
      // Try common error message fields
      if (typeof data.message === 'string') return data.message;
      if (typeof data.error === 'string') return data.error;
    }

    // Fall back to status code description
    if (status) {
      return `Request failed (status ${status})`;
    }

    return err.message || 'Network error';
  }

  // Generic error
  if (err instanceof Error) {
    return err.message;
  }

  return 'Unexpected error';
}
