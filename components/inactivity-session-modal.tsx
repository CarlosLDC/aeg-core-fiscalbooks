'use client';

import { Modal } from '@/components/modal';
import { formatInactivityCountdown } from '@/lib/inactivity-session';
import { useInactivitySession } from '@/lib/use-inactivity-session';

type InactivitySessionModalProps = {
  enabled: boolean;
  onExpire: () => void;
};

export function InactivitySessionModal({ enabled, onExpire }: InactivitySessionModalProps) {
  const { warningOpen, secondsLeft, stayLoggedIn } = useInactivitySession({
    enabled,
    onExpire,
  });

  return (
    <Modal
      open={warningOpen}
      onClose={stayLoggedIn}
      title="Sesión por inactividad"
      titleId="inactivity-session-title"
      panelClassName="w-full max-w-md"
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={stayLoggedIn}
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700"
          >
            Seguir conectado
          </button>
        </div>
      }
    >
      <div className="space-y-4 text-center">
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          No hemos detectado actividad en los últimos 15 minutos. Su sesión se cerrará
          automáticamente si no responde.
        </p>
        <p
          className="font-mono text-4xl font-black tabular-nums text-slate-900 dark:text-white"
          aria-live="polite"
          aria-atomic="true"
        >
          {formatInactivityCountdown(secondsLeft)}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Pulse «Seguir conectado» o interactúe con la página para mantener la sesión abierta.
        </p>
      </div>
    </Modal>
  );
}
