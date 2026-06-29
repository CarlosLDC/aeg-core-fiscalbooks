'use client';

import { useEffect, useState } from 'react';
import { ClipboardCheck, Loader2, Radio } from 'lucide-react';
import {
  ANNUAL_INSPECTION_DEFAULT_PRODUCT,
  applyFailedTestCreditNote,
  applyFailedTestInvoice,
  applyProductDescriptionChange,
  applySuccessfulTestCreditNote,
  applySuccessfulTestInvoice,
  canSendAnnualInspectionTestCreditNote,
  createAnnualInspectionMqttFlowState,
  creditNoteDisabledReason,
  emptyAnnualInspectionChecklist,
  type AnnualInspectionChecklistKey,
  type AnnualInspectionMqttFlowState,
} from '@aeg/annual-inspection-mqtt';
import { AnnualInspectionMqttModal } from '@/components/mqtt/annual-inspection-mqtt-modal';
import { FiscalMqttTopicGuide } from '@/components/mqtt/fiscal-mqtt-topic-guide';
import {
  annualInspectionMqttEligibilityReason,
  isFiscalPrinterEligibleForAnnualInspectionMqtt,
} from '@/lib/printer-mqtt-eligibility';
import {
  getAnnualInspectionMqttErrorMessage,
  requestAnnualInspectionStaInf,
  requestAnnualInspectionTestCreditNote,
  requestAnnualInspectionTestInvoice,
  submitAnnualInspectionMqtt,
} from '@/lib/annual-inspection-mqtt-api';
import { checkMqttConnection } from '@/lib/mqtt-api';
import type { FiscalPrinter } from '@/lib/types';
import type {
  AnnualInspectionStaInfResponse,
  MqttStepTechnicalLog,
} from '@/types/annual-inspection-mqtt';

type AnnualInspectionMqttAdminPanelProps = {
  printer: FiscalPrinter;
};

function stepLabel(step: MqttStepTechnicalLog['step']): string {
  switch (step) {
    case 'sta-inf':
      return 'StaInf';
    case 'test-invoice':
      return 'Factura de prueba';
    case 'test-credit-note':
      return 'Nota de crédito de prueba';
    case 'submit':
      return 'SetDateRevO (submit)';
    default:
      return step;
  }
}

export function AnnualInspectionMqttAdminPanel({ printer }: AnnualInspectionMqttAdminPanelProps) {
  const printerId = Number(printer.id.replace('mock-p-', '').replace('fp-', ''));
  const eligible = isFiscalPrinterEligibleForAnnualInspectionMqtt(printer);
  const eligibilityReason = annualInspectionMqttEligibilityReason(printer);

  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flow, setFlow] = useState<AnnualInspectionMqttFlowState | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [lastStaInf, setLastStaInf] = useState<AnnualInspectionStaInfResponse | null>(null);
  const [technicalLog, setTechnicalLog] = useState<MqttStepTechnicalLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [sendingTestInvoice, setSendingTestInvoice] = useState(false);
  const [sendingTestCreditNote, setSendingTestCreditNote] = useState(false);
  const [submittingInspection, setSubmittingInspection] = useState(false);
  const [brokerStatus, setBrokerStatus] = useState<{
    loading: boolean;
    connected: boolean | null;
    message: string | null;
  }>({ loading: true, connected: null, message: null });

  useEffect(() => {
    let cancelled = false;
    setBrokerStatus({ loading: true, connected: null, message: null });
    void checkMqttConnection()
      .then(({ result }) => {
        if (!cancelled) {
          setBrokerStatus({
            loading: false,
            connected: result.connected,
            message: result.message,
          });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setBrokerStatus({
            loading: false,
            connected: false,
            message: getAnnualInspectionMqttErrorMessage(err),
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function resetFlowState() {
    setFlow(null);
    setModalOpen(false);
    setModalError(null);
    setLastStaInf(null);
    setTechnicalLog([]);
  }

  function appendTechnicalLog(entry: MqttStepTechnicalLog) {
    setTechnicalLog((current) => [...current, entry]);
  }

  async function refreshRegistration(targetPrinterId: number) {
    setRefreshing(true);
    setModalError(null);
    try {
      const result = await requestAnnualInspectionStaInf({ printerId: targetPrinterId });
      setLastStaInf(result);
      appendTechnicalLog({ step: 'sta-inf', result });
      setFlow((current) =>
        current
          ? {
              ...current,
              registroImpresora: result.registroImpresora,
              fiscalSerial: result.fiscalSerial,
            }
          : createAnnualInspectionMqttFlowState({
              registroImpresora: result.registroImpresora,
              fiscalSerial: result.fiscalSerial,
              printerId: targetPrinterId,
              productDescription: ANNUAL_INSPECTION_DEFAULT_PRODUCT,
            }),
      );
      return result;
    } catch (err) {
      const message = getAnnualInspectionMqttErrorMessage(err);
      setModalError(message);
      throw err;
    } finally {
      setRefreshing(false);
    }
  }

  async function handleStartInspection() {
    if (!eligible) {
      setError(eligibilityReason ?? 'La impresora no es apta para inspección anual MQTT.');
      return;
    }

    setStarting(true);
    setError(null);
    resetFlowState();

    try {
      const result = await requestAnnualInspectionStaInf({ printerId });
      setLastStaInf(result);
      appendTechnicalLog({ step: 'sta-inf', result });
      setFlow(
        createAnnualInspectionMqttFlowState({
          registroImpresora: result.registroImpresora,
          fiscalSerial: result.fiscalSerial,
          printerId,
          productDescription: ANNUAL_INSPECTION_DEFAULT_PRODUCT,
        }),
      );
      setModalOpen(true);
    } catch (err) {
      setError(getAnnualInspectionMqttErrorMessage(err));
    } finally {
      setStarting(false);
    }
  }

  function handleChecklistChange(key: AnnualInspectionChecklistKey, checked: boolean) {
    setFlow((current) =>
      current
        ? {
            ...current,
            checklist: {
              ...current.checklist,
              [key]: checked,
            },
          }
        : current,
    );
  }

  async function handleSendTestInvoice() {
    if (!flow) return;

    setSendingTestInvoice(true);
    setModalError(null);
    try {
      const result = await requestAnnualInspectionTestInvoice({
        printerId: flow.printerId,
        productDescription: flow.productDescription.trim() || undefined,
      });
      appendTechnicalLog({ step: 'test-invoice', result });
      setFlow((current) =>
        current ? applySuccessfulTestInvoice(current, result.numeroFacturaPrueba) : current,
      );
    } catch (err) {
      setFlow((current) => (current ? applyFailedTestInvoice(current) : current));
      setModalError(getAnnualInspectionMqttErrorMessage(err));
    } finally {
      setSendingTestInvoice(false);
    }
  }

  async function handleSendTestCreditNote() {
    if (!flow) return;

    setSendingTestCreditNote(true);
    setModalError(null);
    try {
      if (flow.numeroFacturaPrueba == null) {
        throw new Error('Primero envíe la factura de prueba para obtener el número de factura.');
      }
      if (!flow.registroImpresora.trim()) {
        throw new Error('No hay registro de impresora. Use Actualizar o reinicie el flujo.');
      }

      const result = await requestAnnualInspectionTestCreditNote({
        printerId: flow.printerId,
        numeroFacturaPrueba: flow.numeroFacturaPrueba,
        registroImpresora: flow.registroImpresora,
        productDescription: flow.productDescription.trim() || undefined,
      });
      appendTechnicalLog({ step: 'test-credit-note', result });
      setFlow((current) => (current ? applySuccessfulTestCreditNote(current) : current));
    } catch (err) {
      setFlow((current) => (current ? applyFailedTestCreditNote(current) : current));
      setModalError(getAnnualInspectionMqttErrorMessage(err));
    } finally {
      setSendingTestCreditNote(false);
    }
  }

  function handleSubmitInspection() {
    if (!flow) return;

    void (async () => {
      setSubmittingInspection(true);
      setModalError(null);
      try {
        const result = await submitAnnualInspectionMqtt({
          printerId: flow.printerId,
          chkPrecinto: flow.checklist.chkPrecinto,
          chkEtiquetaFiscal: flow.checklist.chkEtiquetaFiscal,
          chkFactura: flow.checklist.chkFactura,
          chkNotaCredito: flow.checklist.chkNotaCredito,
          chkSensorPapel: flow.checklist.chkSensorPapel,
        });
        appendTechnicalLog({ step: 'submit', result });
        setModalOpen(false);
        setFlow(null);
      } catch (err) {
        setModalError(getAnnualInspectionMqttErrorMessage(err));
      } finally {
        setSubmittingInspection(false);
      }
    })();
  }

  return (
    <>
      <AnnualInspectionMqttModal
        open={modalOpen && flow != null}
        registroImpresora={flow?.registroImpresora ?? ''}
        numeroFacturaPrueba={flow?.numeroFacturaPrueba ?? null}
        productDescription={flow?.productDescription ?? ''}
        onProductDescriptionChange={(value) =>
          setFlow((current) => (current ? applyProductDescriptionChange(current, value) : current))
        }
        checklist={flow?.checklist ?? emptyAnnualInspectionChecklist()}
        onChecklistChange={handleChecklistChange}
        onRefresh={() => {
          if (!flow) return;
          void refreshRegistration(flow.printerId);
        }}
        refreshing={refreshing}
        onSendTestInvoice={() => void handleSendTestInvoice()}
        sendingTestInvoice={sendingTestInvoice}
        onSendTestCreditNote={() => void handleSendTestCreditNote()}
        sendingTestCreditNote={sendingTestCreditNote}
        creditNoteDisabled={flow == null || !canSendAnnualInspectionTestCreditNote(flow)}
        creditNoteDisabledReason={creditNoteDisabledReason(flow)}
        onSubmitInspection={handleSubmitInspection}
        submittingInspection={submittingInspection}
        error={modalError}
        onClose={() => setModalOpen(false)}
      />

      <div className="mx-auto max-w-3xl space-y-4">
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-sm text-amber-950 dark:text-amber-100">
          <strong>Pruebas MQTT (administrador).</strong> Este flujo envía comandos a la impresora
          fiscal y no crea un registro en el libro. Para el registro oficial use{' '}
          <strong>Nueva inspección</strong> en la pestaña Inspecciones.
        </div>

        <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <ClipboardCheck className="size-5 text-blue-600" />
              Inspección anual obligatoria (MQTT)
            </h2>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                brokerStatus.loading
                  ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  : brokerStatus.connected
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200'
              }`}
            >
              {brokerStatus.loading ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Radio className="size-3" />
              )}
              {brokerStatus.loading
                ? 'Comprobando broker…'
                : brokerStatus.connected
                  ? 'Broker conectado'
                  : 'Broker no disponible'}
            </span>
          </div>

          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">Serial fiscal</dt>
              <dd className="font-mono font-medium">{printer.serial_fiscal}</dd>
            </div>
            <div>
              <dt className="text-muted">MAC</dt>
              <dd className="font-mono font-medium">{printer.direccion_mac ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted">Estatus</dt>
              <dd className="font-medium capitalize">{printer.estatus}</dd>
            </div>
            <div>
              <dt className="text-muted">Cliente ID</dt>
              <dd className="font-mono">{printer.id_cliente ?? '—'}</dd>
            </div>
          </dl>

          <FiscalMqttTopicGuide
            macAddress={printer.direccion_mac}
            className="mt-4 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 px-3 py-2.5"
          />

          {!eligible && eligibilityReason ? (
            <p role="alert" className="mt-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-sm text-amber-950 dark:text-amber-100">
              {eligibilityReason}
            </p>
          ) : null}

          {error ? (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 px-3 py-2 text-sm text-rose-900 dark:text-rose-100"
            >
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => void handleStartInspection()}
            disabled={starting || !eligible}
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 ${
              starting || !eligible ? 'cursor-not-allowed opacity-70' : ''
            }`}
          >
            {starting ? <Loader2 className="size-4 animate-spin" /> : null}
            Iniciar ritual (StaInf)
          </button>
        </section>

        {lastStaInf ? (
          <section className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4 text-sm">
            <p className="font-medium text-emerald-900 dark:text-emerald-100">Último StaInf</p>
            <dl className="mt-2 space-y-1 text-slate-800 dark:text-slate-200">
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-muted">Registro:</dt>
                <dd className="font-mono">{lastStaInf.registroImpresora}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-muted">Tópico:</dt>
                <dd className="font-mono break-all">{lastStaInf.topic}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-muted">Respuesta code:</dt>
                <dd>{lastStaInf.response.code ?? '—'}</dd>
              </div>
            </dl>
          </section>
        ) : null}

        {technicalLog.length > 0 ? (
          <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Detalle técnico (admin)
            </h3>
            <p className="mt-1 text-xs text-muted">
              Payloads y respuestas crudas de cada paso ejecutado en esta sesión.
            </p>
            <ul className="mt-4 space-y-4">
              {technicalLog.map((entry, index) => (
                <li
                  key={`${entry.step}-${index}`}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-3"
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                    {stepLabel(entry.step)}
                  </p>
                  <p className="mt-1 font-mono text-xs break-all text-muted">
                    {entry.result.topic}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Publicado: {entry.result.publishedAt}
                  </p>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                      commandPayload
                    </summary>
                    <pre className="mt-1 max-h-40 overflow-auto rounded-lg bg-slate-900 p-2 text-[11px] text-slate-100">
                      {entry.result.commandPayload}
                    </pre>
                  </details>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                      response
                    </summary>
                    <pre className="mt-1 max-h-48 overflow-auto rounded-lg bg-slate-900 p-2 text-[11px] text-slate-100">
                      {JSON.stringify(
                        'response' in entry.result ? entry.result.response : entry.result,
                        null,
                        2,
                      )}
                    </pre>
                  </details>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {brokerStatus.message && !brokerStatus.loading ? (
          <p className="text-xs text-muted">{brokerStatus.message}</p>
        ) : null}
      </div>
    </>
  );
}
