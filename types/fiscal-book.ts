export type FiscalBookSearchResponse = {
  items: FiscalBookSummaryResponse[];
  total: number;
  page: number;
  pageSize: number;
};

export type FiscalBookSummaryResponse = {
  id: number;
  fiscalSerial: string;
  businessName: string | null;
  rif: string | null;
  status: string | null;
  distributorId: number | null;
};

export type FiscalBookDetailResponse = {
  id: number;
  fiscalSerial: string;
  status: string;
  deviceType: string;
  finalSalePrice: number | null;
  paid: boolean;
  versionFirmware: string | null;
  macAddress: string | null;
  createdAt: string | null;
  installationDate: string | null;
  modelId: number | null;
  softwareId: number | null;
  clientId: number | null;
  distributorId: number | null;
  businessName: string | null;
  rif: string | null;
  taxpayerType: string | null;
  address: string | null;
  branch: FiscalBookBranchResponse | null;
  model: FiscalBookModelResponse | null;
  software: FiscalBookSoftwareResponse | null;
  distributor: FiscalBookDistributorResponse | null;
  seals: FiscalBookSealResponse[];
  technicalServices: FiscalBookTechnicalServiceResponse[];
  annualInspections: FiscalBookAnnualInspectionResponse[];
};

export type FiscalBookBranchResponse = {
  id: number;
  companyId: number;
  city: string;
  state: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  isClient: boolean;
  isDistributor: boolean;
  isServiceCenter: boolean;
  company: FiscalBookCompanyResponse | null;
};

export type FiscalBookCompanyResponse = {
  id: number;
  businessName: string;
  rif: string;
  contributorType: string;
};

export type FiscalBookModelResponse = {
  id: number;
  brand: string;
  modelCode: string;
  providencia: string | null;
  approvalDate: string | null;
  price: number;
};

export type FiscalBookSoftwareResponse = {
  id: number;
  name: string;
  version: string;
  createdAt: string;
};

export type FiscalBookDistributorResponse = {
  id: number;
  branch: FiscalBookBranchResponse | null;
};

export type FiscalBookSealResponse = {
  id: number;
  printerId: number | null;
  serial: string;
  color: string;
  status: string;
  createdAt: string;
  installationDate: string | null;
  removalDate: string | null;
};

export type FiscalBookTechnicalServiceResponse = {
  id: number;
  createdAt: string;
  requestDate: string;
  serviceCenter: string | null;
  centerRif: string | null;
  technician: string | null;
  technicianNationalId: string | null;
  reportedFailure: string;
  startAt: string;
  endAt: string;
  initialZReport: number;
  finalZReport: number;
  initialZDate: string;
  finalZDate: string;
  sealTampered: boolean;
  installedSealId: number | null;
  removedSealId: number | null;
  installedSealSerial: string | null;
  removedSealSerial: string | null;
  notes: string | null;
  cost: number;
  photoUrls: string[];
};

export type FiscalBookAnnualInspectionResponse = {
  id: number;
  createdAt: string;
  inspectionDate: string;
  serviceCenter: string | null;
  centerRif: string | null;
  inspector: string | null;
  sealTampered: boolean;
  notes: string | null;
  photoUrls: string[];
  mqttRegistroImpresora?: string | null;
  mqttSetDateRevOAt?: number | null;
  mqttNumeroFacturaPrueba?: number | null;
  chkPrecinto?: boolean | null;
  chkEtiquetaFiscal?: boolean | null;
  chkFactura?: boolean | null;
  chkNotaCredito?: boolean | null;
  chkSensorPapel?: boolean | null;
};
