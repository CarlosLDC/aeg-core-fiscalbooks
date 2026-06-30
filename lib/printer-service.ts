import {
  fetchFiscalBookByPrinterId,
  searchFiscalBooks,
} from '@/lib/fiscal-books-api';
import { toBooleanOrNull, toNumber, toStringOrNull } from '@/lib/api-contract';
import {
  AnnualInspection,
  FiscalPrinter,
  TechnicalReview,
} from '@/lib/types';
import type {
  FiscalBookAnnualInspectionResponse,
  FiscalBookDetailResponse,
  FiscalBookSummaryResponse,
  FiscalBookTechnicalServiceResponse,
} from '@/types/fiscal-book';

export type GetPrinterByIdOptions = {
  /** Compatibilidad: el backend aplica el alcance por rol JWT. */
  restrictToDistribuidoraId?: number | null;
};

function cleanPrinterId(id: string): number {
  const raw = id.replace('mock-p-', '').replace('fp-', '');
  return Number(raw);
}

function pick(source: unknown, ...keys: string[]): unknown {
  if (!source || typeof source !== 'object') return undefined;
  const record = source as Record<string, unknown>;
  for (const key of keys) {
    if (record[key] !== undefined) return record[key];
  }
  return undefined;
}

function pickString(source: unknown, ...keys: string[]): string | null {
  return toStringOrNull(pick(source, ...keys));
}

function pickNumber(source: unknown, ...keys: string[]): number | null {
  return toNumber(pick(source, ...keys));
}

function pickBoolean(source: unknown, ...keys: string[]): boolean | null {
  return toBooleanOrNull(pick(source, ...keys));
}

function mapSummaryToFiscalPrinter(
  item: FiscalBookSummaryResponse,
): FiscalPrinter {
  const id = pickNumber(item, 'id', 'printerId', 'printer_id') ?? item.id;
  const distributorId =
    pickNumber(item, 'distributorId', 'distributor_id', 'distribuidoraId') ??
    item.distributorId;
  return {
    id: String(id),
    id_modelo_impresora: '',
    id_sucursal: null,
    id_distribuidor: distributorId != null ? String(distributorId) : null,
    id_cliente: null,
    id_compra: null,
    id_software: null,
    id_firmware: null,
    serial_fiscal:
      pickString(item, 'fiscalSerial', 'fiscal_serial', 'serialFiscal') ??
      item.fiscalSerial,
    estatus: (item.status as FiscalPrinter['estatus']) ?? 'asignada',
    precio_venta_final: null,
    se_pago: null,
    tipo_dispositivo: 'interno',
    businessName:
      pickString(item, 'businessName', 'business_name', 'razonSocial', 'razon_social') ??
      item.businessName,
    rif: pickString(item, 'rif', 'taxId', 'tax_id') ?? item.rif,
    taxpayerType: null,
    address: null,
    precintos: [],
    technicalReviews: [],
    annualInspections: [],
  };
}

function mapDetailToFiscalPrinter(detail: FiscalBookDetailResponse): FiscalPrinter {
  const branch = detail.branch;
  const company = branch?.company ?? null;
  const distributorId =
    pickNumber(detail, 'distributorId', 'distributor_id', 'distribuidoraId') ??
    detail.distributorId;
  const branchId = pickNumber(branch, 'id', 'branchId', 'branch_id') ?? branch?.id;
  const modelId = pickNumber(detail, 'modelId', 'model_id') ?? detail.modelId;
  const softwareId = pickNumber(detail, 'softwareId', 'software_id') ?? detail.softwareId;

  const technicalServices =
    (pick(detail, 'technicalServices', 'technical_services', 'services') as
      | FiscalBookTechnicalServiceResponse[]
      | undefined) ?? detail.technicalServices;
  const inspections =
    (pick(detail, 'annualInspections', 'annual_inspections', 'inspections') as
      | FiscalBookAnnualInspectionResponse[]
      | undefined) ?? detail.annualInspections;

  const technicalReviews: TechnicalReview[] = (technicalServices ?? []).map(mapTechnicalService);
  const annualInspections: AnnualInspection[] = (inspections ?? []).map(mapAnnualInspection);

  return {
    id: String(detail.id),
    serial_fiscal:
      pickString(detail, 'fiscalSerial', 'fiscal_serial', 'serialFiscal') ??
      detail.fiscalSerial,
    estatus:
      (pickString(detail, 'status', 'estatus') as FiscalPrinter['estatus']) ??
      'asignada',
    tipo_dispositivo:
      (pickString(detail, 'deviceType', 'device_type', 'tipoDispositivo') as
        | FiscalPrinter['tipo_dispositivo']
        | null) ?? 'interno',
    precio_venta_final:
      pickNumber(detail, 'finalSalePrice', 'final_sale_price', 'precioVentaFinal'),
    se_pago: pickBoolean(detail, 'paid', 'sePago', 'se_pago'),
    registro_fiscal: null,
    version_firmware:
      pickString(detail, 'versionFirmware', 'version_firmware', 'firmwareVersion') ??
      detail.versionFirmware,
    created_at: pickString(detail, 'createdAt', 'created_at') ?? detail.createdAt,
    fecha_instalacion:
      pickString(detail, 'installationDate', 'installation_date') ??
      detail.installationDate,
    direccion_mac: pickString(detail, 'macAddress', 'mac_address') ?? detail.macAddress,
    clientId: pickNumber(detail, 'clientId', 'client_id') ?? detail.clientId,
    id_modelo_impresora: modelId != null ? String(modelId) : '',
    id_sucursal: branchId != null ? String(branchId) : null,
    id_distribuidor: distributorId != null ? String(distributorId) : null,
    id_cliente: pickNumber(detail, 'clientId', 'client_id') ?? detail.clientId ?? null,
    id_compra: null,
    id_software: softwareId != null ? String(softwareId) : null,
    id_firmware: null,
    businessName:
      pickString(detail, 'businessName', 'business_name', 'razonSocial', 'razon_social') ??
      company?.businessName ??
      null,
    rif: pickString(detail, 'rif', 'taxId', 'tax_id') ?? company?.rif ?? null,
    taxpayerType:
      pickString(detail, 'taxpayerType', 'taxpayer_type', 'contributorType') ??
      company?.contributorType ??
      null,
    address: pickString(detail, 'address', 'direccion') ?? detail.address ?? null,
    sucursal: branch
      ? {
          id: branch.id,
          id_empresa: branch.companyId,
          ciudad: branch.city ?? '',
          estado: branch.state ?? '',
          direccion: branch.address ?? null,
          telefono: branch.phone ?? null,
          correo: branch.email ?? null,
          es_cliente: branch.isClient ?? false,
          es_distribuidora: branch.isDistributor ?? false,
          es_centro_servicio: branch.isServiceCenter ?? false,
          company: company
            ? {
                id: company.id,
                razon_social: company.businessName ?? '',
                rif: company.rif ?? '',
                tipo_contribuyente: company.contributorType ?? '',
              }
            : {
                id: 0,
                razon_social: '',
                rif: '',
                tipo_contribuyente: '',
              },
        }
      : null,
    modelo: detail.model
      ? {
          id: detail.model.id,
          marca: detail.model.brand ?? 'AEG',
          codigo_modelo: detail.model.modelCode ?? '',
          providencia: detail.model.providencia ?? null,
          fecha_homologacion: detail.model.approvalDate ?? null,
          precio: detail.model.price != null ? Number(detail.model.price) : 0,
        }
      : null,
    software: detail.software
      ? {
          id: detail.software.id,
          nombre: detail.software.name ?? '',
          version: detail.software.version ?? '',
          created_at: detail.software.createdAt ?? '',
        }
      : null,
    firmware: null,
    distribuidora: detail.distributor
      ? {
          id: detail.distributor.id,
          sucursal: detail.distributor.branch
            ? {
                id: detail.distributor.branch.id,
                ciudad: detail.distributor.branch.city ?? '',
                estado: detail.distributor.branch.state ?? '',
                direccion: detail.distributor.branch.address ?? null,
                telefono: detail.distributor.branch.phone ?? null,
                correo: detail.distributor.branch.email ?? null,
                company: detail.distributor.branch.company
                  ? {
                      id: detail.distributor.branch.company.id,
                      razon_social: detail.distributor.branch.company.businessName ?? '',
                      rif: detail.distributor.branch.company.rif ?? '',
                      tipo_contribuyente:
                        detail.distributor.branch.company.contributorType ?? '',
                    }
                  : { id: 0, razon_social: '', rif: '', tipo_contribuyente: '' },
              }
            : null,
        }
      : null,
    precintos: (detail.seals ?? []).map((p) => ({
      id: String(p.id),
      id_impresora: p.printerId,
      serial: p.serial,
      color: p.color,
      estatus: p.status as 'disponible' | 'en_impresora' | 'sustituido',
      created_at: p.createdAt,
      fecha_instalacion: p.installationDate,
      fecha_retiro: p.removalDate,
    })),
    technicalReviews,
    annualInspections,
  };
}

function mapTechnicalService(s: FiscalBookTechnicalServiceResponse): TechnicalReview {
  const failure =
    pickString(s, 'reportedFailure', 'reported_failure', 'description', 'descripcion') ??
    s.reportedFailure ??
    '';
  const startAt = pickString(s, 'startAt', 'start_at') ?? s.startAt;
  const endAt = pickString(s, 'endAt', 'end_at') ?? s.endAt;
  const createdAt = pickString(s, 'createdAt', 'created_at') ?? s.createdAt;
  const photoUrls =
    (pick(s, 'photoUrls', 'photo_urls', 'urlFotos') as string[] | undefined) ??
    s.photoUrls ??
    [];
  return {
    id: String(s.id),
    createdAt: createdAt ?? null,
    fechaSolicitud:
      pickString(s, 'requestDate', 'request_date', 'fechaSolicitud') ??
      s.requestDate ??
      null,
    serviceCenter:
      pickString(s, 'serviceCenter', 'service_center', 'centroServicio') ??
      s.serviceCenter,
    centerRif: pickString(s, 'centerRif', 'center_rif') ?? s.centerRif,
    technician: pickString(s, 'technician', 'tecnico') ?? s.technician,
    technicianId:
      pickString(s, 'technicianNationalId', 'technician_national_id', 'technicianId') ??
      s.technicianNationalId,
    interventionType: failure.toLowerCase().includes('mantenimiento')
      ? 'Mantenimiento Preventivo'
      : 'Reparacion General',
    startDate: startAt ? startAt.split('T')[0] : null,
    endDate: endAt ? endAt.split('T')[0] : null,
    date: startAt ? startAt.split('T')[0] : (createdAt?.split('T')[0] ?? null),
    startTime: startAt ? startAt.split('T')[1]?.substring(0, 5) : null,
    endTime: endAt ? endAt.split('T')[1]?.substring(0, 5) : null,
    zReportStart:
      pickNumber(s, 'initialZReport', 'initial_z_report') != null
        ? String(pickNumber(s, 'initialZReport', 'initial_z_report'))
        : null,
    zReportTimestampStart:
      pickString(s, 'initialZDate', 'initial_z_date') ?? s.initialZDate ?? null,
    zReportEnd:
      pickNumber(s, 'finalZReport', 'final_z_report') != null
        ? String(pickNumber(s, 'finalZReport', 'final_z_report'))
        : null,
    zReportTimestampEnd:
      pickString(s, 'finalZDate', 'final_z_date') ?? s.finalZDate ?? null,
    sealBroken: pickBoolean(s, 'sealTampered', 'seal_tampered') ?? false,
    sealReplaced: pickNumber(s, 'installedSealId', 'installed_seal_id') != null,
    currentSealSerial:
      pickString(s, 'removedSealSerial', 'removed_seal_serial') ??
      s.removedSealSerial ??
      null,
    newSealSerial:
      pickString(s, 'installedSealSerial', 'installed_seal_serial') ??
      s.installedSealSerial ??
      null,
    description: failure,
    observaciones: pickString(s, 'notes', 'observations', 'observaciones') ?? s.notes ?? null,
    costo: pickNumber(s, 'cost', 'costo'),
    urlFotos: photoUrls,
    partsReplaced: [],
  };
}

function mapAnnualInspection(i: FiscalBookAnnualInspectionResponse): AnnualInspection {
  const inspectionDate =
    pickString(i, 'inspectionDate', 'inspection_date', 'date', 'fechaInspeccion') ??
    i.inspectionDate;
  const createdAt = pickString(i, 'createdAt', 'created_at') ?? i.createdAt;
  const photoUrls =
    (pick(i, 'photoUrls', 'photo_urls', 'urlFotos') as string[] | undefined) ??
    i.photoUrls ??
    [];
  const dateStr = inspectionDate ?? createdAt?.split('T')[0] ?? null;
  const fechaFin = inspectionDate ? new Date(inspectionDate) : null;
  const passed =
    fechaFin != null && !isNaN(fechaFin.getTime()) ? fechaFin <= new Date() : false;

  return {
    id: String(i.id),
    createdAt: createdAt ?? null,
    date: dateStr,
    serviceCenter:
      pickString(i, 'serviceCenter', 'service_center', 'centroServicio') ??
      i.serviceCenter,
    centerRif: pickString(i, 'centerRif', 'center_rif') ?? i.centerRif,
    inspector: pickString(i, 'inspector', 'employee', 'inspectorName') ?? i.inspector,
    observations:
      pickString(i, 'notes', 'observations', 'observaciones') ?? i.notes ?? null,
    status: passed ? 'passed' : 'pending',
    precintoViolentado: pickBoolean(i, 'sealTampered', 'seal_tampered') ?? false,
    startTime: null,
    endTime: null,
    urlFotos: photoUrls,
    mqttRegistroImpresora:
      pickString(i, 'mqttRegistroImpresora', 'mqtt_registro_impresora') ??
      i.mqttRegistroImpresora ??
      null,
    mqttSetDateRevOAt:
      pickNumber(i, 'mqttSetDateRevOAt', 'mqtt_set_date_rev_o_at') ??
      i.mqttSetDateRevOAt ??
      null,
    mqttNumeroFacturaPrueba:
      pickNumber(i, 'mqttNumeroFacturaPrueba', 'mqtt_numero_factura_prueba') ??
      i.mqttNumeroFacturaPrueba ??
      null,
    chkPrecinto:
      pickBoolean(i, 'chkPrecinto', 'chk_precinto') ?? i.chkPrecinto ?? null,
    chkEtiquetaFiscal:
      pickBoolean(i, 'chkEtiquetaFiscal', 'chk_etiqueta_fiscal') ??
      i.chkEtiquetaFiscal ??
      null,
    chkFactura: pickBoolean(i, 'chkFactura', 'chk_factura') ?? i.chkFactura ?? null,
    chkNotaCredito:
      pickBoolean(i, 'chkNotaCredito', 'chk_nota_credito') ?? i.chkNotaCredito ?? null,
    chkSensorPapel:
      pickBoolean(i, 'chkSensorPapel', 'chk_sensor_papel') ?? i.chkSensorPapel ?? null,
    mqttQrCodigo:
      pickString(i, 'mqttQrCodigo', 'mqtt_qr_codigo') ?? i.mqttQrCodigo ?? null,
    mqttQrRegistro:
      pickString(i, 'mqttQrRegistro', 'mqtt_qr_registro') ?? i.mqttQrRegistro ?? null,
    mqttQrMac: pickString(i, 'mqttQrMac', 'mqtt_qr_mac') ?? i.mqttQrMac ?? null,
    mqttQrFecha:
      pickString(i, 'mqttQrFecha', 'mqtt_qr_fecha') ?? i.mqttQrFecha ?? null,
  };
}

export const printerService = {
  getPrinterById: async (
    id: string,
    _options?: GetPrinterByIdOptions,
  ): Promise<FiscalPrinter | undefined> => {
    const printerId = cleanPrinterId(id);
    if (!Number.isFinite(printerId) || printerId <= 0) return undefined;

    try {
      const detail = await fetchFiscalBookByPrinterId(printerId);
      return mapDetailToFiscalPrinter(detail);
    } catch (error) {
      console.error('Error loading fiscal book detail:', error);
      return undefined;
    }
  },

  searchPrinters: async (
    query: string,
    page: number = 1,
    pageSize: number = 10,
    _opts?: { distribuidoraId?: number | null },
  ): Promise<{ data: FiscalPrinter[]; count: number }> => {
    const result = await searchFiscalBooks(query, page, pageSize);
    return {
      data: result.items.map(mapSummaryToFiscalPrinter),
      count: result.total,
    };
  },

  searchByRif: async function (
    rif: string,
    page: number = 1,
    pageSize: number = 10,
    _opts?: { distribuidoraId?: number | null },
  ): Promise<{ data: FiscalPrinter[]; count: number }> {
    return this.searchPrinters(rif, page, pageSize);
  },
};
