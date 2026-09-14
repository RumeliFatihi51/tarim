export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'SATELLITE_DATA_UNAVAILABLE'
  | 'NO_SUITABLE_SCENE'
  | 'MISSING_SATELLITE_ASSET'
  | 'INSUFFICIENT_VALID_PIXELS'
  | 'RASTER_PROCESSING_ERROR'
  | 'WEATHER_PROVIDER_ERROR'
  | 'AI_SERVICE_ERROR'
  | 'REPORT_GENERATION_ERROR'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR';

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly status = 500,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

