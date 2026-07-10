'use client';

import { useCallback, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  formatInspectionQrLookupDate,
  getQrLookupErrorMessage,
  lookupInspectionByQr,
  type FiscalBookLookupInspectionByQrResponse,
} from '@/lib/annual-inspection-qr-lookup-api';
import { canUseQrCamera } from '@/components/qr-code-scanner';
import { QrScannerErrorBoundary } from '@/components/qr-scanner-error-boundary';

const QrCodeScanner = dynamic(
  () =>
    import('@/components/qr-code-scanner').then((mod) => ({
      default: mod.QrCodeScanner,
    })),
  {
    ssr: false,
    loading: () => (
      <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
        Preparando cámara…
      </p>
    ),
  },
);

type InputMode = 'manual' | 'camera';

export function AnnualInspectionQrLookupPanel() {
  const cameraAvailable = canUseQrCamera();
  const [inputMode, setInputMode] = useState<InputMode>('manual');
  const [qrCodigo, setQrCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lookupResult, setLookupResult] =
    useState<FiscalBookLookupInspectionByQrResponse | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraSession, setCameraSession] = useState(0);
  const scanHandledRef = useRef(false);

  const runLookup = useCallback(
    async (code: string) => {
      const trimmed = code.trim();
      if (!trimmed) {
        setError('Ingrese o escanee un código QR válido.');
        setLookupResult(null);
        return;
      }

      setLoading(true);
      setError(null);
      setLookupResult(null);

      try {
        const result = await lookupInspectionByQr(trimmed);
        setLookupResult(result);
      } catch (err) {
        setError(getQrLookupErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleScan = useCallback(
    (decodedText: string) => {
      if (loading || scanHandledRef.current) return;
      scanHandledRef.current = true;
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
        Escanee o pegue el código impreso en el comprobante para comprobar que el registro
        existe en el libro fiscal.
      </p>

      {cameraAvailable ? (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => {
              scanHandledRef.current = false;
              setInputMode('camera');
              setCameraError(null);
              setError(null);
              setLookupResult(null);
              setCameraSession((session) => session + 1);
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
            <QrScannerErrorBoundary onError={handleCameraError}>
              <QrCodeScanner
                key={cameraSession}
                onScan={handleScan}
                onError={handleCameraError}
              />
            </QrScannerErrorBoundary>
            {cameraError ? (
              <div className="mt-2 space-y-2">
                <p className="text-sm text-amber-700 dark:text-amber-300">{cameraError}</p>
                <button
                  type="button"
                  onClick={() => {
                    scanHandledRef.current = false;
                    setCameraError(null);
                    setCameraSession((session) => session + 1);
                  }}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Reintentar cámara
                </button>
              </div>
            ) : null}
            {loading ? (
              <p className="mt-2 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
                Verificando…
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
                setLookupResult(null);
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
              {loading ? 'Verificando…' : 'Verificar'}
            </button>
          </div>
        )}
      </div>

      {lookupResult ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <p className="font-semibold text-emerald-900 dark:text-emerald-200">
            Inspección verificada
          </p>
          <dl className="mt-2 space-y-2 text-emerald-800 dark:text-emerald-300">
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wide text-emerald-700/80 dark:text-emerald-400/80">
                Serial de la impresora
              </dt>
              <dd className="font-mono text-sm font-semibold">{lookupResult.fiscalSerial}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wide text-emerald-700/80 dark:text-emerald-400/80">
                Fecha de inspección
              </dt>
              <dd className="font-mono text-sm">
                {formatInspectionQrLookupDate(lookupResult.fecha)}
              </dd>
            </div>
          </dl>
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
          {error}
        </div>
      ) : null}
    </section>
  );
}
