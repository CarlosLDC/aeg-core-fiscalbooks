export type SealResponse = {
  id: number;
  printerId: number | null;
  serial: string;
  installationDate: string | null;
  removalDate: string | null;
  color: string;
  status: string;
  createdAt: string;
};
