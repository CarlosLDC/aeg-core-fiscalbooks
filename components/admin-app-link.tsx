import { ExternalLinkIcon } from '@/components/icons';

export const ADMIN_APP_URL = 'https://aeg-admin.tech';

type AdminAppLinkProps = {
  variant?: 'header' | 'panel';
};

export function AdminAppLink({ variant = 'header' }: AdminAppLinkProps) {
  if (variant === 'panel') {
    return (
      <a
        href={ADMIN_APP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-8 flex items-center gap-4 rounded-2xl border border-indigo-200/70 bg-gradient-to-r from-indigo-50 via-white to-violet-50 p-4 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md dark:border-indigo-500/25 dark:from-indigo-950/40 dark:via-slate-900 dark:to-violet-950/40 dark:hover:border-indigo-400/35"
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-md shadow-indigo-500/25">
          AEG
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block text-sm font-semibold text-slate-900 dark:text-white">
            Ir a AEG Admin
          </span>
          <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
            Panel de administración y operaciones
          </span>
        </span>
        <ExternalLinkIcon
          size={18}
          className="shrink-0 text-indigo-500 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 dark:text-indigo-400"
        />
      </a>
    );
  }

  return (
    <a
      href={ADMIN_APP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-gradient-to-r from-indigo-50 to-violet-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm transition-all hover:border-indigo-300 hover:from-indigo-100 hover:to-violet-100 hover:shadow-md md:px-3.5 md:py-2 md:text-sm dark:border-indigo-500/30 dark:from-indigo-950/60 dark:to-violet-950/60 dark:text-indigo-300 dark:hover:border-indigo-400/40 dark:hover:from-indigo-900/70 dark:hover:to-violet-900/70"
    >
      <span className="flex size-5 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-[9px] font-bold tracking-tight text-white shadow-sm md:size-6 md:text-[10px]">
        AEG
      </span>
      <span>Admin</span>
      <ExternalLinkIcon
        size={14}
        className="opacity-70 transition-transform group-hover:-translate-y-px group-hover:translate-x-px group-hover:opacity-100"
      />
    </a>
  );
}
