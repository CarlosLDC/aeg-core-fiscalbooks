export type EmployeeResponse = {
  id: number;
  nationalId: string;
  name: string;
  phone: string;
  email: string;
  createdAt: string;
  type: string;
  companyId: number;
  branchId?: number | null;
  reviewStatus: string;
  activeModificationRequestId: number | null;
};

export type TechnicianResponse = {
  id: number;
  employeeId: number;
  createdAt: string;
};

export type ServiceCenterResponse = {
  id: number;
  branchId: number;
  createdAt: string;
};
