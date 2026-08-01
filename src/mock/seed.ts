import { buildMockCandidates } from "@/mock/candidates";
import { buildMockSections } from "@/mock/sections";
import { buildMockTasks } from "@/mock/tasks";
import { buildMockResults } from "@/mock/results";
import { buildMockReports } from "@/mock/reports";
import { buildMockSettings } from "@/mock/settings";

export function buildMockDatabase() {
  return {
    candidates: buildMockCandidates(),
    sections: buildMockSections(),
    tasks: buildMockTasks(),
    results: buildMockResults(),
    reports: buildMockReports(),
    settings: buildMockSettings()
  };
}
