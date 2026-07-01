import { describe, expect, it } from 'vitest';
import { toCameraErrorMessage } from '@/lib/qr-scanner-runtime';

describe('toCameraErrorMessage', () => {
  it('traduce permiso denegado sin términos técnicos', () => {
    const message = toCameraErrorMessage(
      new DOMException('Permission denied', 'NotAllowedError'),
    );

    expect(message).toBe(
      'Debe permitir el acceso a la cámara en su navegador para escanear el código.',
    );
    expect(message).not.toMatch(/notallowed|permission denied/i);
  });

  it('traduce cámara no encontrada', () => {
    expect(
      toCameraErrorMessage(new DOMException('Requested device not found', 'NotFoundError')),
    ).toBe('No encontramos una cámara en este equipo. Use la opción de pegar el código.');
  });

  it('traduce timeout de inicio de video', () => {
    expect(
      toCameraErrorMessage(
        new Error(
          'AbortError Timeout starting video source. Close other apps using the camera.',
        ),
      ),
    ).toBe('La cámara tardó en responder. Cierre otras apps que la usen e intente de nuevo.');
  });

  it('conserva mensajes ya amigables en español', () => {
    const friendly = 'La cámara tardó en responder. Cierre otras apps que la usen e intente de nuevo.';
    expect(toCameraErrorMessage(new Error(friendly))).toBe(friendly);
  });

  it('usa un mensaje genérico para errores desconocidos', () => {
    expect(toCameraErrorMessage(new Error('Html5Qrcode internal failure xyz'))).toBe(
      'No pudimos usar la cámara. Puede pegar el código manualmente.',
    );
  });
});
