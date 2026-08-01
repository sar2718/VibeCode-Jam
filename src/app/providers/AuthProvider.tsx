import { createContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { readAuthSession, writeAuthSession } from "@/services/storage.service";
import type { AuthSession, DemoCredentials } from "@/types/auth";
import type { UserRole } from "@/types/common";
import {
  loginAdmin as loginAdminService,
  loginByInvitation as loginByInvitationService,
  loginCandidate as loginCandidateService,
  logout as logoutService
} from "@/services/auth.service";

interface AuthContextValue {
  session: AuthSession | null;
  isAuthenticated: boolean;
  loginCandidate: (credentials: DemoCredentials) => Promise<void>;
  loginAdmin: (credentials: DemoCredentials) => Promise<void>;
  loginByInvitation: (hash: string) => Promise<void>;
  logout: () => Promise<void>;
  setActiveSectionId: (sectionId?: string) => void;
  hasRole: (role: UserRole) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => readAuthSession());

  useEffect(() => {
    setSession(readAuthSession());
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: !!session,
      async loginCandidate(credentials) {
        const nextSession = await loginCandidateService(credentials);
        setSession(nextSession);
      },
      async loginAdmin(credentials) {
        const nextSession = await loginAdminService(credentials);
        setSession(nextSession);
      },
      async loginByInvitation(hash) {
        const nextSession = await loginByInvitationService(hash);
        setSession(nextSession);
      },
      async logout() {
        await logoutService();
        setSession(null);
      },
      setActiveSectionId(sectionId) {
        if (!session || session.activeSectionId === sectionId) {
          return;
        }

        const nextSession: AuthSession = {
          ...session,
          activeSectionId: sectionId
        };

        writeAuthSession(nextSession);
        setSession(nextSession);
      },
      hasRole(role) {
        return session?.role === role;
      }
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
