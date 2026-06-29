'use client';

import { useState } from 'react';
import { AnnualInspectionChecklistPanel } from '@/components/fiscal-book/annual-inspection-checklist-panel';
import {
  getAnnualInspectionMqttErrorMessage,
  requestAnnualInspectionStaInf,
  requestAnnualInspectionTestCreditNote,
  requestAnnualInspectionTestInvoice,
  submitAnnualInspectionMqtt,
} from '@/lib/annual-inspection-mqtt-api';
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
  type AnnualInspectionChecklistKey,
  type AnnualInspectionMqttCompletion,
  type AnnualInspectionMqttFlowState,
} from '@/lib/annual-inspection-mqtt-state';

type AnnualInspectionMqttSectionProps = {
  printerId: number;
  fiscalSerial: string;
  onMqttCompleted: (completion: AnnualInspectionMqttCompletion) => void;
};

export function AnnualInspectionMqttSection({
  printerId,
  onMqttCompleted,
}: AnnualInspectionMqttSectionProps) {
  const [flow, setFlow] = useState<AnnualInspectionMqttFlowState | null>(null);
  const [sectionError, setSectionError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [sendingTestInvoice, setSendingTestInvoice] = useState(false);
  const [sendingTestCreditNote, setSendingTestCreditNote] = useState(false);
  const [submittingInspection, setSubmittingInspection] = useState(false);
  const [mqttCompleted, setMqttCompleted] = useState(false);

  async function handleStartInspection() {
    setStarting(true);
    setSectionError(null);
    setMqttCompleted(false);
    setFlow(null);

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
    } catch (err) {
      setSectionError(getAnnualInspectionMqttErrorMessage(err));
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
    setSectionError(null);
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
      setSectionError(getAnnualInspectionMqttErrorMessage(err));
    } finally {
      setSendingTestInvoice(false);
    }
  }

  async function handleSendTestCreditNote() {
    if (!flow) return;
    setSendingTestCreditNote(true);
    setSectionError(null);
    try {
      if (flow.numeroFacturaPrueba == null) {
        throw new Error('Primero envíe la factura de prueba para obtener el número de factura.');
      }
      if (!flow.registroImpresora.trim()) {
        throw new Error('No hay registro de impresora. Reinicie el flujo consultando la impresora.');
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
      setSectionError(getAnnualInspectionMqttErrorMessage(err));
    } finally {
      setSendingTestCreditNote(false);
    }
  }

  async function handleSubmitInspection() {
    if (!flow) return;
    setSubmittingInspection(true);
    setSectionError(null);
    try {
      const result = await submitAnnualInspectionMqtt({
        printerId: flow.printerId,
        chkPrecinto: flow.checklist.chkPrecinto,
        chkEtiquetaFiscal: flow.checklist.chkEtiquetaFiscal,
        chkFactura: flow.checklist.chkFactura,
        chkNotaCredito: flow.checklist.chkNotaCredito,
        chkSensorPapel: flow.checklist.chkSensorPapel,
      });
      setMqttCompleted(true);
      onMqttCompleted({
        checklist: flow.checklist,
        registroImpresora: flow.registroImpresora,
        numeroFacturaPrueba: flow.numeroFacturaPrueba,
        mqttSetDateRevOTimestamp: result.dataTimestamp,
      });
    } catch (err) {
      setSectionError(getAnnualInspectionMqttErrorMessage(err));
    } finally {
      setSubmittingInspection(false);
    }
  }

  return (
    <section className="space-y-4">
      {mqttCompleted ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
          Inspección registrada en la impresora. Ya puede guardar el registro.
        </p>
      ) : null}

      {sectionError && !flow ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300"
        >
          {sectionError}
        </p>
      ) : null}

      {!flow && !mqttCompleted ? (
        <button
          type="button"
          onClick={() => void handleStartInspection()}
          disabled={starting}
          className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-900"
        >
          {starting ? 'Consultando impresora…' : 'Consultar registro de impresora'}
        </button>
      ) : null}

      {flow && !mqttCompleted ? (
        <AnnualInspectionChecklistPanel
          numeroFacturaPrueba={flow.numeroFacturaPrueba}
          productDescription={flow.productDescription}
          onProductDescriptionChange={(value) =>
            setFlow((current) => (current ? applyProductDescriptionChange(current, value) : current))
          }
          checklist={flow.checklist}
          onChecklistChange={handleChecklistChange}
          onSendTestInvoice={() => void handleSendTestInvoice()}
          sendingTestInvoice={sendingTestInvoice}
          onSendTestCreditNote={() => void handleSendTestCreditNote()}
          sendingTestCreditNote={sendingTestCreditNote}
          creditNoteDisabled={!canSendAnnualInspectionTestCreditNote(flow)}
          creditNoteDisabledReason={creditNoteDisabledReason(flow)}
          onSubmitInspection={() => void handleSubmitInspection()}
          submittingInspection={submittingInspection}
          error={sectionError}
        />
      ) : null}
    </section>
  );
}
