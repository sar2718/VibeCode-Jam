import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/app/route-paths";
import type { UserRole } from "@/types/common";

export function RoleGuard({
  role,
  children
}: {
  role: UserRole;
  children: ReactNode;
}) {
  const { session } = useAuth();

  if (!session) {
    return <Navigate to={role === "admin" ? ROUTES.adminLogin : ROUTES.candidateAccess} replace />;
  }

  if (session.role !== role) {
    return <Navigate to={session.role === "admin" ? ROUTES.admin.root : ROUTES.candidate.root} replace />;
  }

  return <>{children}</>;
}
