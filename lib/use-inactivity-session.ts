'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ACTIVITY_STORAGE_KEY,
  INACTIVITY_ACTIVITY_EVENTS,
  INACTIVITY_TIMEOUT_MS,
  INACTIVITY_WARNING_SECONDS,
  getInactivityStatus,
  recordLastActivity,
} from '@/lib/inactivity-session';

type UseInactivitySessionOptions = {
  enabled: boolean;
  onExpire: () => void;
};

export function useInactivitySession({ enabled, onExpire }: UseInactivitySessionOptions) {
  const [warningOpen, setWarningOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(INACTIVITY_WARNING_SECONDS);

  const warningOpenRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastRecordTimeRef = useRef<number>(0);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const clearCountdown = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const clearAllTimers = useCallback(() => {
    clearInactivityTimer();
    clearCountdown();
  }, [clearCountdown, clearInactivityTimer]);

  const closeWarning = useCallback(() => {
    if (!warningOpenRef.current) {
      clearCountdown();
      return;
    }
    warningOpenRef.current = false;
    setWarningOpen(false);
    setSecondsLeft(INACTIVITY_WARNING_SECONDS);
    clearCountdown();
  }, [clearCountdown]);

  const startCountdown = useCallback(
    (initialSeconds?: number) => {
      clearCountdown();
      const sec =
        typeof initialSeconds === 'number' && initialSeconds > 0
          ? initialSeconds
          : INACTIVITY_WARNING_SECONDS;

      setSecondsLeft(sec);
      warningOpenRef.current = true;
      setWarningOpen(true);

      countdownIntervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearAllTimers();
            warningOpenRef.current = false;
            setWarningOpen(false);
            onExpireRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [clearAllTimers, clearCountdown],
  );

  const scheduleIdle = useCallback(
    (delayMs: number = INACTIVITY_TIMEOUT_MS) => {
      clearInactivityTimer();
      inactivityTimerRef.current = setTimeout(() => {
        startCountdown();
      }, Math.max(0, delayMs));
    },
    [clearInactivityTimer, startCountdown],
  );

  const resetIdleTimer = useCallback(
    (forceRecord = false) => {
      if (!enabled) return;

      closeWarning();
      clearInactivityTimer();

      const now = Date.now();
      if (forceRecord || now - lastRecordTimeRef.current >= 1000) {
        recordLastActivity(now);
        lastRecordTimeRef.current = now;
      }

      scheduleIdle(INACTIVITY_TIMEOUT_MS);
    },
    [clearInactivityTimer, closeWarning, enabled, scheduleIdle],
  );

  const evaluateInactivity = useCallback(() => {
    if (!enabled) return;

    const status = getInactivityStatus();

    if (status.isExpired) {
      clearAllTimers();
      closeWarning();
      onExpireRef.current();
      return;
    }

    if (status.isInWarning) {
      clearInactivityTimer();
      if (!warningOpenRef.current) {
        startCountdown(status.warningSecondsLeft);
      }
      return;
    }

    if (status.lastActivity === null) {
      resetIdleTimer(true);
    } else {
      closeWarning();
      scheduleIdle(status.remainingIdleMs);
    }
  }, [
    clearAllTimers,
    clearInactivityTimer,
    closeWarning,
    enabled,
    resetIdleTimer,
    scheduleIdle,
    startCountdown,
  ]);

  const stayLoggedIn = useCallback(() => {
    resetIdleTimer(true);
  }, [resetIdleTimer]);

  useEffect(() => {
    if (!enabled) {
      clearAllTimers();
      if (warningOpenRef.current) {
        closeWarning();
      }
      return;
    }

    const onActivity = () => {
      if (warningOpenRef.current) return;
      resetIdleTimer();
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== ACTIVITY_STORAGE_KEY) return;
      if (!event.newValue) {
        clearAllTimers();
        closeWarning();
        onExpireRef.current();
        return;
      }
      evaluateInactivity();
    };

    const onVisibilityOrFocus = () => {
      evaluateInactivity();
    };

    for (const event of INACTIVITY_ACTIVITY_EVENTS) {
      window.addEventListener(event, onActivity, { passive: true });
    }
    window.addEventListener('storage', onStorage);
    window.addEventListener('visibilitychange', onVisibilityOrFocus);
    window.addEventListener('focus', onVisibilityOrFocus);

    evaluateInactivity();

    return () => {
      for (const event of INACTIVITY_ACTIVITY_EVENTS) {
        window.removeEventListener(event, onActivity);
      }
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('visibilitychange', onVisibilityOrFocus);
      window.removeEventListener('focus', onVisibilityOrFocus);
      clearAllTimers();
      if (warningOpenRef.current) {
        closeWarning();
      }
    };
  }, [
    clearAllTimers,
    closeWarning,
    enabled,
    evaluateInactivity,
    resetIdleTimer,
  ]);

  return {
    warningOpen: enabled && warningOpen,
    secondsLeft,
    stayLoggedIn,
  };
}
