"use client";
import Link from "next/link";
import { useState, useId } from "react";
import {
  ArrowRight,
  Calculator,
  RotateCcw,
  Info,
  Download,
  Target,
  Share2,
  BookmarkPlus,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Clock,
  Layers,
  BarChart2,
  TrendingUp,
  DollarSign,
  ShieldAlert,
  Zap,
  Briefcase,
  Copy,
  Check,
} from "lucide-react";
import Image from "next/image";
import { Header, Footer, Icon, MetricCard, TooltipInfo, MoneyInput, PercentInput, ProductIcon } from "@/components/ui";
import {
  initialInputs,
  useCalculation,
  Inputs,
  formatMoney,
  formatPayback,
  formatROI,
  readinessFactors,
  isAbnormal,
  validInputs,
} from "@/components/calculation";
import { CalculationReport } from "@/components/report";
import {
  PROCESS_CATALOG,
  INDUSTRY_LIST,
  ROLE_ADVICE,
  DIAGNOSTIC_QUESTIONS,
  CONTEXTUAL_KNOWLEDGE_ARTICLES,
  evaluateDiagnostic,
} from "@/lib/presets";
import {
  Industry,
  UserRole,
  CalculationHorizon,
  RampUpMonths,
  DataCategory,
} from "@/types/economics";
import { generateShareUrl } from "@/lib/storage";

function NumField({
  label,
  value,
  onChange,
  suffix,
  min = 0,
  max,
  step = "any",
  tooltip,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix: string;
  min?: number;
  max?: number;
  step?: string;
  tooltip?: string;
}) {
  return (
    <label className="block">
      <span className="field-label flex items-center justify-between mb-1 text-[12px] font-semibold text-[#183a6f]">
        <span className="flex items-center">
          {label}
          {tooltip && <TooltipInfo text={tooltip} />}
        </span>
      </span>
      <div className="relative">
        <input
          className="field money-input pr-14 text-[13px] font-medium text-[#08275b]"
          type="number"
          inputMode="decimal"
          required
          min={min}
          max={max}
          step={step}
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isFinite(n)) onChange(n);
          }}
        />
        <span className="pointer-events-none absolute right-3 top-[12px] text-[11px] text-[#7890b3]">
          {suffix}
        </span>
      </div>
    </label>
  );
}

function Section({
  n,
  title,
  text,
  badge,
  children,
}: {
  n: string;
  title: string;
  text: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-4.5">
      <div className="mb-3.5 flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <span className="grid h-8.5 w-8.5 shrink-0 place-items-center rounded-full bg-[#dceeff] text-base font-extrabold text-[#08275b]">
            {n}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="m-0 text-[19px] font-bold tracking-[-.03em] text-[#08275b]">
                {title}
              </h2>
              {badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e3f7f2] text-[#009b86]">
                  {badge}
                </span>
              )}
            </div>
            <p className="muted m-0 text-[12px] mt-0.5">{text}</p>
          </div>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function CalculatorPage() {
  const [inputError, setInputError] = useState("");
  const [copiedShare, setCopiedShare] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [showThresholds, setShowThresholds] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showQuickExtra, setShowQuickExtra] = useState(false);

  // RoadMap interactive items
  const [roadmapCompleted, setRoadmapCompleted] = useState<number[]>([0]);

  const {
    inputs,
    setInputs,
    result,
    setCalculated,
    hasChanges,
    calculatedInputs,
    recommendation,
    applyTemplate,
    saveCurrentProject,
  } = useCalculation();

  const upd = <K extends keyof Inputs>(k: K, v: Inputs[K]) => {
    setInputs({ ...inputs, [k]: v });
  };

  const roleInfo = ROLE_ADVICE[inputs.userRole || "Руководитель отдела"];
  const currentIndustryTemplates = PROCESS_CATALOG.filter(
    (t) => t.industry === inputs.industry
  );

  const diagResult = evaluateDiagnostic(inputs.diagnostic);

  const handleShare = async () => {
    const summary = {
      process: inputs.process,
      effect: result.effect,
      roi: result.roi,
      payback: formatPayback(result.payback),
      risk: result.risk,
      recommendation: recommendation.title,
    };
    const url = generateShareUrl(summary);
    const textToCopy = `«ИИ Выгодно» — Расчёт для «${inputs.process}»:\n• Экономический эффект: ${formatMoney(result.effect)}/год\n• ROI: ${formatROI(result.roi)}\n• Окупаемость: ${formatPayback(result.payback)}\n• Риск: ${result.risk}\n• Рекомендация: ${recommendation.title}\n\nСсылка: ${url}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 3000);
    } catch {
      alert(textToCopy);
    }
  };

  const handleSaveProject = () => {
    saveCurrentProject();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const toggleRoadmapStep = (idx: number) => {
    setRoadmapCompleted((prev) =>
      prev.includes(idx) ? prev.filter((x) => x !== idx) : [...prev, idx]
    );
  };

  const isSensitiveData =
    inputs.dataCategory === "Персональные" ||
    inputs.dataCategory === "Коммерческая тайна" ||
    inputs.dataCategory === "Чувствительные (финансы / здоровье)";

  return (
    <>
      <Header />
      <main className="container calculator-page py-6 pb-20 lg:pb-6">
        {/* Хлебные крошки и заголовок */}
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="muted m-0 text-xs">Главная › Калькулятор эффективности</p>
            <h1 className="mb-1 mt-3 text-[38px] font-extrabold tracking-[-.055em] text-[#08275b]">
              Оценка экономической эффективности ИИ
            </h1>
            <p className="muted m-0 max-w-2xl text-[15px]">
              Прозрачный расчёт выгод, совокупной стоимости владения (TCO), сроков окупаемости и рисков внедрения.
            </p>
          </div>

          {/* Переключатель режимов: Быстрый / Расширенный */}
          <div className="flex items-center gap-2 bg-[#f0f6fd] p-1.5 rounded-xl border border-[#dce8f8]">
            <button
              type="button"
              onClick={() => upd("mode", "simple")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                inputs.mode === "simple"
                  ? "bg-white text-[#08275b] shadow-xs"
                  : "text-[#5b7ba8] hover:text-[#08275b]"
              }`}
            >
              ⚡ Быстрый расчёт
            </button>
            <button
              type="button"
              onClick={() => upd("mode", "advanced")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                inputs.mode === "advanced"
                  ? "bg-[#08275b] text-white shadow-xs"
                  : "text-[#5b7ba8] hover:text-[#08275b]"
              }`}
            >
              <Sparkles size={13} className="text-[#05b89f]" />
              Расширенный (TCO + мульти-выгоды)
            </button>
          </div>
        </div>

        {/* Роль пользователя & персонализация */}
        <div className="mb-4 card p-3 bg-linear-to-r from-[#f5faff] to-[#f2fdfa] border-[#e0effa] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 font-bold text-[#08275b]">
              <Briefcase size={15} className="text-[#0879e8]" />
              <span>Кто вы:</span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {(
                [
                  "Собственник бизнеса",
                  "Руководитель отдела",
                  "Специалист",
                  "Консультант / аналитик",
                ] as UserRole[]
              ).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => upd("userRole", role)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                    inputs.userRole === role
                      ? "bg-[#08275b] text-white"
                      : "bg-white text-[#385b8c] border border-[#d6e5f7] hover:border-[#a8caee]"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
          <div className="text-[11px] text-[#486b9a] flex items-center gap-2">
            <span className="font-bold text-[#05b89f]">{roleInfo.badge}:</span>
            <span>{roleInfo.focus}</span>
          </div>
        </div>

        <div className="calc-grid grid grid-cols-1 lg:grid-cols-[1.85fr_1fr] gap-4">
          {/* Левая колонка: Форма ввода */}
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!validInputs(inputs)) {
                setInputError(
                  "Проверьте поля: нужны корректные значения, сотрудник — минимум один, стоимость часа — больше нуля."
                );
                return;
              }
              setInputError("");
              setCalculated(inputs);
            }}
          >
            {/* В расширенном режиме выносим диагностику наверх, в быстром — она доступна в доп. параметрах */}
            {inputs.mode === "advanced" && (
              <div className="card border-[#d9e9f9] bg-[#f8fbff] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowDiagnostic(!showDiagnostic)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-[#f1f7fe] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-[#e3f7f2] text-[#009b86]">
                      <Zap size={16} />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[14px] text-[#08275b]">
                          Диагностика: Подходит ли этот процесс для ИИ?
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            diagResult.verdict === "ИИ подходит для пилота"
                              ? "bg-[#e2fbf4] text-[#009b86]"
                              : diagResult.verdict === "Высокий риск — требуется дополнительная проверка"
                              ? "bg-[#fff0f2] text-[#b93850]"
                              : "bg-[#fff7e6] text-[#b37400]"
                          }`}
                        >
                          {diagResult.verdict}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#637ba5] m-0">
                        Короткий чек-лист критериев применимости нейросетей перед экономическим расчётом.
                      </p>
                    </div>
                  </div>
                  {showDiagnostic ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {showDiagnostic && (
                  <div className="p-4 pt-1 border-t border-[#e5effa] bg-white space-y-3">
                    <p className="text-xs text-[#50709b] mb-3">
                      Отметьте утверждения, справедливые для вашего процесса:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {DIAGNOSTIC_QUESTIONS.map((q) => {
                        const isChecked = !!inputs.diagnostic[q.key];
                        return (
                          <label
                            key={q.key}
                            className={`p-2.5 rounded-lg border flex items-start gap-2.5 cursor-pointer transition-colors ${
                              isChecked
                                ? "border-[#05b89f] bg-[#f0fbf9]"
                                : "border-[#e2edf8] hover:bg-[#f9fcff]"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                upd("diagnostic", {
                                  ...inputs.diagnostic,
                                  [q.key]: e.target.checked,
                                });
                              }}
                              className="mt-0.5 rounded accent-[#05b89f]"
                            />
                            <div>
                              <span className="font-semibold text-[#08275b] block">
                                {q.title}
                              </span>
                              <span className="text-[11px] text-[#6782aa] leading-tight block mt-0.5">
                                {q.hint}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                    <div className="p-3 rounded-lg bg-[#f4f9fd] border border-[#d8e8f8] text-xs text-[#3d608d] mt-2">
                      <b>Вердикт модели:</b> {diagResult.advice}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Блок 1: «Бизнес и процесс» */}
            <Section
              n="1"
              title="Бизнес и процесс"
              text="Выберите отрасль или типовой процесс из каталога, либо введите свои параметры."
            >
              <div className="two-grid grid grid-cols-2 gap-3">
                <label>
                  <span className="field-label flex items-center justify-between mb-1 text-[12px] font-semibold text-[#183a6f]">
                    Отрасль бизнеса
                  </span>
                  <select
                    className="field text-[13px] font-medium text-[#08275b]"
                    value={inputs.industry}
                    onChange={(e) => upd("industry", e.target.value as Industry)}
                  >
                    {INDUSTRY_LIST.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="field-label flex items-center justify-between mb-1 text-[12px] font-semibold text-[#183a6f]">
                    Название процесса
                  </span>
                  <input
                    className="field text-[13px] font-medium text-[#08275b]"
                    value={inputs.process}
                    onChange={(e) => upd("process", e.target.value)}
                    maxLength={120}
                    required
                  />
                </label>
              </div>

              {/* Быстрый выбор типовых процессов для выбранной отрасли */}
              {currentIndustryTemplates.length > 0 && (
                <div className="mt-3 p-3 rounded-xl bg-[#f4f8fd] border border-[#deecfa]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-[#143d78] flex items-center gap-1.5">
                      <Sparkles size={13} className="text-[#05b89f]" />
                      Типичные процессы для {inputs.industry}:
                    </span>
                    <Link
                      href="/cases"
                      className="text-[11px] text-[#0879e8] hover:underline"
                    >
                      Все шаблоны →
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {currentIndustryTemplates.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => applyTemplate(tpl)}
                        className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-[#eaf4ff] text-[#08275b] rounded-lg border border-[#cbe0f6] transition-colors text-left"
                      >
                        <b>{tpl.process}</b>
                        <span className="text-[10px] text-[#6080ad] ml-1.5">
                          (~{tpl.defaults.hours} ч/мес.)
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <label className="mt-3 block">
                <span className="field-label flex items-center justify-between mb-1 text-[12px] font-semibold text-[#183a6f]">
                  Краткое описание процесса
                </span>
                <textarea
                  className="field h-[58px] text-[13px] text-[#08275b]"
                  value={inputs.description}
                  onChange={(e) => upd("description", e.target.value)}
                  maxLength={300}
                  placeholder="Например: подготовка черновиков смет, ответы на типовые отзывы клиентов, разбор первичных документов..."
                />
              </label>
            </Section>

            {/* Блок 2: Экономия времени (в быстром режиме) или Источники выгоды (в расширенном режиме) */}
            {inputs.mode === "simple" ? (
              <>
                {/* 2. Экономия времени (Быстрый режим: 3 поля) */}
                <Section
                  n="2"
                  title="Экономия рабочего времени"
                  text="Сколько рутинного времени высвободит автоматизация у команды."
                >
                  <div className="three-grid grid grid-cols-3 gap-3">
                    <NumField
                      label="Сотрудников"
                      value={inputs.staff}
                      onChange={(v) => {
                        upd("staff", v);
                        if (inputs.timeSavings) {
                          upd("timeSavings", { ...inputs.timeSavings, staff: v });
                        }
                      }}
                      suffix="чел."
                      min={1}
                      step="1"
                      tooltip="Сколько человек задействовано в этом повторяющемся процессе."
                    />
                    <NumField
                      label="Экономия на чел."
                      value={inputs.hours}
                      onChange={(v) => {
                        upd("hours", v);
                        if (inputs.timeSavings) {
                          upd("timeSavings", {
                            ...inputs.timeSavings,
                            hoursPerEmployeeMonth: v,
                          });
                        }
                      }}
                      suffix="ч/мес."
                      tooltip="Реалистичные высвобождаемые часы на рутине (не весь день!)."
                    />
                    <MoneyInput
                      label="Стоимость часа"
                      value={inputs.rate}
                      onChange={(v) => {
                        upd("rate", v);
                        if (inputs.timeSavings) {
                          upd("timeSavings", { ...inputs.timeSavings, hourlyRate: v });
                        }
                      }}
                      suffix="₽/час"
                      min={100}
                      tooltip="Полная ставка сотрудника с учётом налогов и накладных."
                    />
                  </div>
                </Section>

                {/* 3. Затраты и внедрение (Быстрый режим: 4 поля) */}
                <Section
                  n="3"
                  title="Затраты и внедрение"
                  text="Разовые инвестиции на запуск, регулярная подписка и поправки на качество."
                >
                  <div className="two-grid grid grid-cols-2 gap-3">
                    <MoneyInput
                      label="Разовые затраты"
                      value={inputs.oneTime}
                      onChange={(v) => upd("oneTime", v)}
                      suffix="₽"
                      tooltip="Разработка, настройка промптов, интеграция, первичное обучение сотрудников."
                    />
                    <MoneyInput
                      label="Ежемесячный сервис / API"
                      value={inputs.monthly}
                      onChange={(v) => upd("monthly", v)}
                      suffix="₽/мес."
                      tooltip="Подписка на ИИ-сервис или токены API."
                    />
                    <PercentInput
                      label="Коэффициент качества q"
                      value={inputs.quality}
                      onChange={(v) => upd("quality", v)}
                      isDecimal={true}
                      metricKey="quality"
                      tooltip="Доля результатов ИИ, пригодных без критических переделок человеком (обычно 85–95%)."
                    />
                    <PercentInput
                      label="Коэффициент реализации k"
                      value={inputs.realization}
                      onChange={(v) => upd("realization", v)}
                      isDecimal={true}
                      metricKey="realization"
                      tooltip="Какая часть высвобожденных часов направляется на реальную полезную работу (обычно 70–85%)."
                    />
                  </div>
                </Section>

                {/* Аккордеон дополнительных параметров в Быстром режиме */}
                <div className="card border-[#dce8f8] bg-[#f8fbff] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowQuickExtra(!showQuickExtra)}
                    className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#f1f7fe] transition-colors"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-[#08275b]">
                      <Sparkles size={14} className="text-[#05b89f]" />
                      <span>⚙️ Дополнительные параметры (горизонт, риски, данные)</span>
                    </div>
                    {showQuickExtra ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {showQuickExtra && (
                    <div className="p-4 pt-2 border-t border-[#e2ecf8] bg-white space-y-4">
                      <div className="two-grid grid grid-cols-2 gap-3">
                        <MoneyInput
                          label="Дополнительно в месяц"
                          value={inputs.additional}
                          onChange={(v) => upd("additional", v)}
                          suffix="₽/мес."
                          tooltip="Сопровождение, доработки, инфраструктура."
                        />
                        <MoneyInput
                          label="Доступный бюджет пилота"
                          value={inputs.budget}
                          onChange={(v) => upd("budget", v)}
                          suffix="₽"
                          tooltip="Бюджет на 30-дневный пилот. Не прибавляется к затратам, но влияет на индекс готовности."
                        />
                        <label>
                          <span className="field-label flex items-center justify-between mb-1 text-[12px] font-semibold text-[#183a6f]">
                            Категория данных
                            <TooltipInfo metric="risk" />
                          </span>
                          <select
                            className="field text-[13px] font-medium text-[#08275b]"
                            value={inputs.dataCategory || inputs.data}
                            onChange={(e) => {
                              const val = e.target.value as DataCategory;
                              upd("dataCategory", val);
                              upd("data", val);
                            }}
                          >
                            <option value="Публичные">Публичные данные</option>
                            <option value="Внутренние">Внутренние рабочие данные</option>
                            <option value="Персональные">Персональные данные (152-ФЗ)</option>
                            <option value="Коммерческая тайна">Коммерческая тайна</option>
                            <option value="Чувствительные (финансы / здоровье)">
                              Чувствительные (финансы / здоровье)
                            </option>
                          </select>
                        </label>

                        <label className="rounded-lg border border-[#d8e6f6] px-3 py-2 text-[11px] flex items-center gap-2 cursor-pointer h-[43px] mt-[22px]">
                          <input
                            type="checkbox"
                            checked={inputs.hasOwner ?? inputs.owner}
                            onChange={(e) => {
                              upd("hasOwner", e.target.checked);
                              upd("owner", e.target.checked);
                            }}
                            className="accent-[#05b89f]"
                          />
                          <span>
                            <b>Ответственный за пилот назначен</b>
                            <small className="block text-[#6784ad]">
                              Сотрудник контролирует замеры и обучение
                            </small>
                          </span>
                        </label>
                      </div>

                      {/* Горизонт расчёта и Ramp-up */}
                      <div className="p-3 rounded-xl bg-[#f2f7fd] border border-[#dbe8f8] flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#08275b]">
                            Горизонт расчёта:
                          </span>
                          <div className="flex gap-1">
                            {([1, 2, 3, 5] as CalculationHorizon[]).map((yr) => (
                              <button
                                key={yr}
                                type="button"
                                onClick={() => upd("horizonYears", yr)}
                                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                                  (inputs.horizonYears || 1) === yr
                                    ? "bg-[#08275b] text-white"
                                    : "bg-white text-[#3c5e8f] border border-[#d0e1f4]"
                                }`}
                              >
                                {yr} {yr === 1 ? "год" : yr < 5 ? "года" : "лет"}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#08275b] flex items-center">
                            Выход на мощность:
                            <TooltipInfo metric="rampUp" />
                          </span>
                          <select
                            className="field h-8 text-xs py-1 px-2 w-auto text-[#08275b]"
                            value={inputs.rampUpMonths || 0}
                            onChange={(e) =>
                              upd("rampUpMonths", Number(e.target.value) as RampUpMonths)
                            }
                          >
                            <option value="0">Сразу (без разгона)</option>
                            <option value="1">1 месяц</option>
                            <option value="3">3 месяца (плавный запуск)</option>
                            <option value="6">6 месяцев</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Расширенный режим: Мульти-выгоды */}
                <Section
                  n="2"
                  title="Источники выгоды (Мульти-выгоды)"
                  text="Включите дополнительные источники отдачи: подрядчики, ошибки, выручка, конверсия."
                  badge="Мульти-выгоды"
                >
                  {/* Источник 1: Экономия рабочего времени */}
                  <div className="p-3 rounded-xl border border-[#dbe9f8] bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#08275b] flex items-center gap-2">
                        <ProductIcon name="benefit-time" size={18} />
                        1. Экономия рабочего времени команды
                      </span>
                      <span className="text-[11px] text-[#05b89f] font-semibold">
                        {formatMoney(result.detailed.benefits.timeSavingsAnnual)} / год
                      </span>
                    </div>

                    <div className="three-grid grid grid-cols-3 gap-3">
                      <NumField
                        label="Сотрудников"
                        value={inputs.staff}
                        onChange={(v) => {
                          upd("staff", v);
                          if (inputs.timeSavings) {
                            upd("timeSavings", { ...inputs.timeSavings, staff: v });
                          }
                        }}
                        suffix="чел."
                        min={1}
                      />
                      <NumField
                        label="Экономия / сотрудника"
                        value={inputs.hours}
                        onChange={(v) => {
                          upd("hours", v);
                          if (inputs.timeSavings) {
                            upd("timeSavings", {
                              ...inputs.timeSavings,
                              hoursPerEmployeeMonth: v,
                            });
                          }
                        }}
                        suffix="ч/мес."
                        tooltip="Реалистичные высвобождаемые часы на рутине (не весь день!)."
                      />
                      <MoneyInput
                        label="Стоимость часа"
                        value={inputs.rate}
                        onChange={(v) => {
                          upd("rate", v);
                          if (inputs.timeSavings) {
                            upd("timeSavings", { ...inputs.timeSavings, hourlyRate: v });
                          }
                        }}
                        suffix="₽/час"
                        min={100}
                        tooltip="Полная ставка сотрудника с учётом налогов и накладных."
                      />
                    </div>
                  </div>

                  {/* Дополнительные источники */}
                  <div className="mt-3 space-y-3">
                    {/* Источник 2: Подрядчики */}
                    <div className="p-3 rounded-xl border border-[#e0ecf8] bg-[#f9fcff]">
                      <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={inputs.contractorSavings.enabled}
                            onChange={(e) =>
                              upd("contractorSavings", {
                                ...inputs.contractorSavings,
                                enabled: e.target.checked,
                              })
                            }
                            className="accent-[#05b89f]"
                          />
                          <span className="text-xs font-bold text-[#08275b] flex items-center gap-2">
                            <ProductIcon name="benefit-contractors" size={18} />
                            2. Снижение расходов на подрядчиков / фрилансеров
                          </span>
                        </label>
                        {inputs.contractorSavings.enabled && (
                          <span className="text-[11px] text-[#05b89f] font-semibold">
                            +{formatMoney(result.detailed.benefits.contractorSavingsAnnual)} / год
                          </span>
                        )}
                      </div>
                      {inputs.contractorSavings.enabled && (
                        <div className="two-grid grid grid-cols-2 gap-3 mt-2">
                          <MoneyInput
                            label="Текущие расходы на подрядчиков"
                            value={inputs.contractorSavings.currentMonthlyExpense}
                            onChange={(v) =>
                              upd("contractorSavings", {
                                ...inputs.contractorSavings,
                                currentMonthlyExpense: v,
                              })
                            }
                            suffix="₽/мес."
                          />
                          <PercentInput
                            label="Ожидаемое снижение"
                            value={inputs.contractorSavings.reductionPercent}
                            onChange={(v) =>
                              upd("contractorSavings", {
                                ...inputs.contractorSavings,
                                reductionPercent: v,
                              })
                            }
                            isDecimal={false}
                            min={0}
                            max={100}
                          />
                        </div>
                      )}
                    </div>

                    {/* Источник 3: Ошибки и брак */}
                    <div className="p-3 rounded-xl border border-[#e0ecf8] bg-[#f9fcff]">
                      <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={inputs.errorSavings.enabled}
                            onChange={(e) =>
                              upd("errorSavings", {
                                ...inputs.errorSavings,
                                enabled: e.target.checked,
                              })
                            }
                            className="accent-[#05b89f]"
                          />
                          <span className="text-xs font-bold text-[#08275b] flex items-center gap-2">
                            <ProductIcon name="benefit-quality" size={18} />
                            3. Снижение ошибок, брака и переделок
                          </span>
                        </label>
                        {inputs.errorSavings.enabled && (
                          <span className="text-[11px] text-[#05b89f] font-semibold">
                            +{formatMoney(result.detailed.benefits.errorSavingsAnnual)} / год
                          </span>
                        )}
                      </div>
                      {inputs.errorSavings.enabled && (
                        <div className="three-grid grid grid-cols-3 gap-3 mt-2">
                          <NumField
                            label="Ошибок в месяц"
                            value={inputs.errorSavings.errorsPerMonth}
                            onChange={(v) =>
                              upd("errorSavings", {
                                ...inputs.errorSavings,
                                errorsPerMonth: v,
                              })
                            }
                            suffix="шт."
                          />
                          <MoneyInput
                            label="Прямой ущерб от ошибки"
                            value={inputs.errorSavings.costPerError}
                            onChange={(v) =>
                              upd("errorSavings", {
                                ...inputs.errorSavings,
                                costPerError: v,
                              })
                            }
                            suffix="₽"
                          />
                          <PercentInput
                            label="Снижение ошибок с ИИ"
                            value={inputs.errorSavings.reductionPercent}
                            onChange={(v) =>
                              upd("errorSavings", {
                                ...inputs.errorSavings,
                                reductionPercent: v,
                              })
                            }
                            isDecimal={false}
                            min={0}
                            max={100}
                          />
                        </div>
                      )}
                    </div>

                    {/* Источник 4: Дополнительная маржа */}
                    <div className="p-3 rounded-xl border border-[#e0ecf8] bg-[#f9fcff]">
                      <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={inputs.revenueGain.enabled}
                            onChange={(e) =>
                              upd("revenueGain", {
                                ...inputs.revenueGain,
                                enabled: e.target.checked,
                              })
                            }
                            className="accent-[#05b89f]"
                          />
                          <span className="text-xs font-bold text-[#08275b] flex items-center gap-2">
                            <ProductIcon name="benefit-revenue" size={18} />
                            4. Прирост маржинальной прибыли (рост продаж)
                          </span>
                        </label>
                        {inputs.revenueGain.enabled && (
                          <span className="text-[11px] text-[#05b89f] font-semibold">
                            +{formatMoney(result.detailed.benefits.revenueMarginAnnual)} / год
                          </span>
                        )}
                      </div>
                      {inputs.revenueGain.enabled && (
                        <div className="three-grid grid grid-cols-3 gap-3 mt-2">
                          <MoneyInput
                            label="Текущая выручка процесса"
                            value={inputs.revenueGain.currentMonthlyRevenue}
                            onChange={(v) =>
                              upd("revenueGain", {
                                ...inputs.revenueGain,
                                currentMonthlyRevenue: v,
                              })
                            }
                            suffix="₽/мес."
                          />
                          <PercentInput
                            label="Ожидаемый прирост"
                            value={inputs.revenueGain.growthPercent}
                            onChange={(v) =>
                              upd("revenueGain", {
                                ...inputs.revenueGain,
                                growthPercent: v,
                              })
                            }
                            isDecimal={false}
                          />
                          <PercentInput
                            label="Маржинальность (Margin)"
                            value={inputs.revenueGain.contributionMarginPercent}
                            onChange={(v) =>
                              upd("revenueGain", {
                                ...inputs.revenueGain,
                                contributionMarginPercent: v,
                              })
                            }
                            isDecimal={false}
                            min={1}
                            max={100}
                            tooltip="Считаем только дополнительную маржу, а не всю выручку как чистую прибыль."
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </Section>

                {/* 3. Затраты и TCO (Расширенный режим) */}
                <Section
                  n="3"
                  title="Затраты и совокупная стоимость владения (TCO)"
                  text="Совокупная стоимость владения (TCO): детальная раскладка разовых и регулярных затрат."
                  badge="TCO Модель"
                >
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl border border-[#e2edf8] bg-[#f8fbff]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-[#08275b] flex items-center gap-1.5">
                          <ProductIcon name="metric-tco" size={16} />
                          Разовые затраты (CapEx)
                        </span>
                        <span className="text-xs font-bold text-[#0879e8]">
                          Итого разовых: {formatMoney(result.detailed.costs.oneTimeTotal)}
                        </span>
                      </div>
                      <div className="three-grid grid grid-cols-3 gap-2.5">
                        <MoneyInput
                          label="Разработка / кастомизация"
                          value={inputs.oneTimeTCO.development}
                          onChange={(v) =>
                            upd("oneTimeTCO", { ...inputs.oneTimeTCO, development: v })
                          }
                          suffix="₽"
                        />
                        <MoneyInput
                          label="Настройка промптов / базы"
                          value={inputs.oneTimeTCO.setup}
                          onChange={(v) =>
                            upd("oneTimeTCO", { ...inputs.oneTimeTCO, setup: v })
                          }
                          suffix="₽"
                        />
                        <MoneyInput
                          label="Интеграция с CRM / ERP"
                          value={inputs.oneTimeTCO.integration}
                          onChange={(v) =>
                            upd("oneTimeTCO", { ...inputs.oneTimeTCO, integration: v })
                          }
                          suffix="₽"
                        />
                        <MoneyInput
                          label="Обучение сотрудников"
                          value={inputs.oneTimeTCO.training}
                          onChange={(v) =>
                            upd("oneTimeTCO", { ...inputs.oneTimeTCO, training: v })
                          }
                          suffix="₽"
                        />
                        <MoneyInput
                          label="Консультации / аудит"
                          value={inputs.oneTimeTCO.consulting}
                          onChange={(v) =>
                            upd("oneTimeTCO", { ...inputs.oneTimeTCO, consulting: v })
                          }
                          suffix="₽"
                        />
                        <MoneyInput
                          label="Миграция данных"
                          value={inputs.oneTimeTCO.dataMigration}
                          onChange={(v) =>
                            upd("oneTimeTCO", { ...inputs.oneTimeTCO, dataMigration: v })
                          }
                          suffix="₽"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-[#e2edf8] bg-[#f8fbff]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-[#08275b] flex items-center gap-1.5">
                          <ProductIcon name="metric-payback" size={16} />
                          Регулярные расходы (OpEx)
                        </span>
                        <span className="text-xs font-bold text-[#0879e8]">
                          В месяц: {formatMoney(result.detailed.costs.recurringMonthlyTotal)}
                        </span>
                      </div>
                      <div className="three-grid grid grid-cols-3 gap-2.5">
                        <MoneyInput
                          label="Лицензии на пользователей"
                          value={inputs.recurringTCO.licenses}
                          onChange={(v) =>
                            upd("recurringTCO", { ...inputs.recurringTCO, licenses: v })
                          }
                          suffix="₽/мес."
                        />
                        <MoneyInput
                          label="Токены API нейросетей"
                          value={inputs.recurringTCO.apiTokens}
                          onChange={(v) =>
                            upd("recurringTCO", { ...inputs.recurringTCO, apiTokens: v })
                          }
                          suffix="₽/мес."
                        />
                        <MoneyInput
                          label="Серверы / облако"
                          value={inputs.recurringTCO.infrastructure}
                          onChange={(v) =>
                            upd("recurringTCO", {
                              ...inputs.recurringTCO,
                              infrastructure: v,
                            })
                          }
                          suffix="₽/мес."
                        />
                        <MoneyInput
                          label="Поддержка и обновления"
                          value={inputs.recurringTCO.support}
                          onChange={(v) =>
                            upd("recurringTCO", { ...inputs.recurringTCO, support: v })
                          }
                          suffix="₽/мес."
                        />
                        <MoneyInput
                          label="Контроль качества разметки"
                          value={inputs.recurringTCO.qualityControl}
                          onChange={(v) =>
                            upd("recurringTCO", {
                              ...inputs.recurringTCO,
                              qualityControl: v,
                            })
                          }
                          suffix="₽/мес."
                        />
                        <MoneyInput
                          label="Прочие сервисы"
                          value={inputs.recurringTCO.additionalServices}
                          onChange={(v) =>
                            upd("recurringTCO", {
                              ...inputs.recurringTCO,
                              additionalServices: v,
                            })
                          }
                          suffix="₽/мес."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Горизонт расчёта и Ramp-up */}
                  <div className="mt-3 p-3 rounded-xl bg-[#f2f7fd] border border-[#dbe8f8] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#08275b]">
                        Горизонт расчёта:
                      </span>
                      <div className="flex gap-1">
                        {([1, 2, 3, 5] as CalculationHorizon[]).map((yr) => (
                          <button
                            key={yr}
                            type="button"
                            onClick={() => upd("horizonYears", yr)}
                            className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                              (inputs.horizonYears || 1) === yr
                                ? "bg-[#08275b] text-white"
                                : "bg-white text-[#3c5e8f] border border-[#d0e1f4]"
                            }`}
                          >
                            {yr} {yr === 1 ? "год" : yr < 5 ? "года" : "лет"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#08275b] flex items-center">
                        Выход на мощность:
                        <TooltipInfo metric="rampUp" />
                      </span>
                      <select
                        className="field h-8 text-xs py-1 px-2 w-auto text-[#08275b]"
                        value={inputs.rampUpMonths || 0}
                        onChange={(e) =>
                          upd("rampUpMonths", Number(e.target.value) as RampUpMonths)
                        }
                      >
                        <option value="0">Сразу (без разгона)</option>
                        <option value="1">1 месяц</option>
                        <option value="3">3 месяца (плавный запуск)</option>
                        <option value="6">6 месяцев</option>
                      </select>
                    </div>
                  </div>
                </Section>

                {/* 4. Блок «Качество, реализация и данные» (Расширенный режим) */}
                <Section
                  n="4"
                  title="Качество и риски"
                  text="Поправки на качество черновиков, долю реализации высвобожденных часов и безопасность данных."
                >
                  <div className="two-grid grid grid-cols-2 gap-3">
                    <PercentInput
                      label="Коэффициент качества q"
                      value={inputs.quality}
                      onChange={(v) => upd("quality", v)}
                      isDecimal={true}
                      metricKey="quality"
                      tooltip="Доля задач, выполненных без критических ошибок и переделок (обычно 85–95%)."
                    />
                    <PercentInput
                      label="Коэффициент реализации k"
                      value={inputs.realization}
                      onChange={(v) => upd("realization", v)}
                      isDecimal={true}
                      metricKey="realization"
                      tooltip="Какая часть высвобожденных часов направляется на реальную полезную работу (обычно 70–85%)."
                    />

                    <label>
                      <span className="field-label flex items-center justify-between mb-1 text-[12px] font-semibold text-[#183a6f]">
                        Категория данных
                        <TooltipInfo metric="risk" />
                      </span>
                      <select
                        className="field text-[13px] font-medium text-[#08275b]"
                        value={inputs.dataCategory || inputs.data}
                        onChange={(e) => {
                          const val = e.target.value as DataCategory;
                          upd("dataCategory", val);
                          upd("data", val);
                        }}
                      >
                        <option value="Публичные">Публичные данные</option>
                        <option value="Внутренние">Внутренние рабочие данные</option>
                        <option value="Персональные">Персональные данные (152-ФЗ)</option>
                        <option value="Коммерческая тайна">Коммерческая тайна</option>
                        <option value="Чувствительные (финансы / здоровье)">
                              Чувствительные (финансы / здоровье)
                        </option>
                      </select>
                    </label>

                    <label>
                      <span className="field-label flex items-center justify-between mb-1 text-[12px] font-semibold text-[#183a6f]">
                        Готовность команды
                        <TooltipInfo metric="readiness" />
                      </span>
                      <select
                        className="field text-[13px] font-medium text-[#08275b]"
                        value={inputs.readinessScore || inputs.readiness}
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          upd("readinessScore", n);
                          upd("readiness", n);
                        }}
                      >
                        <option value="1">1 — не готовы (нет регламентов)</option>
                        <option value="2">2 — низкая готовность</option>
                        <option value="3">3 — средняя (есть базовые инструкции)</option>
                        <option value="4">4 — высокая (оцифрованные процессы)</option>
                        <option value="5">5 — полностью готовы</option>
                      </select>
                    </label>

                    <MoneyInput
                      label="Доступный бюджет пилота"
                      value={inputs.budget}
                      onChange={(v) => upd("budget", v)}
                      suffix="₽"
                      tooltip="Бюджет на 30-дневный пилот. Не прибавляется к затратам, но влияет на индекс готовности."
                    />

                    <label className="rounded-lg border border-[#d8e6f6] px-3 py-2 text-[11px] flex items-center gap-2 cursor-pointer h-[43px] mt-[22px]">
                      <input
                        type="checkbox"
                        checked={inputs.hasOwner ?? inputs.owner}
                        onChange={(e) => {
                          upd("hasOwner", e.target.checked);
                          upd("owner", e.target.checked);
                        }}
                        className="accent-[#05b89f]"
                      />
                      <span>
                        <b>Ответственный за пилот назначен</b>
                        <small className="block text-[#6784ad]">
                          Сотрудник контролирует замеры и обучение
                        </small>
                      </span>
                    </label>
                  </div>

                  {/* Data safety warning */}
                  {isSensitiveData && (
                    <div
                      role="alert"
                      className="mt-3 rounded-xl bg-[#fff8e8] border border-[#fde2a4] p-3 flex items-start gap-2.5 text-xs text-[#8f5d07]"
                    >
                      <ProductIcon name="ind-security" size={22} className="shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold">
                          Внимание: Выбрана чувствительная категория данных ({inputs.dataCategory})
                        </strong>
                        Перед запуском пилота необходимо проверить правовые основания (152-ФЗ),
                        настройки сохранения истории в сервисе, возможность деперсонализации или использование изолированного контура.
                      </div>
                    </div>
                  )}
                </Section>
              </>
            )}

            {inputError && (
              <p
                role="alert"
                className="rounded-lg bg-[#fff3f5] p-3 text-xs text-[#a6445b] border border-[#fbd3d9]"
              >
                {inputError}
              </p>
            )}

            {hasChanges && (
              <p className="m-0 text-[12px] text-[#6d87ad]">
                Есть несохранённые изменения — нажмите «Рассчитать» для обновления модели.
              </p>
            )}

            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                onClick={() => setInputs(initialInputs)}
                className="btn btn-outline flex-1"
              >
                <RotateCcw size={15} />
                Сбросить вводные
              </button>
              <button className="btn btn-primary flex-[1.7]">
                <Calculator size={16} />
                Рассчитать результат
              </button>
            </div>
          </form>

          {/* Правая колонка: Результаты расчёта, метрики и действия */}
          <aside id="calc-results" className="result-side sticky top-20 h-fit space-y-2.5">
            {/* 1. Блок Рекомендации НАВЕРХУ */}
            <div
              className="card p-3.5 transition-all"
              style={{
                background:
                  recommendation.tone === "positive"
                    ? "#effcf8"
                    : recommendation.tone === "negative"
                    ? "#fff3f5"
                    : "#f4f7fb",
                borderColor:
                  recommendation.tone === "positive"
                    ? "#b5e9df"
                    : recommendation.tone === "negative"
                    ? "#f1d6dc"
                    : "#dbe5ef",
              }}
            >
              <div className="flex gap-3">
                <Icon
                  type={
                    recommendation.tone === "positive"
                      ? "pilot"
                      : recommendation.tone === "negative"
                      ? "loss"
                      : "prepare"
                  }
                  size={28}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <b className="text-[11px] uppercase tracking-wider text-[#4d709e]">
                      Рекомендация сервиса
                    </b>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        recommendation.tone === "positive"
                          ? "bg-[#d1f5ec] text-[#008775]"
                          : recommendation.tone === "negative"
                          ? "bg-[#fde2e6] text-[#b93850]"
                          : "bg-[#e5effa] text-[#2c5282]"
                      }`}
                    >
                      {recommendation.tone === "positive"
                        ? "Окупается"
                        : recommendation.tone === "negative"
                        ? "Требует доработки"
                        : "Умеренный эффект"}
                    </span>
                  </div>
                  <h2 className="my-1.5 text-[18px] font-extrabold text-[#08275b] leading-snug">
                    {recommendation.title}
                  </h2>
                  <p className="muted m-0 text-[12px] leading-relaxed">
                    {recommendation.reason}
                  </p>
                </div>
              </div>

              {/* Интерактивный чеклист подготовки процесса (если готовность < 6) */}
              {result.readiness < 6 && (
                <div className="mt-3 p-3 rounded-xl bg-white border border-[#dce6f2]">
                  <button
                    type="button"
                    onClick={() => setShowRoadmap(!showRoadmap)}
                    className="w-full flex items-center justify-between text-xs font-bold text-[#08275b]"
                  >
                    <span>📋 AI Readiness Roadmap (7 шагов)</span>
                    <span className="text-[10px] text-[#009b86]">
                      {roadmapCompleted.length} / 7 выполнено
                    </span>
                  </button>

                  {showRoadmap && (
                    <div className="mt-2 space-y-1.5 text-[11px]">
                      {[
                        "1. Зафиксировать baseline (время выполнения без ИИ)",
                        "2. Назначить ответственного владельца процесса",
                        "3. Выбрать 10–20 типовых задач для тестирования",
                        "4. Подготовить и протестировать шаблоны промптов",
                        "5. Проверить категорию данных и исключить утечки",
                        "6. Определить критерии качества и долю переделок",
                        "7. Утвердить бюджет и запустить 30-дневный пилот",
                      ].map((step, idx) => (
                        <label
                          key={step}
                          className="flex items-center gap-2 cursor-pointer text-[#486895]"
                        >
                          <input
                            type="checkbox"
                            checked={roadmapCompleted.includes(idx)}
                            onChange={() => toggleRoadmapStep(idx)}
                            className="accent-[#05b89f]"
                          />
                          <span
                            className={
                              roadmapCompleted.includes(idx)
                                ? "line-through text-slate-400"
                                : ""
                            }
                          >
                            {step}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Персонализированный следующий шаг (ровно 1 главный CTA) */}
              <div className="mt-3">
                {recommendation.tone === "positive" ? (
                  <Link
                    href="/pilot"
                    className="btn btn-primary w-full no-underline text-xs py-2.5 justify-center"
                  >
                    Запустить пилот на 30 дней <ArrowRight size={15} />
                  </Link>
                ) : (
                  <Link
                    href="/scenarios"
                    className="btn btn-outline w-full no-underline text-xs py-2.5 justify-center"
                  >
                    Подобрать сценарии и What-If <ArrowRight size={15} />
                  </Link>
                )}
              </div>
            </div>

            {/* 2. Карточка «Результаты расчёта» */}
            <div className="card p-3.5">
              <div className="flex items-center justify-between border-b border-[#e9f2fa] pb-2.5 mb-2.5">
                <div>
                  <h2 className="m-0 text-[16px] font-bold text-[#08275b]">
                    Результаты расчёта
                  </h2>
                  <span className="text-[11px] text-[#637ba5]">
                    Горизонт: {inputs.horizonYears || 1}{" "}
                    {(inputs.horizonYears || 1) === 1
                      ? "год"
                      : (inputs.horizonYears || 1) < 5
                      ? "года"
                      : "лет"}
                    {inputs.rampUpMonths > 0 && ` • разгон ${inputs.rampUpMonths} мес.`}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleShare}
                    title="Поделиться расчётом"
                    className="p-1.5 text-slate-500 hover:text-[#05b89f] rounded-md transition-colors"
                  >
                    {copiedShare ? (
                      <Check size={16} className="text-emerald-500" />
                    ) : (
                      <Share2 size={16} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProject}
                    title="Сохранить в Мои проекты"
                    className="p-1.5 text-slate-500 hover:text-[#0879e8] rounded-md transition-colors"
                  >
                    {savedSuccess ? (
                      <Check size={16} className="text-blue-500" />
                    ) : (
                      <BookmarkPlus size={16} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    title="Печать отчёта"
                    className="p-1.5 text-slate-500 hover:text-[#05b89f] rounded-md transition-colors"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>

              {/* Dirty state: предупреждение */}
              {hasChanges && (
                <div
                  role="status"
                  className="mb-2.5 rounded-lg bg-[#fff7e9] px-3 py-2 text-[11px] font-semibold text-[#9b6711] border border-[#fce3b8] flex items-center gap-1.5"
                >
                  <AlertTriangle size={14} className="shrink-0 text-[#d97706]" />
                  <span>Данные изменены — пересчитайте результат</span>
                </div>
              )}

              {/* Предупреждение о необычно высоких показателях */}
              {isAbnormal(calculatedInputs, result) && (
                <div className="mb-2.5 rounded-lg bg-[#fff5f6] px-3 py-2 text-[11px] text-[#aa5361] border border-[#fad2d8]">
                  Расчёт содержит необычно высокие значения. Проверьте исходные данные.
                </div>
              )}

              <div
                className={`space-y-2 transition-opacity ${
                  hasChanges ? "opacity-70" : ""
                }`}
              >
                <MetricCard
                  type="benefit"
                  title="Экономический эффект E"
                  value={formatMoney(result.effect)}
                  detail={`первый год (выгода ${formatMoney(
                    result.benefit
                  )} − затраты ${formatMoney(result.cost)})`}
                  tooltip="Чистая экономическая выгода за 1-й год после вычета всех разовых и регулярных затрат."
                  metricKey="e"
                />

                <MetricCard
                  type="roi"
                  title="Рентабельность ROI"
                  value={formatROI(result.roi)}
                  detail="за первый год с учётом запуска"
                  tooltip="Отношение чистого эффекта ко всем затратам за первый год (E / C × 100%)."
                  metricKey="roi"
                />

                <MetricCard
                  type="payback"
                  title="Срок окупаемости PP"
                  value={formatPayback(result.payback)}
                  detail={
                    inputs.rampUpMonths > 0
                      ? `с учётом разгона ${inputs.rampUpMonths} мес.`
                      : "с момента запуска"
                  }
                  tooltip="Срок, за который накопленный чистый поток покрывает первоначальные инвестиции."
                  metricKey="pp"
                />

                {/* Точка безубыточности */}
                <div className="card flex items-start gap-2.5 p-2.5 bg-[#fbfdff]">
                  <Icon type="target" size={26} className="mt-0.5" />
                  <div className="flex-1">
                    <div className="text-[12px] font-semibold text-[#08275b] flex items-center justify-between">
                      <span>Точка безубыточности</span>
                      <TooltipInfo metric="breakEven" />
                    </div>
                    <div className="metric-value mt-0.5 text-sm font-bold">
                      {result.breakEven !== null
                        ? `${result.breakEven.toLocaleString("ru-RU", {
                            maximumFractionDigits: 1,
                          })} ч/мес.`
                        : "Не определяется"}
                    </div>
                    <p className="muted mb-0 mt-0.5 text-[10px]">
                      {result.breakEven !== null && calculatedInputs.staff > 0
                        ? `На сотрудника: ${(
                            result.breakEven / calculatedInputs.staff
                          ).toLocaleString("ru-RU", {
                            maximumFractionDigits: 1,
                          })} ч/мес.`
                        : "Порог недостижим при текущих вводных"}
                    </p>
                  </div>
                </div>

                {/* Индекс готовности с раскрытием 5 факторов */}
                <div className="card flex items-center gap-2.5 p-2.5">
                  <Icon type="readiness" size={26} />
                  <div className="flex-1">
                    <details className="readiness-details">
                      <summary className="cursor-pointer text-[12px] font-semibold text-[#08275b] flex items-center justify-between">
                        <span className="flex items-center">
                          Индекс готовности
                          <TooltipInfo metric="readiness" />
                        </span>
                        <span className="text-[10px] text-[#0879e8]">5 факторов ⓘ</span>
                      </summary>
                      <div className="mt-2 rounded-lg bg-[#f3f8fc] p-2.5 text-[11px] space-y-1">
                        {readinessFactors(calculatedInputs).map((factor) => (
                          <div
                            className="flex justify-between gap-2 py-0.5 border-b border-[#e4eef8] last:border-none"
                            key={factor.label}
                          >
                            <span className="text-[#40618d]">{factor.label}</span>
                            <b className="text-[#08275b]">
                              {factor.points} / {factor.max}
                            </b>
                          </div>
                        ))}
                      </div>
                    </details>
                    <div className="mt-1 flex items-center gap-2">
                      <b className="text-sm font-bold text-[#08275b]">
                        {result.readiness} / 10
                      </b>
                      <span className="h-2 flex-1 rounded bg-[#e2ecf8] overflow-hidden">
                        <i
                          className="block h-full rounded bg-[#08b79a] transition-all"
                          style={{ width: `${result.readiness * 10}%` }}
                        />
                      </span>
                      <span className="text-[11px] font-bold text-[#446693]">
                        {result.risk} риск
                      </span>
                    </div>
                  </div>
                </div>

                {/* Второстепенные метрики: Цена отсрочки */}
                {result.detailed.costOfDelayMonthly > 0 && (
                  <div className="p-2.5 rounded-xl bg-[#f0fbf7] border border-[#d2f3ea] text-[11px] text-[#057666] flex items-start gap-2.5">
                    <ProductIcon name="benefit-time" size={18} className="shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between font-bold mb-0.5">
                        <span>Цена отсрочки: ~{formatMoney(result.detailed.costOfDelayMonthly)} / мес.</span>
                        <TooltipInfo metric="costOfDelay" />
                      </div>
                      <span className="text-[#3c786f] text-[10px] block leading-tight">
                        Расчётная потенциальная упущенная выгода, а не гарантированный убыток.
                      </span>
                    </div>
                  </div>
                )}

                {/* Раскрываемый блок «Что должно измениться, чтобы окупилось» */}
                <div className="border border-[#e2edf8] rounded-xl overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setShowThresholds(!showThresholds)}
                    className="w-full p-2.5 flex items-center justify-between text-xs font-semibold text-[#18427e] bg-[#f9fcff] hover:bg-[#f1f7fe]"
                  >
                    <span className="flex items-center gap-1.5">
                      <ProductIcon name="metric-growth" size={16} />
                      Что нужно для окупаемости?
                    </span>
                    {showThresholds ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {showThresholds && (
                    <div className="p-3 text-[11px] space-y-1.5 bg-white border-t border-[#e5effa]">
                      <div className="flex justify-between">
                        <span className="text-[#5578a8]">Мин. экономия часов:</span>
                        <b className="text-[#08275b]">
                          {result.detailed.thresholds.minHoursPerStaff !== null
                            ? `${result.detailed.thresholds.minHoursPerStaff} ч/мес. на сотр.`
                            : "—"}
                        </b>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5578a8]">Макс. допустимый сервис:</span>
                        <b className="text-[#08275b]">
                          {formatMoney(result.detailed.thresholds.maxMonthlyServiceCost || 0)} / мес.
                        </b>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5578a8]">Мин. допустимое качество q:</span>
                        <b className="text-[#08275b]">
                          {result.detailed.thresholds.minQuality !== null
                            ? `${result.detailed.thresholds.minQuality}`
                            : "Не окупается при q=1.0"}
                        </b>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5578a8]">Мин. реализация k:</span>
                        <b className="text-[#08275b]">
                          {result.detailed.thresholds.minRealization !== null
                            ? `${result.detailed.thresholds.minRealization}`
                            : "Не окупается при k=1.0"}
                        </b>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5578a8]">Макс. разовые затраты:</span>
                        <b className="text-[#08275b]">
                          {formatMoney(result.detailed.thresholds.maxOneTimeCost || 0)}
                        </b>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Контекстные материалы из базы знаний */}
            <div className="card p-3.5 bg-[#fbfdff]">
              <div className="text-xs font-bold text-[#08275b] mb-2 flex items-center gap-1.5">
                <Info size={14} className="text-[#0879e8]" />
                Контекстные материалы по вашему расчёту:
              </div>
              <div className="space-y-2 text-xs">
                {CONTEXTUAL_KNOWLEDGE_ARTICLES.filter((art) =>
                  art.condition(inputs, result.effect, result.roi, result.readiness)
                )
                  .slice(0, 2)
                  .map((art) => (
                    <Link
                      key={art.id}
                      href={art.link}
                      className="block p-2 rounded-lg border border-[#e2ecf7] hover:border-[#a8d3fb] bg-white transition-colors no-underline"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#08275b]">{art.title}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#ebf4ff] text-[#0879e8]">
                          {art.tag}
                        </span>
                      </div>
                      <p className="muted text-[11px] m-0 mt-0.5 line-clamp-2">
                        {art.summary}
                      </p>
                    </Link>
                  ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Мобильная плашка с экспресс-итогами расчёта */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#d8e6f4] px-4 py-2.5 shadow-[0_-4px_20px_rgba(8,39,91,0.09)] z-30 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] text-[#637ba5] block leading-tight">Эффект в год</span>
          <b className={`text-sm font-extrabold truncate block ${result.effect >= 0 ? "text-[#009b86]" : "text-rose-600"}`}>
            {formatMoney(result.effect)}
          </b>
        </div>
        <div className="text-center min-w-0">
          <span className="text-[10px] text-[#637ba5] block leading-tight">ROI · Срок</span>
          <b className="text-xs font-bold text-[#08275b] block">
            {formatROI(result.roi)} · {formatPayback(result.payback)}
          </b>
        </div>
        <button
          type="button"
          onClick={() => {
            document.getElementById("calc-results")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="btn btn-primary text-xs py-1.5 px-3 min-h-[38px] whitespace-nowrap"
        >
          Результаты ↓
        </button>
      </div>

      <Footer />
      <CalculationReport />
    </>
  );
}
