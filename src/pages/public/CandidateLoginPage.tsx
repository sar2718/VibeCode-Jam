import { Navigate } from "react-router-dom";
import { ROUTES } from "@/app/route-paths";

export function CandidateLoginPage() {
  return <Navigate to={ROUTES.home} replace />;
}
