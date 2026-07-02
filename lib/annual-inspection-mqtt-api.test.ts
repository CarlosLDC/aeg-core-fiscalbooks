import { describe, expect, it } from 'vitest';
import { ApiError } from '@/types/auth';
import {
  ANNUAL_INSPECTION_PRINTER_QUERY_ERROR_MESSAGE,
  ANNUAL_INSPECTION_STA_INF_TIMEOUT_MESSAGE,
  getAnnualInspectionMqttErrorMessage,
  getAnnualInspectionStaInfErrorMessage,
} from '@/lib/annual-inspection-mqtt-api';

describe('getAnnualInspectionStaInfErrorMessage', () => {
  it('maps client abort to a friendly timeout message', () => {
    expect(
      getAnnualInspectionStaInfErrorMessage(
        new DOMException('The user aborted a request.', 'AbortError'),
      ),
    ).toBe(ANNUAL_INSPECTION_STA_INF_TIMEOUT_MESSAGE);
  });

  it('maps backend timeout messages without exposing technical terms', () => {
    expect(
      getAnnualInspectionStaInfErrorMessage(
        new ApiError('Tiempo de espera agotado esperando respuesta StaInf de la impresora.', 502),
      ),
    ).toBe(ANNUAL_INSPECTION_STA_INF_TIMEOUT_MESSAGE);
  });

  it('maps unauthorized responses without forcing navigation', () => {
    expect(
      getAnnualInspectionStaInfErrorMessage(
        new ApiError('Sesión expirada o no válida', 401),
      ),
    ).toBe('Sesión expirada. Vuelva a iniciar sesión.');
  });

  it('maps missing mac backend errors to a descriptive message', () => {
    const message = getAnnualInspectionStaInfErrorMessage(
      new ApiError('La impresora no tiene dirección MAC.', 400),
    );
    expect(message).toMatch(/dirección MAC/i);
    expect(getAnnualInspectionMqttErrorMessage(new ApiError('La impresora no tiene MAC', 400))).toBe(
      message,
    );
  });

  it('hides technical backend failures behind a generic printer message', () => {
    expect(
      getAnnualInspectionStaInfErrorMessage(
        new ApiError('Unexpected response cmd, expected StaInf', 502),
      ),
    ).toBe(ANNUAL_INSPECTION_PRINTER_QUERY_ERROR_MESSAGE);
  });
});
