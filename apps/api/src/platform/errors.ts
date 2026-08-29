/** Numeric error_code matches the legacy Spring envelope. Throw HttpError; app.onError serializes it. */

export class HttpError extends Error {
  readonly errorCode: number;
  readonly status: number;

  constructor(errorCode: number, message: string, status = errorCode) {
    super(message);
    this.name = 'HttpError';
    this.errorCode = errorCode;
    this.status = status;
  }
}

export const badRequest = (message: string): HttpError => new HttpError(400, message, 400);
export const unauthenticated = (message: string): HttpError => new HttpError(401, message, 401);
export const forbidden = (message: string): HttpError => new HttpError(403, message, 403);
export const notFound = (message: string): HttpError => new HttpError(404, message, 404);
export const conflict = (message: string): HttpError => new HttpError(409, message, 409);
export const payloadTooLarge = (message: string): HttpError => new HttpError(413, message, 413);
export const systemError = (message: string): HttpError => new HttpError(500, message, 500);
