'use client';

import {
  ANNUAL_INSPECTION_CHECKLIST_ROWS,
  type AnnualInspectionChecklistKey,
  type AnnualInspectionChecklistState,
} from '@/lib/annual-inspection-mqtt-state';

type AnnualInspectionChecklistPanelProps = {
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
  creditNoteDisabled: boolean;
  creditNoteDisabledReason: string | null;
  onSubmitInspection: () => void;
  submittingInspection: boolean;
  error?: string | null;
  disabled?: boolean;
};

export function AnnualInspectionChecklistPanel({
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
  creditNoteDisabled,
  creditNoteDisabledReason,
  onSubmitInspection,
  submittingInspection,
  error,
  disabled = false,
}: AnnualInspectionChecklistPanelProps) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Marque el checklist manualmente o deje que se marque tras pruebas exitosas. El paso 1 usa
        el estado actual de los cinco checkboxes al registrar en la impresora.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="block min-w-0 flex-1">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
            Registro de impresora
          </span>
          <input
            type="text"
            readOnly
            value={registroImpresora}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm dark:border-slate-800 dark:bg-slate-950"
          />
        </label>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing || disabled}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium hover:bg-slate-50 disabled:opacity-70 dark:border-slate-800 dark:hover:bg-slate-800"
        >
          {refreshing ? 'Actualizando…' : 'Actualizar'}
        </button>
      </div>

      {numeroFacturaPrueba != null ? (
        <p className="text-sm ml-1">
          <span className="text-slate-500 dark:text-slate-400">Número de factura de prueba:</span>{' '}
          <span className="font-mono font-semibold text-slate-900 dark:text-white">
            {numeroFacturaPrueba}
          </span>
        </p>
      ) : null}

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
          Descripción de producto (des01)
        </span>
        <textarea
          value={productDescription}
          onChange={(event) => onProductDescriptionChange(event.target.value)}
          rows={3}
          disabled={disabled}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm disabled:opacity-70 dark:border-slate-800 dark:bg-slate-950"
        />
      </label>

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
          Checklist reglamentario
        </p>
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
          {ANNUAL_INSPECTION_CHECKLIST_ROWS.map((row) => (
            <li
              key={row.key}
              className="flex flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap"
            >
              <input
                id={`annual-inspection-${row.key}`}
                type="checkbox"
                checked={checklist[row.key]}
                disabled={disabled}
                onChange={(event) => onChecklistChange(row.key, event.target.checked)}
                className="size-4 shrink-0 rounded border-slate-300"
              />
              <label
                htmlFor={`annual-inspection-${row.key}`}
                className="min-w-0 flex-1 cursor-pointer text-sm text-slate-900 dark:text-white"
              >
                {row.label}
              </label>
              {row.action === 'test-invoice' ? (
                <button
                  type="button"
                  onClick={onSendTestInvoice}
                  disabled={sendingTestInvoice || disabled}
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:opacity-70 dark:border-slate-800 sm:w-auto"
                >
                  {sendingTestInvoice ? 'Enviando…' : 'Enviar Factura de Prueba'}
                </button>
              ) : null}
              {row.action === 'test-credit-note' ? (
                <button
                  type="button"
                  onClick={onSendTestCreditNote}
                  disabled={sendingTestCreditNote || creditNoteDisabled || disabled}
                  title={creditNoteDisabledReason ?? undefined}
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-800 sm:w-auto"
                >
                  {sendingTestCreditNote ? 'Enviando…' : 'Enviar Nota de Crédito de Prueba'}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300"
        >
          {error}
        </p>
      ) : null}

      <div className="border-t border-slate-200 pt-5 dark:border-slate-800">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Paso 1 · Impresora fiscal
        </p>
        <button
          type="button"
          onClick={onSubmitInspection}
          disabled={submittingInspection || disabled}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submittingInspection
            ? 'Registrando en impresora…'
            : 'Paso 1 · Registrar en impresora (SetDateRevO)'}
        </button>
      </div>
    </div>
  );
}
