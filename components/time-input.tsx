'use client';

import { useRef, type MouseEvent } from 'react';

interface TimeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  focusClassName?: string;
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function openTimePicker(input: HTMLInputElement | null) {
  if (!input || input.disabled) return;
  input.focus();
  if (typeof input.showPicker !== 'function') return;
  try {
    input.showPicker();
  } catch {
    // Algunos navegadores exigen un gesto de usuario directo en el input.
  }
}

export function TimeInput({ className, focusClassName = "focus:border-blue-500", onClick, ...props }: TimeInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputClick = (event: MouseEvent<HTMLInputElement>) => {
    onClick?.(event);
    openTimePicker(event.currentTarget);
  };

  return (
    <div className={`relative flex-1 ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <ClockIcon />
      </div>
      <input
        ref={inputRef}
        type="time"
        {...props}
        onClick={handleInputClick}
        className={`time-input-field w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none transition-all font-medium text-slate-900 dark:text-white cursor-pointer ${focusClassName}`}
      />
    </div>
  );
}
