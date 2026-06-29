import { getApiBaseUrl } from '@/lib/api';
import { buildApiPath } from '@/lib/api-config';
import { getStoredToken } from '@/lib/auth-storage';
import { redirectToLoginAfterExpired } from '@/lib/session-expired';
import { ApiError } from '@/types/auth';
import type { MqttConnectionProbeResult } from '@/types/annual-inspection-mqtt';

const BASE = '/api/mqtt';

export async function checkMqttConnection(): Promise<{
  result: MqttConnectionProbeResult;
  httpStatus: number;
}> {
  const token = getStoredToken();
  if (!token) {
    throw new ApiError('No hay sesión activa', 401);
  }

  const url = `${getApiBaseUrl()}${buildApiPath(`${BASE}/connection-check`)}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'omit',
  });

  const data = (await response.json()) as MqttConnectionProbeResult;

  if (response.status === 401) {
    redirectToLoginAfterExpired();
    throw new ApiError('Sesión expirada o no válida', 401);
  }

  if (response.status === 403) {
    throw new ApiError('Solo un administrador puede usar las herramientas MQTT de diagnóstico.', 403);
  }

  return { result: data, httpStatus: response.status };
}

export function getMqttErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof TypeError) {
    return 'No se pudo conectar con el servidor.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Ha ocurrido un error inesperado.';
}
