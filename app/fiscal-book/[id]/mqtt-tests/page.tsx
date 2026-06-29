'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useUserProfile } from '@/app/layout';
import { AnnualInspectionMqttAdminPanel } from '@/components/mqtt/annual-inspection-mqtt-admin-panel';
import { ArrowLeft } from '@/components/icons';
import { canAccessFiscalBookMqttTests } from '@/lib/roles';
import { printerService } from '@/lib/printer-service';

export default function FiscalBookMqttTestsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { profile, loading: authLoading } = useUserProfile();
  const [printer, setPrinter] = useState<
    Awaited<ReturnType<typeof printerService.getPrinterById>>
  >(undefined);
  const [loadingPrinter, setLoadingPrinter] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    const load = async () => {
      setLoadingPrinter(true);
      const row = await printerService.getPrinterById(id);
      setPrinter(row);
      setLoadingPrinter(false);
    };

    void load();
  }, [id, authLoading]);

  if (authLoading || loadingPrinter) {
    return (
      <main className="container mx-auto px-4 py-32 max-w-3xl flex-1 flex flex-col justify-center text-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted font-medium">Cargando datos del equipo…</p>
      </main>
    );
  }

  if (!canAccessFiscalBookMqttTests(profile)) {
    return (
      <main className="container mx-auto px-4 py-12 max-w-3xl flex-1 flex flex-col">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-8 text-center">
          <p className="text-slate-800 dark:text-slate-200 font-semibold mb-4">
            Solo usuarios con rol <strong>administrador</strong> pueden acceder a las pruebas MQTT.
          </p>
          <Link
            href={`/fiscal-book/${id}`}
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
          >
            Volver al libro fiscal
          </Link>
        </div>
      </main>
    );
  }

  if (!printer) {
    return (
      <main className="container mx-auto px-4 py-12 max-w-3xl flex-1">
        <p className="text-center text-muted">No se encontró el equipo fiscal.</p>
        <p className="text-center mt-4">
          <Link href="/" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
            Volver a búsqueda
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl flex-1 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/fiscal-book/${id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Volver al libro fiscal
        </Link>
      </div>

      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Herramientas administrador
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
          Pruebas MQTT — {printer.serial_fiscal}
        </h1>
      </header>

      <AnnualInspectionMqttAdminPanel printer={printer} />
    </main>
  );
}
