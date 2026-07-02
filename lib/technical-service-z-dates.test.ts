import { describe, expect, it } from 'vitest';
import {
  formatZReportDateOnly,
  formatZReportTimestamp,
  isoToMqttZReportUnix,
  manualZReportDateToIso,
  mqttZReportUnixToIso,
  parseManualZReportDate,
} from '@/lib/technical-service-z-dates';

describe('technical-service-z-dates', () => {
  it('parses manual Z report date at local midnight', () => {
    const parsed = parseManualZReportDate('2026-06-15', 'Reporte Z inicial');
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.getHours()).toBe(0);
    expect(parsed.value.getMinutes()).toBe(0);
    expect(manualZReportDateToIso(parsed.value)).toMatch(/2026-06-15T/);
  });

  it('round-trips mqtt unix timestamps', () => {
    const unix = 1_718_000_000;
    const iso = mqttZReportUnixToIso(unix);
    expect(isoToMqttZReportUnix(iso)).toBe(unix);
  });

  it('formats manual dates without time and mqtt values with time', () => {
    const manual = manualZReportDateToIso(new Date(2026, 5, 15, 0, 0, 0, 0));
    expect(formatZReportTimestamp(manual)).not.toMatch(/\d{1,2}:\d{2}/);

    const mqttIso = mqttZReportUnixToIso(1_718_000_000);
    expect(formatZReportTimestamp(mqttIso)).toMatch(/\d{2}:\d{2}:\d{2}$/);
  });

  it('formats Z report dates without time', () => {
    const manual = manualZReportDateToIso(new Date(2026, 5, 30, 0, 0, 0, 0));
    expect(formatZReportDateOnly(manual)).toBe('2026-06-30');

    const mqttIso = mqttZReportUnixToIso(1_718_000_000);
    expect(formatZReportDateOnly(mqttIso)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(formatZReportDateOnly(mqttIso)).not.toMatch(/:/);
  });
});
