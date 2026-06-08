import { fetchEmployees } from '@/lib/employees-api';
import { fetchServiceCenters } from '@/lib/service-centers-api';
import { fetchTechnicians } from '@/lib/technicians-api';
import type { UserProfile } from '@/lib/auth-profile';

export type ResolvedTechnicianContext = {
  technicianId: number;
  employeeId: number;
  employeeName: string;
  employeeNationalId: string;
  serviceCenterId: number | null;
  distributorId: number | null;
  companyName: string | null;
  companyRif: string | null;
  branchCity: string | null;
  branchState: string | null;
};

export async function resolveTechnicianForProfile(
  profile: UserProfile,
): Promise<ResolvedTechnicianContext | { message: string }> {
  if (!profile.employeeId) {
    return {
      message:
        'Su perfil no tiene un empleado vinculado. Contacte al administrador para asociar su usuario a un empleado.',
    };
  }

  const [technicians, employees, serviceCenters] = await Promise.all([
    fetchTechnicians(),
    fetchEmployees(),
    fetchServiceCenters(),
  ]);

  const employee = employees.find((e) => e.id === profile.employeeId);
  if (!employee) {
    return {
      message:
        'No figura en el directorio de empleados o no tiene permisos de acceso. Verifique su registro en el sistema.',
    };
  }

  const technician = technicians.find((t) => t.employeeId === employee.id);
  if (!technician) {
    return {
      message:
        'Su empleado no está registrado como técnico. Contacte al administrador del sistema.',
    };
  }

  const branchId = profile.branchId ?? employee.branchId ?? null;
  const serviceCenter =
    branchId != null
      ? serviceCenters.find((sc) => sc.branchId === branchId) ?? null
      : null;

  return {
    technicianId: technician.id,
    employeeId: employee.id,
    employeeName: employee.name,
    employeeNationalId: employee.nationalId,
    serviceCenterId: serviceCenter?.id ?? null,
    distributorId: profile.distributorId,
    companyName: null,
    companyRif: null,
    branchCity: null,
    branchState: null,
  };
}
