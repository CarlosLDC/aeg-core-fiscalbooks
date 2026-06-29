'use client';

import {
  ANNUAL_INSPECTION_CHECKLIST_ROWS,
  type AnnualInspectionChecklistKey,
  type AnnualInspectionChecklistState,
} from '@/lib/annual-inspection-mqtt-state';

const CHECKBOX_CLASS =
  'w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer';
const LABEL_CLASS =
  'text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none';

type AnnualInspectionChecklistPanelProps = {
  numeroFacturaPrueba: number | null;
  productDescription: string;
  onProductDescriptionChange: (value: string) => void;
  checklist: AnnualInspectionChecklistState;
  onChecklistChange: (key: AnnualInspectionChecklistKey, checked: boolean) => void;
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
  numeroFacturaPrueba,
  productDescription,
  onProductDescriptionChange,
  checklist,
  onChecklistChange,
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
    <div className="space-y-6">
      {numeroFacturaPrueba != null ? (
        <p className="text-sm ml-1 text-slate-600 dark:text-slate-400">
          <span>Número de factura de prueba:</span>{' '}
          <span className="font-mono font-semibold text-slate-900 dark:text-white">
            {numeroFacturaPrueba}
          </span>
        </p>
      ) : null}

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
          Producto de prueba
        </span>
        <input
          type="text"
          value={productDescription}
          onChange={(event) => onProductDescriptionChange(event.target.value)}
          disabled={disabled}
          className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition-all font-medium text-slate-900 dark:text-white disabled:opacity-70"
        />
      </label>

      <div className="space-y-4">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
          Resultados de inspección
        </p>

        {ANNUAL_INSPECTION_CHECKLIST_ROWS.map((row) => (
          <div key={row.key} className="space-y-2">
            <div className="flex items-center gap-3">
              <input
                id={`annual-inspection-${row.key}`}
                type="checkbox"
                checked={checklist[row.key]}
                disabled={disabled}
                onChange={(event) => onChecklistChange(row.key, event.target.checked)}
                className={CHECKBOX_CLASS}
              />
              <label htmlFor={`annual-inspection-${row.key}`} className={LABEL_CLASS}>
                {row.okLabel}
              </label>
            </div>
            {row.action === 'test-invoice' ? (
              <button
                type="button"
                onClick={onSendTestInvoice}
                disabled={sendingTestInvoice || disabled}
                className="ml-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-70 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {sendingTestInvoice ? 'Enviando…' : 'Enviar factura de prueba'}
              </button>
            ) : null}
            {row.action === 'test-credit-note' ? (
              <button
                type="button"
                onClick={onSendTestCreditNote}
                disabled={sendingTestCreditNote || creditNoteDisabled || disabled}
                title={creditNoteDisabledReason ?? undefined}
                className="ml-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {sendingTestCreditNote ? 'Enviando…' : 'Enviar nota de crédito de prueba'}
              </button>
            ) : null}
          </div>
        ))}
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300"
        >
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={onSubmitInspection}
        disabled={submittingInspection || disabled}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-900"
      >
        {submittingInspection ? 'Registrando en impresora…' : 'Registrar inspección en impresora'}
      </button>
    </div>
  );
}
