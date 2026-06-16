import { fetchEmployees } from '@/lib/employees-api';
import { toNumber, toStringOrNull } from '@/lib/api-contract';
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

  const employee = employees.find((e) => toNumber(e.id) === profile.employeeId);
  if (!employee) {
    return {
      message:
        'No figura en el directorio de empleados o no tiene permisos de acceso. Verifique su registro en el sistema.',
    };
  }

  const employeeId = toNumber(employee.id);
  const technician = technicians.find(
    (t) =>
      (toNumber(t.employeeId) ??
        toNumber((t as { employee_id?: unknown }).employee_id) ??
        toNumber((t as { employee?: { id?: unknown } }).employee?.id)) === employeeId,
  );
  if (!technician) {
    return {
      message:
        'Su empleado no está registrado como técnico. Contacte al administrador del sistema.',
    };
  }

  const branchId =
    profile.branchId ??
    toNumber(employee.branchId) ??
    toNumber((employee as { branch_id?: unknown }).branch_id) ??
    null;
  const serviceCenter =
    branchId != null
      ? serviceCenters.find(
          (sc) =>
            (toNumber(sc.branchId) ??
              toNumber((sc as { branch_id?: unknown }).branch_id)) === branchId,
        ) ?? null
      : null;

  return {
    technicianId: toNumber(technician.id) ?? 0,
    employeeId: employeeId ?? 0,
    employeeName:
      toStringOrNull(employee.name) ??
      toStringOrNull((employee as { fullName?: unknown }).fullName) ??
      toStringOrNull(employee.email) ??
      'Técnico',
    employeeNationalId:
      toStringOrNull(employee.nationalId) ??
      toStringOrNull((employee as { national_id?: unknown }).national_id) ??
      '',
    serviceCenterId: serviceCenter ? toNumber(serviceCenter.id) : null,
    distributorId: profile.distributorId,
    companyName: null,
    companyRif: null,
    branchCity: null,
    branchState: null,
  };
}
