'use client';

import { useState, use, useEffect } from 'react';
import { useUserProfile } from '@/app/layout';
import { canRegistrarServiciosEInspecciones } from '@/lib/roles';
import { printerService } from '@/lib/printer-service';
import type { FiscalPrinter } from '@/lib/types';
import type { SealResponse } from '@/types/seal';
import { createTechnicalService } from '@/lib/technical-services-api';
import { fetchSeals } from '@/lib/seals-api';
import { resolveTechnicianForProfile } from '@/lib/technician-resolver';
import { messageFromUnknownError } from '@/lib/api-error-message';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TimeInput } from '@/components/time-input';
import { ArrowLeft } from '@/components/icons';
import { SuccessModal } from '@/components/success-modal';
import {
  parseLocalDateOnly,
  parseLocalDateTime,
  toIsoUtc,
  diffDaysInclusive,
} from '@/lib/datetime-local';

type TecnicoCentroRow = {
  tecnico_id: number;
  centro_servicio_id: number | null;
  distribuidora_id: number | null;
  empleado_id: number;
  empleado_nombre: string;
  empleado_cedula: string | null;
  empresa_razon_social: string | null;
  empresa_rif: string | null;
  sucursal_ciudad: string | null;
  sucursal_estado: string | null;
};

const MAX_SERVICE_DAYS = 8;

function formatCentroDisplay(r: {
  empresa_razon_social: string | null;
  sucursal_estado: string | null;
  sucursal_ciudad: string | null;
}) {
  const org = r.empresa_razon_social?.trim() || '—';
  const lugar = [r.sucursal_estado, r.sucursal_ciudad]
    .filter((x) => x != null && String(x).trim() !== '')
    .join(', ');
  return lugar ? `${org} — ${lugar}` : org;
}

/** Muestra sede (empresa + ubicación) y si el alta es bajo distribuidora sin centro en BD. */
function formatLugarServicio(r: TecnicoCentroRow) {
  const base = formatCentroDisplay(r);
  if (r.centro_servicio_id != null) return base;
  if (r.distribuidora_id != null) {
    return `${base} — Servicio bajo distribuidora (sin centro de servicio en sucursal)`;
  }
  return base;
}

export default function NewTechnicalService({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { profile, authProfile, loading: authLoading } = useUserProfile();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // View Data
  const [tecnicosData, setTecnicosData] = useState<TecnicoCentroRow[]>([]);
  const [loadingTecnicos, setLoadingTecnicos] = useState(true);
  const [tecnicoLoadError, setTecnicoLoadError] = useState<string | null>(null);
  const [printer, setPrinter] = useState<FiscalPrinter | null>(null);
  const [loadingPrinter, setLoadingPrinter] = useState(true);

  // Form state
  // Foreign Keys (simplified as number inputs for now)
  const [idTecnico, setIdTecnico] = useState('');
  const [idCentroServicio, setIdCentroServicio] = useState('');
  /** Presente cuando el servicio se registra con `servicios_tecnicos.id_distribuidora` (sucursal distribuidora sin `centros_servicio`). */
  const [idDistribuidora, setIdDistribuidora] = useState('');
  const [tecnicoInfo, setTecnicoInfo] = useState<TecnicoCentroRow | null>(null);
  
  // Dates
  const [fechaSolicitud, setFechaSolicitud] = useState('');
  
  const [fechaInicioDate, setFechaInicioDate] = useState('');
  const [fechaInicioTime, setFechaInicioTime] = useState('');

  const [fechaFinDate, setFechaFinDate] = useState('');
  const [fechaFinTime, setFechaFinTime] = useState('');

  const [fechaZInicialDate, setFechaZInicialDate] = useState('');
  const [fechaZInicialTime, setFechaZInicialTime] = useState('');

  const [fechaZFinalDate, setFechaZFinalDate] = useState('');
  const [fechaZFinalTime, setFechaZFinalTime] = useState('');
  
  // Texts & Numbers
  const [fallaReportada, setFallaReportada] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [reporteZInicial, setReporteZInicial] = useState('');
  const [reporteZFinal, setReporteZFinal] = useState('');
  const [costo, setCosto] = useState('');
  
  // Booleans
  const [precintoViolentado, setPrecintoViolentado] = useState(false);
  const [sealReplaced, setSealReplaced] = useState(false);
  const [idPrecintoInstalado, setIdPrecintoInstalado] = useState('');
  const [precintosDisponibles, setPrecintosDisponibles] = useState<SealResponse[]>([]);
  const [loadingPrecintos, setLoadingPrecintos] = useState(false);
  const [idPrecintoActual, setIdPrecintoActual] = useState<number | null>(null);
  const [serialPrecintoActual, setSerialPrecintoActual] = useState<string | null>(null);

  const [successOpen, setSuccessOpen] = useState(false);
  const [successRecordId, setSuccessRecordId] = useState<string | null>(null);

  useEffect(() => {
    if (!printer?.precintos) return;
    const activo = printer.precintos.find((p) => p.estatus === 'en_impresora' as const);
    setIdPrecintoActual(activo ? Number(activo.id) : null);
    setSerialPrecintoActual(activo?.serial ?? null);
  }, [printer]);

  useEffect(() => {
    if (authLoading || !authProfile) return;

    const load = async () => {
      setLoadingTecnicos(true);
      setTecnicoLoadError(null);
      setTecnicoInfo(null);
      setTecnicosData([]);
      setIdTecnico('');
      setIdCentroServicio('');
      setIdDistribuidora('');

      const resolved = await resolveTechnicianForProfile(authProfile);
      if ('message' in resolved) {
        setTecnicoLoadError(resolved.message);
        setLoadingTecnicos(false);
        setLoadingPrinter(false);
        return;
      }

      const row: TecnicoCentroRow = {
        tecnico_id: resolved.technicianId,
        centro_servicio_id: resolved.serviceCenterId,
        distribuidora_id: resolved.distributorId,
        empleado_id: resolved.employeeId,
        empleado_nombre: resolved.employeeName,
        empleado_cedula: resolved.employeeNationalId,
        empresa_razon_social: resolved.companyName,
        empresa_rif: resolved.companyRif,
        sucursal_ciudad: resolved.branchCity,
        sucursal_estado: resolved.branchState,
      };

      setTecnicoInfo(row);
      setIdTecnico(String(row.tecnico_id));
      setIdCentroServicio(
        row.centro_servicio_id != null ? String(row.centro_servicio_id) : '',
      );
      setIdDistribuidora(
        row.distribuidora_id != null ? String(row.distribuidora_id) : '',
      );
      setTecnicosData([row]);
      setLoadingTecnicos(false);

      setLoadingPrinter(true);
      const printerRow = await printerService.getPrinterById(id);
      setPrinter(printerRow ?? null);
      setLoadingPrinter(false);
    };

    load();
  }, [id, authLoading, authProfile]);

  // Auto-fill centro / distribuidora cuando cambia el técnico seleccionado
  useEffect(() => {
    if (idTecnico && tecnicosData.length > 0) {
      const selectedTecnico = tecnicosData.find((t) => t.tecnico_id.toString() === idTecnico);
      if (selectedTecnico?.centro_servicio_id != null) {
        setIdCentroServicio(String(selectedTecnico.centro_servicio_id));
      } else {
        setIdCentroServicio('');
      }
      if (selectedTecnico?.distribuidora_id != null) {
        setIdDistribuidora(String(selectedTecnico.distribuidora_id));
      } else {
        setIdDistribuidora('');
      }
    } else {
      setIdCentroServicio('');
      setIdDistribuidora('');
    }
  }, [idTecnico, tecnicosData]);

  useEffect(() => {
    const fetchPrecintos = async () => {
      if (!sealReplaced) return;

      setLoadingPrecintos(true);
      try {
        const seals = await fetchSeals();
        setPrecintosDisponibles(
          seals
            .filter((s) => s.status === 'disponible')
            .sort((a, b) => a.serial.localeCompare(b.serial)),
        );
      } catch {
        setPrecintosDisponibles([]);
      }
      setLoadingPrecintos(false);
    };

    fetchPrecintos();
  }, [sealReplaced]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const cleanId = Number(id.replace('mock-p-', '').replace('fp-', ''));

      // Strict Validation for NOT NULL fields
      if (!idTecnico || !fechaSolicitud || !fallaReportada ||
          !fechaInicioDate || !fechaInicioTime || !fechaFinDate || !fechaFinTime ||
          !fechaZInicialDate || !fechaZInicialTime || !fechaZFinalDate || !fechaZFinalTime ||
          !reporteZInicial || !reporteZFinal || !costo) {
        throw new Error('Todos los campos marcados con (*) son obligatorios según el reglamento.');
      }

      const numZInicial = parseInt(reporteZInicial, 10);
      const numZFinal = parseInt(reporteZFinal, 10);
      const numCosto = parseFloat(costo);
      const numTecnico = Number(idTecnico);
      const rawCentro = idCentroServicio.trim();
      const rawDist = idDistribuidora.trim();
      const numCentro =
        rawCentro === '' ? null : Number(rawCentro);
      const numDist =
        rawDist === '' ? null : Number(rawDist);

      if (!Number.isFinite(numZInicial) || !Number.isFinite(numZFinal)) {
        throw new Error('Los números de Reporte Z deben ser valores numéricos enteros.');
      }
      if (!Number.isFinite(numCosto) || numCosto < 0) {
        throw new Error('El costo debe ser un número mayor o igual a cero.');
      }
      if (!Number.isFinite(numTecnico) || numTecnico <= 0) {
        throw new Error('Datos de técnico inválidos.');
      }
      const centroOk = numCentro != null && Number.isFinite(numCentro) && numCentro > 0;
      const distOk = numDist != null && Number.isFinite(numDist) && numDist > 0;
      if (!centroOk && !distOk) {
        throw new Error(
          'Debe indicarse un centro de servicio o una distribuidora para el registro (datos del directorio).'
        );
      }
      if (rawCentro !== '' && !centroOk) {
        throw new Error('Identificador de centro de servicio inválido.');
      }
      if (rawDist !== '' && !distOk) {
        throw new Error('Identificador de distribuidora inválido.');
      }

      const solicitud = parseLocalDateOnly(fechaSolicitud, 'Fecha de solicitud');
      if (!solicitud.ok) throw new Error(solicitud.error);

      const inicioSrv = parseLocalDateTime(
        fechaInicioDate,
        fechaInicioTime,
        'Inicio de servicio'
      );
      if (!inicioSrv.ok) throw new Error(inicioSrv.error);

      const finSrv = parseLocalDateTime(fechaFinDate, fechaFinTime, 'Fin de servicio');
      if (!finSrv.ok) throw new Error(finSrv.error);

      const zIni = parseLocalDateTime(
        fechaZInicialDate,
        fechaZInicialTime,
        'Fecha y hora del Reporte Z inicial'
      );
      if (!zIni.ok) throw new Error(zIni.error);

      const zFin = parseLocalDateTime(
        fechaZFinalDate,
        fechaZFinalTime,
        'Fecha y hora del Reporte Z final'
      );
      if (!zFin.ok) throw new Error(zFin.error);

      const start = inicioSrv.value;
      const end = finSrv.value;
      const zStart = zIni.value;
      const zEnd = zFin.value;

      // --- Coherencia temporal del servicio ---
      if (end.getTime() < start.getTime()) {
        throw new Error('La fecha y hora de fin de servicio no puede ser anterior al inicio.');
      }

      const diffDays = diffDaysInclusive(start, end);
      if (diffDays > MAX_SERVICE_DAYS) {
        throw new Error(
          `Un servicio técnico no puede durar más de ${MAX_SERVICE_DAYS} días según el reglamento.`
        );
      }

      // La solicitud no debe ser posterior al fin del servicio
      if (solicitud.value.getTime() > end.getTime()) {
        throw new Error('La fecha de solicitud no puede ser posterior al fin del servicio.');
      }

      // Reportes Z: orden temporal
      if (zEnd.getTime() < zStart.getTime()) {
        throw new Error('La fecha y hora del Reporte Z final no puede ser anterior al Reporte Z inicial.');
      }

      // Reportes Z dentro del período de servicio (inclusive)
      if (zStart.getTime() < start.getTime() || zEnd.getTime() > end.getTime()) {
        throw new Error(
          'Las fechas y horas de los Reportes Z deben estar dentro del período de inicio y fin del servicio.'
        );
      }

      if (numZFinal < numZInicial) {
        throw new Error('El número de Reporte Z final no puede ser menor al inicial.');
      }

      if (sealReplaced && !idPrecintoInstalado) {
        throw new Error('Debe seleccionar el nuevo precinto a instalar.');
      }

      const nuevoPrecintoId = sealReplaced && idPrecintoInstalado
        ? Number(idPrecintoInstalado)
        : null;

      if (nuevoPrecintoId != null) {
        if (idPrecintoActual != null && nuevoPrecintoId === idPrecintoActual) {
          throw new Error('El precinto a instalar no puede ser el mismo que el precinto actual en la impresora.');
        }
        const disponible = precintosDisponibles.some((p) => Number(p.id) === nuevoPrecintoId);
        if (!disponible) {
          throw new Error(
            'El precinto seleccionado ya no está disponible. Actualice la página y elija otro de la lista.',
          );
        }
      }

      const created = await createTechnicalService({
        printerId: cleanId,
        technicianId: numTecnico,
        serviceCenterId: centroOk ? numCentro : null,
        distributorId: distOk ? numDist : null,
        sealTampered: precintoViolentado,
        notes: observaciones || null,
        startAt: toIsoUtc(start),
        endAt: toIsoUtc(end),
        photoUrls: [],
        installedSealId: nuevoPrecintoId,
        removedSealId: idPrecintoActual,
        initialZReport: numZInicial,
        finalZReport: numZFinal,
        cost: numCosto,
        reportedFailure: fallaReportada,
        requestDate: fechaSolicitud.trim(),
        initialZDate: toIsoUtc(zStart),
        finalZDate: toIsoUtc(zEnd),
      });

      setSuccessRecordId(String(created.id));
      setSuccessOpen(true);
    } catch (err: unknown) {
      setError(messageFromUnknownError(err));
    } finally {
      // Siempre: en éxito antes no se llamaba y la UI quedaba en «Guardando…» indefinidamente
      setLoading(false);
    }
  };

  if (!authLoading && profile && !canRegistrarServiciosEInspecciones(profile)) {
    return (
      <main className="container mx-auto px-4 py-12 max-w-3xl flex-1 flex flex-col">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-8 text-center">
          <p className="text-slate-800 dark:text-slate-200 font-semibold mb-4">
            Solo usuarios con rol <strong>técnico</strong> pueden registrar servicios en el libro fiscal.
          </p>
          <Link href={`/fiscal-book/${id}`} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
            Volver al libro fiscal
          </Link>
        </div>
      </main>
    );
  }

  if (authLoading || loadingPrinter || loadingTecnicos) {
    return (
      <main className="container mx-auto px-4 py-32 max-w-3xl flex-1 flex flex-col justify-center text-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted font-medium">Cargando datos del equipo…</p>
      </main>
    );
  }

  if (!printer) {
    return (
      <main className="container mx-auto px-4 py-12 max-w-3xl flex-1 flex flex-col">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
          <p className="text-slate-800 dark:text-slate-200 font-semibold mb-4">
            No se encontró el equipo o no tiene permiso para registrar servicios en esta sucursal.
          </p>
          <Link href={`/fiscal-book/${id}`} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
            Volver al libro fiscal
          </Link>
        </div>
      </main>
    );
  }

  if (tecnicoLoadError) {
    return (
      <main className="container mx-auto px-4 py-12 max-w-3xl flex-1 flex flex-col">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
          <p className="text-slate-800 dark:text-slate-200 font-semibold mb-2">No se puede registrar el servicio</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">{tecnicoLoadError}</p>
          <Link href={`/fiscal-book/${id}`} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
            Volver al libro fiscal
          </Link>
        </div>
      </main>
    );
  }

  const goToLibroTrasExito = () => {
    const rid = successRecordId;
    setSuccessOpen(false);
    setSuccessRecordId(null);
    const q = rid
      ? `?tab=tech&registro=${encodeURIComponent(rid)}`
      : '?tab=tech';
    router.push(`/fiscal-book/${id}${q}`);
    router.refresh();
  };

  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl flex-1 flex flex-col">
      <SuccessModal
        open={successOpen}
        title="Servicio registrado"
        message="El servicio técnico se guardó correctamente. Podrá verlo en el libro fiscal en la pestaña Servicios, en la página del registro creado."
        primaryLabel="Ver en el libro"
        onPrimary={goToLibroTrasExito}
        secondaryLabel="Permanecer aquí"
        onSecondary={() => {
          setSuccessOpen(false);
          setSuccessRecordId(null);
        }}
      />
      <div className="mb-8">
        <Link href={`/fiscal-book/${id}`} className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-4">
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Volver al libro</span>
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
          Añadir Servicio Técnico
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Registra un nuevo mantenimiento correctivo o preventivo.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 uppercase-none"
          aria-disabled={!tecnicoInfo}
        >
          
          {/* Metadatos */}
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Técnico Responsable</label>
              {tecnicoInfo ? (
                <div className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium text-slate-500 dark:text-slate-500">
                  {tecnicoInfo.empleado_nombre} (V{tecnicoInfo.empleado_cedula?.replace(/-/g, '')})
                </div>
              ) : (
                <div className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-medium text-slate-400">
                  Sin datos de técnico
                </div>
              )}
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                Centro de servicio / Distribuidora
              </label>
              <div className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium text-slate-500 dark:text-slate-500">
                {tecnicoInfo
                  ? formatLugarServicio(tecnicoInfo)
                  : idCentroServicio
                    ? (() => {
                        const selected = tecnicosData.find(
                          (t) =>
                            t.centro_servicio_id != null &&
                            String(t.centro_servicio_id) === idCentroServicio
                        );
                        return selected ? formatLugarServicio(selected) : `Centro #${idCentroServicio}`;
                      })()
                    : idDistribuidora
                      ? (() => {
                          const selected = tecnicosData.find(
                            (t) =>
                              t.distribuidora_id != null &&
                              String(t.distribuidora_id) === idDistribuidora
                          );
                          return selected
                            ? formatLugarServicio(selected)
                            : `Distribuidora #${idDistribuidora}`;
                        })()
                      : '—'}
              </div>
            </div>
          </div>

          <div className="border-b border-slate-100 dark:border-slate-800" />

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Fecha de Solicitud</label>
              <input
                type="date"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition-all font-medium text-slate-900 dark:text-white [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                value={fechaSolicitud}
                onChange={(e) => setFechaSolicitud(e.target.value)}
              />
            </div>
            <div />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 lg:col-span-1">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Inicio de Servicio</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  required
                  className="w-2/3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition-all font-medium text-slate-900 dark:text-white [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                  value={fechaInicioDate}
                  onChange={(e) => setFechaInicioDate(e.target.value)}
                />
                <TimeInput
                  required
                  value={fechaInicioTime}
                  onChange={(e) => setFechaInicioTime(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-4 lg:col-span-1">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Fin de Servicio</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  required
                  className="w-2/3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition-all font-medium text-slate-900 dark:text-white [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                  value={fechaFinDate}
                  onChange={(e) => setFechaFinDate(e.target.value)}
                />
                <TimeInput
                  required
                  value={fechaFinTime}
                  onChange={(e) => setFechaFinTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Reporte Z y Fechas Z */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Reporte Z Inicial Column */}
            <div className="flex flex-col gap-2">
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Reporte Z Inicial</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 dark:text-slate-500 font-bold">#</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition-all font-medium font-mono text-slate-900 dark:text-white placeholder:text-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="000123"
                    value={reporteZInicial}
                    onChange={(e) => setReporteZInicial(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  required
                  className="w-2/3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition-all font-medium text-slate-900 dark:text-white [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                  value={fechaZInicialDate}
                  onChange={(e) => setFechaZInicialDate(e.target.value)}
                />
                <TimeInput
                  required
                  value={fechaZInicialTime}
                  onChange={(e) => setFechaZInicialTime(e.target.value)}
                />
              </div>
            </div>

            {/* Reporte Z Final Column */}
            <div className="flex flex-col gap-2">
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Reporte Z Final</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 dark:text-slate-500 font-bold">#</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition-all font-medium font-mono text-slate-900 dark:text-white placeholder:text-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="000124"
                    value={reporteZFinal}
                    onChange={(e) => setReporteZFinal(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  required
                  className="w-2/3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition-all font-medium text-slate-900 dark:text-white [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                  value={fechaZFinalDate}
                  onChange={(e) => setFechaZFinalDate(e.target.value)}
                />
                <TimeInput
                  required
                  value={fechaZFinalTime}
                  onChange={(e) => setFechaZFinalTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="border-b border-slate-100 dark:border-slate-800" />

          {/* Detalles del Servicio */}
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Costo Total</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-400 dark:text-slate-500 font-bold">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition-all font-medium font-mono text-slate-900 dark:text-white placeholder:text-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0.00"
                  value={costo}
                  onChange={(e) => setCosto(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Falla Reportada</label>
              <textarea
                required
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
                placeholder="Describa la falla reportada o motivo del servicio..."
                value={fallaReportada}
                onChange={(e) => setFallaReportada(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Observaciones (Opcional)</label>
              <textarea
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
                placeholder="Cualquier observación adicional de lo realizado..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="precinto_violentado"
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                checked={precintoViolentado}
                onChange={(e) => setPrecintoViolentado(e.target.checked)}
              />
              <label htmlFor="precinto_violentado" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                ¿Se encontró el precinto violentado?
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="seal_replaced"
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                checked={sealReplaced}
                onChange={(e) => setSealReplaced(e.target.checked)}
              />
              <label htmlFor="seal_replaced" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                ¿Se reemplazó el precinto?
              </label>
            </div>

            {sealReplaced && (
              <div className="pl-8 pt-2 animate-in slide-in-from-left-2 duration-200 space-y-4">
                {serialPrecintoActual && (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm">
                    <span className="text-amber-700 dark:text-amber-400 font-medium">
                      Precinto actual a retirar:
                    </span>
                    <span className="font-mono font-bold text-amber-900 dark:text-amber-200">{serialPrecintoActual}</span>
                    <span className="text-amber-500 dark:text-amber-500 text-xs">(pasará a sustituido)</span>
                  </div>
                )}
                {!serialPrecintoActual && !idPrecintoActual && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                    Este equipo no tiene precinto activo registrado. Solo se instalará el nuevo.
                  </p>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 block">Nuevo Precinto a Instalar (*)</label>
                  <select
                    required={sealReplaced}
                    className="w-full max-w-md px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition-all font-medium text-slate-900 dark:text-white appearance-none"
                    value={idPrecintoInstalado}
                    onChange={(e) => setIdPrecintoInstalado(e.target.value)}
                    disabled={loadingPrecintos}
                  >
                    <option value="" disabled>
                      {loadingPrecintos ? 'Cargando precintos disponibles...' : 'Seleccione un precinto disponible...'}
                    </option>
                    {precintosDisponibles.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.serial} ({p.color})
                      </option>
                    ))}
                  </select>
                  {precintosDisponibles.length === 0 && !loadingPrecintos && (
                    <p className="text-xs text-amber-600 font-medium">No hay precintos con estatus «disponible». Registre uno primero.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          )}

          <div className="pt-4 flex items-center justify-end gap-3">
            <Link
              href={`/fiscal-book/${id}`}
              className="px-6 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading || !tecnicoInfo}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? 'Guardando...' : 'Guardar Servicio'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
