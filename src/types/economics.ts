export type Industry =
  | "ИТ и цифровые сервисы"
  | "Услуги"
  | "Розница"
  | "Строительство"
  | "Маркетинг"
  | "Образование"
  | "Продажи"
  | "Клиентский сервис"
  | "Документы и бэк-офис"
  | "HR и найм"
  | "Аналитика и отчёты";

export type UserRole =
  | "Собственник бизнеса"
  | "Руководитель отдела"
  | "Специалист"
  | "Консультант / аналитик";

export type DataCategory =
  | "Публичные"
  | "Внутренние"
  | "Персональные"
  | "Коммерческая тайна"
  | "Чувствительные (финансы / здоровье)";

export type CalculationHorizon = 1 | 2 | 3 | 5; // years
export type RampUpMonths = 0 | 1 | 3 | 6;

export interface DiagnosticQuestion {
  id: string;
  text: string;
  weight: number;
  hint: string;
}

export interface DiagnosticState {
  isRepetitive: boolean; // повторяется?
  hasExamples: boolean; // есть примеры/данные?
  humanCheckable: boolean; // можно проверить человеком?
  nonCriticalError: boolean; // ошибка не фатальна?
  isStandardized: boolean; // процесс стандартизирован?
  noCheaperAutomation: boolean; // обычная автоматизация не решает дешевле?
  hasBaseline: boolean; // есть измеримый baseline?
  hasOwner: boolean; // есть ответственный?
}

export type DiagnosticResult =
  | "ИИ подходит для пилота"
  | "Сначала стандартизируйте процесс"
  | "Вероятно, здесь достаточно обычной автоматизации"
  | "Высокий риск — требуется дополнительная проверка";

// Источники эффекта
export interface TimeSavingsBenefit {
  enabled: boolean;
  staff: number;
  hoursPerEmployeeMonth: number;
  hourlyRate: number;
}

export interface ContractorSavingsBenefit {
  enabled: boolean;
  currentMonthlyExpense: number;
  reductionPercent: number; // 0..100%
}

export interface ErrorSavingsBenefit {
  enabled: boolean;
  errorsPerMonth: number;
  costPerError: number;
  correctionHoursPerError: number;
  reductionPercent: number; // 0..100%
}

export interface RevenueGainBenefit {
  enabled: boolean;
  currentMonthlyRevenue: number;
  growthPercent: number; // 0..100%
  contributionMarginPercent: number; // маржинальность 0..100%
}

export interface ConversionGainBenefit {
  enabled: boolean;
  monthlyLeads: number;
  currentConversionPercent: number; // 0..100%
  newConversionPercent: number; // 0..100%
  averageMarginPerClient: number; // средняя маржа с закрытого клиента
}

export interface ThroughputBenefit {
  enabled: boolean;
  tasksPerDayBefore: number;
  tasksPerDayAfter: number;
  valuePerExtraTask: number;
  workingDaysPerMonth: number;
}

// Затраты TCO
export interface TCOOneTimeCosts {
  development: number; // разработка
  setup: number; // настройка и промпты
  integration: number; // интеграция с сервисами/CRM
  training: number; // обучение сотрудников
  consulting: number; // консультации / аудит
  dataMigration: number; // подготовка и миграция данных
  custom: number; // прочие разовые
}

export interface TCORecurringCosts {
  licenses: number; // лицензии на пользователя / софт
  apiTokens: number; // токены API ИИ
  infrastructure: number; // серверы / облако
  support: number; // сопровождение / вендор
  qualityControl: number; // контроль качества / разметка
  additionalServices: number; // вспомогательные сервисы
  custom: number; // прочие ежемесячные
}

// Риски
export interface RiskCategoryAssessment {
  id: string;
  category:
    | "Данные и безопасность"
    | "Качество и галлюцинации"
    | "Юридические риски"
    | "Организационные риски"
    | "Технические риски"
    | "Зависимость от вендора"
    | "Сотрудники и адаптация";
  description: string;
  probability: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  mitigation: string;
}

// Полный набор входных данных калькулятора (совместимый с Inputs)
export interface ComprehensiveInputs {
  // Базовая идентификация
  industry: Industry;
  process: string;
  description: string;
  userRole: UserRole;

  // Режим работы формы
  mode: "simple" | "advanced";

  // Источники эффекта
  timeSavings: TimeSavingsBenefit;
  contractorSavings: ContractorSavingsBenefit;
  errorSavings: ErrorSavingsBenefit;
  revenueGain: RevenueGainBenefit;
  conversionGain: ConversionGainBenefit;
  throughputGain: ThroughputBenefit;

  // Коэффициенты
  quality: number; // 0..1
  realization: number; // 0..1

  // Затраты
  oneTimeTCO: TCOOneTimeCosts;
  recurringTCO: TCORecurringCosts;

  // Горизонт и выход на мощность
  horizonYears: CalculationHorizon;
  rampUpMonths: RampUpMonths;

  // Диагностика и готовность
  readinessScore: number; // 1..5 субъективная
  diagnostic: DiagnosticState;
  budget: number;
  dataCategory: DataCategory;
  hasOwner: boolean;

  // Совместимость с базовыми полями классического калькулятора
  staff: number;
  hours: number;
  rate: number;
  oneTime: number;
  monthly: number;
  additional: number;
  readiness: number;
  data: string;
  owner: boolean;
}

// Результат расчёта
export interface BreakEvenThresholds {
  minHoursPerStaff: number | null;
  maxMonthlyServiceCost: number | null;
  minQuality: number | null;
  minRealization: number | null;
  maxOneTimeCost: number | null;
}

export interface BenefitBreakdown {
  timeSavingsAnnual: number;
  contractorSavingsAnnual: number;
  errorSavingsAnnual: number;
  revenueMarginAnnual: number;
  conversionMarginAnnual: number;
  throughputAnnual: number;
  potentialAnnualTotal: number;
  realizedAnnualTotal: number;
}

export interface TCOBreakdown {
  oneTimeTotal: number;
  recurringMonthlyTotal: number;
  recurringAnnualTotal: number;
  year1Total: number;
  horizonTotal: number; // TCO за выбранный горизонт
}

export interface MonthlyCashFlowPoint {
  month: number;
  benefit: number;
  cost: number;
  net: number;
  cumulativeNet: number;
  withoutAI: number;
}

export interface DetailedCalculationResult {
  // Базовые метрики 1-го года (как в Result)
  potentialMonthly: number;
  benefit: number; // B за год
  cost: number; // C за год 1
  effect: number; // E за год 1
  roi: number; // ROI %
  monthlyNet: number; // Bm - Cm на полной мощности
  payback: number | null; // PP в месяцах (с учётом ramp-up)
  breakEven: number | null; // часы в месяц на процесс

  // Расширенные метрики
  horizonYears: CalculationHorizon;
  tcoHorizon: number; // Затраты за весь горизонт
  benefitHorizon: number; // Выгода за весь горизонт
  effectHorizon: number; // Чистый эффект за весь горизонт
  roiHorizon: number; // ROI за весь горизонт

  costOfDelayMonthly: number; // упущенная выгода за месяц промедления

  benefits: BenefitBreakdown;
  costs: TCOBreakdown;
  thresholds: BreakEvenThresholds;
  cashFlowTimeline: MonthlyCashFlowPoint[];

  readiness: number; // 0..10
  risk: "Низкий" | "Средний" | "Повышенный";
  riskScore: number; // 0..100
  diagnosticVerdict: DiagnosticResult;
  diagnosticAdvice: string;
}

// Сравнение вариантов
export interface SolutionVariant {
  id: string;
  name: string;
  badge?: string;
  isBase?: boolean;
  description: string;
  oneTimeCost: number;
  monthlyCost: number;
  expectedAnnualBenefit: number;
  quality: number;
  realization: number;
  result?: {
    effect: number;
    roi: number;
    payback: number | null;
    tco3Years: number;
    risk: "Низкий" | "Средний" | "Повышенный";
    breakEven: number | null;
  };
}

// Приоритеты и портфель процессов
export type ProjectStatus =
  | "Идея"
  | "Расчёт"
  | "Готов к пилоту"
  | "Пилот"
  | "Масштабирование"
  | "Остановлен";

export interface ProcessPriorityItem {
  id: string;
  name: string;
  industry: Industry;
  annualEffect: number;
  roi: number;
  paybackMonths: number | null;
  complexity: number; // 1 (очень легко) .. 5 (очень сложно)
  readiness: number; // 1 .. 10
  risk: "Низкий" | "Средний" | "Повышенный";
  priorityScore: number; // 0 .. 100
  zone: "Быстрые победы" | "Стратегические проекты" | "Сначала подготовить" | "Низкий приоритет";
  status: ProjectStatus;
  updatedAt: string;
  inputs?: Partial<ComprehensiveInputs>;
  investment?: number;
}

// План vs Факт пилота
export interface PilotPlanFactMetric {
  id: string;
  name: string;
  unit: string;
  planValue: number;
  factValue: number;
  higherIsBetter: boolean;
  format?: (v: number) => string;
}

export interface PilotPlanFactData {
  projectName: string;
  startDate: string;
  endDate: string;
  status: "Подготовка" | "В процессе" | "Завершён";
  metrics: PilotPlanFactMetric[];
  notes: string;
  planSavingsAnnual: number;
  actualSavingsAnnual: number;
  planOneTime: number;
  actualOneTime: number;
  planMonthly: number;
  actualMonthly: number;
  forecastErrorPercent: number; // -15%
  scaleRecommendation: "Масштабировать" | "Доработать и повторить пилот" | "Остановить";
  recommendationReason: string;
}

// Сохранённые проекты в localStorage
export interface ProjectVersion {
  versionId: string;
  versionNumber: number;
  createdAt: string;
  note: string;
  inputs: ComprehensiveInputs;
  effect: number;
  roi: number;
  payback: number | null;
}

export interface SavedCalculation {
  id: string;
  title: string;
  industry: Industry;
  process: string;
  createdAt: string;
  updatedAt: string;
  status: ProjectStatus;
  inputs: ComprehensiveInputs;
  effect: number;
  roi: number;
  payback: number | null;
  risk: "Низкий" | "Средний" | "Повышенный";
  readiness: number;
  recommendationTitle: string;
  versions: ProjectVersion[];
}
