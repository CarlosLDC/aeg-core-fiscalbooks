import { apiFetch } from '@/lib/api';
import {
  clearUserProfile,
  getProfileFromStorage,
  resolveAndStoreUserProfile,
  type UserProfile,
} from '@/lib/auth-profile';
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from '@/lib/auth-storage';
import { getUsernameFromToken, isTokenExpired } from '@/lib/jwt';
import type { AuthResponse, LoginRequest } from '@/types/auth';
import { ApiError } from '@/types/auth';

type RawAuthResponse = Partial<AuthResponse> & {
  accessToken?: string;
  access_token?: string;
  jwt?: string;
};

function extractToken(data: RawAuthResponse): string | null {
  return data.token ?? data.accessToken ?? data.access_token ?? data.jwt ?? null;
}

export async function login(
  credentials: LoginRequest,
  remember: boolean,
): Promise<AuthResponse> {
  const data = await apiFetch<RawAuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
    auth: false,
  });

  const token = extractToken(data);
  if (!token) {
    throw new ApiError('El servidor no devolvió un token de sesión válido.', 500);
  }

  setStoredToken(token, remember);
  await resolveAndStoreUserProfile(token, remember);
  return { ...data, token };
}

export function logout() {
  clearStoredToken();
  clearUserProfile();
}

export function getSession(): (UserProfile & { token: string }) | null {
  const token = getStoredToken();
  if (!token || isTokenExpired(token)) {
    if (token) {
      clearStoredToken();
      clearUserProfile();
    }
    return null;
  }

  const username = getUsernameFromToken(token);
  if (!username) {
    clearStoredToken();
    clearUserProfile();
    return null;
  }

  const profile = getProfileFromStorage(username, token);
  if (!profile) {
    clearStoredToken();
    clearUserProfile();
    return null;
  }

  return { token, ...profile };
}

export function getLoginErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('NEXT_PUBLIC_API_URL')) {
      return 'El servidor no está configurado. Contacta al administrador del sistema.';
    }
  }
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'Usuario o contraseña incorrectos';
    }
    if (error.status === 403) {
      return 'No tienes permiso para acceder';
    }
    return error.message;
  }
  if (error instanceof TypeError) {
    return 'No se pudo conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.';
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'No se pudo iniciar sesión. Inténtalo de nuevo.';
}
