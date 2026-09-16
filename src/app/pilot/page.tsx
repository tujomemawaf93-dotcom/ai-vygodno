"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  CirclePlay,
  CheckCircle2,
  BarChart3,
  Clock3,
  ClipboardCheck,
  RotateCcw,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  FileCheck,
  Check,
  Save,
} from "lucide-react";
import { Header, Footer, Icon, CTA, CheckLine, Logo, MetricCard, MoneyInput, PercentInput, ProductIcon } from "@/components/ui";
import {
  useCalculation,
  formatMoney,
  formatROI,
  formatPayback,
} from "@/components/calculation";
import { calculatePilotPlanFact } from "@/lib/calculation-engine";
import { getPilotData, savePilotData } from "@/lib/storage";
import { PilotPlanFactData } from "@/types/economics";
import "../secondary.css";

const steps = [
  [
    "1",
    "Выбрать процесс",
    "Определите участок, где ИИ может принести быстрый и заметный эффект.",
    "target",
  ],
  [
    "2",
    "Замерить до",
    "Зафиксируйте текущие показатели: время, стоимость, качество, объём.",
    "benefit",
  ],
  [
    "3",
    "Запустить с ИИ",
    "Настройте решение, обучите команду и начните использовать в работе.",
    "rocket",
  ],
  [
    "4",
    "Сравнить результат",
    "Оцените изменения, сделайте выводы и примите решение.",
    "risk",
  ],
];

export default function Pilot() {
  const { calculatedInputs: inputs, result } = useCalculation();

  // План vs Факт состояние
  const [planTimeMin, setPlanTimeMin] = useState(10);
  const [factTimeMin, setFactTimeMin] = useState(6);

  const [planTasksDay, setPlanTasksDay] = useState(20);
  const [factTasksDay, setFactTasksDay] = useState(27);

  const [planErrorPct, setPlanErrorPct] = useState(5);
  const [factErrorPct, setFactErrorPct] = useState(2);

  const [planMonthlyCost, setPlanMonthlyCost] = useState(inputs.monthly + inputs.additional || 40000);
  const [factMonthlyCost, setFactMonthlyCost] = useState(34000);

  const [planQuality, setPlanQuality] = useState(inputs.quality || 0.9);
  const [factQuality, setFactQuality] = useState(0.88);

  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    "Выбран процесс для пилота": true,
    "Подготовлены промпты": true,
    "Назначен ответственный": inputs.owner,
    "Обеспечена безопасность данных": true,
    "Определены критерии успеха": false,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const loaded = getPilotData();
    if (loaded) {
      // Restore if saved
    }
  }, []);

  // Расчёт фактического эффекта и отклонения
  const hourlyRate = inputs.rate || 2000;
  const staffCount = inputs.staff || 5;

  // Экономия минут на задачу * задач в день * 21 день * staff
  const actualSavedHoursMonth =
    ((planTimeMin - factTimeMin) / 60) * factTasksDay * 21;
  const actualSavingsAnnual =
    actualSavedHoursMonth * staffCount * hourlyRate * 12 * factQuality * 0.8;
  const actualYear1Cost = inputs.oneTime + factMonthlyCost * 12;
  const actualEffect = actualSavingsAnnual - actualYear1Cost;
  const actualRoi =
    actualYear1Cost > 0 ? (actualEffect / actualYear1Cost) * 100 : NaN;

  // Plan vs fact analysis
  const planEffect = result.effect;
  const analysis = calculatePilotPlanFact(
    planEffect,
    actualEffect,
    factQuality,
    planQuality
  );

  const toggleCheck = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSavePilot = () => {
    const data: PilotPlanFactData = {
      projectName: inputs.process,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      status: "Завершён",
      metrics: [],
      notes: "Итоги пилота 30 дней",
      planSavingsAnnual: result.benefit,
      actualSavingsAnnual,
      planOneTime: inputs.oneTime,
      actualOneTime: inputs.oneTime,
      planMonthly: planMonthlyCost,
      actualMonthly: factMonthlyCost,
      forecastErrorPercent: analysis.forecastError,
      scaleRecommendation: analysis.verdict,
      recommendationReason: analysis.reason,
    };
    savePilotData(data);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;

  return (
    <>
      <Header />
      <main className="secondary-page pilot-page">
        <section className="soft-bg">
          <div className="container hero-grid grid grid-cols-[1fr_1.05fr] gap-10 py-10">
            <div>
              <span className="eyebrow">БЫСТРЫЙ СТАРТ</span>
              <h1 className="mt-5 text-[51px] font-extrabold tracking-[-.06em]">
                Пилот 30 дней
              </h1>
              <h2 className="mt-0 text-[23px] font-bold text-[#506b99]">
                Проверьте, как ИИ работает в вашем бизнесе
                <br />
                с контролем рисков, замерами Plan vs Fact
              </h2>
              <p className="muted max-w-[550px] text-[16px] leading-6">
                Запустите пилотный проект на одном процессе: зафиксируйте план ДО запуска, внесите фактические замеры ПОСЛЕ и примите взвешенное решение о масштабировании.
              </p>
              <div className="mt-5 flex gap-3">
                <a href="#plan-fact" className="btn btn-primary no-underline">
                  План vs Факт пилота <ArrowRight size={18} />
                </a>
                <a href="#process" className="btn btn-outline">
                  <CirclePlay className="text-[#05b89f]" />
                  Как это работает?
                </a>
              </div>
              <div className="mt-5 flex gap-5">
                <CheckLine>Без больших затрат</CheckLine>
                <CheckLine>Контроль рисков</CheckLine>
                <CheckLine>Реальный результат</CheckLine>
              </div>
            </div>

            <div className="pilot-preview">
              <div className="preview-chrome">
                <span />
                <span />
                <span />
                <small>Рабочее пространство · пример пилота</small>
              </div>
              <div className="preview-topbar">
                <Logo small />
                <nav>
                  <span>Мой пилот</span>
                  <span>Результаты</span>
                  <span>Отчёт</span>
                </nav>
              </div>
              <div className="grid grid-cols-2 gap-4 p-3">
                <div>
                  <div className="pilot-title">
                    <h3>Пилот 30 дней</h3>
                    <span className="text-xs bg-[#eefaf7] text-[#009b86] font-semibold px-2 py-0.5 rounded">В процессе</span>
                  </div>
                  <p className="muted text-xs mb-2">{inputs.process || "Обработка заявок"}</p>
                  <div className="h-2 rounded bg-[#e4eef9]">
                    <i className="block h-full w-[40%] rounded bg-[#05b89f]" />
                  </div>
                  <p className="text-xs text-[#52749e] mt-1 mb-3">
                    День 12 из 30 <b className="float-right text-[#08275b]">40%</b>
                  </p>
                  <div className="space-y-1.5">
                    <p className="flex items-center gap-2 text-[11px] text-[#008775] font-semibold m-0">
                      <span className="grid h-4 w-4 place-items-center rounded-full bg-[#ebf8f5] text-[#008775] text-[10px] font-bold">✓</span>
                      <span>Процесс настроен</span>
                    </p>
                    <p className="flex items-center gap-2 text-[11px] text-[#008775] font-semibold m-0">
                      <span className="grid h-4 w-4 place-items-center rounded-full bg-[#ebf8f5] text-[#008775] text-[10px] font-bold">✓</span>
                      <span>ИИ выполняет задачи</span>
                    </p>
                    <p className="flex items-center gap-2 text-[11px] text-[#08275b] font-bold m-0">
                      <span className="grid h-4 w-4 place-items-center rounded-full bg-[#e8f1fc] text-[#0879e8] text-[10px] font-bold">○</span>
                      <span>Идёт сбор результатов</span>
                    </p>
                    <p className="flex items-center gap-2 text-[11px] text-[#7892b1] font-medium m-0">
                      <span className="grid h-4 w-4 place-items-center rounded-full bg-[#f1f5f9] text-[#94a3b8] text-[10px] font-bold">○</span>
                      <span>Готовим итоговый отчёт</span>
                    </p>
                  </div>
                </div>
                <div className="rounded-xl bg-linear-to-b from-[#eefaf7] to-[#e4f6f1] p-4 flex flex-col justify-between border border-[#c4eee2]">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Icon type="benefit" size={26} />
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#05b89f]/15 text-[#008775]">30 дней</span>
                    </div>
                    <h3 className="text-[16px] font-extrabold text-[#08275b] mb-1">
                      Замер на 7-й и 21-й день
                    </h3>
                    <p className="muted text-[11px] m-0 mb-3 leading-snug">
                      Сравните время и качество выполнения одинаковых задач до и после ИИ.
                    </p>
                    <div className="rounded-lg overflow-hidden bg-white/80 border border-[#b2e5d7] p-2 flex items-center justify-center">
                      <Image
                        src="/assets/ill-pilot-30days.png"
                        alt="30 дней пилота"
                        width={210}
                        height={120}
                        className="object-contain max-h-[110px]"
                        unoptimized
                      />
                    </div>
                  </div>
                  <div className="text-xs text-[#009b86] font-bold mt-2">
                    Чек-лист: {completedCount} из 5 шагов
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Секция: План vs Факт (Интерактивная аналитика после пилота) */}
        <section id="plan-fact" className="container py-8">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div>
              <span className="eyebrow">РЕЗУЛЬТАТ ПИЛОТА</span>
              <h2 className="section-title mt-1">Интерактивный анализ: План vs Факт</h2>
              <p className="muted text-xs m-0">
                Введите фактические результаты пилота и рассчитайте ошибку прогноза (Forecast error).
              </p>
            </div>
            <button
              onClick={handleSavePilot}
              className="btn btn-outline text-xs flex items-center gap-1.5"
            >
              {savedSuccess ? <Check size={14} className="text-[#05b89f]" /> : <Save size={14} />}
              {savedSuccess ? "Сохранено!" : "Зафиксировать факт пилота"}
            </button>
          </div>

          <div className="grid grid-cols-[1.5fr_1fr] gap-6 mb-6">
            {/* Таблица измерений */}
            <div className="card p-4 border-[#dbeaf8]">
              <div className="table-wrap">
                <table className="w-full text-xs min-w-[480px] border-collapse">
                  <thead>
                    <tr className="bg-[#f0f7ff] text-[#08275b]">
                      <th className="p-2.5 text-left border">Метрика процесса</th>
                      <th className="p-2.5 text-center border w-28">План</th>
                      <th className="p-2.5 text-center border w-36">Факт пилота</th>
                      <th className="p-2.5 text-center border w-28">Отклонение</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Время на задачу */}
                    <tr>
                      <td className="p-2.5 border font-semibold">Время на одну задачу</td>
                      <td className="p-2 text-center border text-[#52749e]">
                        {planTimeMin} мин
                      </td>
                      <td className="p-2 text-center border bg-[#f8fdff]">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            min="1"
                            value={factTimeMin}
                            onChange={(e) => setFactTimeMin(Number(e.target.value))}
                            className="field h-7 text-xs text-center p-1 w-16 font-bold text-[#08275b]"
                          />
                          <span className="text-[#52749e]">мин</span>
                        </div>
                      </td>
                      <td className={`p-2.5 text-center border font-bold ${factTimeMin <= planTimeMin ? "text-[#008775] bg-[#ebf8f5]/40" : "text-[#be3853] bg-[#fef1f3]/40"}`}>
                        {planTimeMin > 0
                          ? `${factTimeMin <= planTimeMin ? "" : "+"}${Math.round(((factTimeMin - planTimeMin) / planTimeMin) * 100)}%`
                          : "—"}
                      </td>
                    </tr>

                    {/* Задач в день */}
                    <tr>
                      <td className="p-2.5 border font-semibold">Число задач в день</td>
                      <td className="p-2 text-center border text-[#52749e]">
                        {planTasksDay} шт.
                      </td>
                      <td className="p-2 text-center border bg-[#f8fdff]">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            min="1"
                            value={factTasksDay}
                            onChange={(e) => setFactTasksDay(Number(e.target.value))}
                            className="field h-7 text-xs text-center p-1 w-16 font-bold text-[#08275b]"
                          />
                          <span className="text-[#52749e]">шт.</span>
                        </div>
                      </td>
                      <td className={`p-2.5 text-center border font-bold ${factTasksDay >= planTasksDay ? "text-[#008775] bg-[#ebf8f5]/40" : "text-[#be3853] bg-[#fef1f3]/40"}`}>
                        {planTasksDay > 0
                          ? `${factTasksDay >= planTasksDay ? "+" : ""}${Math.round(((factTasksDay - planTasksDay) / planTasksDay) * 100)}%`
                          : "—"}
                      </td>
                    </tr>

                    {/* Доля ошибок */}
                    <tr>
                      <td className="p-2.5 border font-semibold">Доля ошибок / брака</td>
                      <td className="p-2 text-center border text-[#52749e]">
                        {planErrorPct}%
                      </td>
                      <td className="p-2 text-center border bg-[#f8fdff]">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={factErrorPct}
                            onChange={(e) => setFactErrorPct(Number(e.target.value))}
                            className="field h-7 text-xs text-center p-1 w-16 font-bold text-[#08275b]"
                          />
                          <span className="text-[#52749e]">%</span>
                        </div>
                      </td>
                      <td className={`p-2.5 text-center border font-bold ${factErrorPct <= planErrorPct ? "text-[#008775] bg-[#ebf8f5]/40" : "text-[#be3853] bg-[#fef1f3]/40"}`}>
                        {factErrorPct <= planErrorPct ? "-" : "+"}
                        {Math.abs(factErrorPct - planErrorPct)} п.п.
                      </td>
                    </tr>

                    {/* Ежемесячные затраты */}
                    <tr>
                      <td className="p-2.5 border font-semibold">Затраты на сервис в месяц</td>
                      <td className="p-2 text-center border text-xs text-[#52749e]">
                        {formatMoney(planMonthlyCost)}
                      </td>
                      <td className="p-2 text-center border bg-[#f8fdff]">
                        <MoneyInput
                          value={factMonthlyCost}
                          onChange={setFactMonthlyCost}
                          className="field h-7 text-xs text-center p-1 w-28 font-bold"
                          min={0}
                        />
                      </td>
                      <td className={`p-2.5 text-center border font-semibold ${factMonthlyCost <= planMonthlyCost ? "text-[#008775] bg-[#ebf8f5]/40" : "text-[#be3853] bg-[#fef1f3]/40"}`}>
                        {planMonthlyCost > 0
                          ? `${factMonthlyCost <= planMonthlyCost ? "" : "+"}${Math.round(((factMonthlyCost - planMonthlyCost) / planMonthlyCost) * 100)}%`
                          : "—"}
                      </td>
                    </tr>

                    {/* Коэффициент качества */}
                    <tr>
                      <td className="p-2.5 border font-semibold">Коэффициент качества q</td>
                      <td className="p-2 text-center border text-xs text-[#52749e]">
                        {Math.round(planQuality * 100)}%
                      </td>
                      <td className="p-2 text-center border bg-[#f8fdff]">
                        <div className="w-20 mx-auto">
                          <PercentInput
                            value={factQuality}
                            onChange={setFactQuality}
                            isDecimal={true}
                            className="field h-7 text-xs text-center p-1 w-full font-bold text-[#0879e8]"
                          />
                        </div>
                      </td>
                      <td className={`p-2.5 text-center border font-semibold ${factQuality >= planQuality ? "text-[#008775] bg-[#ebf8f5]/40" : "text-[#be3853] bg-[#fef1f3]/40"}`}>
                        {factQuality >= planQuality ? "+" : ""}
                        {Math.round((factQuality - planQuality) * 100)} п.п.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Карточка итогового решения по пилоту */}
            {(() => {
              const isScale = analysis.verdict === "Масштабировать";
              const isRework = analysis.verdict === "Доработать и повторить пилот";
              const borderClass = isScale
                ? "border-[#a5dfd4] bg-linear-to-b from-[#f0fbf8] to-[#ffffff]"
                : isRework
                ? "border-[#fde68a] bg-linear-to-b from-[#fffdf5] to-[#ffffff]"
                : "border-[#fbcdd5] bg-linear-to-b from-[#fff5f6] to-[#ffffff]";
              const badgeClass = isScale
                ? "bg-[#ebf8f5] text-[#008775] border-[#a5dfd4]"
                : isRework
                ? "bg-[#fef9ee] text-[#b45309] border-[#fde68a]"
                : "bg-[#fef1f3] text-[#be3853] border-[#fbcdd5]";
              const titleClass = isScale
                ? "text-[#008775]"
                : isRework
                ? "text-[#b45309]"
                : "text-[#be3853]";
              const deltaRub = actualEffect - planEffect;
              const humanDeviation =
                deltaRub < 0
                  ? `Фактический результат хуже прогноза на ${formatMoney(Math.abs(deltaRub))} / на ${Math.abs(analysis.forecastError)}% ниже планового`
                  : deltaRub > 0
                  ? `Фактический результат лучше прогноза на ${formatMoney(deltaRub)} / на ${analysis.forecastError}% выше планового`
                  : "Фактический результат точно соответствует плану";

              const verdictIcon = isScale
                ? "/assets/verdict-scale.png"
                : isRework
                ? "/assets/verdict-refine.png"
                : "/assets/verdict-stop.png";

              return (
                <div className={`card p-5 border flex flex-col justify-between ${borderClass}`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-[#52749e] uppercase tracking-wider">
                        Вердикт по итогам пилота
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${badgeClass}`}>
                        {isScale ? "Готово к внедрению" : isRework ? "Требует тюнинга" : "Высокий риск"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      <Image
                        src={verdictIcon}
                        alt={analysis.verdict}
                        width={44}
                        height={44}
                        className="object-contain shrink-0"
                        unoptimized
                      />
                      <h3 className={`text-2xl font-black m-0 leading-tight ${titleClass}`}>
                        {analysis.verdict}
                      </h3>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white/80 border border-slate-200/60 text-xs font-semibold text-[#08275b] mb-3">
                      {humanDeviation}
                    </div>

                    <div className="space-y-2 text-xs bg-white p-3 rounded-xl border border-slate-200/80 mb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[#6280a5]">Фактический эффект:</span>
                        <b className="text-sm text-[#008775]">
                          {formatMoney(actualEffect)} / год
                        </b>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#6280a5]">Фактический ROI:</span>
                        <b className="text-sm text-[#08275b]">{formatROI(actualRoi)}</b>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#6280a5]">Качество результата:</span>
                        <b className={`text-xs ${factQuality >= 0.85 ? "text-[#008775]" : "text-[#b45309]"}`}>
                          {Math.round(factQuality * 100)}% (цель: {Math.round(planQuality * 100)}%)
                        </b>
                      </div>
                    </div>

                    <div className="text-xs text-[#52749e] leading-relaxed">
                      <strong className="text-[#08275b] block mb-1.5 font-semibold">Обоснование решения:</strong>
                      <ul className="space-y-1.5 pl-0 list-none m-0">
                        {(analysis.reasons || [analysis.reason]).map((r, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-[11px] text-[#3d5d85] leading-normal">
                            <span className="text-[#05b89f] font-bold shrink-0 mt-0.5">•</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200/60 flex gap-2 mt-3">
                    <Link
                      href="/priorities"
                      className="btn btn-outline text-xs w-full flex items-center justify-center gap-1"
                    >
                      Обновить статус в портфеле <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>

        {/* Чек-лист и этапы */}
        <section id="process" className="container py-7 border-t border-[#edf4fc]">
          <div className="flex justify-between">
            <h2 className="section-title">Как проходит пилот</h2>
            <a href="#pilot-checklist" className="text-sm text-[#009b86]">
              К подготовке <ArrowRight size={14} className="inline" />
            </a>
          </div>
          <div className="pilot-flow mt-4">
            {steps.map(([n, t, b, i]) => (
              <article className="pilot-step" key={n}>
                <b className="grid h-7 w-7 place-items-center rounded-full bg-[#dceeff] text-sm">
                  {n}
                </b>
                <Icon type={i as "target"} size={26} />
                <h3 className="text-[15px] font-extrabold">{t}</h3>
                <p className="muted text-[12px] leading-4">{b}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 p-5 rounded-2xl bg-linear-to-r from-[#f0f7ff] via-[#ebf7f5] to-[#f4faff] border border-[#d6e7f8] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-md">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#05b89f]">Архитектура пилота</span>
              <h3 className="text-lg font-extrabold text-[#08275b] mt-1 mb-2">30-дневный контрольный цикл</h3>
              <p className="text-xs text-[#52749e] leading-relaxed m-0">
                Чёткий регламент: выбор одного узкого участка, замер baseline, тестовая эксплуатация 10–20 типовых задач с обученной командой и итоговая фиксация факта с расчётом отклонений.
              </p>
            </div>
            <div className="shrink-0">
              <Image
                src="/assets/ill-pilot-flow.png"
                alt="Схема пилота 30 дней"
                width={380}
                height={160}
                className="object-contain rounded-xl max-h-[145px]"
                unoptimized
              />
            </div>
          </div>

          <div className="two-grid mt-6 grid grid-cols-[1fr_1fr] gap-4">
            <section id="pilot-checklist" className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="m-0 text-xl font-extrabold flex items-center gap-2">
                  <ClipboardCheck size={22} className="text-[#009b86]" /> Чек-лист подготовки
                </h2>
                <span className="text-xs font-bold text-[#05b89f]">
                  {completedCount} из 5 готово
                </span>
              </div>
              {[
                ["Выбран процесс для пилота", "Один повторяющийся процесс с измеримым результатом"],
                ["Подготовлены промпты", "Шаблоны запросов и тестовые примеры задач"],
                ["Назначен ответственный", "Сотрудник контролирует ход и результаты пилота"],
                ["Обеспечена безопасность данных", "Проверены доступы и категория используемой информации"],
                ["Определены критерии успеха", "Зафиксированы время, качество, стоимость и ожидаемый эффект"],
              ].map(([title, description]) => (
                <label className="pilot-check cursor-pointer" key={title}>
                  <input
                    type="checkbox"
                    checked={!!checklist[title]}
                    onChange={() => toggleCheck(title)}
                  />
                  <span>
                    <b>{title}</b>
                    <small>{description}</small>
                  </span>
                </label>
              ))}
            </section>

            <section className="card p-5 flex flex-col justify-between">
              <div>
                <h2 className="m-0 text-xl font-extrabold flex items-center gap-2 mb-2">
                  <FileCheck size={22} className="text-[#0879e8]" /> Правила безопасного пилота
                </h2>
                <div className="space-y-2.5 text-xs text-[#52749e] mt-3">
                  <div className="p-2.5 rounded-lg bg-[#f8fbff] border border-[#e2edf8]">
                    <b className="text-[#08275b] block mb-0.5">10–20 типовых задач</b>
                    Сформируйте фиксированный тестовый датасет реальных обращений или документов.
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#f8fbff] border border-[#e2edf8]">
                    <b className="text-[#08275b] block mb-0.5">Двойной слепой замер</b>
                    Замерьте чистое время эксперта без ИИ и время с ИИ (включая проверку черновика).
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#f8fbff] border border-[#e2edf8]">
                    <b className="text-[#08275b] block mb-0.5">Изоляция секретов</b>
                    Исключите передачу паролей, коммерческих тайн и персональных данных.
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#edf4fc]">
                <Link href="/calculator" className="btn btn-outline text-xs w-full flex items-center justify-center gap-1">
                  Вернуться в калькулятор <ArrowRight size={13} />
                </Link>
              </div>
            </section>
          </div>
        </section>

        <CTA
          title="Готовы протестировать ИИ в вашем бизнесе?"
          button="Начать пилот"
        />
      </main>
      <Footer />
    </>
  );
}
