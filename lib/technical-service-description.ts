export function mergeTechnicalServiceDescription(
  reportedFailure: string | null | undefined,
  notes: string | null | undefined,
): string {
  const failure = reportedFailure?.trim() ?? '';
  const extra = notes?.trim() ?? '';
  if (!failure) return extra;
  if (!extra || failure === extra) return failure;
  return `${failure}\n\n${extra}`;
}
