"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  ComprehensiveInputs,
  DetailedCalculationResult,
  DiagnosticState,
  Industry,
  SavedCalculation,
} from "@/types/economics";
import {
  calculateEconomics,
  round1,
  roundMoney,
} from "@/lib/calculation-engine";
import {
  getSavedProjects,
  saveProject,
  deleteProject as deleteStoredProject,
  duplicateProject as duplicateStoredProject,
  saveProjectVersion,
} from "@/lib/storage";
import { ProcessTemplate } from "@/lib/presets";

export type Inputs = ComprehensiveInputs;

export type Result = {
  potentialMonthly: number;
  benefit: number;
  cost: number;
  effect: number;
  roi: number;
  monthlyNet: number;
  payback: number | null;
  breakEven: number | null;
  readiness: number;
  risk: "Низкий" | "Средний" | "Повышенный";
  detailed: DetailedCalculationResult;
};

export const defaultDiagnostic: DiagnosticState = {
  isRepetitive: true,
  hasExamples: true,
  humanCheckable: true,
  nonCriticalError: true,
  isStandardized: true,
  noCheaperAutomation: true,
  hasBaseline: true,
  hasOwner: true,
};

export const initialInputs: Inputs = {
  industry: "ИТ и цифровые сервисы",
  process: "Обработка обращений клиентов",
  description: "",
  userRole: "Руководитель отдела",
  mode: "simple",

  staff: 5,
  hours: 10,
  rate: 2000,
  oneTime: 240000,
  monthly: 40000,
  additional: 10000,
  budget: 150000,
  quality: 0.9,
  realization: 0.8,
  readiness: 4,
  data: "Внутренние",
  owner: true,

  timeSavings: {
    enabled: true,
    staff: 5,
    hoursPerEmployeeMonth: 10,
    hourlyRate: 2000,
  },
  contractorSavings: {
    enabled: false,
    currentMonthlyExpense: 60000,
    reductionPercent: 40,
  },
  errorSavings: {
    enabled: false,
    errorsPerMonth: 8,
    costPerError: 6000,
    correctionHoursPerError: 1.5,
    reductionPercent: 50,
  },
  revenueGain: {
    enabled: false,
    currentMonthlyRevenue: 1000000,
    growthPercent: 5,
    contributionMarginPercent: 30,
  },
  conversionGain: {
    enabled: false,
    monthlyLeads: 250,
    currentConversionPercent: 4,
    newConversionPercent: 5.5,
    averageMarginPerClient: 20000,
  },
  throughputGain: {
    enabled: false,
    tasksPerDayBefore: 20,
    tasksPerDayAfter: 28,
    valuePerExtraTask: 150,
    workingDaysPerMonth: 21,
  },

  oneTimeTCO: {
    development: 140000,
    setup: 40000,
    integration: 30000,
    training: 30000,
    consulting: 0,
    dataMigration: 0,
    custom: 0,
  },
  recurringTCO: {
    licenses: 25000,
    apiTokens: 15000,
    infrastructure: 5000,
    support: 5000,
    qualityControl: 0,
    additionalServices: 0,
    custom: 0,
  },

  horizonYears: 1,
  rampUpMonths: 0,
  readinessScore: 4,
  diagnostic: defaultDiagnostic,
  dataCategory: "Внутренние",
  hasOwner: true,
};

export function readinessFactors(i: Inputs) {
  const staff = i.mode === "simple" ? i.staff : (i.timeSavings?.staff || 1);
  const hours = i.mode === "simple" ? i.hours : (i.timeSavings?.hoursPerEmployeeMonth || 10);
  const totalHours = staff * hours;
  const data = i.dataCategory || i.data;
  const owner = i.mode === "simple" ? i.owner : i.hasOwner;
  const readiness = i.readiness || i.readinessScore || 3;
  const monthlySum = i.monthly + i.additional;

  return [
    {
      label: `Экономия команды: ${totalHours.toLocaleString("ru-RU")} ч/мес. (≥15: 3; ≥8: 2; иначе: 1)`,
      points: totalHours >= 15 ? 3 : totalHours >= 8 ? 2 : 1,
      max: 3,
    },
    {
      label: `Цифровая готовность: ${readiness}/5 (4–5: 2; 3: 1; 1–2: 0)`,
      points: readiness >= 4 ? 2 : readiness >= 3 ? 1 : 0,
      max: 2,
    },
    {
      label: "Бюджет ≥ трёх месячных регулярных расходов",
      points: i.budget >= monthlySum * 3 ? 2 : 0,
      max: 2,
    },
    {
      label: `Данные: ${data} (публичные: 2; внутренние: 1; конфиденциальные: 0)`,
      points: data === "Публичные" ? 2 : data === "Внутренние" ? 1 : 0,
      max: 2,
    },
    {
      label: "Ответственный назначен",
      points: owner ? 1 : 0,
      max: 1,
    },
  ];
}

export function validInputs(i: Inputs): boolean {
  if (!i) return false;
  const basicNums = [
    i.staff,
    i.hours,
    i.rate,
    i.oneTime,
    i.monthly,
    i.additional,
    i.budget,
    i.quality,
    i.realization,
    i.readiness,
  ];
  return (
    basicNums.every(Number.isFinite) &&
    Number.isInteger(i.staff) &&
    i.staff >= 1 &&
    i.hours >= 0 &&
    i.rate > 0 &&
    i.oneTime >= 0 &&
    i.monthly >= 0 &&
    i.additional >= 0 &&
    i.budget >= 0 &&
    i.quality >= 0 &&
    i.quality <= 1 &&
    i.realization >= 0 &&
    i.realization <= 1 &&
    i.readiness >= 1 &&
    i.readiness <= 5
  );
}

export function calculate(i: Inputs): Result {
  // Ensure synchronized fields before computing
  const normalized: Inputs = {
    ...i,
    data: i.data || i.dataCategory || "Внутренние",
    dataCategory: (i.dataCategory || i.data || "Внутренние") as Inputs["dataCategory"],
    owner: i.owner !== undefined ? i.owner : i.hasOwner,
    hasOwner: i.hasOwner !== undefined ? i.hasOwner : i.owner,
    readiness: i.readiness || i.readinessScore || 4,
    readinessScore: i.readinessScore || i.readiness || 4,
  };

  const detailed = calculateEconomics(normalized);

  return {
    potentialMonthly: detailed.potentialMonthly,
    benefit: detailed.benefit,
    cost: detailed.cost,
    effect: detailed.effect,
    roi: detailed.roi,
    monthlyNet: detailed.monthlyNet,
    payback: detailed.payback,
    breakEven: detailed.breakEven,
    readiness: detailed.readiness,
    risk: detailed.risk,
    detailed,
  };
}

export function recommendationFor(r: Result) {
  if (r.effect <= 0) {
    return {
      title: "ИИ ПОКА НЕ ОКУПАЕТСЯ",
      reason:
        "В первом году реализованная выгода не покрывает все затраты. Проверьте расходы, сократите внедрение или используйте обычную автоматизацию.",
      tone: "negative" as const,
    };
  }
  if (r.readiness < 6) {
    return {
      title: "СНАЧАЛА ПОДГОТОВИТЬ ПРОЦЕСС",
      reason:
        "Экономика положительная, но индекс готовности ниже 6/10. Подготовьте стандарты процесса, назначьте ответственного и сформируйте тестовый набор задач.",
      tone: "neutral" as const,
    };
  }
  return {
    title: "НАЧАТЬ ПИЛОТ",
    reason:
      "Эффект первого года положительный, готовность не ниже 6/10. Проверьте экономию и качество на ограниченном 30-дневном пилоте.",
    tone: "positive" as const,
  };
}

export function buildScenarios(i: Inputs) {
  return [
    {
      name: "Пессимистичный",
      description: "Качество ×0,85 · реализация ×0,8",
      tone: "negative" as const,
      q: 0.85,
      k: 0.8,
    },
    {
      name: "Базовый",
      description: "Ваши текущие коэффициенты",
      tone: "positive" as const,
      q: 1,
      k: 1,
    },
    {
      name: "Оптимистичный",
      description: "Качество ×1,05 · реализация ×1,1",
      tone: "blue" as const,
      q: 1.05,
      k: 1.1,
    },
  ].map((s) => ({
    ...s,
    result: calculate({
      ...i,
      quality: Math.min(1, i.quality * s.q),
      realization: Math.min(1, i.realization * s.k),
    }),
  }));
}

export const formatMoney = (n: number) =>
  Number.isFinite(n)
    ? Math.round(n).toLocaleString("ru-RU", { maximumFractionDigits: 0 }) + " ₽"
    : "— ₽";

export const formatROI = (n: number) =>
  Number.isFinite(n)
    ? n.toLocaleString("ru-RU", { maximumFractionDigits: 1 }) + "%"
    : "Не определяется";

export const formatPayback = (n: number | null) => {
  if (n === null) return "Нет окупаемости";
  if (Math.abs(n) < 0.05) return "0 мес.";
  if (n < 0.1 && n > 0) return "< 0,1 мес.";
  const val = Math.abs(n) < 0.05 ? 0 : n;
  return val.toLocaleString("ru-RU", { maximumFractionDigits: 1 }) + " мес.";
};

export const isAbnormal = (i: Inputs, r: Result) =>
  r.roi > 1000 ||
  (r.payback !== null && r.payback < 0.1) ||
  i.hours > 160 ||
  r.benefit > Math.max(1, r.cost) * 11;

type Store = {
  inputs: Inputs;
  setInputs: (v: Inputs) => void;
  calculatedInputs: Inputs;
  result: Result;
  setCalculated: (v: Inputs) => void;
  hasChanges: boolean;
  calculatedAt: string | null;
  scenarios: ReturnType<typeof buildScenarios>;
  recommendation: ReturnType<typeof recommendationFor>;
  applyTemplate: (t: ProcessTemplate) => void;
  savedProjects: SavedCalculation[];
  refreshSavedProjects: () => void;
  saveCurrentProject: (title?: string) => SavedCalculation;
  deleteSavedProject: (id: string) => void;
  duplicateSavedProject: (id: string) => void;
  createVersionSnapshot: (note?: string) => void;
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
};

const Ctx = createContext<Store | null>(null);

export function CalculationProvider({ children }: { children: React.ReactNode }) {
  const [inputs, setInputsState] = useState<Inputs>(initialInputs);
  const [calculatedInputs, setCalculatedState] = useState<Inputs>(initialInputs);
  const [calculatedAt, setCalculatedAt] = useState<string | null>(null);
  const [savedProjects, setSavedProjects] = useState<SavedCalculation[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const refreshSavedProjects = () => {
    setSavedProjects(getSavedProjects());
  };

  useEffect(() => {
    try {
      refreshSavedProjects();
      const raw = sessionStorage.getItem("ai-vygodno-calculation-v3");
      if (raw) {
        const saved = JSON.parse(raw);
        if (validInputs(saved.inputs)) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setInputsState(saved.inputs);
          setCalculatedState(saved.inputs);
          setCalculatedAt(saved.at);
          if (saved.projectId) setActiveProjectId(saved.projectId);
          return;
        }
      }
      // Fallback to legacy v2 session key
      const legacyRaw = sessionStorage.getItem("ai-vygodno-calculation-v2");
      if (legacyRaw) {
        const legacySaved = JSON.parse(legacyRaw);
        if (validInputs(legacySaved.inputs)) {
          const merged: Inputs = {
            ...initialInputs,
            ...legacySaved.inputs,
            timeSavings: {
              enabled: true,
              staff: legacySaved.inputs.staff,
              hoursPerEmployeeMonth: legacySaved.inputs.hours,
              hourlyRate: legacySaved.inputs.rate,
            },
          };
          setInputsState(merged);
          setCalculatedState(merged);
          setCalculatedAt(legacySaved.at);
        }
      }
    } catch {
      /* Browser storage is optional */
    }
  }, []);

  const setInputs = (next: Inputs) => {
    // Keep legacy staff/hours/rate/oneTime/monthly in sync with advanced structures
    if (next.mode === "simple") {
      next.timeSavings = {
        enabled: true,
        staff: next.staff,
        hoursPerEmployeeMonth: next.hours,
        hourlyRate: next.rate,
      };
      next.oneTimeTCO = {
        ...next.oneTimeTCO,
        development: next.oneTime,
        setup: 0,
        integration: 0,
        training: 0,
        consulting: 0,
        dataMigration: 0,
        custom: 0,
      };
      next.recurringTCO = {
        ...next.recurringTCO,
        licenses: next.monthly,
        apiTokens: next.additional,
        infrastructure: 0,
        support: 0,
        qualityControl: 0,
        additionalServices: 0,
        custom: 0,
      };
      next.dataCategory = (next.data || "Внутренние") as Inputs["dataCategory"];
      next.hasOwner = next.owner;
      next.readinessScore = next.readiness;
    } else {
      // In advanced mode, derive legacy numbers for backward compatibility
      if (next.timeSavings) {
        next.staff = next.timeSavings.staff;
        next.hours = next.timeSavings.hoursPerEmployeeMonth;
        next.rate = next.timeSavings.hourlyRate;
      }
      const oneTimeSum = Object.values(next.oneTimeTCO || {}).reduce((a, b) => a + b, 0);
      next.oneTime = oneTimeSum;
      const recurringSum = Object.values(next.recurringTCO || {}).reduce((a, b) => a + b, 0);
      next.monthly = recurringSum;
      next.additional = 0;
      next.data = next.dataCategory;
      next.owner = next.hasOwner;
      next.readiness = next.readinessScore;
    }
    setInputsState(next);
  };

  const setCalculated = (v: Inputs) => {
    if (!validInputs(v)) return;
    const at = new Date().toISOString();
    setCalculatedState({ ...v });
    setCalculatedAt(at);
    try {
      sessionStorage.setItem(
        "ai-vygodno-calculation-v3",
        JSON.stringify({ inputs: v, at, projectId: activeProjectId })
      );
    } catch {
      /* Keep in-memory state */
    }
  };

  const applyTemplate = (tpl: ProcessTemplate) => {
    const updated: Inputs = {
      ...inputs,
      industry: tpl.industry,
      process: tpl.process,
      description: tpl.description,
      staff: tpl.defaults.staff,
      hours: tpl.defaults.hours,
      rate: tpl.defaults.rate,
      oneTime: tpl.defaults.oneTime,
      monthly: tpl.defaults.monthly,
      additional: tpl.defaults.additional,
      quality: tpl.defaults.quality,
      realization: tpl.defaults.realization,
      readiness: tpl.defaults.readiness,
      data: tpl.defaults.data,
      dataCategory: tpl.defaults.data as Inputs["dataCategory"],
      owner: tpl.defaults.owner,
      hasOwner: tpl.defaults.owner,
      timeSavings: {
        enabled: true,
        staff: tpl.defaults.staff,
        hoursPerEmployeeMonth: tpl.defaults.hours,
        hourlyRate: tpl.defaults.rate,
      },
      contractorSavings: {
        enabled: !!tpl.defaults.contractorSavings,
        currentMonthlyExpense: tpl.defaults.contractorSavings || 50000,
        reductionPercent: 40,
      },
      errorSavings: {
        enabled: !!tpl.defaults.errorsPerMonth,
        errorsPerMonth: tpl.defaults.errorsPerMonth || 10,
        costPerError: tpl.defaults.costPerError || 10000,
        correctionHoursPerError: 2,
        reductionPercent: 50,
      },
    };
    setInputs(updated);
    setCalculated(updated);
  };

  const saveCurrentProject = (customTitle?: string): SavedCalculation => {
    const id = activeProjectId || "proj_" + Math.random().toString(36).substring(2, 9);
    const title = customTitle || inputs.process || "Расчёт эффективности ИИ";
    const currentRes = calculate(inputs);
    const proj: SavedCalculation = {
      id,
      title,
      industry: inputs.industry,
      process: inputs.process,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "Расчёт",
      inputs: JSON.parse(JSON.stringify(inputs)),
      effect: currentRes.effect,
      roi: currentRes.roi,
      payback: currentRes.payback,
      risk: currentRes.risk,
      readiness: currentRes.readiness,
      recommendationTitle: recommendationFor(currentRes).title,
      versions: [],
    };
    saveProject(proj);
    setActiveProjectId(id);
    refreshSavedProjects();
    return proj;
  };

  const deleteSavedProject = (id: string) => {
    deleteStoredProject(id);
    if (activeProjectId === id) setActiveProjectId(null);
    refreshSavedProjects();
  };

  const duplicateSavedProject = (id: string) => {
    const dup = duplicateStoredProject(id);
    if (dup) {
      refreshSavedProjects();
      setActiveProjectId(dup.id);
      setInputs(dup.inputs);
      setCalculated(dup.inputs);
    }
  };

  const createVersionSnapshot = (note = "Контрольная точка") => {
    if (!activeProjectId) {
      saveCurrentProject();
      return;
    }
    const currentRes = calculate(inputs);
    saveProjectVersion(
      activeProjectId,
      inputs,
      currentRes.effect,
      currentRes.roi,
      currentRes.payback,
      note
    );
    refreshSavedProjects();
  };

  const result = useMemo(() => calculate(calculatedInputs), [calculatedInputs]);
  const scenarios = useMemo(() => buildScenarios(calculatedInputs), [calculatedInputs]);

  return (
    <Ctx.Provider
      value={{
        inputs,
        setInputs,
        calculatedInputs,
        calculatedAt,
        result,
        scenarios,
        recommendation: recommendationFor(result),
        setCalculated,
        hasChanges: JSON.stringify(inputs) !== JSON.stringify(calculatedInputs),
        applyTemplate,
        savedProjects,
        refreshSavedProjects,
        saveCurrentProject,
        deleteSavedProject,
        duplicateSavedProject,
        createVersionSnapshot,
        activeProjectId,
        setActiveProjectId,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCalculation() {
  const c = useContext(Ctx);
  if (!c) throw new Error("CalculationProvider missing");
  return c;
}
