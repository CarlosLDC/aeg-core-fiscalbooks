'use client';

import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserProfile } from '@/app/layout';
import { canRegistrarServiciosEInspecciones } from '@/lib/roles';
import { printerService } from '@/lib/printer-service';
import { createAnnualInspection } from '@/lib/annual-inspections-api';
import { messageFromUnknownError } from '@/lib/api-error-message';
import { ArrowLeft } from '@/components/icons';
import { SuccessModal } from '@/components/success-modal';

type InspectorInfo = {
  userId: number;
  userName: string;
  userNationalId: string;
};

export default function NewAnnualInspection({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { profile, authProfile, loading: authLoading } = useUserProfile();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loadingPrinter, setLoadingPrinter] = useState(true);
  const [printer, setPrinter] = useState<Awaited<ReturnType<typeof printerService.getPrinterById>>>(undefined);

  const [observaciones, setObservaciones] = useState('');
  const [precintoViolentado, setPrecintoViolentado] = useState(false);
  const [fechaInspeccion, setFechaInspeccion] = useState('');

  const [successOpen, setSuccessOpen] = useState(false);
  const [successRecordId, setSuccessRecordId] = useState<string | null>(null);

  const inspectorInfo: InspectorInfo | null =
    authProfile?.userId != null
      ? {
          userId: authProfile.userId,
          userName: authProfile.name ?? authProfile.username ?? 'Inspector',
          userNationalId: authProfile.nationalId ?? '',
        }
      : null;

  useEffect(() => {
    if (authLoading) return;

    const load = async () => {
      setLoadingPrinter(true);
      const row = await printerService.getPrinterById(id);
      setPrinter(row);
      setLoadingPrinter(false);
    };

    load();
  }, [id, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const cleanId = Number(id.replace('mock-p-', '').replace('fp-', ''));

      if (!inspectorInfo?.userId || !fechaInspeccion) {
        throw new Error('Todos los campos marcados con (*) son obligatorios según el reglamento.');
      }

      const inspectionDate = new Date(fechaInspeccion);
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      if (inspectionDate > today) {
        throw new Error('La fecha de inspección no puede ser futura.');
      }

      const created = await createAnnualInspection({
        printerId: cleanId,
        userId: inspectorInfo.userId,
        sealTampered: precintoViolentado,
        notes: observaciones || null,
        photoUrls: [],
        inspectionDate: fechaInspeccion,
      });

      setSuccessRecordId(String(created.id));
      setSuccessOpen(true);
    } catch (err: unknown) {
      setError(messageFromUnknownError(err));
    } finally {
      setLoading(false);
    }
  };

  if (!authLoading && profile && !canRegistrarServiciosEInspecciones(profile)) {
    return (
      <main className="container mx-auto px-4 py-12 max-w-3xl flex-1 flex flex-col">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-8 text-center">
          <p className="text-slate-800 dark:text-slate-200 font-semibold mb-4">
            Solo usuarios con rol <strong>técnico</strong> o <strong>administrador</strong> pueden registrar inspecciones en el libro fiscal.
          </p>
          <Link href={`/fiscal-book/${id}`} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
            Volver al libro fiscal
          </Link>
        </div>
      </main>
    );
  }

  if (authLoading || loadingPrinter) {
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
            No se encontró el equipo o no tiene permiso para registrar inspecciones en esta sucursal.
          </p>
          <Link href={`/fiscal-book/${id}`} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
            Volver al libro fiscal
          </Link>
        </div>
      </main>
    );
  }

  if (!inspectorInfo) {
    return (
      <main className="container mx-auto px-4 py-12 max-w-3xl flex-1 flex flex-col">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
          <p className="text-slate-800 dark:text-slate-200 font-semibold mb-2">No se puede registrar la inspección</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
            Su perfil no tiene un usuario vinculado. Contacte al administrador del sistema.
          </p>
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
      ? `?tab=inspection&registro=${encodeURIComponent(rid)}`
      : '?tab=inspection';
    router.push(`/fiscal-book/${id}${q}`);
    router.refresh();
  };

  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl flex-1 flex flex-col">
      <SuccessModal
        open={successOpen}
        title="Inspección registrada"
        message="La inspección anual se guardó correctamente. Podrá verla en el libro fiscal en la pestaña Inspecciones."
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
          Añadir Inspección Anual
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Registra una nueva revisión periódica por parte de inspector.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Inspector Responsable</label>
              <div className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium text-slate-500 dark:text-slate-500">
                {inspectorInfo.userName} (V{inspectorInfo.userNationalId.replace(/-/g, '')})
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Fecha de inspección</label>
            <input
              type="date"
              required
              className="w-full max-w-xs px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition-all font-medium text-slate-900 dark:text-white"
              value={fechaInspeccion}
              onChange={(e) => setFechaInspeccion(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Observaciones / Resultados</label>
            <textarea
              required
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
              placeholder="Describa a detalle las observaciones y resultados de la inspección..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </div>

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
              disabled={loading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? 'Guardando...' : 'Guardar Inspección'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
