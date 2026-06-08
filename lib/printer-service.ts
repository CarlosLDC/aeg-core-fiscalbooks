import {
  fetchFiscalBookByPrinterId,
  searchFiscalBooks,
} from '@/lib/fiscal-books-api';
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

function mapSummaryToFiscalPrinter(
  item: FiscalBookSummaryResponse,
): FiscalPrinter {
  return {
    id: String(item.id),
    id_modelo_impresora: '',
    id_sucursal: null,
    id_distribuidor: item.distributorId != null ? String(item.distributorId) : null,
    id_compra: null,
    id_software: null,
    id_firmware: null,
    serial_fiscal: item.fiscalSerial,
    estatus: (item.status as FiscalPrinter['estatus']) ?? 'asignada',
    precio_venta_final: null,
    se_pago: null,
    tipo_dispositivo: 'interno',
    businessName: item.businessName,
    rif: item.rif,
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

  const technicalReviews: TechnicalReview[] = (detail.technicalServices ?? []).map(
    mapTechnicalService,
  );
  const annualInspections: AnnualInspection[] = (detail.annualInspections ?? []).map(
    mapAnnualInspection,
  );

  return {
    id: String(detail.id),
    serial_fiscal: detail.fiscalSerial,
    estatus: (detail.status as FiscalPrinter['estatus']) ?? 'asignada',
    tipo_dispositivo: (detail.deviceType as FiscalPrinter['tipo_dispositivo']) ?? 'interno',
    precio_venta_final: detail.finalSalePrice != null ? Number(detail.finalSalePrice) : null,
    se_pago: detail.paid ?? null,
    registro_fiscal: null,
    version_firmware: detail.versionFirmware ?? null,
    created_at: detail.createdAt ?? null,
    fecha_instalacion: detail.installationDate ?? null,
    direccion_mac: detail.macAddress ?? null,
    id_modelo_impresora: detail.modelId != null ? String(detail.modelId) : '',
    id_sucursal: branch?.id != null ? String(branch.id) : null,
    id_distribuidor: detail.distributorId != null ? String(detail.distributorId) : null,
    id_compra: null,
    id_software: detail.softwareId != null ? String(detail.softwareId) : null,
    id_firmware: null,
    businessName: detail.businessName ?? company?.businessName ?? null,
    rif: detail.rif ?? company?.rif ?? null,
    taxpayerType: detail.taxpayerType ?? company?.contributorType ?? null,
    address: detail.address ?? null,
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
  const failure = s.reportedFailure ?? '';
  return {
    id: String(s.id),
    createdAt: s.createdAt ?? null,
    fechaSolicitud: s.requestDate ?? null,
    serviceCenter: s.serviceCenter,
    centerRif: s.centerRif,
    technician: s.technician,
    technicianId: s.technicianNationalId,
    interventionType: failure.toLowerCase().includes('mantenimiento')
      ? 'Mantenimiento Preventivo'
      : 'Reparacion General',
    startDate: s.startAt ? s.startAt.split('T')[0] : null,
    endDate: s.endAt ? s.endAt.split('T')[0] : null,
    date: s.startAt ? s.startAt.split('T')[0] : (s.createdAt?.split('T')[0] ?? null),
    startTime: s.startAt ? s.startAt.split('T')[1]?.substring(0, 5) : null,
    endTime: s.endAt ? s.endAt.split('T')[1]?.substring(0, 5) : null,
    zReportStart: s.initialZReport != null ? String(s.initialZReport) : null,
    zReportTimestampStart: s.initialZDate ?? null,
    zReportEnd: s.finalZReport != null ? String(s.finalZReport) : null,
    zReportTimestampEnd: s.finalZDate ?? null,
    sealBroken: s.sealTampered ?? false,
    sealReplaced: !!s.installedSealId,
    currentSealSerial: s.removedSealSerial ?? null,
    newSealSerial: s.installedSealSerial ?? null,
    description: failure,
    observaciones: s.notes ?? null,
    costo: s.cost != null ? Number(s.cost) : null,
    urlFotos: s.photoUrls ?? [],
    partsReplaced: [],
  };
}

function mapAnnualInspection(i: FiscalBookAnnualInspectionResponse): AnnualInspection {
  const dateStr = i.inspectionDate ?? i.createdAt?.split('T')[0] ?? null;
  const fechaFin = i.inspectionDate ? new Date(i.inspectionDate) : null;
  const passed =
    fechaFin != null && !isNaN(fechaFin.getTime()) ? fechaFin <= new Date() : false;

  return {
    id: String(i.id),
    createdAt: i.createdAt ?? null,
    date: dateStr,
    serviceCenter: i.serviceCenter,
    centerRif: i.centerRif,
    inspector: i.inspector,
    observations: i.notes ?? null,
    status: passed ? 'passed' : 'pending',
    precintoViolentado: i.sealTampered ?? false,
    startTime: null,
    endTime: null,
    urlFotos: i.photoUrls ?? [],
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
    } catch {
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
