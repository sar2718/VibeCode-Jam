import type { UserRole } from "@/types/common";

export interface AuthSession {
  role: UserRole;
  userId: string;
  fullName: string;
  activeSectionId?: string;
  invitationHash?: string;
}

export interface DemoCredentials {
  login: string;
  password: string;
}
