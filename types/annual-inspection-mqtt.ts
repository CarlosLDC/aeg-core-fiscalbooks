export type FiscalMqttResponseItem = {
  cmd?: string | null;
  code?: number | null;
  dataD?: number | null;
  dataS?: string | null;
};

export type AnnualInspectionStaInfResponse = {
  registroImpresora: string;
  topic: string;
  fiscalSerial: string;
  macAddress: string;
  commandPayload: string;
  response: FiscalMqttResponseItem;
  publishedAt: string;
};

export type AnnualInspectionTestInvoiceResponse = {
  numeroFacturaPrueba: number;
  topic: string;
  fiscalSerial: string;
  macAddress: string;
  commandPayload: string;
  response: FiscalMqttResponseItem[];
  publishedAt: string;
};

export type AnnualInspectionTestCreditNoteResponse = {
  topic: string;
  fiscalSerial: string;
  macAddress: string;
  commandPayload: string;
  response: FiscalMqttResponseItem[];
  publishedAt: string;
};

export type AnnualInspectionSubmitResponse = {
  dataTimestamp: number;
  inspAo: {
    precinto: string;
    etiqFisc: string;
    impFact: string;
    impNC: string;
    sensPapel: string;
  };
  topic: string;
  fiscalSerial: string;
  macAddress: string;
  commandPayload: string;
  response: FiscalMqttResponseItem;
  publishedAt: string;
};
