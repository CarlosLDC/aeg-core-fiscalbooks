export type LoginRequest = {
  username: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
};

export type JwtPayload = {
  sub?: string;
  username?: string;
  preferred_username?: string;
  email?: string;
  userName?: string;
  user_name?: string;
  exp?: number;
  iat?: number;
  role?: string;
  userRole?: string;
  user_role?: string;
  branchId?: number;
  branch_id?: number;
  distributorId?: number;
  distributor_id?: number;
  employeeId?: number;
  employee_id?: number;
  authorities?: string[];
  roles?: string[];
  scope?: string[] | string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
