import { readErrorMessageFromResponse } from '@/lib/api-error-message';
import { unwrapApiPayload } from '@/lib/api-contract';
import { buildApiPath, resolveApiBaseUrl } from '@/lib/api-config';
import { getStoredToken } from '@/lib/auth-storage';
import { isTokenExpired } from '@/lib/jwt';
import { redirectToLoginAfterExpired } from '@/lib/session-expired';
import { ApiError } from '@/types/auth';

export function getApiBaseUrl(): string {
  const base = resolveApiBaseUrl();
  if (base === null) {
    throw new Error('NEXT_PUBLIC_API_URL no está configurada.');
  }
  return base;
}

type ApiFetchOptions = RequestInit & {
  auth?: boolean;
};

const SESSION_VALIDATION_PATHS = ['/api/auth/me'];

function shouldLogoutSessionOnUnauthorized(path: string): boolean {
  const normalized = path.split('?')[0];
  return SESSION_VALIDATION_PATHS.some(
    (sessionPath) => normalized === sessionPath || normalized.endsWith(sessionPath),
  );
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { auth = true, headers, ...init } = options;
  const url = `${getApiBaseUrl()}${buildApiPath(path)}`;

  const requestHeaders = new Headers(headers);
  if (!requestHeaders.has('Content-Type') && init.body) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (auth) {
    const token = getStoredToken();
    if (!token) {
      throw new ApiError('No hay sesión activa', 401);
    }
    if (isTokenExpired(token)) {
      redirectToLoginAfterExpired();
      throw new ApiError('Sesión expirada o no válida', 401);
    }
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...init,
    headers: requestHeaders,
    credentials: 'omit',
  });

  if (response.status === 401 && auth) {
    if (shouldLogoutSessionOnUnauthorized(path)) {
      redirectToLoginAfterExpired();
    }
    throw new ApiError('Sesión expirada o no válida', 401);
  }

  if (!response.ok) {
    const message = await readErrorMessageFromResponse(response);
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    const data = await response.json();
    return unwrapApiPayload<T>(data);
  }

  return undefined as T;
}
