import { describe, expect, it } from 'vitest';
import { ApiError } from '@/types/auth';
import {
  ANNUAL_INSPECTION_STA_INF_TIMEOUT_MESSAGE,
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

  it('maps backend timeout messages to the same friendly text', () => {
    expect(
      getAnnualInspectionStaInfErrorMessage(
        new ApiError('Tiempo de espera agotado esperando respuesta StaInf de la impresora.', 502),
      ),
    ).toBe(ANNUAL_INSPECTION_STA_INF_TIMEOUT_MESSAGE);
  });
});
