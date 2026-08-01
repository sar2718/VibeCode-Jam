import { Navigate } from "react-router-dom";
import { ROUTES } from "@/app/route-paths";

export function CreateCandidatePage() {
  return <Navigate to={`${ROUTES.admin.candidates}?create=1`} replace />;
}
