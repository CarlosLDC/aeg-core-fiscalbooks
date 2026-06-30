'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getQrLookupErrorMessage,
  lookupInspectionByQr,
} from '@/lib/annual-inspection-qr-lookup-api';
import { canUseQrCamera, QrCodeScanner } from '@/components/qr-code-scanner';

type InputMode = 'manual' | 'camera';

export function AnnualInspectionQrLookupPanel() {
  const router = useRouter();
  const cameraAvailable = canUseQrCamera();
  const [inputMode, setInputMode] = useState<InputMode>('manual');
  const [qrCodigo, setQrCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const runLookup = useCallback(
    async (code: string) => {
      const trimmed = code.trim();
      if (!trimmed) {
        setError('Ingrese o escanee un código QR válido.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await lookupInspectionByQr(trimmed);
        router.push(
          `/fiscal-book/${result.printerId}?tab=inspection&registro=${result.inspectionId}`,
        );
      } catch (err) {
        setError(getQrLookupErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  const handleScan = useCallback(
    (decodedText: string) => {
      if (loading) return;
      setQrCodigo(decodedText);
      void runLookup(decodedText);
    },
    [loading, runLookup],
  );

  const handleCameraError = useCallback((message: string) => {
    setCameraError(message);
  }, []);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
        Verificar comprobante QR
      </h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Escanee o pegue el código impreso tras una inspección anual para abrir el registro
        correspondiente en el libro fiscal.
      </p>

      {cameraAvailable ? (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setInputMode('camera');
              setCameraError(null);
              setError(null);
            }}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              inputMode === 'camera'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Escanear
          </button>
          <button
            type="button"
            onClick={() => setInputMode('manual')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              inputMode === 'manual'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Pegar código
          </button>
        </div>
      ) : null}

      <div className="mt-4">
        {inputMode === 'camera' && cameraAvailable ? (
          <>
            <QrCodeScanner onScan={handleScan} onError={handleCameraError} />
            {cameraError ? (
              <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">{cameraError}</p>
            ) : null}
            {loading ? (
              <p className="mt-2 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
                Buscando registro…
              </p>
            ) : null}
          </>
        ) : (
          <div className="space-y-3">
            <textarea
              rows={3}
              value={qrCodigo}
              onChange={(e) => {
                setQrCodigo(e.target.value);
                setError(null);
              }}
              placeholder="Pegue aquí el contenido del QR…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
            <button
              type="button"
              disabled={loading || !qrCodigo.trim()}
              onClick={() => void runLookup(qrCodigo)}
              className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900"
            >
              {loading ? 'Buscando…' : 'Verificar y abrir registro'}
            </button>
          </div>
        )}
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
          {error}
        </div>
      ) : null}
    </section>
  );
}
