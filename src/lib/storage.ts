import {
  ComprehensiveInputs,
  PilotPlanFactData,
  ProcessPriorityItem,
  ProjectVersion,
  SavedCalculation,
} from "@/types/economics";

const STORAGE_KEYS = {
  PROJECTS: "ai-vygodno-projects-v3",
  PORTFOLIO: "ai-vygodno-portfolio-v3",
  PILOT: "ai-vygodno-pilot-v3",
  ACTIVE_INPUTS: "ai-vygodno-active-inputs-v3",
  VARIANTS: "ai-vygodno-variants-v3",
};

function isClient(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

// Управление сохранёнными проектами / расчётами
export function getSavedProjects(): SavedCalculation[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Failed to load saved projects from localStorage", err);
    return [];
  }
}

export function saveProject(project: SavedCalculation): void {
  if (!isClient()) return;
  try {
    const current = getSavedProjects();
    const existingIndex = current.findIndex((p) => p.id === project.id);
    const updated = [...current];
    const timestamp = new Date().toISOString();

    if (existingIndex >= 0) {
      updated[existingIndex] = {
        ...project,
        updatedAt: timestamp,
      };
    } else {
      updated.unshift({
        ...project,
        createdAt: project.createdAt || timestamp,
        updatedAt: timestamp,
      });
    }

    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to save project to localStorage", err);
  }
}

export function deleteProject(id: string): void {
  if (!isClient()) return;
  try {
    const current = getSavedProjects();
    const filtered = current.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));
  } catch (err) {
    console.warn("Failed to delete project", err);
  }
}

export function duplicateProject(id: string, newTitle?: string): SavedCalculation | null {
  if (!isClient()) return null;
  const current = getSavedProjects();
  const source = current.find((p) => p.id === id);
  if (!source) return null;

  const newId = "proj_" + Math.random().toString(36).substring(2, 9);
  const copy: SavedCalculation = {
    ...source,
    id: newId,
    title: newTitle || `${source.title} (копия)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    versions: [],
  };

  saveProject(copy);
  return copy;
}

export function saveProjectVersion(
  projectId: string,
  inputs: ComprehensiveInputs,
  effect: number,
  roi: number,
  payback: number | null,
  note = "Контрольная точка"
): SavedCalculation | null {
  if (!isClient()) return null;
  const current = getSavedProjects();
  const index = current.findIndex((p) => p.id === projectId);
  if (index === -1) return null;

  const proj = current[index];
  const newVerNumber = (proj.versions?.length || 0) + 1;
  const version: ProjectVersion = {
    versionId: "ver_" + Math.random().toString(36).substring(2, 8),
    versionNumber: newVerNumber,
    createdAt: new Date().toISOString(),
    note,
    inputs: JSON.parse(JSON.stringify(inputs)),
    effect,
    roi,
    payback,
  };

  const updated: SavedCalculation = {
    ...proj,
    updatedAt: new Date().toISOString(),
    versions: [...(proj.versions || []), version],
  };

  current[index] = updated;
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(current));
  } catch (err) {
    console.warn("Failed to save project version", err);
  }
  return updated;
}

// Управление портфелем проектов
export function getPortfolio(): ProcessPriorityItem[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PORTFOLIO);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePortfolio(items: ProcessPriorityItem[]): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(items));
  } catch (err) {
    console.warn("Failed to save portfolio", err);
  }
}

// Управление данными пилота (План vs Факт)
export function getPilotData(): PilotPlanFactData | null {
  if (!isClient()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PILOT);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function savePilotData(data: PilotPlanFactData): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.PILOT, JSON.stringify(data));
  } catch (err) {
    console.warn("Failed to save pilot data", err);
  }
}

// Экспорт / импорт состояния через URL hash (без персональных и конфиденциальных данных)
export function generateShareUrl(summary: {
  process: string;
  effect: number;
  roi: number;
  payback: string;
  risk: string;
  recommendation: string;
}): string {
  if (!isClient()) return "";
  const params = new URLSearchParams({
    p: summary.process.slice(0, 50),
    e: Math.round(summary.effect).toString(),
    r: Number.isFinite(summary.roi) ? summary.roi.toFixed(1) : "0",
    pb: summary.payback,
    rk: summary.risk,
    rc: summary.recommendation,
  });
  return `${window.location.origin}/calculator#share=${encodeURIComponent(params.toString())}`;
}
