import {
  BenefitBreakdown,
  BreakEvenThresholds,
  CalculationHorizon,
  ComprehensiveInputs,
  DetailedCalculationResult,
  MonthlyCashFlowPoint,
  RampUpMonths,
  TCOBreakdown,
} from "@/types/economics";
import { evaluateDiagnostic } from "./presets";

// Безопасное округление
export const roundMoney = (v: number) => Math.round(v);
export const round1 = (v: number) => Math.round(v * 10) / 10;
export const round2 = (v: number) => Math.round(v * 100) / 100;

// Расчёт источников эффекта
export function calculateBenefits(i: ComprehensiveInputs): BenefitBreakdown {
  const q = Math.max(0, Math.min(1, i.quality));
  const k = Math.max(0, Math.min(1, i.realization));

  // 1. Экономия рабочего времени
  let timeSavingsAnnual = 0;
  if (i.mode === "simple" || i.timeSavings.enabled) {
    const staff = i.mode === "simple" ? i.staff : i.timeSavings.staff;
    const hours = i.mode === "simple" ? i.hours : i.timeSavings.hoursPerEmployeeMonth;
    const rate = i.mode === "simple" ? i.rate : i.timeSavings.hourlyRate;
    const potentialMonthly = staff * hours * rate;
    timeSavingsAnnual = potentialMonthly * 12 * q * k;
  }

  // 2. Снижение расходов на подрядчиков
  let contractorSavingsAnnual = 0;
  if (i.mode === "advanced" && i.contractorSavings.enabled) {
    const monthlyContractor = i.contractorSavings.currentMonthlyExpense;
    const drop = Math.max(0, Math.min(100, i.contractorSavings.reductionPercent)) / 100;
    contractorSavingsAnnual = monthlyContractor * drop * 12 * k;
  }

  // 3. Снижение ошибок и брака
  let errorSavingsAnnual = 0;
  if (i.mode === "advanced" && i.errorSavings.enabled) {
    const errCount = i.errorSavings.errorsPerMonth;
    const directCost = i.errorSavings.costPerError;
    const rate = i.timeSavings?.hourlyRate || i.rate || 2000;
    const fixCost = (i.errorSavings.correctionHoursPerError || 0) * rate;
    const totalMonthlyErrorLoss = errCount * (directCost + fixCost);
    const drop = Math.max(0, Math.min(100, i.errorSavings.reductionPercent)) / 100;
    errorSavingsAnnual = totalMonthlyErrorLoss * drop * 12 * q * k;
  }

  // 4. Рост выручки (маржинальный эффект)
  let revenueMarginAnnual = 0;
  if (i.mode === "advanced" && i.revenueGain.enabled) {
    const rev = i.revenueGain.currentMonthlyRevenue;
    const growth = Math.max(0, i.revenueGain.growthPercent) / 100;
    const margin = Math.max(0, Math.min(100, i.revenueGain.contributionMarginPercent)) / 100;
    revenueMarginAnnual = rev * growth * margin * 12 * k;
  }

  // 5. Рост конверсии
  let conversionMarginAnnual = 0;
  if (i.mode === "advanced" && i.conversionGain.enabled) {
    const leads = i.conversionGain.monthlyLeads;
    const c1 = Math.max(0, Math.min(100, i.conversionGain.currentConversionPercent)) / 100;
    const c2 = Math.max(0, Math.min(100, i.conversionGain.newConversionPercent)) / 100;
    const extraClients = Math.max(0, leads * (c2 - c1));
    conversionMarginAnnual = extraClients * i.conversionGain.averageMarginPerClient * 12 * k;
  }

  // 6. Увеличение throughput
  let throughputAnnual = 0;
  if (i.mode === "advanced" && i.throughputGain.enabled) {
    const extraTasksPerDay = Math.max(
      0,
      i.throughputGain.tasksPerDayAfter - i.throughputGain.tasksPerDayBefore
    );
    const monthlyExtra = extraTasksPerDay * (i.throughputGain.workingDaysPerMonth || 21);
    throughputAnnual = monthlyExtra * i.throughputGain.valuePerExtraTask * 12 * k;
  }

  const realizedAnnualTotal =
    timeSavingsAnnual +
    contractorSavingsAnnual +
    errorSavingsAnnual +
    revenueMarginAnnual +
    conversionMarginAnnual +
    throughputAnnual;

  const potentialAnnualTotal =
    (q > 0 && k > 0) ? realizedAnnualTotal / (q * k) : realizedAnnualTotal;

  return {
    timeSavingsAnnual,
    contractorSavingsAnnual,
    errorSavingsAnnual,
    revenueMarginAnnual,
    conversionMarginAnnual,
    throughputAnnual,
    potentialAnnualTotal,
    realizedAnnualTotal,
  };
}

// Расчёт затрат TCO
export function calculateTCO(
  i: ComprehensiveInputs,
  horizonYears: CalculationHorizon = 1
): TCOBreakdown {
  let oneTimeTotal = 0;
  let recurringMonthlyTotal = 0;

  if (i.mode === "simple") {
    oneTimeTotal = i.oneTime;
    recurringMonthlyTotal = i.monthly + i.additional;
  } else {
    const o = i.oneTimeTCO;
    oneTimeTotal =
      (o.development || 0) +
      (o.setup || 0) +
      (o.integration || 0) +
      (o.training || 0) +
      (o.consulting || 0) +
      (o.dataMigration || 0) +
      (o.custom || 0);

    const r = i.recurringTCO;
    recurringMonthlyTotal =
      (r.licenses || 0) +
      (r.apiTokens || 0) +
      (r.infrastructure || 0) +
      (r.support || 0) +
      (r.qualityControl || 0) +
      (r.additionalServices || 0) +
      (r.custom || 0);
  }

  const recurringAnnualTotal = recurringMonthlyTotal * 12;
  const year1Total = oneTimeTotal + recurringAnnualTotal;
  const horizonTotal = oneTimeTotal + recurringMonthlyTotal * (horizonYears * 12);

  return {
    oneTimeTotal,
    recurringMonthlyTotal,
    recurringAnnualTotal,
    year1Total,
    horizonTotal,
  };
}

// Моделирование Ramp-up и помесячного Cash Flow
export function calculateCashFlowTimeline(
  oneTimeCost: number,
  monthlyRecurringCost: number,
  annualRealizedBenefit: number,
  horizonYears: CalculationHorizon,
  rampUpMonths: RampUpMonths
): { timeline: MonthlyCashFlowPoint[]; paybackMonth: number | null; totalBenefit: number } {
  const totalMonths = horizonYears * 12;
  const targetMonthlyBenefit = annualRealizedBenefit / 12;
  const timeline: MonthlyCashFlowPoint[] = [];

  let cumulativeNet = -oneTimeCost;
  let totalBenefit = 0;
  let paybackMonth: number | null = null;

  // Month 0 - старт
  timeline.push({
    month: 0,
    benefit: 0,
    cost: oneTimeCost,
    net: -oneTimeCost,
    cumulativeNet,
    withoutAI: 0,
  });

  for (let m = 1; m <= totalMonths; m++) {
    let rampFactor = 1;
    if (rampUpMonths > 0) {
      if (m <= rampUpMonths) {
        rampFactor = m / (rampUpMonths + 1);
      } else {
        rampFactor = 1;
      }
    }

    const monthBenefit = targetMonthlyBenefit * rampFactor;
    const monthCost = monthlyRecurringCost;
    const net = monthBenefit - monthCost;
    cumulativeNet += net;
    totalBenefit += monthBenefit;

    if (paybackMonth === null && cumulativeNet >= 0) {
      const prevCum = cumulativeNet - net;
      if (net > 0 && prevCum < 0) {
        paybackMonth = round2(m - 1 + (-prevCum) / net);
      } else {
        paybackMonth = m;
      }
    }

    timeline.push({
      month: m,
      benefit: roundMoney(monthBenefit),
      cost: roundMoney(monthCost),
      net: roundMoney(net),
      cumulativeNet: roundMoney(cumulativeNet),
      withoutAI: 0,
    });
  }

  return { timeline, paybackMonth, totalBenefit };
}

// Пороги безубыточности ("Что должно измениться")
export function calculateBreakEvenThresholds(
  i: ComprehensiveInputs,
  annualBenefit: number,
  costs: TCOBreakdown
): BreakEvenThresholds {
  const q = Math.max(0.01, i.quality);
  const k = Math.max(0.01, i.realization);
  const staff = Math.max(1, i.mode === "simple" ? i.staff : (i.timeSavings?.staff || 1));
  const rate = Math.max(1, i.mode === "simple" ? i.rate : (i.timeSavings?.hourlyRate || 2000));

  // 1. Минимальные часы экономии на сотрудника в месяц (чтобы B >= year1Total)
  let minHoursPerStaff: number | null = null;
  const timeDenom = staff * rate * 12 * q * k;
  if (timeDenom > 0) {
    const nonTimeBenefits = annualBenefit - (i.mode === "simple" ? annualBenefit : 0);
    const neededFromTime = Math.max(0, costs.year1Total - nonTimeBenefits);
    minHoursPerStaff = round1(neededFromTime / (staff * rate * 12 * q * k));
  }

  // 2. Максимальная допустимая стоимость сервиса в месяц
  // C0 + (maxMonthly) * 12 <= B => maxMonthly = (B - C0) / 12
  const maxMonthlyServiceCost = roundMoney((annualBenefit - costs.oneTimeTotal) / 12);

  // 3. Минимальное качество q (при текущем k и вводных)
  let minQuality: number | null = null;
  if (annualBenefit > 0 && q > 0) {
    const potentialAtQ1 = annualBenefit / q;
    if (potentialAtQ1 > 0) {
      const requiredQ = costs.year1Total / potentialAtQ1;
      minQuality = requiredQ <= 1 ? round2(requiredQ) : null;
    }
  }

  // 4. Минимальная реализация k
  let minRealization: number | null = null;
  if (annualBenefit > 0 && k > 0) {
    const potentialAtK1 = annualBenefit / k;
    if (potentialAtK1 > 0) {
      const requiredK = costs.year1Total / potentialAtK1;
      minRealization = requiredK <= 1 ? round2(requiredK) : null;
    }
  }

  // 5. Максимальные разовые затраты
  const maxOneTimeCost = roundMoney(Math.max(0, annualBenefit - costs.recurringAnnualTotal));

  return {
    minHoursPerStaff,
    maxMonthlyServiceCost: maxMonthlyServiceCost > 0 ? maxMonthlyServiceCost : 0,
    minQuality,
    minRealization,
    maxOneTimeCost,
  };
}

// Оценка индекса готовности (0..10)
export function calculateReadiness(i: ComprehensiveInputs): {
  score: number;
  factors: Array<{ label: string; points: number; max: number }>;
} {
  const staff = i.mode === "simple" ? i.staff : (i.timeSavings?.staff || 1);
  const hours = i.mode === "simple" ? i.hours : (i.timeSavings?.hoursPerEmployeeMonth || 10);
  const totalHours = staff * hours;
  const budget = i.budget;
  const monthlyCosts =
    i.mode === "simple"
      ? i.monthly + i.additional
      : calculateTCO(i, 1).recurringMonthlyTotal;

  const dataPoints =
    i.dataCategory === "Публичные" || i.data === "Публичные"
      ? 2
      : i.dataCategory === "Внутренние" || i.data === "Внутренние"
      ? 1
      : 0;

  const owner = i.mode === "simple" ? i.owner : i.hasOwner;
  const readiness = i.readiness || i.readinessScore || 3;

  const factors = [
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
      points: budget >= monthlyCosts * 3 ? 2 : 0,
      max: 2,
    },
    {
      label: `Данные: ${i.dataCategory || i.data} (публичные: 2; внутренние: 1; конфиденциальные: 0)`,
      points: dataPoints,
      max: 2,
    },
    {
      label: "Ответственный назначен",
      points: owner ? 1 : 0,
      max: 1,
    },
  ];

  const score = Math.min(10, factors.reduce((acc, f) => acc + f.points, 0));
  return { score, factors };
}

// Главная расчётная функция
export function calculateEconomics(i: ComprehensiveInputs): DetailedCalculationResult {
  const benefits = calculateBenefits(i);
  const costs = calculateTCO(i, i.horizonYears || 1);

  const annualBenefit = benefits.realizedAnnualTotal;
  const year1Cost = costs.year1Total;
  const effect = annualBenefit - year1Cost;
  const roi = year1Cost > 0 ? (effect / year1Cost) * 100 : NaN;

  // Monthly net at full ramp-up
  const monthlyNet = annualBenefit / 12 - costs.recurringMonthlyTotal;

  // Timeline with ramp-up
  const { timeline, paybackMonth, totalBenefit } = calculateCashFlowTimeline(
    costs.oneTimeTotal,
    costs.recurringMonthlyTotal,
    annualBenefit,
    i.horizonYears || 1,
    i.rampUpMonths || 0
  );

  // Horizon metrics
  const tcoHorizon = costs.horizonTotal;
  const benefitHorizon = totalBenefit;
  const effectHorizon = benefitHorizon - tcoHorizon;
  const roiHorizon = tcoHorizon > 0 ? (effectHorizon / tcoHorizon) * 100 : NaN;

  // Classic break-even in hours/month for the whole process
  const denom = (i.rate || 2000) * i.quality * i.realization * 12;
  const breakEven = denom > 0 ? year1Cost / denom : null;

  // Thresholds
  const thresholds = calculateBreakEvenThresholds(i, annualBenefit, costs);

  // Cost of Delay
  const costOfDelayMonthly = effect > 0 ? roundMoney(effect / 12) : 0;

  // Readiness & Risk
  const { score: readiness } = calculateReadiness(i);
  const isConfidential =
    i.dataCategory === "Коммерческая тайна" ||
    i.dataCategory === "Чувствительные (финансы / здоровье)" ||
    i.data === "Конфиденциальные";

  const risk: "Низкий" | "Средний" | "Повышенный" =
    isConfidential || readiness < 5 ? "Повышенный" : readiness < 7 ? "Средний" : "Низкий";

  const riskScore =
    risk === "Повышенный" ? 75 : risk === "Средний" ? 45 : 20;

  // Diagnostic verdict
  const diag = evaluateDiagnostic(i.diagnostic);

  const staff = i.mode === "simple" ? i.staff : (i.timeSavings?.staff || 1);
  const hours = i.mode === "simple" ? i.hours : (i.timeSavings?.hoursPerEmployeeMonth || 10);
  const rate = i.mode === "simple" ? i.rate : (i.timeSavings?.hourlyRate || 2000);
  const potentialMonthly = staff * hours * rate;

  return {
    potentialMonthly,
    benefit: roundMoney(annualBenefit),
    cost: roundMoney(year1Cost),
    effect: roundMoney(effect),
    roi: round1(roi),
    monthlyNet: roundMoney(monthlyNet),
    payback: monthlyNet > 0 ? paybackMonth : null,
    breakEven,

    horizonYears: i.horizonYears || 1,
    tcoHorizon: roundMoney(tcoHorizon),
    benefitHorizon: roundMoney(benefitHorizon),
    effectHorizon: roundMoney(effectHorizon),
    roiHorizon: round1(roiHorizon),

    costOfDelayMonthly,
    benefits,
    costs,
    thresholds,
    cashFlowTimeline: timeline,

    readiness,
    risk,
    riskScore,
    diagnosticVerdict: diag.verdict,
    diagnosticAdvice: diag.advice,
  };
}

// 2D Чувствительность (Sensitivity 2.0)
export type SensitivityVariable =
  | "hours"
  | "rate"
  | "quality"
  | "realization"
  | "monthly"
  | "oneTime";

export type SensitivityMetric = "effect" | "roi" | "payback";

export function calculateSensitivityGrid(
  inputs: ComprehensiveInputs,
  varX: SensitivityVariable = "monthly",
  varY: SensitivityVariable = "hours",
  metric: SensitivityMetric = "effect"
): {
  xValues: number[];
  yValues: number[];
  matrix: (number | null)[][];
} {
  const getBaseValue = (v: SensitivityVariable): number => {
    switch (v) {
      case "hours":
        return Math.max(1, inputs.hours);
      case "rate":
        return Math.max(500, inputs.rate);
      case "quality":
        return Math.max(0.2, inputs.quality);
      case "realization":
        return Math.max(0.2, inputs.realization);
      case "monthly":
        return Math.max(5000, inputs.monthly);
      case "oneTime":
        return Math.max(10000, inputs.oneTime);
    }
  };

  const generateRange = (v: SensitivityVariable): number[] => {
    const base = getBaseValue(v);
    if (v === "quality" || v === "realization") {
      return [0.6, 0.75, 0.85, 0.95, 1.0];
    }
    const multipliers = [0.5, 0.75, 1.0, 1.25, 1.5];
    return multipliers.map((m) => {
      const val = base * m;
      return v === "hours" ? round1(val) : roundMoney(val);
    });
  };

  const xValues = generateRange(varX);
  const yValues = generateRange(varY);

  const matrix: (number | null)[][] = [];

  for (const y of yValues) {
    const row: (number | null)[] = [];
    for (const x of xValues) {
      const cloned = JSON.parse(JSON.stringify(inputs)) as ComprehensiveInputs;

      const applyVal = (v: SensitivityVariable, val: number) => {
        if (v === "hours") {
          cloned.hours = val;
          if (cloned.timeSavings) cloned.timeSavings.hoursPerEmployeeMonth = val;
        } else if (v === "rate") {
          cloned.rate = val;
          if (cloned.timeSavings) cloned.timeSavings.hourlyRate = val;
        } else if (v === "quality") {
          cloned.quality = Math.min(1, Math.max(0, val));
        } else if (v === "realization") {
          cloned.realization = Math.min(1, Math.max(0, val));
        } else if (v === "monthly") {
          cloned.monthly = val;
        } else if (v === "oneTime") {
          cloned.oneTime = val;
        }
      };

      applyVal(varX, x);
      applyVal(varY, y);

      const res = calculateEconomics(cloned);
      if (metric === "effect") {
        row.push(roundMoney(res.effect));
      } else if (metric === "roi") {
        row.push(Number.isFinite(res.roi) ? round1(res.roi) : null);
      } else {
        row.push(res.payback !== null ? round1(res.payback) : null);
      }
    }
    matrix.push(row);
  }

  return { xValues, yValues, matrix };
}

// Приоритет процессов (Score и матрица 2x2)
export function calculateProcessPriorityScore(
  effect: number,
  roi: number,
  complexity: number, // 1..5
  readiness: number, // 1..10
  risk: "Низкий" | "Средний" | "Повышенный"
): {
  score: number;
  zone: "Быстрые победы" | "Стратегические проекты" | "Сначала подготовить" | "Низкий приоритет";
  breakdown: { effectPts: number; roiPts: number; readinessPts: number; complexityPenalty: number; riskPenalty: number };
} {
  // Нормализуем эффект (до 500 тыс = до 30 баллов)
  const effectPts = Math.min(35, Math.max(0, (effect / 500000) * 35));
  // ROI (до 300% = до 25 баллов)
  const roiPts = Math.min(25, Math.max(0, (roi / 300) * 25));
  // Готовность (до 10 = до 20 баллов)
  const readinessPts = (readiness / 10) * 20;
  // Штраф за сложность (1..5: до 15 баллов штрафа)
  const complexityPenalty = ((complexity - 1) / 4) * 15;
  // Штраф за риск
  const riskPenalty = risk === "Повышенный" ? 15 : risk === "Средний" ? 8 : 2;

  const rawScore = effectPts + roiPts + readinessPts - complexityPenalty - riskPenalty;
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  // Определение зоны в матрице:
  // X: Сложность (низкая <= 2.5, высокая > 2.5)
  // Y: Эффект (высокий >= 200 000 руб, низкий < 200 000 руб)
  const isHighEffect = effect >= 200000;
  const isLowComplexity = complexity <= 2.5;

  let zone: "Быстрые победы" | "Стратегические проекты" | "Сначала подготовить" | "Низкий приоритет";
  if (isHighEffect && isLowComplexity) {
    zone = "Быстрые победы";
  } else if (isHighEffect && !isLowComplexity) {
    zone = "Стратегические проекты";
  } else if (!isHighEffect && isLowComplexity) {
    zone = "Сначала подготовить";
  } else {
    zone = "Низкий приоритет";
  }

  return {
    score,
    zone,
    breakdown: {
      effectPts: round1(effectPts),
      roiPts: round1(roiPts),
      readinessPts: round1(readinessPts),
      complexityPenalty: round1(complexityPenalty),
      riskPenalty,
    },
  };
}

// План vs Факт анализ
export function calculatePilotPlanFact(
  planEffect: number,
  actualEffect: number,
  actualQuality: number,
  planQuality: number
): {
  forecastError: number;
  deltaRub: number;
  verdict: "Масштабировать" | "Доработать и повторить пилот" | "Остановить";
  reason: string;
  reasons: string[];
} {
  const denom = Math.max(1000, Math.abs(planEffect));
  const forecastError = round1(((actualEffect - planEffect) / denom) * 100);
  const deltaRub = roundMoney(actualEffect - planEffect);

  if (actualEffect > 0 && actualQuality >= 0.85 && forecastError >= -25) {
    return {
      forecastError,
      deltaRub,
      verdict: "Масштабировать",
      reason:
        "Пилот подтвердил положительную экономику и требуемое качество. Можно переходить к регулярной эксплуатации и тиражированию на весь отдел.",
      reasons: [
        "Экономическая модель подтверждена: фактический эффект положительный и окупает затраты.",
        `Качество генерации (${Math.round(actualQuality * 100)}%) соответствует рабочему стандарту (целевой порог ≥85%).`,
        "Отклонение от прогноза находится в пределах допустимого коридора риска.",
        "Рекомендация: утвердить масштабирование на всю команду и включить решение в постоянный бюджет.",
      ],
    };
  }

  if (actualEffect > 0 && (actualQuality < 0.85 || forecastError < -25)) {
    return {
      forecastError,
      deltaRub,
      verdict: "Доработать и повторить пилот",
      reason:
        "Экономика положительная, но фактическое качество или отклонение от прогноза требуют доработки промптов, регламента или интерфейса взаимодействия.",
      reasons: [
        "Экономический потенциал подтверждён, но стабильность процесса пока недостаточна.",
        `Качество черновиков (${Math.round(actualQuality * 100)}%) ниже целевого порога (85%) либо отставание от плана превысило 25%.`,
        "Рекомендация: оптимизировать системные промпты, регламентировать валидацию человеком и провести 14-дневный контрольный спринт.",
        "Не масштабировать на весь штат до устранения выявленных узких мест.",
      ],
    };
  }

  return {
    forecastError,
    deltaRub,
    verdict: "Остановить",
    reason:
      "Фактический эффект оказался отрицательным или неощутимым. Дальнейшие инвестиции не рекомендуются до кардинального пересмотра процесса или выбора альтернативного решения.",
    reasons: [
      "Фактический эффект отрицательный или расходы на обслуживание превышают ценность.",
      "Затраты времени на ручную перепроверку и исправление ошибок нивелируют выгоду.",
      "Текущее решение или алгоритм не подходят для специфики этого процесса.",
      "Рекомендация: зафиксировать результаты, отменить подписку и рассмотреть альтернативные сценарии автоматизации.",
    ],
  };
}
