'use client';

import { Loader2, RefreshCw, X } from 'lucide-react';
import {
  ANNUAL_INSPECTION_CHECKLIST_ROWS,
  type AnnualInspectionChecklistKey,
  type AnnualInspectionChecklistState,
} from '@aeg/annual-inspection-mqtt';

type AnnualInspectionMqttModalProps = {
  open: boolean;
  registroImpresora: string;
  numeroFacturaPrueba: number | null;
  productDescription: string;
  onProductDescriptionChange: (value: string) => void;
  checklist: AnnualInspectionChecklistState;
  onChecklistChange: (key: AnnualInspectionChecklistKey, checked: boolean) => void;
  onRefresh: () => void;
  refreshing: boolean;
  onSendTestInvoice: () => void;
  sendingTestInvoice: boolean;
  onSendTestCreditNote: () => void;
  sendingTestCreditNote: boolean;
  creditNoteDisabled?: boolean;
  creditNoteDisabledReason?: string | null;
  onSubmitInspection: () => void;
  submittingInspection: boolean;
  error?: string | null;
  onClose: () => void;
};

function productDescriptionHint(productDescription: string): string {
  const lineCount = productDescription
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean).length;
  if (lineCount <= 1) {
    return 'Máximo 24 caracteres en una sola línea (el precio ocupa el resto del ancho).';
  }
  return 'Máximo 24 caracteres por línea, hasta 3 líneas.';
}

export function AnnualInspectionMqttModal({
  open,
  registroImpresora,
  numeroFacturaPrueba,
  productDescription,
  onProductDescriptionChange,
  checklist,
  onChecklistChange,
  onRefresh,
  refreshing,
  onSendTestInvoice,
  sendingTestInvoice,
  onSendTestCreditNote,
  sendingTestCreditNote,
  creditNoteDisabled = false,
  creditNoteDisabledReason,
  onSubmitInspection,
  submittingInspection,
  error,
  onClose,
}: AnnualInspectionMqttModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="annual-inspection-mqtt-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2
              id="annual-inspection-mqtt-title"
              className="text-lg font-semibold text-slate-900 dark:text-white"
            >
              Inspección anual obligatoria
            </h2>
            <p className="mt-1 text-sm text-muted">
              Marque el checklist manualmente o deje que se marque tras pruebas exitosas.
              Enviar inspección solo usa el estado actual de los cinco checkboxes.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="block min-w-0 flex-1">
              <span className="mb-1.5 block text-sm font-medium">Registro de impresora</span>
              <input
                type="text"
                readOnly
                value={registroImpresora}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 font-mono text-sm"
              />
            </label>
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 ${
                refreshing ? 'cursor-not-allowed opacity-70' : ''
              }`}
            >
              {refreshing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              Actualizar
            </button>
          </div>

          {numeroFacturaPrueba != null ? (
            <p className="text-sm text-slate-800 dark:text-slate-200">
              <span className="text-muted">Número de factura de prueba:</span>{' '}
              <span className="font-mono font-semibold">{numeroFacturaPrueba}</span>
            </p>
          ) : null}

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Descripción de producto (des01)</span>
            <textarea
              value={productDescription}
              onChange={(event) => onProductDescriptionChange(event.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            />
            <span className="mt-1 block text-xs text-muted">
              {productDescriptionHint(productDescription)} Se usa en la factura y nota de crédito de
              prueba.
            </span>
          </label>

          <ul className="divide-y divide-slate-200 dark:divide-slate-700 rounded-xl border border-slate-200 dark:border-slate-700">
            {ANNUAL_INSPECTION_CHECKLIST_ROWS.map((row) => (
              <li
                key={row.key}
                className="flex flex-wrap items-center gap-3 px-3 py-3 sm:flex-nowrap"
              >
                <input
                  id={`annual-inspection-${row.key}`}
                  type="checkbox"
                  checked={checklist[row.key]}
                  onChange={(event) => onChecklistChange(row.key, event.target.checked)}
                  className="size-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor={`annual-inspection-${row.key}`}
                  className="min-w-0 flex-1 cursor-pointer text-sm"
                >
                  {row.label}
                </label>
                {row.action === 'test-invoice' ? (
                  <button
                    type="button"
                    onClick={onSendTestInvoice}
                    disabled={sendingTestInvoice}
                    className={`w-full shrink-0 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 sm:w-auto ${
                      sendingTestInvoice ? 'cursor-not-allowed opacity-70' : ''
                    }`}
                  >
                    {sendingTestInvoice ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Loader2 className="size-3.5 animate-spin" />
                        Enviando…
                      </span>
                    ) : (
                      'Enviar Factura de Prueba'
                    )}
                  </button>
                ) : null}
                {row.action === 'test-credit-note' ? (
                  <button
                    type="button"
                    onClick={onSendTestCreditNote}
                    disabled={sendingTestCreditNote || creditNoteDisabled}
                    title={creditNoteDisabledReason ?? undefined}
                    className={`w-full shrink-0 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 sm:w-auto ${
                      sendingTestCreditNote || creditNoteDisabled
                        ? 'cursor-not-allowed opacity-70'
                        : ''
                    }`}
                  >
                    {sendingTestCreditNote ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Loader2 className="size-3.5 animate-spin" />
                        Enviando…
                      </span>
                    ) : (
                      'Enviar Nota de Crédito de Prueba'
                    )}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>

          {error ? (
            <p
              role="alert"
              className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 px-3 py-2 text-sm text-rose-900 dark:text-rose-100"
            >
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={onSubmitInspection}
            disabled={submittingInspection}
            className={`flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 ${
              submittingInspection ? 'cursor-not-allowed opacity-70' : ''
            }`}
          >
            {submittingInspection ? <Loader2 className="size-4 animate-spin" /> : null}
            Enviar Inspección Anual Obligatoria
          </button>
        </div>
      </div>
    </div>
  );
}
