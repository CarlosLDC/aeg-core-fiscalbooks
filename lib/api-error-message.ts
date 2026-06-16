import { ApiError } from '@/types/auth';

function messageFromPayload(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  const data = value as Record<string, unknown>;
  for (const key of ['message', 'error', 'detail', 'title'] as const) {
    const message = messageFromPayload(data[key]);
    if (message) return message;
  }

  const errors = data.errors;
  if (Array.isArray(errors)) {
    for (const error of errors) {
      const message = messageFromPayload(error);
      if (message) return message;
    }
  }

  return null;
}

export async function readErrorMessageFromResponse(
  response: Response,
): Promise<string> {
  const contentType = response.headers.get('content-type') ?? '';
  try {
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return (
        messageFromPayload(data) ??
        (response.statusText || `Error del servidor (${response.status})`)
      );
    }
    const text = (await response.text()).trim();
    if (text && text.length < 200 && !text.startsWith('<')) {
      return text;
    }
  } catch {
    /* cuerpo no legible */
  }
  if (response.status === 401) {
    return 'Usuario o contraseña incorrectos';
  }
  if (response.status === 403) {
    return 'No tienes permiso para realizar esta acción';
  }
  if (response.status >= 500) {
    return `Error del servidor (${response.status}). Inténtalo más tarde.`;
  }
  return response.statusText || `Error en la petición (${response.status})`;
}

export function messageFromUnknownError(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof TypeError) return 'No se pudo conectar con el servidor.';
  if (error instanceof Error && error.message.trim()) return error.message;
  return 'Error desconocido.';
}
