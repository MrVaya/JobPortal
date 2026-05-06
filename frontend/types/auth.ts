export type UserRole = "CANDIDATE" | "EMPLOYER" | "ADMIN";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
   emailVerified: boolean;
};

export type LoginPayload = {
  email: string;
  password: string;
};