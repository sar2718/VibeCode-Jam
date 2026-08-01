export const ROUTES = {
  home: "/",
  candidateAccess: "/candidate-access",
  adminLogin: "/admin/login",
  invitation: "/invite/:hash",
  invitationByHash: (hash: string) => `/invite/${hash}`,
  candidate: {
    root: "/candidate",
    session: (sectionId: string) => `/candidate/session/${sectionId}`,
    complete: (sectionId: string) => `/candidate/session/${sectionId}/complete`
  },
  admin: {
    root: "/admin",
    candidates: "/admin/candidates",
    createCandidate: "/admin/candidates/new",
    candidate: (candidateId: string) => `/admin/candidates/${candidateId}`,
    sections: "/admin/sections",
    createSection: "/admin/sections/new",
    results: "/admin/results",
    report: (sectionId: string) => `/admin/reports/${sectionId}`,
    settings: "/admin/settings"
  }
} as const;
