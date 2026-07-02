'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  INACTIVITY_ACTIVITY_EVENTS,
  INACTIVITY_TIMEOUT_MS,
  INACTIVITY_WARNING_SECONDS,
} from '@/lib/inactivity-session';

type UseInactivitySessionOptions = {
  enabled: boolean;
  onExpire: () => void;
};

export function useInactivitySession({ enabled, onExpire }: UseInactivitySessionOptions) {
  const [warningOpen, setWarningOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(INACTIVITY_WARNING_SECONDS);

  const lastActivityRef = useRef(Date.now());
  const warningOpenRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const startCountdown = useCallback(() => {
    clearCountdown();
    setSecondsLeft(INACTIVITY_WARNING_SECONDS);
    countdownIntervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearCountdown();
          clearInactivityTimer();
          warningOpenRef.current = false;
          setWarningOpen(false);
          onExpireRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearCountdown, clearInactivityTimer]);

  const openWarning = useCallback(() => {
    clearInactivityTimer();
    warningOpenRef.current = true;
    setWarningOpen(true);
    startCountdown();
  }, [clearInactivityTimer, startCountdown]);

  const scheduleInactivityCheck = useCallback(() => {
    clearInactivityTimer();
    if (!enabled || warningOpenRef.current) return;

    const elapsed = Date.now() - lastActivityRef.current;
    const remaining = Math.max(0, INACTIVITY_TIMEOUT_MS - elapsed);

    inactivityTimerRef.current = setTimeout(() => {
      openWarning();
    }, remaining);
  }, [clearInactivityTimer, enabled, openWarning]);

  const stayLoggedIn = useCallback(() => {
    lastActivityRef.current = Date.now();
    warningOpenRef.current = false;
    setWarningOpen(false);
    clearCountdown();
    setSecondsLeft(INACTIVITY_WARNING_SECONDS);
    scheduleInactivityCheck();
  }, [clearCountdown, scheduleInactivityCheck]);

  const registerActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (warningOpenRef.current) {
      stayLoggedIn();
      return;
    }
    scheduleInactivityCheck();
  }, [scheduleInactivityCheck, stayLoggedIn]);

  useEffect(() => {
    if (!enabled) {
      clearInactivityTimer();
      clearCountdown();
      warningOpenRef.current = false;
      setWarningOpen(false);
      setSecondsLeft(INACTIVITY_WARNING_SECONDS);
      return;
    }

    lastActivityRef.current = Date.now();
    scheduleInactivityCheck();

    const onActivity = () => {
      registerActivity();
    };

    for (const event of INACTIVITY_ACTIVITY_EVENTS) {
      window.addEventListener(event, onActivity, { passive: true });
    }

    return () => {
      clearInactivityTimer();
      clearCountdown();
      for (const event of INACTIVITY_ACTIVITY_EVENTS) {
        window.removeEventListener(event, onActivity);
      }
    };
  }, [
    clearCountdown,
    clearInactivityTimer,
    enabled,
    registerActivity,
    scheduleInactivityCheck,
  ]);

  return {
    warningOpen,
    secondsLeft,
    stayLoggedIn,
  };
}
