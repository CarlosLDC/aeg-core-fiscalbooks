export type LoginRequest = {
  username: string;
  password: string;
  /** Portal destino; el libro fiscal usa FISCAL_BOOK. */
  portal?: 'CORE_ADMIN' | 'FISCAL_BOOK';
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
  userId?: number;
  user_id?: number;
  nationalId?: string;
  national_id?: string;
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
