'use client';

import { useState } from 'react';
import { AnnualInspectionMqttModal } from '@/components/fiscal-book/annual-inspection-mqtt-modal';
import {
  getAnnualInspectionMqttErrorMessage,
  requestAnnualInspectionStaInf,
  requestAnnualInspectionTestCreditNote,
  requestAnnualInspectionTestInvoice,
  submitAnnualInspectionMqtt,
} from '@/lib/annual-inspection-mqtt-api';
import {
  FISCAL_MQTT_COMANDO_RESPUESTA_GUIDE,
  FISCAL_MQTT_TOPIC_SUFFIX,
} from '@/lib/fiscal-mqtt-topics';
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
  type AnnualInspectionChecklistState,
  type AnnualInspectionMqttFlowState,
} from '@/lib/annual-inspection-mqtt-state';

type AnnualInspectionMqttSectionProps = {
  printerId: number;
  fiscalSerial: string;
  onMqttCompleted: (checklist: AnnualInspectionChecklistState) => void;
};

export function AnnualInspectionMqttSection({
  printerId,
  fiscalSerial,
  onMqttCompleted,
}: AnnualInspectionMqttSectionProps) {
  const [flow, setFlow] = useState<AnnualInspectionMqttFlowState | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sendingTestInvoice, setSendingTestInvoice] = useState(false);
  const [sendingTestCreditNote, setSendingTestCreditNote] = useState(false);
  const [submittingInspection, setSubmittingInspection] = useState(false);
  const [mqttCompleted, setMqttCompleted] = useState(false);

  async function refreshRegistration() {
    setRefreshing(true);
    setModalError(null);
    try {
      const result = await requestAnnualInspectionStaInf({ printerId });
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
              printerId,
              productDescription: ANNUAL_INSPECTION_DEFAULT_PRODUCT,
            }),
      );
    } catch (err) {
      setModalError(getAnnualInspectionMqttErrorMessage(err));
      throw err;
    } finally {
      setRefreshing(false);
    }
  }

  async function handleStartInspection() {
    setStarting(true);
    setModalError(null);
    setMqttCompleted(false);
    setFlow(null);
    setModalOpen(false);

    try {
      const result = await requestAnnualInspectionStaInf({ printerId });
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
      setModalError(getAnnualInspectionMqttErrorMessage(err));
    } finally {
      setStarting(false);
    }
  }

  function handleChecklistChange(key: AnnualInspectionChecklistKey, checked: boolean) {
    setFlow((current) =>
      current
        ? {
            ...current,
            checklist: { ...current.checklist, [key]: checked },
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
      await requestAnnualInspectionTestCreditNote({
        printerId: flow.printerId,
        numeroFacturaPrueba: flow.numeroFacturaPrueba,
        registroImpresora: flow.registroImpresora,
        productDescription: flow.productDescription.trim() || undefined,
      });
      setFlow((current) => (current ? applySuccessfulTestCreditNote(current) : current));
    } catch (err) {
      setFlow((current) => (current ? applyFailedTestCreditNote(current) : current));
      setModalError(getAnnualInspectionMqttErrorMessage(err));
    } finally {
      setSendingTestCreditNote(false);
    }
  }

  async function handleSubmitInspection() {
    if (!flow) return;
    setSubmittingInspection(true);
    setModalError(null);
    try {
      await submitAnnualInspectionMqtt({
        printerId: flow.printerId,
        chkPrecinto: flow.checklist.chkPrecinto,
        chkEtiquetaFiscal: flow.checklist.chkEtiquetaFiscal,
        chkFactura: flow.checklist.chkFactura,
        chkNotaCredito: flow.checklist.chkNotaCredito,
        chkSensorPapel: flow.checklist.chkSensorPapel,
      });
      setMqttCompleted(true);
      onMqttCompleted(flow.checklist);
      setModalOpen(false);
    } catch (err) {
      setModalError(getAnnualInspectionMqttErrorMessage(err));
    } finally {
      setSubmittingInspection(false);
    }
  }

  return (
    <section className="space-y-3 rounded-2xl border border-blue-200 bg-blue-50/60 p-5 dark:border-blue-900/40 dark:bg-blue-950/20">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Inspección anual obligatoria (MQTT)
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Paso 1: consulta StaInf en la impresora. Pasos 2–5: checklist, pruebas fiscales y
          SetDateRevO en la impresora.
        </p>
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
          {FISCAL_MQTT_COMANDO_RESPUESTA_GUIDE}{' '}
          <span className="font-mono">
            /{'{mac}'}
            {FISCAL_MQTT_TOPIC_SUFFIX.COMANDO}
          </span>
          {' · '}
          <span className="font-mono">
            /{'{mac}'}
            {FISCAL_MQTT_TOPIC_SUFFIX.RESPUESTA}
          </span>
        </p>
      </div>

      {mqttCompleted ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
          Inspección registrada en la impresora fiscal. Complete el formulario del libro y
          guarde el registro.
        </p>
      ) : null}

      {modalError && !modalOpen ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300"
        >
          {modalError}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => void handleStartInspection()}
        disabled={starting || mqttCompleted}
        className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
      >
        {starting ? 'Consultando impresora…' : 'Inspección Anual Obligatoria'}
      </button>

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
        onRefresh={() => void refreshRegistration()}
        refreshing={refreshing}
        onSendTestInvoice={() => void handleSendTestInvoice()}
        sendingTestInvoice={sendingTestInvoice}
        onSendTestCreditNote={() => void handleSendTestCreditNote()}
        sendingTestCreditNote={sendingTestCreditNote}
        creditNoteDisabled={flow == null || !canSendAnnualInspectionTestCreditNote(flow)}
        creditNoteDisabledReason={creditNoteDisabledReason(flow)}
        onSubmitInspection={() => void handleSubmitInspection()}
        submittingInspection={submittingInspection}
        error={modalError}
        onClose={() => setModalOpen(false)}
      />
    </section>
  );
}
