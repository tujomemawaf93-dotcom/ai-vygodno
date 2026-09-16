"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Plus,
  Trash2,
  Check,
  Scale,
  Sparkles,
  BarChart2,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import { Header, Footer, MetricCard, CTA, TooltipInfo, MoneyInput, PercentInput, EmptyState, ProductIcon } from "@/components/ui";
import {
  useCalculation,
  formatMoney,
  formatROI,
  formatPayback,
} from "@/components/calculation";
import { SolutionVariant } from "@/types/economics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function ComparePage() {
  const { inputs, setInputs, setCalculated } = useCalculation();

  const initialVariants: SolutionVariant[] = [
    {
      id: "var-1",
      name: "Готовый облачный ассистент (SaaS)",
      badge: "Быстрый старт",
      description: "Готовая подписка, минимальная настройка промптов силами команды.",
      oneTimeCost: 60000,
      monthlyCost: 25000,
      expectedAnnualBenefit: 650000,
      quality: 0.88,
      realization: 0.8,
    },
    {
      id: "var-2",
      name: "Собственная интеграция через API",
      badge: "Оптимальный баланс",
      isBase: true,
      description: "Текущий расчёт из калькулятора с подключением корпоративных баз.",
      oneTimeCost: inputs.oneTime || 240000,
      monthlyCost: inputs.monthly + inputs.additional || 50000,
      expectedAnnualBenefit:
        inputs.staff * inputs.hours * inputs.rate * 12 || 1200000,
      quality: inputs.quality || 0.9,
      realization: inputs.realization || 0.8,
    },
    {
      id: "var-3",
      name: "Заказная разработка под ключ",
      badge: "Максимум контроля",
      description: "Выделенный локальный контур или доработка подрядчиком под ключ.",
      oneTimeCost: 650000,
      monthlyCost: 40000,
      expectedAnnualBenefit: 1400000,
      quality: 0.95,
      realization: 0.85,
    },
  ];

  const [variants, setVariants] = useState<SolutionVariant[]>(initialVariants);

  const updateVariant = (id: string, field: keyof SolutionVariant, value: any) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const addVariant = () => {
    if (variants.length >= 4) return;
    const newId = "var-" + (variants.length + 1);
    setVariants([
      ...variants,
      {
        id: newId,
        name: `Вариант ${variants.length + 1}`,
        description: "Пользовательское решение",
        oneTimeCost: 150000,
        monthlyCost: 30000,
        expectedAnnualBenefit: 800000,
        quality: 0.9,
        realization: 0.8,
      },
    ]);
  };

  const removeVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const resetVariants = () => {
    setVariants(initialVariants);
  };

  const calculateVariantMetrics = (v: SolutionVariant) => {
    const q = Math.max(0, Math.min(1, v.quality));
    const k = Math.max(0, Math.min(1, v.realization));
    const realizedBenefit = v.expectedAnnualBenefit * q * k;
    const year1Cost = v.oneTimeCost + v.monthlyCost * 12;
    const effect = realizedBenefit - year1Cost;
    const roi = year1Cost > 0 ? (effect / year1Cost) * 100 : NaN;
    const monthlyNet = realizedBenefit / 12 - v.monthlyCost;
    const payback = monthlyNet > 0 ? v.oneTimeCost / monthlyNet : null;
    const tco3Years = v.oneTimeCost + v.monthlyCost * 36;
    const breakEvenCost = year1Cost;

    return {
      realizedBenefit,
      year1Cost,
      effect,
      roi,
      payback,
      tco3Years,
    };
  };

  // Вычисление лучших показателей в строках таблицы
  const metricsMap = variants.map((v) => ({
    id: v.id,
    variant: v,
    m: calculateVariantMetrics(v),
  }));

  const bestEffectId =
    metricsMap.length > 1
      ? metricsMap.reduce((b, c) => (c.m.effect > b.m.effect ? c : b), metricsMap[0])?.id
      : null;

  const bestRoiId =
    metricsMap.length > 1
      ? metricsMap.reduce(
          (b, c) =>
            (c.m.roi || -Infinity) > (b.m.roi || -Infinity) ? c : b,
          metricsMap[0]
        )?.id
      : null;

  const validPaybacks = metricsMap.filter((x) => x.m.payback !== null && x.m.payback > 0);
  const bestPaybackId =
    validPaybacks.length > 1
      ? validPaybacks.sort((a, b) => a.m.payback! - b.m.payback!)[0]?.id
      : null;

  const bestTcoId =
    metricsMap.length > 1
      ? metricsMap.reduce(
          (b, c) => (c.m.tco3Years < b.m.tco3Years ? c : b),
          metricsMap[0]
        )?.id
      : null;

  // Executive Summary сравнения двух первых вариантов
  const vA = variants[0];
  const vB = variants[1];
  const mA = vA ? calculateVariantMetrics(vA) : null;
  const mB = vB ? calculateVariantMetrics(vB) : null;

  let conclusionText = "";
  if (mA && mB && vA && vB) {
    const diffEffect = mB.effect - mA.effect;
    const diffTco = mB.tco3Years - mA.tco3Years;
    const diffCost1 = mB.year1Cost - mA.year1Cost;
    const paybackDiff =
      mA.payback !== null && mB.payback !== null
        ? Math.abs(mA.payback - mB.payback).toFixed(1)
        : null;

    if (diffEffect > 0 && diffTco <= 0) {
      conclusionText = `Вариант «${vB.name}» выигрывает по всем ключевым параметрам: чистый эффект выше на ${formatMoney(diffEffect)}/год при меньшем 3-летнем TCO (экономия ${formatMoney(Math.abs(diffTco))}).`;
    } else if (diffEffect < 0 && diffTco >= 0) {
      conclusionText = `Вариант «${vA.name}» финансово эффективнее: даёт на ${formatMoney(Math.abs(diffEffect))}/год больше чистого эффекта и обходится дешевле на ${formatMoney(diffTco)} за 3 года.`;
    } else if (diffTco < 0 && diffEffect <= 0) {
      conclusionText = `Вариант «${vB.name}» дешевле на ${formatMoney(Math.abs(diffTco))} за 3 года (на ${formatMoney(Math.abs(diffCost1))} в 1-й год), хотя приносит на ${formatMoney(Math.abs(diffEffect))} меньше чистой выгоды.`;
    } else if (diffTco > 0 && diffEffect > 0) {
      conclusionText = `Вариант «${vB.name}» приносит на ${formatMoney(diffEffect)}/год больше, но требует дополнительных ${formatMoney(diffCost1)} в первый год (TCO 3 года выше на ${formatMoney(diffTco)}). ${paybackDiff ? `Разница в окупаемости: ~${paybackDiff} мес.` : ""}`;
    } else {
      conclusionText = `Варианты сопоставимы по финансовой модели: ключевым фактором выбора является готовность команды и требования к безопасности данных.`;
    }
  }

  // Данные для сравнительного графика Recharts
  const chartData = variants.map((v) => {
    const m = calculateVariantMetrics(v);
    return {
      name: v.name.length > 20 ? v.name.slice(0, 18) + "…" : v.name,
      fullName: v.name,
      effect: Math.round(m.effect / 1000),
      cost: Math.round(m.year1Cost / 1000),
      tco3: Math.round(m.tco3Years / 1000),
      roi: Number.isFinite(m.roi) ? Math.round(m.roi) : 0,
    };
  });

  const applyVariantToCalculator = (v: SolutionVariant) => {
    setInputs({
      ...inputs,
      process: `${inputs.process} (${v.name})`,
      oneTime: v.oneTimeCost,
      monthly: v.monthlyCost,
      additional: 0,
      quality: v.quality,
      realization: v.realization,
    });
    setCalculated({
      ...inputs,
      process: `${inputs.process} (${v.name})`,
      oneTime: v.oneTimeCost,
      monthly: v.monthlyCost,
      additional: 0,
      quality: v.quality,
      realization: v.realization,
    });
  };

  return (
    <>
      <Header />
      <main className="container py-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="muted text-xs">Главная › Сравнение решений</p>
            <h1 className="mt-2 text-3xl font-extrabold text-[#08275b]">
              Сравнение вариантов внедрения
            </h1>
            <p className="muted text-sm max-w-2xl">
              Сравните до 4 разных подходов: готовый SaaS, собственная интеграция или заказная разработка. Вводите свои параметры и оценивайте разницу в TCO и окупаемости.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <button
              type="button"
              onClick={resetVariants}
              className="btn btn-outline text-xs flex items-center gap-1.5"
              title="Восстановить исходные 3 варианта"
            >
              <RotateCcw size={14} /> Сбросить
            </button>
            {variants.length < 4 && (
              <button
                type="button"
                onClick={addVariant}
                className="btn btn-outline text-xs flex items-center gap-1.5"
              >
                <Plus size={14} /> Добавить вариант ({variants.length}/4)
              </button>
            )}
            <Link href="/calculator" className="btn btn-primary text-xs flex items-center gap-1.5">
              В калькулятор <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* 1. Верхнее Executive Summary сравнения двух первых вариантов */}
        {variants.length >= 2 && vA && vB && mA && mB && (
          <div className="mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[#dcf4ee] text-[#009b86]">
                  <Scale size={14} />
                </span>
                <h2 className="text-xs font-bold text-[#08275b] uppercase tracking-wider m-0">
                  Экспресс-сравнение: Вариант A vs Вариант B
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-[#009b86] bg-[#e1f8f3] px-2.5 py-0.5 rounded-full">
                Математический вывод модели
              </span>
            </div>

            {/* Две карточки рядом: Вариант A и Вариант B */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Карточка Вариант A */}
              <div className="card p-3.5 bg-linear-to-b from-[#f8fbff] to-white border-[#d2e4f7] shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#e6f0fa] mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-[#08275b] text-white">
                      Вариант A
                    </span>
                    <h3 className="text-sm font-bold text-[#08275b] m-0 truncate max-w-[200px]" title={vA.name}>
                      {vA.name}
                    </h3>
                  </div>
                  {vA.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e8f2fc] text-[#0879e8]">
                      {vA.badge}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-white border border-[#e5eef8]">
                    <span className="text-[10px] text-[#637fa5] uppercase font-medium flex items-center gap-1">
                      <ProductIcon name="metric-effect" size={13} /> Эффект E
                    </span>
                    <b className={`text-sm font-extrabold ${mA.effect >= 0 ? "text-[#05b89f]" : "text-rose-600"}`}>
                      {formatMoney(mA.effect)} / год
                    </b>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-[#e5eef8]">
                    <span className="text-[10px] text-[#637fa5] uppercase font-medium flex items-center gap-1">
                      <ProductIcon name="metric-roi" size={13} /> ROI
                    </span>
                    <b className="text-sm font-extrabold text-[#08275b]">{formatROI(mA.roi)}</b>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-[#e5eef8]">
                    <span className="text-[10px] text-[#637fa5] uppercase font-medium flex items-center gap-1">
                      <ProductIcon name="metric-payback" size={13} /> Окупаемость PP
                    </span>
                    <b className="text-sm font-extrabold text-[#08275b]">{formatPayback(mA.payback)}</b>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-[#e5eef8]">
                    <span className="text-[10px] text-[#637fa5] uppercase font-medium flex items-center gap-1">
                      <ProductIcon name="metric-tco" size={13} /> TCO (3 года)
                    </span>
                    <b className="text-sm font-extrabold text-[#08275b]">{formatMoney(mA.tco3Years)}</b>
                  </div>
                </div>
              </div>

              {/* Карточка Вариант B */}
              <div className="card p-3.5 bg-linear-to-b from-[#f4fcf9] to-white border-[#c8eee5] shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#e1f5ef] mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-[#009b86] text-white">
                      Вариант B
                    </span>
                    <h3 className="text-sm font-bold text-[#08275b] m-0 truncate max-w-[200px]" title={vB.name}>
                      {vB.name}
                    </h3>
                  </div>
                  {vB.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#dcf5ef] text-[#008775]">
                      {vB.badge}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-white border border-[#d8f0ea]">
                    <span className="text-[10px] text-[#637fa5] uppercase font-medium flex items-center gap-1">
                      <ProductIcon name="metric-effect" size={13} /> Эффект E
                    </span>
                    <b className={`text-sm font-extrabold ${mB.effect >= 0 ? "text-[#05b89f]" : "text-rose-600"}`}>
                      {formatMoney(mB.effect)} / год
                    </b>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-[#d8f0ea]">
                    <span className="text-[10px] text-[#637fa5] uppercase font-medium flex items-center gap-1">
                      <ProductIcon name="metric-roi" size={13} /> ROI
                    </span>
                    <b className="text-sm font-extrabold text-[#08275b]">{formatROI(mB.roi)}</b>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-[#d8f0ea]">
                    <span className="text-[10px] text-[#637fa5] uppercase font-medium flex items-center gap-1">
                      <ProductIcon name="metric-payback" size={13} /> Окупаемость PP
                    </span>
                    <b className="text-sm font-extrabold text-[#08275b]">{formatPayback(mB.payback)}</b>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-[#d8f0ea]">
                    <span className="text-[10px] text-[#637fa5] uppercase font-medium flex items-center gap-1">
                      <ProductIcon name="metric-tco" size={13} /> TCO (3 года)
                    </span>
                    <b className="text-sm font-extrabold text-[#08275b]">{formatMoney(mB.tco3Years)}</b>
                  </div>
                </div>
              </div>
            </div>

            {/* 2–3 чётких математических строки выводов */}
            <div className="card p-3 bg-[#f8fbff] border-[#d9e8f8]">
              <div className="text-[11px] font-bold text-[#4e6f98] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#05b89f]" />
                Ключевые математические различия:
              </div>
              <ul className="m-0 pl-4 space-y-1 text-xs text-[#08275b] font-medium leading-relaxed">
                {/* Строка 1: Окупаемость */}
                <li>
                  {mA.payback !== null && mB.payback !== null ? (
                    mA.payback < mB.payback ? (
                      <>
                        <b className="text-[#08275b]">«{vA.name}»</b> окупается на{" "}
                        <b className="text-[#009b86]">
                          {(mB.payback - mA.payback).toFixed(1)} мес. быстрее
                        </b>{" "}
                        (за {formatPayback(mA.payback)} против {formatPayback(mB.payback)}).
                      </>
                    ) : mB.payback < mA.payback ? (
                      <>
                        <b className="text-[#08275b]">«{vB.name}»</b> окупается на{" "}
                        <b className="text-[#009b86]">
                          {(mA.payback - mB.payback).toFixed(1)} мес. быстрее
                        </b>{" "}
                        (за {formatPayback(mB.payback)} против {formatPayback(mA.payback)}).
                      </>
                    ) : (
                      <>Оба варианта имеют одинаковый срок возврата инвестиций ({formatPayback(mA.payback)}).</>
                    )
                  ) : (
                    <>
                      Вариант {mA.payback !== null ? `«${vA.name}»` : `«${vB.name}»`} окупается, тогда как альтернатива требует оптимизации расходов.
                    </>
                  )}
                </li>

                {/* Строка 2: Инвестиции */}
                <li>
                  {vA.oneTimeCost < vB.oneTimeCost ? (
                    <>
                      <b className="text-[#08275b]">«{vA.name}»</b> требует на{" "}
                      <b className="text-[#0879e8]">
                        {formatMoney(vB.oneTimeCost - vA.oneTimeCost)} меньше
                      </b>{" "}
                      стартовых инвестиций ({formatMoney(vA.oneTimeCost)} против {formatMoney(vB.oneTimeCost)}).
                    </>
                  ) : vB.oneTimeCost < vA.oneTimeCost ? (
                    <>
                      <b className="text-[#08275b]">«{vB.name}»</b> требует на{" "}
                      <b className="text-[#0879e8]">
                        {formatMoney(vA.oneTimeCost - vB.oneTimeCost)} меньше
                      </b>{" "}
                      стартовых инвестиций ({formatMoney(vB.oneTimeCost)} против {formatMoney(vA.oneTimeCost)}).
                    </>
                  ) : (
                    <>Оба варианта требуют одинаковых стартовых вложений ({formatMoney(vA.oneTimeCost)}).</>
                  )}
                </li>

                {/* Строка 3: Чистый эффект */}
                <li>
                  {mA.effect > mB.effect ? (
                    <>
                      <b className="text-[#08275b]">«{vA.name}»</b> даёт на{" "}
                      <b className="text-[#009b86]">
                        {formatMoney(mA.effect - mB.effect)} больший
                      </b>{" "}
                      чистый эффект в год ({formatMoney(mA.effect)} против {formatMoney(mB.effect)}).
                    </>
                  ) : mB.effect > mA.effect ? (
                    <>
                      <b className="text-[#08275b]">«{vB.name}»</b> даёт на{" "}
                      <b className="text-[#009b86]">
                        {formatMoney(mB.effect - mA.effect)} больший
                      </b>{" "}
                      чистый эффект в год ({formatMoney(mB.effect)} против {formatMoney(mA.effect)}).
                    </>
                  ) : (
                    <>Оба варианта приносят одинаковый годовой эффект ({formatMoney(mA.effect)}).</>
                  )}
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Пустое состояние, если все варианты удалены */}
        {variants.length === 0 ? (
          <EmptyState
            illustration="/assets/empty-compare.png"
            title="Все варианты удалены"
            description="Добавьте новый вариант для сравнения или восстановите 3 типовых подхода внедрения."
            actionText="Восстановить базовые варианты"
            onAction={resetVariants}
          />
        ) : (
          /* Сравнительная таблица */
          <div className="card overflow-x-auto p-4 mb-6 border-[#dbeaf8]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-[#08275b] flex items-center gap-2 m-0">
                <Scale size={18} className="text-[#05b89f]" />
                Сравнительная таблица решений
              </h2>
              <span className="text-xs text-[#637ba5]">
                Зелёным подсвечены наилучшие финансовые значения в строке
              </span>
            </div>

            <table className="w-full text-xs min-w-[700px] border-collapse">
              <thead>
                <tr className="bg-[#f2f7fd] text-[#08275b]">
                  <th className="p-2.5 text-left w-[240px] font-bold">Параметр</th>
                  {variants.map((v) => (
                    <th key={v.id} className="p-2.5 text-left border-l border-[#e0ecf8]">
                      <div className="flex items-center justify-between gap-1">
                        <input
                          type="text"
                          value={v.name}
                          onChange={(e) => updateVariant(v.id, "name", e.target.value)}
                          className="font-bold text-[#08275b] bg-transparent border-b border-dashed border-[#a6c7ec] focus:outline-none w-full text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => removeVariant(v.id)}
                          className="text-slate-400 hover:text-rose-500 p-1 rounded"
                          title="Удалить вариант"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      {v.badge && (
                        <span className="text-[10px] text-[#009b86] font-semibold block mt-0.5">
                          {v.badge}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e9f2fa]">
                {/* Разовые затраты */}
                <tr className="hover:bg-[#f9fcff] transition-colors">
                  <td className="p-2.5 font-semibold text-[#486895]">
                    Разовые затраты (C₀)
                  </td>
                  {variants.map((v) => (
                    <td key={v.id} className="p-2.5 border-l border-[#e0ecf8]">
                      <MoneyInput
                        value={v.oneTimeCost}
                        onChange={(val) => updateVariant(v.id, "oneTimeCost", val)}
                        suffix="₽"
                      />
                    </td>
                  ))}
                </tr>

                {/* Ежемесячный сервис */}
                <tr className="hover:bg-[#f9fcff] transition-colors">
                  <td className="p-2.5 font-semibold text-[#486895]">
                    Сервис в месяц (Cₘ)
                  </td>
                  {variants.map((v) => (
                    <td key={v.id} className="p-2.5 border-l border-[#e0ecf8]">
                      <MoneyInput
                        value={v.monthlyCost}
                        onChange={(val) => updateVariant(v.id, "monthlyCost", val)}
                        suffix="₽/мес."
                      />
                    </td>
                  ))}
                </tr>

                {/* Ожидаемая потенциальная выгода */}
                <tr className="hover:bg-[#f9fcff] transition-colors">
                  <td className="p-2.5 font-semibold text-[#486895]">
                    Потенциальная выгода / год (Bₚ)
                  </td>
                  {variants.map((v) => (
                    <td key={v.id} className="p-2.5 border-l border-[#e0ecf8]">
                      <MoneyInput
                        value={v.expectedAnnualBenefit}
                        onChange={(val) =>
                          updateVariant(v.id, "expectedAnnualBenefit", val)
                        }
                        suffix="₽/год"
                      />
                    </td>
                  ))}
                </tr>

                {/* Качество q и реализация k */}
                <tr className="hover:bg-[#f9fcff] transition-colors">
                  <td className="p-2.5 font-semibold text-[#486895]">
                    Качество q · Реализация k
                  </td>
                  {variants.map((v) => (
                    <td key={v.id} className="p-2.5 border-l border-[#e0ecf8]">
                      <div className="grid grid-cols-2 gap-1.5">
                        <PercentInput
                          value={v.quality}
                          isDecimal={true}
                          onChange={(val) => updateVariant(v.id, "quality", val)}
                        />
                        <PercentInput
                          value={v.realization}
                          isDecimal={true}
                          onChange={(val) => updateVariant(v.id, "realization", val)}
                        />
                      </div>
                    </td>
                  ))}
                </tr>

                {/* РАСЧЁТНЫЕ СТРОКИ С ПОДСВЕТКОЙ ЛУЧШИХ */}
                <tr className="bg-[#f7fbff] hover:bg-[#f2f8fe] transition-colors">
                  <td className="p-2.5 font-bold text-[#08275b]">
                    <span className="flex items-center gap-1.5">
                      <ProductIcon name="metric-effect" size={14} />
                      Чистый эффект первого года (E)
                    </span>
                  </td>
                  {variants.map((v) => {
                    const m = calculateVariantMetrics(v);
                    const isBest = v.id === bestEffectId;
                    return (
                      <td
                        key={v.id}
                        className={`p-2.5 border-l border-[#e0ecf8] text-right font-bold text-sm transition-colors ${
                          isBest ? "bg-[#e2fbf4] text-[#008f7b]" : ""
                        }`}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {isBest && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#05b89f] text-white">
                              ★ Лучший
                            </span>
                          )}
                          <span
                            className={
                              m.effect >= 0 ? "text-[#05b89f]" : "text-[#d43753]"
                            }
                          >
                            {formatMoney(m.effect)}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                <tr className="hover:bg-[#f9fcff] transition-colors">
                  <td className="p-2.5 font-bold text-[#08275b]">
                    <span className="flex items-center gap-1.5">
                      <ProductIcon name="metric-roi" size={14} />
                      ROI за первый год
                    </span>
                  </td>
                  {variants.map((v) => {
                    const m = calculateVariantMetrics(v);
                    const isBest = v.id === bestRoiId;
                    return (
                      <td
                        key={v.id}
                        className={`p-2.5 border-l border-[#e0ecf8] text-right font-bold text-xs transition-colors ${
                          isBest ? "bg-[#e2fbf4] text-[#008f7b]" : "text-[#08275b]"
                        }`}
                      >
                        {formatROI(m.roi)}
                      </td>
                    );
                  })}
                </tr>

                <tr className="hover:bg-[#f9fcff] transition-colors">
                  <td className="p-2.5 font-bold text-[#08275b]">
                    <span className="flex items-center gap-1.5">
                      <ProductIcon name="metric-payback" size={14} />
                      Срок окупаемости (PP)
                    </span>
                  </td>
                  {variants.map((v) => {
                    const m = calculateVariantMetrics(v);
                    const isBest = v.id === bestPaybackId;
                    return (
                      <td
                        key={v.id}
                        className={`p-2.5 border-l border-[#e0ecf8] text-right font-bold text-xs transition-colors ${
                          isBest ? "bg-[#e2fbf4] text-[#008f7b]" : "text-[#08275b]"
                        }`}
                      >
                        {formatPayback(m.payback)}
                      </td>
                    );
                  })}
                </tr>

                <tr className="hover:bg-[#f9fcff] transition-colors">
                  <td className="p-2.5 font-bold text-[#08275b]">
                    <span className="flex items-center gap-1.5">
                      <ProductIcon name="metric-tco" size={14} />
                      TCO за 3 года
                    </span>
                  </td>
                  {variants.map((v) => {
                    const m = calculateVariantMetrics(v);
                    const isBest = v.id === bestTcoId;
                    return (
                      <td
                        key={v.id}
                        className={`p-2.5 border-l border-[#e0ecf8] text-right text-xs font-semibold transition-colors ${
                          isBest ? "bg-[#e2fbf4] text-[#008f7b] font-bold" : "text-[#426490]"
                        }`}
                      >
                        {formatMoney(m.tco3Years)}
                      </td>
                    );
                  })}
                </tr>

                {/* Кнопка применить в калькулятор */}
                <tr>
                  <td className="p-2.5 font-semibold text-[#486895]">Действие</td>
                  {variants.map((v) => (
                    <td key={v.id} className="p-2.5 border-l border-[#e0ecf8]">
                      <button
                        type="button"
                        onClick={() => applyVariantToCalculator(v)}
                        className="btn btn-outline text-[11px] py-1 px-2.5 w-full flex items-center justify-center gap-1"
                      >
                        Применить в расчёт <ArrowRight size={12} />
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Визуальное сравнение: Диаграммы BarChart */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="card p-4">
            <h3 className="text-sm font-bold text-[#08275b] mb-1">
              Экономический эффект первого года vs Затраты 1-го года (тыс. ₽)
            </h3>
            <p className="muted text-xs mb-3">Зелёный — эффект, Синий — полные затраты</p>
            <div className="h-[230px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf2f7" />
                  <XAxis dataKey="name" fontSize={11} interval={0} />
                  <YAxis fontSize={11} width={45} />
                  <Tooltip
                    formatter={(val, name) => [
                      `${val} тыс. ₽`,
                      name === "effect" ? "Чистый эффект" : "Затраты 1 года",
                    ]}
                  />
                  <Bar dataKey="effect" name="Чистый эффект" fill="#08b79a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cost" name="Затраты 1 года" fill="#0879e8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-4">
            <h3 className="text-sm font-bold text-[#08275b] mb-1">
              TCO за 3 года (совокупные инвестиции, тыс. ₽)
            </h3>
            <p className="muted text-xs mb-3">Разовые затраты + регулярные платежи за 36 месяцев</p>
            <div className="h-[230px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf2f7" />
                  <XAxis dataKey="name" fontSize={11} interval={0} />
                  <YAxis fontSize={11} width={45} />
                  <Tooltip formatter={(val) => [`${val} тыс. ₽`, "TCO за 3 года"]} />
                  <Bar dataKey="tco3" name="TCO 3 года" fill="#18396f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <CTA
          title="Определились с подходящим вариантом решения?"
          button="Рассчитать детально в калькуляторе"
        />
      </main>
      <Footer />
    </>
  );
}
