export type AnnualInspectionRequest = {
  printerId: number;
  userId: number;
  sealTampered: boolean;
  notes?: string | null;
  photoUrls: string[];
  inspectionDate?: string | null;
};

export type AnnualInspectionResponse = {
  id: number;
  printerId: number;
  userId: number;
};
