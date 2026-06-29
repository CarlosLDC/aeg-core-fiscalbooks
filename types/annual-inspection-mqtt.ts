import type {
  AnnualInspectionStaInfResponse,
  AnnualInspectionSubmitResponse,
  AnnualInspectionTestCreditNoteResponse,
  AnnualInspectionTestInvoiceResponse,
} from '@aeg/annual-inspection-mqtt';

export type {
  AnnualInspectionMqttCompletion,
  AnnualInspectionStaInfResponse,
  AnnualInspectionSubmitResponse,
  AnnualInspectionTestCreditNoteResponse,
  AnnualInspectionTestInvoiceResponse,
  FiscalMqttResponseItem,
} from '@aeg/annual-inspection-mqtt';

export type MqttConnectionProbeResult = {
  success: boolean;
  connected: boolean;
  broker: string;
  durationMs: number;
  message: string;
};

export type MqttStepTechnicalLog =
  | { step: 'sta-inf'; result: AnnualInspectionStaInfResponse }
  | { step: 'test-invoice'; result: AnnualInspectionTestInvoiceResponse }
  | { step: 'test-credit-note'; result: AnnualInspectionTestCreditNoteResponse }
  | { step: 'submit'; result: AnnualInspectionSubmitResponse };
