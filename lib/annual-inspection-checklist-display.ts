import type { AnnualInspection } from '@/lib/types';
import {
  hasAnnualInspectionMqttAudit,
  formatMqttSetDateRevOAt,
} from '@/lib/annual-inspection-mqtt-display';
import {
  ANNUAL_INSPECTION_CHECKLIST_ROWS,
  formatChecklistItemValue,
  hasPersistedChecklist,
  type AnnualInspectionChecklistKey,
} from '@/lib/annual-inspection-mqtt-state';

function checklistValue(
  inspection: AnnualInspection,
  key: AnnualInspectionChecklistKey,
): boolean | null {
  const value = inspection[key];
  if (value != null) return value;
  if (key === 'chkPrecinto' && inspection.precintoViolentado != null) {
    return !inspection.precintoViolentado;
  }
  return null;
}

export function hasAnnualInspectionChecklistDisplay(
  inspection: AnnualInspection,
): boolean {
  return (
    hasPersistedChecklist(inspection) ||
    inspection.precintoViolentado != null ||
    hasAnnualInspectionMqttAudit(inspection)
  );
}

export function annualInspectionChecklistRows(inspection: AnnualInspection) {
  return ANNUAL_INSPECTION_CHECKLIST_ROWS.map((row) => ({
    label: row.label,
    value: formatChecklistItemValue(row.key, checklistValue(inspection, row.key)),
  }));
}

export { hasAnnualInspectionMqttAudit, formatMqttSetDateRevOAt };
