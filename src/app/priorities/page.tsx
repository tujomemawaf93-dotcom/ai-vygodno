"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  Plus,
  Trash2,
  Copy,
  Scale,
  ExternalLink,
  CheckCircle2,
  SlidersHorizontal,
  Target,
  Sparkles,
  Layers,
  FolderKanban,
  AlertCircle,
  HelpCircle,
  BarChart2,
  Rocket,
  ArrowUpRight,
  RotateCcw,
} from "lucide-react";
import { Header, Footer, MetricCard, CTA, TooltipInfo, ProductIcon, EmptyState } from "@/components/ui";
import {
  useCalculation,
  formatMoney,
  formatROI,
  formatPayback,
} from "@/components/calculation";
import { ProcessPriorityItem, ProjectStatus } from "@/types/economics";
import {
  getPortfolio,
  savePortfolio,
  getSavedProjects,
} from "@/lib/storage";
import { calculateProcessPriorityScore } from "@/lib/calculation-engine";
import { PROCESS_CATALOG } from "@/lib/presets";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";

const DEFAULT_PROCESSES: ProcessPriorityItem[] = [
  {
    id: "proc-1",
    name: "Ответы клиентам на 1-й линии",
    industry: "Услуги",
    investment: 200000,
    annualEffect: 580000,
    roi: 180,
    paybackMonths: 3.2,
    complexity: 1.8,
    readiness: 7,
    risk: "Низкий",
    priorityScore: 84,
    zone: "Быстрые победы",
    status: "Готов к пилоту",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proc-2",
    name: "Подготовка черновиков КП и смет",
    industry: "Строительство",
    investment: 270000,
    annualEffect: 920000,
    roi: 240,
    paybackMonths: 2.8,
    complexity: 3.2,
    readiness: 6,
    risk: "Средний",
    priorityScore: 78,
    zone: "Стратегические проекты",
    status: "Пилот",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proc-3",
    name: "Первичная обработка актов и счетов",
    industry: "Документы и бэк-офис",
    investment: 160000,
    annualEffect: 340000,
    roi: 110,
    paybackMonths: 4.5,
    complexity: 2.1,
    readiness: 8,
    risk: "Низкий",
    priorityScore: 68,
    zone: "Сначала подготовить",
    status: "Расчёт",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proc-4",
    name: "Сквозной скоринг звонков и встреч",
    industry: "Продажи",
    investment: 130000,
    annualEffect: 180000,
    roi: 40,
    paybackMonths: 8.5,
    complexity: 4.2,
    readiness: 4,
    risk: "Повышенный",
    priorityScore: 32,
    zone: "Низкий приоритет",
    status: "Идея",
    updatedAt: new Date().toISOString(),
  },
];

export default function PrioritiesPage() {
  const router = useRouter();
  const { inputs, setInputs, setCalculated } = useCalculation();
  const [items, setItems] = useState<ProcessPriorityItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<ProcessPriorityItem | null>(null);

  useEffect(() => {
    const saved = getPortfolio();
    if (saved && saved.length > 0) {
      setItems(saved);
    } else {
      setItems(DEFAULT_PROCESSES);
      savePortfolio(DEFAULT_PROCESSES);
    }
    setIsLoaded(true);
  }, []);

  const updateItemStatus = (id: string, newStatus: ProjectStatus) => {
    const updated = items.map((it) =>
      it.id === id ? { ...it, status: newStatus, updatedAt: new Date().toISOString() } : it
    );
    setItems(updated);
    savePortfolio(updated);
  };

  const removeItem = (id: string) => {
    const updated = items.filter((it) => it.id !== id);
    setItems(updated);
    savePortfolio(updated);
    if (selectedProcess?.id === id) setSelectedProcess(null);
  };

  const duplicateItem = (id: string) => {
    const item = items.find((it) => it.id === id);
    if (!item) return;
    const duplicated: ProcessPriorityItem = {
      ...item,
      id: "proc_" + Math.random().toString(36).substring(2, 7),
      name: `${item.name} (копия)`,
      updatedAt: new Date().toISOString(),
    };
    const updated = [duplicated, ...items];
    setItems(updated);
    savePortfolio(updated);
  };

  const openInCalculator = (item: ProcessPriorityItem) => {
    if (item.inputs) {
      setInputs({ ...inputs, ...item.inputs, process: item.name });
      setCalculated({ ...inputs, ...item.inputs, process: item.name });
    } else {
      setInputs({
        ...inputs,
        process: item.name,
        industry: item.industry,
      });
      setCalculated({
        ...inputs,
        process: item.name,
        industry: item.industry,
      });
    }
    router.push("/calculator");
  };

  const addProcessFromCatalog = (templateId: string) => {
    const tpl = PROCESS_CATALOG.find((t) => t.id === templateId);
    if (!tpl) return;
    const effect = (tpl.defaults.hours * tpl.defaults.staff * tpl.defaults.rate * 12 * 0.9 * 0.8) - (tpl.defaults.oneTime + tpl.defaults.monthly * 12);
    const cost = tpl.defaults.oneTime + tpl.defaults.monthly * 12;
    const roi = cost > 0 ? (effect / cost) * 100 : 50;
    const complexity = 2.5;
    const readiness = tpl.defaults.readiness * 2;
    const risk = tpl.defaults.data === "Внутренние" ? "Средний" : "Низкий";

    const { score, zone } = calculateProcessPriorityScore(
      effect,
      roi,
      complexity,
      readiness,
      risk as any
    );

    const newItem: ProcessPriorityItem = {
      id: "proc_" + Math.random().toString(36).substring(2, 7),
      name: tpl.process,
      industry: tpl.industry,
      investment: cost,
      annualEffect: Math.round(effect),
      roi: Math.round(roi),
      paybackMonths: 3.5,
      complexity,
      readiness,
      risk: risk as any,
      priorityScore: score,
      zone,
      status: "Расчёт",
      updatedAt: new Date().toISOString(),
    };

    const updated = [newItem, ...items];
    setItems(updated);
    savePortfolio(updated);
  };

  // Dashboard KPI metrics
  const activeCount = items.length;
  const pilotsCount = items.filter((i) => i.status === "Пилот").length;
  const readyForPilotCount = items.filter((i) => i.status === "Готов к пилоту").length;
  const scalingCount = items.filter((i) => i.status === "Масштабирование").length;
  const totalPotentialEffect = items.reduce(
    (acc, it) => acc + (it.annualEffect > 0 ? it.annualEffect : 0),
    0
  );
  const avgROI =
    items.length > 0
      ? Math.round(items.reduce((acc, it) => acc + (it.roi || 0), 0) / items.length)
      : 0;

  // Данные для ScatterChart
  const scatterData = items.map((it) => ({
    x: it.complexity,
    y: Math.round(it.annualEffect / 1000),
    z: it.priorityScore,
    name: it.name,
    zone: it.zone,
    risk: it.risk,
    item: it,
  }));

  const getZoneColor = (zone: string) => {
    switch (zone) {
      case "Быстрые победы":
        return "#008775";
      case "Стратегические проекты":
        return "#0879e8";
      case "Сначала подготовить":
        return "#b45309";
      default:
        return "#94a3b8";
    }
  };

  return (
    <>
      <Header />
      <main className="container py-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="muted text-xs">Главная › Приоритеты и портфель проектов</p>
            <h1 className="mt-2 text-3xl font-extrabold text-[#08275b]">
              Матрица приоритетов: Что внедрять первым?
            </h1>
            <p className="muted text-sm max-w-2xl">
              Ранжируйте процессы по ожидаемому эффекту, сложности реализации, готовности и рискам. Фокусируйтесь на «Быстрых победах» перед переходом к крупным системам.
            </p>
          </div>

          <div className="flex gap-2">
            <select
              className="field h-9 text-xs py-1 px-3 w-auto bg-white"
              onChange={(e) => {
                if (e.target.value) {
                  addProcessFromCatalog(e.target.value);
                  e.target.value = "";
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>
                + Добавить процесс из каталога...
              </option>
              {PROCESS_CATALOG.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.industry}: {t.process}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Компактная сводка портфеля, подчеркивающая доминирование матрицы 2x2 */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-linear-to-r from-[#f5f9fe] to-[#f2fcf9] border border-[#dce8f6] mb-5 text-xs text-[#08275b]">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <ProductIcon name="accent-workspace" size={16} />
              В портфеле: <b>{activeCount} процессов</b> ({pilotsCount} в пилоте, {readyForPilotCount} готовы к пилоту)
            </span>
            <span className="text-[#c8d9ed]">|</span>
            <span className="flex items-center gap-1.5">
              <ProductIcon name="metric-effect" size={16} />
              Суммарный потенциал: <b className="text-[#009b86]">{formatMoney(totalPotentialEffect)} / год</b>
            </span>
            <span className="text-[#c8d9ed]">|</span>
            <span className="flex items-center gap-1.5">
              <ProductIcon name="metric-roi" size={16} />
              Средний ROI: <b>{avgROI}%</b>
            </span>
          </div>
          {scalingCount > 0 && (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#dcf5ef] text-[#008775] flex items-center gap-1.5">
              <ProductIcon name="verdict-scale" size={14} />
              К масштабированию: {scalingCount}
            </span>
          )}
        </div>

        {/* Матрица приоритетов 2x2 (Scatter plot) */}
        <div className="grid grid-cols-[1.65fr_1fr] gap-6 mb-6">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-[#08275b] flex items-center gap-2 m-0">
                <Target size={18} className="text-[#05b89f]" />
                Матрица приоритетов (Сложность vs Годовой эффект)
              </h2>
              <span className="text-[11px] text-[#637ba5]">Кликните точку для деталей</span>
            </div>
            <p className="muted text-xs mb-3">
              Ось X — сложность внедрения (1 = легко, 5 = трудно). Ось Y — экономический эффект (тыс. ₽).
            </p>

            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 15, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6f0fa" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Сложность"
                    domain={[1, 5]}
                    ticks={[1, 2, 2.5, 3, 4, 5]}
                    unit=""
                    fontSize={11}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Эффект"
                    unit="k ₽"
                    fontSize={11}
                    width={55}
                  />
                  <ZAxis type="number" dataKey="z" range={[80, 220]} name="Priority Score" />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#08275b] text-white p-2.5 rounded-xl text-xs shadow-xl">
                            <b className="block text-[#4de5cb] mb-1">{data.name}</b>
                            <div>Эффект: {data.y} тыс. ₽/год</div>
                            <div>Сложность: {data.x} / 5</div>
                            <div>Priority Score: {data.z}/100</div>
                            <div className="mt-1 text-[10px] font-bold text-emerald-300">
                              Зона: {data.zone}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine x={2.5} stroke="#c3d9f0" strokeDasharray="3 3" />
                  <ReferenceLine y={200} stroke="#c3d9f0" strokeDasharray="3 3" />
                  <Scatter
                    data={scatterData}
                    onClick={(entry: any) => setSelectedProcess(entry?.item || entry?.payload?.item || null)}
                  >
                    {scatterData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getZoneColor(entry.zone)}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Легенда 4 квадрантов */}
            <div className="grid grid-cols-4 gap-2 mt-2 pt-3 border-t border-[#eaf2fb] text-[11px]">
              <div className="p-2 rounded-lg bg-[#ebf8f5] border border-[#a5dfd4]">
                <b className="text-[#008775] block">★ Быстрые победы</b>
                <span className="text-[#2b6559]">Высокий эффект, низкая сложность. Запускать в 1-ю очередь!</span>
              </div>
              <div className="p-2 rounded-lg bg-[#eff6ff] border border-[#cbe2fc]">
                <b className="text-[#0879e8] block">◈ Стратегические</b>
                <span className="text-[#3c6b9d]">Высокий эффект, высокая сложность. Требуют интеграции.</span>
              </div>
              <div className="p-2 rounded-lg bg-[#fef9ee] border border-[#fde68a]">
                <b className="text-[#b45309] block">◷ Подготовить</b>
                <span className="text-[#87590d]">Низкая сложность, скромный эффект. Для обучения команды.</span>
              </div>
              <div className="p-2 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                <b className="text-slate-500 block">✕ Низкий приоритет</b>
                <span className="text-slate-500">Высокая сложность при скромной отдаче. Отложить.</span>
              </div>
            </div>
          </div>

          {/* Детали выбранного процесса или карточка Priority Score */}
          <div className="card p-4 flex flex-col justify-between">
            {selectedProcess ? (
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e3f7f2] text-[#009b86]">
                      {selectedProcess.zone}
                    </span>
                    <h3 className="text-base font-bold text-[#08275b] mt-1.5 mb-0">
                      {selectedProcess.name}
                    </h3>
                    <span className="text-xs text-[#637ba5]">{selectedProcess.industry}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#637ba5]">Priority Score</span>
                    <div className="text-2xl font-black text-[#08275b]">
                      {selectedProcess.priorityScore}
                      <span className="text-xs font-normal text-slate-400">/100</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs bg-[#f8fbff] p-3 rounded-xl border border-[#e2edf8]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#5578a8] flex items-center gap-1.5">
                      <ProductIcon name="metric-effect" size={13} />
                      Экономический эффект:
                    </span>
                    <b className="text-[#05b89f]">{formatMoney(selectedProcess.annualEffect)}</b>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#5578a8] flex items-center gap-1.5">
                      <ProductIcon name="metric-roi" size={13} />
                      ROI:
                    </span>
                    <b>{formatROI(selectedProcess.roi)}</b>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#5578a8] flex items-center gap-1.5">
                      <ProductIcon name="metric-payback" size={13} />
                      Окупаемость:
                    </span>
                    <b>{formatPayback(selectedProcess.paybackMonths)}</b>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#5578a8]">Сложность внедрения:</span>
                    <b>{selectedProcess.complexity} / 5</b>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#5578a8] flex items-center gap-1.5">
                      <ProductIcon name="metric-readiness" size={13} />
                      Индекс готовности:
                    </span>
                    <b>{selectedProcess.readiness} / 10</b>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#5578a8] flex items-center gap-1.5">
                      <ProductIcon name="metric-risk" size={13} />
                      Категория риска:
                    </span>
                    <b>{selectedProcess.risk}</b>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#08275b] block mb-1">
                    Статус в портфеле:
                  </label>
                  <select
                    className="field h-8 text-xs py-1"
                    value={selectedProcess.status}
                    onChange={(e) =>
                      updateItemStatus(selectedProcess.id, e.target.value as ProjectStatus)
                    }
                  >
                    <option value="Идея">Идея</option>
                    <option value="Расчёт">Расчёт</option>
                    <option value="Готов к пилоту">Готов к пилоту</option>
                    <option value="Пилот">Пилот</option>
                    <option value="Масштабирование">Масштабирование</option>
                    <option value="Остановлен">Остановлен</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link
                    href="/pilot"
                    className="btn btn-primary text-xs py-2 px-3 flex-1 flex items-center justify-center gap-1"
                  >
                    Перейти к пилоту <ArrowRight size={13} />
                  </Link>
                  <button
                    onClick={() => removeItem(selectedProcess.id)}
                    className="btn btn-outline text-xs py-2 px-3 text-rose-600 hover:bg-rose-50"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="mx-auto text-[#05b89f] mb-2" size={32} />
                <h3 className="text-sm font-bold text-[#08275b]">
                  Выберите процесс на графике
                </h3>
                <p className="text-xs text-[#637ba5] mt-1 max-w-xs mx-auto">
                  Нажмите на точку матрицы, чтобы увидеть структуру Priority Score, статус и перейти к запуску пилота.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Портфель проектов (Таблица) */}
        <div className="card p-4 border-[#dbeaf8] mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-[#08275b] flex items-center gap-2 m-0">
              <FolderKanban size={18} className="text-[#0879e8]" />
              Портфель ИИ-проектов компании
            </h2>
            <span className="text-xs text-[#637ba5]">
              Хранится локально в вашем браузере
            </span>
          </div>

          <div className="table-wrap">
            <table className="w-full text-xs min-w-[720px] border-collapse">
              <thead>
                <tr className="bg-[#f2f7fd] text-[#08275b]">
                  <th className="p-2.5 text-left font-bold">Проект</th>
                  <th className="p-2.5 text-left font-bold">Статус</th>
                  <th className="p-2.5 text-right font-bold">Инвестиции</th>
                  <th className="p-2.5 text-right font-bold">
                    <span className="inline-flex items-center gap-1">
                      <ProductIcon name="metric-effect" size={13} /> E (Эффект)
                    </span>
                  </th>
                  <th className="p-2.5 text-center font-bold">
                    <span className="inline-flex items-center gap-1">
                      <ProductIcon name="metric-roi" size={13} /> ROI
                    </span>
                  </th>
                  <th className="p-2.5 text-center font-bold">
                    <span className="inline-flex items-center gap-1">
                      <ProductIcon name="metric-payback" size={13} /> PP
                    </span>
                  </th>
                  <th className="p-2.5 text-center font-bold">
                    <span className="inline-flex items-center gap-1">
                      <ProductIcon name="metric-risk" size={13} /> Риск
                    </span>
                  </th>
                  <th className="p-2.5 text-center font-bold">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e9f2fa]">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-4 text-center">
                      <EmptyState
                        illustration="/assets/empty-projects.png"
                        title="Портфель пуст"
                        description="Добавьте процессы из каталога выше или восстановите стандартный набор процессов для анализа."
                        actionText="Восстановить базовые процессы"
                        onAction={() => {
                          setItems(DEFAULT_PROCESSES);
                          savePortfolio(DEFAULT_PROCESSES);
                        }}
                      />
                    </td>
                  </tr>
                ) : (
                  items.map((it) => (
                    <tr
                      key={it.id}
                      onClick={() => setSelectedProcess(it)}
                      className="hover:bg-[#f9fcff] cursor-pointer transition-colors"
                    >
                      <td className="p-2.5">
                        <span className="font-bold text-[#08275b] block">{it.name}</span>
                        <span className="text-[10px] text-[#637ba5]">{it.industry}</span>
                      </td>
                      <td className="p-2.5">
                        <select
                          className="field h-7 text-[11px] py-0 px-2 w-auto bg-white"
                          value={it.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            updateItemStatus(it.id, e.target.value as ProjectStatus)
                          }
                        >
                          <option value="Идея">Идея</option>
                          <option value="Расчёт">Расчёт</option>
                          <option value="Готов к пилоту">Готов к пилоту</option>
                          <option value="Пилот">Пилот</option>
                          <option value="Масштабирование">Масштабирование</option>
                          <option value="Остановлен">Остановлен</option>
                        </select>
                      </td>
                      <td className="p-2.5 text-right font-medium text-[#08275b]">
                        {formatMoney(it.investment || 200000)}
                      </td>
                      <td className="p-2.5 text-right font-bold text-[#05b89f]">
                        {formatMoney(it.annualEffect)}
                      </td>
                      <td className="p-2.5 text-center font-semibold">{formatROI(it.roi)}</td>
                      <td className="p-2.5 text-center font-medium">{formatPayback(it.paybackMonths)}</td>
                      <td className="p-2.5 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            it.risk === "Низкий"
                              ? "bg-[#e2fbf4] text-[#009b86]"
                              : it.risk === "Повышенный"
                              ? "bg-[#fff0f2] text-[#b93850]"
                              : "bg-[#fff7e6] text-[#b37400]"
                          }`}
                        >
                          {it.risk}
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openInCalculator(it);
                            }}
                            className="p-1.5 text-slate-400 hover:text-[#0879e8] hover:bg-[#ebf4fd] rounded transition-colors"
                            title="Открыть в калькуляторе"
                          >
                            <ExternalLink size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateItem(it.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-[#08275b] hover:bg-[#f0f4f9] rounded transition-colors"
                            title="Дублировать процесс"
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push("/compare");
                            }}
                            className="p-1.5 text-slate-400 hover:text-[#05b89f] hover:bg-[#e9f8f5] rounded transition-colors"
                            title="Сравнить с альтернативами"
                          >
                            <Scale size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeItem(it.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors"
                            title="Удалить процесс"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )))}
              </tbody>
            </table>
          </div>
        </div>

        <CTA
          title="Хотите добавить новый процесс для расчёта?"
          button="Открыть калькулятор"
        />
      </main>
      <Footer />
    </>
  );
}
