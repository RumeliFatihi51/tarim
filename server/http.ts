import { config } from './config';
import { AppError } from './errors';

export async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = config.EXTERNAL_REQUEST_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new AppError('SATELLITE_DATA_UNAVAILABLE', `External request timed out after ${timeoutMs} ms`, 504);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

