'use client';

import { useState } from 'react';
import { verifyAnnualInspectionQr } from '@/lib/annual-inspection-mqtt-api';
import type { AnnualInspectionQrVerification } from '@/lib/annual-inspection-qr-display';

type AnnualInspectionQrSectionProps = {
  printerId: number;
  registroImpresora: string;
  onQrVerified: (verification: AnnualInspectionQrVerification) => void;
};

export function AnnualInspectionQrSection({
  printerId,
  registroImpresora,
  onQrVerified,
}: AnnualInspectionQrSectionProps) {
  const [qrCodigo, setQrCodigo] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState<AnnualInspectionQrVerification | null>(null);

  async function handleVerify() {
    const trimmed = qrCodigo.trim();
    if (!trimmed) {
      setError('Ingrese el código extraído del QR.');
      return;
    }

    setVerifying(true);
    setError(null);
    setVerified(null);

    try {
      const result = await verifyAnnualInspectionQr({
        printerId,
        qrCodigo: trimmed,
        registroImpresora,
      });
      const verification: AnnualInspectionQrVerification = {
        qrCodigo: trimmed,
        registro: result.registro,
        mac: result.mac,
        fecha: result.fecha,
      };
      setVerified(verification);
      onQrVerified(verification);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo verificar el código QR.');
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Ingrese el código extraído del QR impreso por la impresora.
      </p>

      <div>
        <label
          htmlFor="annual-inspection-qr-codigo"
          className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300"
        >
          Código del QR
        </label>
        <input
          id="annual-inspection-qr-codigo"
          type="text"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm text-slate-900 outline-none transition-all focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          placeholder="Código extraído del QR"
          value={qrCodigo}
          onChange={(e) => {
            setQrCodigo(e.target.value);
            setVerified(null);
            setError(null);
          }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void handleVerify()}
          disabled={verifying || !qrCodigo.trim()}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
        >
          {verifying ? 'Verificando…' : 'Verificar QR'}
        </button>
        {verified ? (
          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            QR verificado correctamente
          </span>
        ) : null}
      </div>

      {verified ? (
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm dark:border-emerald-900/40 dark:bg-emerald-950/20 md:grid-cols-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-800/70 dark:text-emerald-300/70">
              Registro
            </p>
            <p className="mt-1 font-mono font-semibold text-emerald-950 dark:text-emerald-100">
              {verified.registro}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-800/70 dark:text-emerald-300/70">
              MAC
            </p>
            <p className="mt-1 font-mono font-semibold text-emerald-950 dark:text-emerald-100">
              {verified.mac}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-800/70 dark:text-emerald-300/70">
              Fecha
            </p>
            <p className="mt-1 font-mono font-semibold text-emerald-950 dark:text-emerald-100">
              {verified.fecha}
            </p>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
          {error}
        </div>
      ) : null}
    </div>
  );
}
