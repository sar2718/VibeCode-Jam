import { createBrowserRouter } from "react-router-dom";
import { PublicLayout } from "@/layouts/PublicLayout";
import { CandidateLayout } from "@/layouts/CandidateLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { RoleGuard } from "@/components/common/RoleGuard";
import { LandingPage } from "@/pages/public/LandingPage";
import { CandidateLoginPage } from "@/pages/public/CandidateLoginPage";
import { EmployerLoginPage } from "@/pages/public/EmployerLoginPage";
import { InvitationPage } from "@/pages/public/InvitationPage";
import { CandidateHomePage } from "@/pages/candidate/CandidateHomePage";
import { CandidateSolvePage } from "@/pages/candidate/CandidateSolvePage";
import { CandidateReportPage } from "@/pages/candidate/CandidateReportPage";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { CandidatesListPage } from "@/pages/admin/CandidatesListPage";
import { CandidateDetailPage } from "@/pages/admin/CandidateDetailPage";
import { CreateCandidatePage } from "@/pages/admin/CreateCandidatePage";
import { CreateSectionPage } from "@/pages/admin/CreateSectionPage";
import { SectionsListPage } from "@/pages/admin/SectionsListPage";
import { ResultsPage } from "@/pages/admin/ResultsPage";
import { ReportViewPage } from "@/pages/admin/ReportViewPage";
import { SettingsPage } from "@/pages/admin/SettingsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { AppErrorPage } from "@/pages/AppErrorPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    errorElement: <AppErrorPage />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "candidate-access", element: <CandidateLoginPage /> },
      { path: "admin/login", element: <EmployerLoginPage /> },
      { path: "invite/:hash", element: <InvitationPage /> }
    ]
  },
  {
    path: "/candidate",
    element: (
      <RoleGuard role="candidate">
        <CandidateLayout />
      </RoleGuard>
    ),
    errorElement: <AppErrorPage />,
    children: [
      { index: true, element: <CandidateHomePage /> },
      { path: "session/:sectionId", element: <CandidateSolvePage /> },
      { path: "session/:sectionId/complete", element: <CandidateReportPage /> }
    ]
  },
  {
    path: "/admin",
    element: (
      <RoleGuard role="admin">
        <AdminLayout />
      </RoleGuard>
    ),
    errorElement: <AppErrorPage />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: "candidates", element: <CandidatesListPage /> },
      { path: "candidates/new", element: <CreateCandidatePage /> },
      { path: "candidates/:candidateId", element: <CandidateDetailPage /> },
      { path: "sections", element: <SectionsListPage /> },
      { path: "sections/new", element: <CreateSectionPage /> },
      { path: "results", element: <ResultsPage /> },
      { path: "reports/:sectionId", element: <ReportViewPage /> },
      { path: "settings", element: <SettingsPage /> }
    ]
  },
  {
    path: "*",
    element: <NotFoundPage />
  }
]);
