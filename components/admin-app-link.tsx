import { ExternalLinkIcon } from '@/components/icons';

export const ADMIN_APP_URL = 'https://aeg-admin.tech';

type AdminAppLinkProps = {
  variant?: 'header' | 'panel';
};

const baseClasses =
  'transition-colors border border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900/60';

export function AdminAppLink({ variant = 'header' }: AdminAppLinkProps) {
  if (variant === 'panel') {
    return (
      <a
        href={ADMIN_APP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`group mt-8 flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 ${baseClasses}`}
      >
        <span>Ir a AEG Admin</span>
        <ExternalLinkIcon
          size={15}
          className="shrink-0 text-slate-400 transition-colors group-hover:text-indigo-500 dark:group-hover:text-indigo-400"
        />
      </a>
    );
  }

  return (
    <a
      href={ADMIN_APP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 md:px-3 md:text-sm ${baseClasses}`}
    >
      <span>AEG Admin</span>
      <ExternalLinkIcon
        size={12}
        className="text-slate-400 transition-colors group-hover:text-indigo-500 dark:group-hover:text-indigo-400"
      />
    </a>
  );
}
