"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Download,
  Target,
  SlidersHorizontal,
  Lightbulb,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Pencil,
  Info,
  Sparkles,
  RotateCcw,
  Sliders,
  DollarSign,
  Percent,
  Check,
} from "lucide-react";
import { Header, Footer, MetricCard, TooltipInfo, ProductIcon } from "@/components/ui";
import {
  calculate,
  useCalculation,
  formatMoney,
  formatROI,
  formatPayback,
  isAbnormal,
} from "@/components/calculation";
import { CalculationReport } from "@/components/report";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  calculateSensitivityGrid,
  SensitivityMetric,
  SensitivityVariable,
  round1,
  roundMoney,
} from "@/lib/calculation-engine";
import "../analytics.css";

const number = (n: number) =>
  n.toLocaleString("ru-RU", { maximumFractionDigits: 1 });

export default function Scenarios() {
  const {
    calculatedInputs: inputs,
    result,
    scenarios,
    recommendation,
    calculatedAt,
    hasChanges,
    setInputs,
    setCalculated,
  } = useCalculation();

  // What-If local state
  const [whatIfHours, setWhatIfHours] = useState(inputs.hours);
  const [whatIfRate, setWhatIfRate] = useState(inputs.rate);
  const [whatIfMonthly, setWhatIfMonthly] = useState(inputs.monthly);
  const [whatIfOneTime, setWhatIfOneTime] = useState(inputs.oneTime);
  const [whatIfQuality, setWhatIfQuality] = useState(inputs.quality);
  const [whatIfRealization, setWhatIfRealization] = useState(inputs.realization);
  const [whatIfActive, setWhatIfActive] = useState(false);
  const [whatIfApplied, setWhatIfApplied] = useState(false);

  // Sensitivity 2.0 configuration
  const [sensVarX, setSensVarX] = useState<SensitivityVariable>("monthly");
  const [sensVarY, setSensVarY] = useState<SensitivityVariable>("hours");
  const [sensMetric, setSensMetric] = useState<SensitivityMetric>("effect");

  // What-If calculated live
  const whatIfResult = calculate({
    ...inputs,
    hours: whatIfHours,
    rate: whatIfRate,
    monthly: whatIfMonthly,
    oneTime: whatIfOneTime,
    quality: whatIfQuality,
    realization: whatIfRealization,
  });

  const resetWhatIf = () => {
    setWhatIfHours(inputs.hours);
    setWhatIfRate(inputs.rate);
    setWhatIfMonthly(inputs.monthly);
    setWhatIfOneTime(inputs.oneTime);
    setWhatIfQuality(inputs.quality);
    setWhatIfRealization(inputs.realization);
    setWhatIfActive(false);
  };

  const applyWhatIfToCalculator = () => {
    const updated = {
      ...inputs,
      hours: whatIfHours,
      rate: whatIfRate,
      monthly: whatIfMonthly,
      oneTime: whatIfOneTime,
      quality: whatIfQuality,
      realization: whatIfRealization,
    };
    setInputs(updated);
    setCalculated(updated);
    setWhatIfApplied(true);
    setTimeout(() => setWhatIfApplied(false), 3000);
  };

  // Sensitivity 2.0 Matrix Calculation
  const sensData = calculateSensitivityGrid(inputs, sensVarX, sensVarY, sensMetric);

  // Cash flow timeline data based on selected horizon and ramp-up
  const cashflow = result.detailed.cashFlowTimeline.map((pt) => ({
    month: pt.month,
    ai: pt.cumulativeNet,
    without: 0,
  }));

  const maxMonth = (inputs.horizonYears || 1) * 12;
  const positiveMonth =
    result.monthlyNet > 0
      ? result.payback !== null
        ? result.payback
        : null
      : null;

  const breakLabel =
    positiveMonth === null
      ? "При этих вводных выхода в плюс нет"
      : positiveMonth > maxMonth
      ? `Выход в плюс после ${round1(positiveMonth)} мес. — за пределами выбранного горизонта`
      : `Первый месяц в плюсе: ${round1(positiveMonth)} мес.`;

  const reasoning = [
    [
      "Экономика",
      `Выгода ${formatMoney(result.benefit)} минус затраты ${formatMoney(
        result.cost
      )} = ${formatMoney(result.effect)} за первый год.`,
    ],
    [
      "Готовность",
      `Индекс ${result.readiness}/10. ${
        result.readiness >= 6
          ? "Порог 6/10 достигнут."
          : "До порога пилота 6/10 требуется подготовка."
      } ${inputs.owner ? "Ответственный назначен." : "Ответственный не назначен."}`,
    ],
    [
      "Устойчивость результата",
      scenarios[0].result.effect > 0
        ? `Даже консервативный (пессимистичный) сценарий даёт +${formatMoney(
            scenarios[0].result.effect
          )} в первый год.`
        : `В пессимистичном сценарии эффект ${formatMoney(
            scenarios[0].result.effect
          )}. Результат чувствителен к качеству и реализации.`,
    ],
    [
      "Риски данных",
      `${inputs.dataCategory || inputs.data} данные. ${
        inputs.data === "Конфиденциальные" ||
        inputs.dataCategory === "Коммерческая тайна" ||
        inputs.dataCategory === "Чувствительные (финансы / здоровье)"
          ? "Требуется деперсонализация или изолированный контур."
          : "Проверяйте результаты человеком и условия сервиса."
      } Риск — комплексная оценка категории и готовности.`,
    ],
  ];

  const varLabels: Record<SensitivityVariable, string> = {
    hours: "Экономия часов (ч/мес.)",
    rate: "Стоимость часа (₽)",
    monthly: "Сервис в месяц (₽)",
    oneTime: "Разовые затраты (₽)",
    quality: "Качество q (0–1)",
    realization: "Реализация k (0–1)",
  };

  return (
    <>
      <Header />
      <main className="container analytics-page py-6">
        <div className="analytics-heading mb-5">
          <div>
            <p className="muted text-xs">
              <Link href="/">Главная</Link> › Сценарии и стресс-тестирование
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-[#08275b]">
              Сценарный анализ и What-If симулятор
            </h1>
            <p className="muted text-sm max-w-2xl">
              Сравните условия, протестируйте гипотезы ползунками, проверьте 2D-чувствительность и траекторию денежного потока.
            </p>
          </div>
          <div className="analytics-actions">
            <small className="muted">
              {calculatedAt
                ? new Date(calculatedAt).toLocaleString("ru-RU")
                : "Демонстрационный расчёт"}
            </small>
            <Link className="btn btn-outline text-xs" href="/calculator">
              <Pencil size={14} /> Изменить вводные
            </Link>
          </div>
        </div>

        {hasChanges && (
          <p className="analytics-notice" role="status">
            Данные изменены в калькуляторе — здесь показан последний подтверждённый результат.
          </p>
        )}

        {isAbnormal(inputs, result) && (
          <p className="analytics-notice" role="status">
            Проверьте исходные данные: расчёт содержит необычно высокие значения.
          </p>
        )}

        {/* 4 KPI карточки */}
        <div className="four-grid analytics-kpis grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <MetricCard
            type="benefit"
            title="Экономический эффект"
            value={formatMoney(result.effect)}
            detail="первый год, включая запуск"
            tooltip="Чистая годовая выгода за вычетом всех расходов первого года."
          />
          <MetricCard
            type="roi"
            title="ROI"
            value={formatROI(result.roi)}
            detail="за первый год"
            tooltip="Отношение чистого эффекта ко всем расходам первого года."
          />
          <MetricCard
            type="payback"
            title="Срок окупаемости"
            value={formatPayback(result.payback)}
            detail={
              inputs.rampUpMonths > 0
                ? `с разгоном ${inputs.rampUpMonths} мес.`
                : "с момента старта"
            }
            tooltip="Период возврата инвестиций с учётом динамики выхода на полную мощность."
          />
          <MetricCard
            type="risk"
            title="Уровень риска"
            value={result.risk}
            detail={`готовность ${result.readiness}/10`}
            tooltip="Комплексный индекс на основе категории данных и цифровой готовности."
          />
        </div>

        {/* Секция 1: 3 Сценария */}
        <section className="analytics-section mb-6">
          <div className="analytics-section-heading flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-[#08275b] m-0">Сценарии развития</h2>
            <details className="model-help text-xs text-[#5275a5] cursor-pointer">
              <summary className="flex items-center gap-1 font-medium">
                <Info size={14} /> Как рассчитываются сценарии?
              </summary>
              <p className="mt-1 p-2 bg-white rounded-lg border text-[11px] text-[#426593]">
                Каждый вариант проходит модель с варьированием коэффициентов качества q и реализации k.
                Часы, ставка и затраты сохраняются. Это сценарные допущения для проверки устойчивости проекта.
              </p>
            </details>
          </div>
          <div className="three-grid grid grid-cols-1 md:grid-cols-3 gap-3">
            {scenarios.map((s, idx) => {
              return (
                <article className={`scenario-panel ${s.tone}`} key={s.name}>
                  <div className="scenario-heading flex items-center gap-3">
                    <span className={`scenario-symbol ${s.tone} p-1 flex items-center justify-center`}>
                      <ProductIcon
                        name={
                          idx === 0
                            ? "status-prepare"
                            : idx === 1
                            ? "status-pilot"
                            : "metric-growth"
                        }
                        size={24}
                      />
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-[#08275b] m-0">{s.name}</h3>
                      <p className="text-[11px] text-[#5578a8] m-0">{s.description}</p>
                    </div>
                    {idx === 1 && (
                      <span className="scenario-badge ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#d7f5ee] text-[#009b86]">
                        {recommendation.tone === "positive" ? "Базовый" : "Текущие"}
                      </span>
                    )}
                  </div>
                  <dl className="mt-3 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <dt className="text-[#5578a8]">Экономический эффект:</dt>
                      <dd className="font-bold text-[#08275b] m-0">
                        {formatMoney(s.result.effect)} / год
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#5578a8]">ROI:</dt>
                      <dd className="font-bold text-[#08275b] m-0">
                        {formatROI(s.result.roi)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#5578a8]">Окупаемость:</dt>
                      <dd className="font-bold text-[#08275b] m-0">
                        {formatPayback(s.result.payback)}
                      </dd>
                    </div>
                  </dl>
                </article>
              );
            })}
          </div>
        </section>

        {/* Секция 2: Интерактивный What-If симулятор */}
        <section
          id="what-if"
          className="card p-4 mb-6 border-[#d2e5f8] bg-linear-to-r from-[#fbfdff] to-[#f4f9ff] scroll-mt-20 shadow-xs"
        >
          <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#e3f5ff] text-[#0879e8]">
                <Sliders size={16} />
              </span>
              <div>
                <h2 className="text-base font-bold text-[#08275b] m-0">
                  What-If Симулятор (исследование чувствительности «на лету»)
                </h2>
                <p className="text-[11px] text-[#637ba5] m-0">
                  Тестируйте чувствительность модели ползунками без перезагрузки страницы.
                </p>
              </div>
            </div>

            {whatIfActive && (
              <button
                type="button"
                onClick={resetWhatIf}
                className="text-xs text-[#0879e8] hover:underline flex items-center gap-1 font-semibold"
              >
                <RotateCcw size={13} /> Сбросить к базовым
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-4.5 items-start">
            {/* Компактная панель ползунков */}
            <div className="space-y-2.5 p-3 rounded-xl bg-white border border-[#e1edf9]">
              {/* Часы */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-[#08275b]">
                  <span className="text-[#486b9a] flex items-center gap-1.5">
                    <ProductIcon name="benefit-time" size={14} />
                    Экономия часов на сотрудника:
                  </span>
                  <b className="text-[#05b89f] font-mono">{whatIfHours} ч/мес.</b>
                </div>
                <input
                  type="range"
                  min={1}
                  max={60}
                  step={1}
                  value={whatIfHours}
                  onChange={(e) => {
                    setWhatIfHours(Number(e.target.value));
                    setWhatIfActive(true);
                  }}
                  className="w-full h-2 accent-[#05b89f] cursor-pointer py-2"
                />
              </div>

              {/* Сервис в месяц */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-[#08275b]">
                  <span className="text-[#486b9a] flex items-center gap-1.5">
                    <ProductIcon name="metric-tco" size={14} />
                    Стоимость сервиса в месяц:
                  </span>
                  <b className="text-[#0879e8] font-mono">{formatMoney(whatIfMonthly)}</b>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={200000}
                  step={5000}
                  value={whatIfMonthly}
                  onChange={(e) => {
                    setWhatIfMonthly(Number(e.target.value));
                    setWhatIfActive(true);
                  }}
                  className="w-full h-2 accent-[#0879e8] cursor-pointer py-2"
                />
              </div>

              {/* Разовые затраты */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-[#08275b]">
                  <span className="text-[#486b9a] flex items-center gap-1.5">
                    <ProductIcon name="metric-payback" size={14} />
                    Разовые затраты на внедрение:
                  </span>
                  <b className="text-[#08275b] font-mono">{formatMoney(whatIfOneTime)}</b>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1000000}
                  step={20000}
                  value={whatIfOneTime}
                  onChange={(e) => {
                    setWhatIfOneTime(Number(e.target.value));
                    setWhatIfActive(true);
                  }}
                  className="w-full h-2 accent-[#08275b] cursor-pointer py-2"
                />
              </div>

              {/* Качество q и Реализация k */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-[#edf4fc]">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-[#08275b]">
                    <span className="text-[#486b9a] flex items-center gap-1">
                      <ProductIcon name="benefit-quality" size={13} />
                      Качество q:
                    </span>
                    <b className="font-mono">{whatIfQuality}</b>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={1.0}
                    step={0.05}
                    value={whatIfQuality}
                    onChange={(e) => {
                      setWhatIfQuality(Number(e.target.value));
                      setWhatIfActive(true);
                    }}
                    className="w-full h-2 accent-[#05b89f] cursor-pointer py-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-[#08275b]">
                    <span className="text-[#486b9a] flex items-center gap-1">
                      <ProductIcon name="benefit-conversion" size={13} />
                      Реализация k:
                    </span>
                    <b className="font-mono">{whatIfRealization}</b>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={1.0}
                    step={0.05}
                    value={whatIfRealization}
                    onChange={(e) => {
                      setWhatIfRealization(Number(e.target.value));
                      setWhatIfActive(true);
                    }}
                    className="w-full h-2 accent-[#05b89f] cursor-pointer py-2"
                  />
                </div>
              </div>
            </div>

            {/* Живое превью результата What-If с дельтами vs baseline */}
            <div className="p-3.5 rounded-xl bg-white border border-[#d8e8f8] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#edf4fc] pb-2 mb-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#637ba5]">
                    Результат What-If
                  </span>
                  <span className="text-[10px] text-slate-400">vs базовый расчёт</span>
                </div>

                {/* Эффект E */}
                <div className="mb-2.5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-[#52749e]">Экономический эффект E:</span>
                    <span
                      className={`text-[11px] font-bold font-mono ${
                        whatIfResult.effect - result.effect >= 0
                          ? "text-[#009b86]"
                          : "text-rose-600"
                      }`}
                    >
                      {whatIfResult.effect - result.effect >= 0 ? "+" : ""}
                      {formatMoney(whatIfResult.effect - result.effect)}
                    </span>
                  </div>
                  <div
                    className={`text-xl font-extrabold leading-tight ${
                      whatIfResult.effect >= 0 ? "text-[#05b89f]" : "text-[#d63351]"
                    }`}
                  >
                    {formatMoney(whatIfResult.effect)} / год
                  </div>
                </div>

                {/* ROI и Окупаемость */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#edf4fc] text-xs">
                  <div className="p-2 rounded-lg bg-[#f8fbff] border border-[#e5eef8]">
                    <div className="flex justify-between items-center text-[10px] text-[#637ba5] mb-0.5">
                      <span>ROI:</span>
                      <span
                        className={`font-bold font-mono ${
                          (whatIfResult.roi || 0) - (result.roi || 0) >= 0
                            ? "text-[#009b86]"
                            : "text-rose-600"
                        }`}
                      >
                        {(whatIfResult.roi || 0) - (result.roi || 0) >= 0 ? "+" : ""}
                        {Math.round((whatIfResult.roi || 0) - (result.roi || 0))}%
                      </span>
                    </div>
                    <b className="text-sm font-bold text-[#08275b] block">
                      {formatROI(whatIfResult.roi)}
                    </b>
                  </div>

                  <div className="p-2 rounded-lg bg-[#f8fbff] border border-[#e5eef8]">
                    <div className="flex justify-between items-center text-[10px] text-[#637ba5] mb-0.5">
                      <span>Окупаемость:</span>
                      <span className="font-bold font-mono text-slate-500 text-[10px]">
                        {(() => {
                          if (whatIfResult.payback === null || result.payback === null) return "—";
                          const diff = whatIfResult.payback - result.payback;
                          if (Math.abs(diff) < 0.05) return "Без изменений";
                          return `${diff > 0 ? "+" : "−"}${Math.abs(diff).toFixed(1)} мес.`;
                        })()}
                      </span>
                    </div>
                    <b className="text-sm font-bold text-[#08275b] block">
                      {formatPayback(whatIfResult.payback)}
                    </b>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={applyWhatIfToCalculator}
                className="btn btn-primary text-xs w-full mt-3 flex items-center justify-center gap-1.5 py-2 font-semibold"
              >
                {whatIfApplied ? (
                  <>
                    <Check size={14} className="text-white" /> Параметры применены в калькулятор!
                  </>
                ) : (
                  <>
                    Применить параметры в калькулятор <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Секция 3: Sensitivity 2.0 & Cash flow */}
        <section className="two-grid analytics-columns grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* 2D Тепловая карта чувствительности */}
          <div className="analytics-panel card p-4">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <h2 className="text-base font-bold text-[#08275b] flex items-center gap-1.5 m-0">
                <SlidersHorizontal size={18} className="text-[#0879e8]" />
                Анализ чувствительности 2.0
              </h2>

              <div className="flex items-center gap-2 text-[11px]">
                <span className="md:hidden text-[10px] text-[#0879e8] font-semibold">← Скролл таблицы →</span>
                <span className="text-[#637ba5]">Метрика:</span>
                <select
                  className="field h-7 text-[11px] py-0 px-2 w-auto"
                  value={sensMetric}
                  onChange={(e) => setSensMetric(e.target.value as SensitivityMetric)}
                >
                  <option value="effect">Эффект E (тыс. ₽)</option>
                  <option value="roi">ROI (%)</option>
                  <option value="payback">Окупаемость (мес.)</option>
                </select>
              </div>
            </div>

            {/* Селекторы осей X и Y */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs bg-[#f4f8fd] p-2.5 rounded-lg mb-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#08275b] shrink-0">Ось X:</span>
                <select
                  className="field h-8 text-xs py-0 px-2 w-auto bg-white"
                  value={sensVarX}
                  onChange={(e) => setSensVarX(e.target.value as SensitivityVariable)}
                >
                  <option value="monthly">Стоимость сервиса</option>
                  <option value="oneTime">Разовые затраты</option>
                  <option value="rate">Ставка часа</option>
                  <option value="quality">Качество q</option>
                  <option value="realization">Реализация k</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#08275b] shrink-0">Ось Y:</span>
                <select
                  className="field h-8 text-xs py-0 px-2 w-auto bg-white"
                  value={sensVarY}
                  onChange={(e) => setSensVarY(e.target.value as SensitivityVariable)}
                >
                  <option value="hours">Часы экономии</option>
                  <option value="rate">Ставка часа</option>
                  <option value="quality">Качество q</option>
                  <option value="realization">Реализация k</option>
                  <option value="monthly">Стоимость сервиса</option>
                </select>
              </div>
            </div>

            <div className="table-wrap">
              <table className="sensitivity-table w-full text-[11px] min-w-[380px]">
                <caption>
                  Ось X: {varLabels[sensVarX]} → | Ось Y: {varLabels[sensVarY]} ↓
                </caption>
                <thead>
                  <tr>
                    <th scope="col" className="p-1.5 text-left">
                      Y \ X
                    </th>
                    {sensData.xValues.map((xVal) => (
                      <th scope="col" key={xVal} className="p-1.5 text-center">
                        {xVal > 1000 ? `${Math.round(xVal / 1000)}k` : xVal}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sensData.yValues.map((yVal, rIdx) => (
                    <tr key={yVal}>
                      <th scope="row" className="p-1.5 text-left font-semibold">
                        {yVal > 1000 ? `${Math.round(yVal / 1000)}k` : yVal}
                      </th>
                      {sensData.matrix[rIdx].map((cellVal, cIdx) => {
                        const isPayback = sensMetric === "payback";
                        const isRoi = sensMetric === "roi";
                        const isEffect = sensMetric === "effect";

                        let bgClass = "bg-[#f5f8fc] text-[#607eab]";
                        let text = cellVal !== null ? `${cellVal}` : "—";

                        if (cellVal !== null) {
                          if (isEffect) {
                            text = `${round1(cellVal / 1000)}`;
                            if (cellVal < 0) {
                              bgClass = "bg-[#fef1f3] text-[#be3853]";
                            } else {
                              bgClass = "bg-[#ebf8f5] text-[#008775]";
                            }
                          } else if (isRoi) {
                            text = `${cellVal}%`;
                            if (cellVal <= 0) {
                              bgClass = "bg-[#fef1f3] text-[#be3853]";
                            } else {
                              bgClass = "bg-[#ebf8f5] text-[#008775]";
                            }
                          } else if (isPayback) {
                            text = `${cellVal}м`;
                            if (cellVal <= 6) {
                              bgClass = "bg-[#ebf8f5] text-[#008775]";
                            } else if (cellVal <= 12) {
                              bgClass = "bg-[#f0f9f7] text-[#00a38d]";
                            } else {
                              bgClass = "bg-[#fef1f3] text-[#be3853]";
                            }
                          }
                        }

                        return (
                          <td
                            key={cIdx}
                            className={`p-1.5 text-center font-medium rounded border border-[#eef3f9] transition-colors ${bgClass}`}
                          >
                            {text}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="heatmap-legend mt-3 flex items-center justify-between text-[11px] text-[#637ba5]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#fef1f3] border border-[#fbd4dc] inline-block" />
                Отрицательный эффект / низкий ROI
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#ebf8f5] border border-[#c5ece3] inline-block" />
                Высокая окупаемость / плюс
              </span>
            </div>
          </div>

          {/* График накопленного денежного потока */}
          <div className="analytics-panel card p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-[#08275b] flex items-center gap-1.5 m-0">
                <BarChart3 size={18} className="text-[#05b89f]" />
                Денежный поток (горизонт {inputs.horizonYears || 1}{" "}
                {(inputs.horizonYears || 1) === 1
                  ? "год"
                  : (inputs.horizonYears || 1) < 5
                  ? "года"
                  : "лет"}
                )
              </h2>
              <div className="cashflow-legend text-xs flex gap-3 text-[#52749e]">
                <span className="flex items-center gap-1 font-semibold text-[#008f7b]">
                  <span className="w-2.5 h-0.5 bg-[#05b89f] inline-block" /> С ИИ
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-2.5 h-0.5 border-b border-dashed border-slate-400 inline-block" /> Без ИИ
                </span>
              </div>
            </div>

            <p className="muted text-xs mb-3">
              Накопленный дополнительный чистый денежный поток (тыс. ₽) по месяцам.
            </p>

            <div className="cashflow-chart h-[210px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={cashflow}
                  margin={{ top: 12, right: 15, left: 0, bottom: 5 }}
                >
                  <CartesianGrid stroke="#eaf0f7" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                  />
                  <YAxis
                    width={60}
                    tickFormatter={(v) => `${number(v / 1000)}k`}
                    tickLine={false}
                    axisLine={false}
                    fontSize={10}
                  />
                  <Tooltip
                    labelFormatter={(v) => `Месяц ${v}`}
                    formatter={(v, name) => [formatMoney(Number(v)), name]}
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid #e2edf7",
                      fontSize: 12,
                    }}
                  />
                  <ReferenceLine y={0} stroke="#c5d3e5" />
                  <Line
                    name="Без ИИ"
                    type="linear"
                    dataKey="without"
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    dot={false}
                  />
                  <Line
                    name="С ИИ"
                    type="linear"
                    dataKey="ai"
                    stroke="#05b89f"
                    strokeWidth={2.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                  {result.payback !== null && result.payback <= maxMonth && (
                    <ReferenceDot
                      x={result.payback}
                      y={0}
                      r={5}
                      fill="#05b89f"
                      stroke="white"
                      strokeWidth={2}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="cashflow-callout mt-2 p-2.5 rounded-lg bg-[#eefaf7] border border-[#cbeee5] text-xs font-bold text-[#008f7b]">
              {breakLabel}
            </div>

            <div className="break-even-band mt-3 p-3 rounded-xl bg-[#f5faff] border border-[#dce8f6] flex items-center gap-3 text-xs">
              <Target size={24} className="text-[#0879e8] shrink-0" />
              <div>
                <strong>
                  Общая точка безубыточности:{" "}
                  {result.breakEven === null
                    ? "не определяется"
                    : `${number(result.breakEven)} ч/мес.`}
                </strong>
                {inputs.staff > 0 && result.breakEven !== null && (
                  <p className="m-0 text-[#50729e]">
                    На сотрудника: {number(result.breakEven / inputs.staff)} ч/мес.
                  </p>
                )}
                <small className="text-[#7d9abb]">
                  Порог покрытия всех совокупных расходов первого года с учётом внедрения.
                </small>
              </div>
            </div>
          </div>
        </section>

        {/* Секция 4: Объяснимость (Reasoning) */}
        <section className="reasoning-panel card p-5 mb-6">
          <h2 className="text-lg font-bold text-[#08275b] flex items-center gap-2 mb-4">
            <Lightbulb size={20} className="text-[#05b89f]" />
            Обоснование вердикта и структура эффекта
          </h2>
          <div className="four-grid grid grid-cols-4 gap-4 mb-4">
            {reasoning.map(([title, text]) => (
              <div key={title} className="p-3 rounded-xl bg-[#f8fbff] border border-[#e6f0fa]">
                <h3 className="text-sm font-bold text-[#08275b] mb-1">{title}</h3>
                <p className="text-xs text-[#52749e] m-0 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          <div className={`recommendation-line ${recommendation.tone} p-3.5 rounded-xl border`}>
            <strong className="text-sm font-bold block mb-0.5">
              {recommendation.title}
            </strong>
            <p className="text-xs m-0 leading-relaxed">{recommendation.reason}</p>
          </div>
        </section>

        {/* Финальный CTA */}
        <div className="analytics-cta card p-4 flex items-center justify-between flex-wrap gap-4 bg-linear-to-r from-[#eef9ff] to-[#eafff9] border-[#d2efe8]">
          <div>
            <strong className="text-base font-bold text-[#08275b] block">
              Проверьте расчёт на практике в пилоте
            </strong>
            <p className="muted text-xs m-0">
              30 дней, один процесс, замеры до и после, контроль рисков и фиксация факта.
            </p>
          </div>
          <div className="flex gap-2">
            <Link className="btn btn-primary text-xs" href="/pilot">
              Перейти к пилоту <ArrowRight size={15} />
            </Link>
            <button
              className="btn btn-outline text-xs"
              onClick={() => window.print()}
            >
              <Download size={15} /> Скачать отчёт
            </button>
          </div>
        </div>
      </main>

      <CalculationReport />
      <Footer />
    </>
  );
}
