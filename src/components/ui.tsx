"use client";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BarChart3,
  SlidersHorizontal,
  Check,
  Clock3,
  FileText,
  Menu,
  Percent,
  Rocket,
  ShieldCheck,
  Target,
  UserRound,
  Info,
  FolderKanban,
  X,
  Trash2,
  Copy,
  Plus,
  ExternalLink,
  History,
  Scale,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useCalculation, formatMoney, formatROI, formatPayback } from "./calculation";

export function Logo({ small = false }: { small?: boolean }) {
  return (
    <Link
      href="/"
      className={`relative block shrink-0 ${small ? "h-9 w-[154px]" : "h-12 w-[205px]"}`}
      aria-label="ИИ Выгодно"
    >
      <Image
        src="/logo-ai-vygodno.png"
        alt="ИИ Выгодно"
        fill
        sizes="205px"
        className="object-contain object-left"
        priority
      />
    </Link>
  );
}



export type MetricKey =
  | "e"
  | "roi"
  | "pp"
  | "tco"
  | "breakEven"
  | "readiness"
  | "risk"
  | "quality"
  | "realization"
  | "rampUp"
  | "costOfDelay";

export const METRIC_TOOLTIPS: Record<
  MetricKey,
  {
    title: string;
    what: string;
    how: string;
    interpretation: string;
  }
> = {
  e: {
    title: "Экономический эффект (E)",
    what: "Чистая годовая прибыль компании от внедрения ИИ за первый год.",
    how: "Реализованная выгода минус все разовые и регулярные затраты: E = B − C.",
    interpretation: "E > 0 — проект окупается в первый год; E ≤ 0 — затраты пока превышают отдачу.",
  },
  roi: {
    title: "Рентабельность инвестиций (ROI)",
    what: "Коэффициент отдачи на каждый вложенный рубль за первый год.",
    how: "Отношение чистого эффекта ко всем расходам первого года: (E / C) × 100%.",
    interpretation: "> 100% — высокая отдача; 0–100% — проект окупается; < 0% — вложения не возвращаются.",
  },
  pp: {
    title: "Срок окупаемости (PP)",
    what: "Период возврата первоначальных вложений в проект.",
    how: "Разовые затраты делятся на чистый ежемесячный поток: C₀ / (Bₘ − Cₘ).",
    interpretation: "До 6 мес. — быстрая окупаемость; до 12 мес. — стандартная; > 12 мес. — долгосрочная инвестиция.",
  },
  tco: {
    title: "Совокупная стоимость владения (TCO)",
    what: "Полная сумма затрат на внедрение и эксплуатацию ИИ за выбранный горизонт.",
    how: "Сумма CapEx (разработка, интеграция, обучение) и OpEx (лицензии, API-токены, поддержка).",
    interpretation: "Показывает полную стоимость решения без скрытых платежей, защищая от кассовых разрывов.",
  },
  breakEven: {
    title: "Точка безубыточности",
    what: "Минимальная экономия времени, при которой проект выходит в ноль.",
    how: "Все затраты первого года делятся на скорректированную ставку часа: C / (Ставка × q × k).",
    interpretation: "Если процесс высвобождает больше этого объёма часов в месяц — проект финансово оправдан.",
  },
  readiness: {
    title: "Индекс готовности к ИИ",
    what: "Оценка зрелости процесса и условий для старта пилота от 1 до 10.",
    how: "Сумма 5 факторов: экономия времени (до 3 б.), регламенты (до 2 б.), бюджет (до 2 б.), данные (до 2 б.), ответственный (1 б.).",
    interpretation: "≥ 6/10 — процесс готов к пилоту; < 6/10 — требуется предварительная стандартизация.",
  },
  risk: {
    title: "Уровень риска",
    what: "Интегральная оценка правовых, технических и организационных рисков.",
    how: "Анализ категории передаваемых данных (152-ФЗ) и индекса цифровой готовности.",
    interpretation: "«Низкий» — безопасный старт; «Повышенный» — требует деперсонализации или закрытого контура.",
  },
  quality: {
    title: "Коэффициент качества (q)",
    what: "Доля результатов ИИ, пригодных без критических переделок человеком.",
    how: "Отношение принятых черновиков к общему числу задач (обычно 0.85–0.95).",
    interpretation: "Определяет нагрузку на проверку: чем ниже q, тем больше времени уходит на контроль.",
  },
  realization: {
    title: "Коэффициент реализации (k)",
    what: "Доля высвобожденного времени, направленная на реальную пользу бизнесу.",
    how: "Экспертная поправка модели (обычно 0.70–0.85).",
    interpretation: "Страхует от завышенных ожиданий: время приносит деньги только при конвертации в работу или снижении затрат.",
  },
  rampUp: {
    title: "Выход на мощность (Ramp-up)",
    what: "Период адаптации команды до достижения плановой экономии.",
    how: "Моделирует постепенный рост отдачи (25% → 50% → 75% → 100%) по месяцам освоения.",
    interpretation: "Даёт реалистичный срок окупаемости без иллюзий мгновенного эффекта с первого дня.",
  },
  costOfDelay: {
    title: "Цена отсрочки (Cost of Delay)",
    what: "Ориентировочная упущенная выгода от задержки старта на 1 месяц.",
    how: "Рассчитывается как среднемесячный чистый эффект после запуска (E / 12).",
    interpretation: "Вспомогательный аналитический ориентир для приоритизации, а не гарантированный убыток.",
  },
};

export const navigationLinks = [
  ["Калькулятор", "/calculator"],
  ["Сравнение", "/compare"],
  ["Приоритеты", "/priorities"],
  ["Сценарии", "/scenarios"],
  ["Пилот 30 дней", "/pilot"],
  ["Кейсы", "/cases"],
  ["О сервисе", "/about"],
];

// Форматирование чисел с пробелами-разделителями (140 000)
export function formatThousands(val: number): string {
  if (!Number.isFinite(val)) return "0";
  return Math.round(val).toLocaleString("ru-RU").replace(/\u00A0/g, " ");
}

// Компонент единообразного ввода денежных средств с форматированием пробелами и ₽
export function MoneyInput({
  label,
  value,
  onChange,
  suffix = "₽",
  min = 0,
  max,
  tooltip,
  metricKey,
  placeholder = "0",
  className = "",
}: {
  label?: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  min?: number;
  max?: number;
  tooltip?: string;
  metricKey?: MetricKey;
  placeholder?: string;
  className?: string;
}) {
  const [localStr, setLocalStr] = useState<string>(() =>
    Number.isFinite(value) ? formatThousands(value) : ""
  );
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalStr(Number.isFinite(value) ? formatThousands(value) : "");
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, "");
    if (!digitsOnly) {
      setLocalStr("");
      onChange(0);
      return;
    }
    const parsed = parseInt(digitsOnly, 10);
    const clamped = max !== undefined ? Math.min(max, parsed) : parsed;
    setLocalStr(formatThousands(clamped));
    onChange(clamped);
  };

  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="field-label flex items-center justify-between mb-1 text-[12px] font-semibold text-[#183a6f]">
          <span className="flex items-center">
            {label}
            {(metricKey || tooltip) && (
              <TooltipInfo metric={metricKey} text={tooltip} />
            )}
          </span>
        </span>
      )}
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          className="field money-input pr-12 text-[13px] font-medium text-[#08275b]"
          value={localStr}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            setLocalStr(Number.isFinite(value) ? formatThousands(value) : "");
          }}
          onChange={handleChange}
        />
        <span className="pointer-events-none absolute right-3 top-[11px] text-[11px] font-semibold text-[#738cb3]">
          {suffix}
        </span>
      </div>
    </label>
  );
}

// Компонент единообразного ввода процентов (85%, 70%)
export function PercentInput({
  label,
  value,
  onChange,
  isDecimal = false,
  min = 0,
  max = 100,
  tooltip,
  metricKey,
  className = "",
}: {
  label?: string;
  value: number;
  onChange: (v: number) => void;
  isDecimal?: boolean;
  min?: number;
  max?: number;
  tooltip?: string;
  metricKey?: MetricKey;
  className?: string;
}) {
  const displayVal = isDecimal ? Math.round(value * 100) : value;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, "");
    if (!digitsOnly) {
      onChange(0);
      return;
    }
    let parsed = parseInt(digitsOnly, 10);
    if (parsed > max) parsed = max;
    if (parsed < min) parsed = min;
    onChange(isDecimal ? parsed / 100 : parsed);
  };

  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="field-label flex items-center justify-between mb-1 text-[12px] font-semibold text-[#183a6f]">
          <span className="flex items-center">
            {label}
            {(metricKey || tooltip) && (
              <TooltipInfo metric={metricKey} text={tooltip} />
            )}
          </span>
        </span>
      )}
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          className="field money-input pr-9 text-[13px] font-medium text-[#08275b]"
          value={Number.isFinite(displayVal) ? displayVal : ""}
          onChange={handleChange}
        />
        <span className="pointer-events-none absolute right-3 top-[11px] text-[11px] font-semibold text-[#738cb3]">
          %
        </span>
      </div>
    </label>
  );
}

// Понятная подсказка (3 пункта: Что это? Как считается? Как трактовать?)
export function TooltipInfo({
  metric,
  title,
  text,
  what,
  how,
  interpretation,
  formula,
}: {
  metric?: MetricKey;
  title?: string;
  text?: string;
  what?: string;
  how?: string;
  interpretation?: string;
  formula?: string;
}) {
  const [open, setOpen] = useState(false);

  const data = metric ? METRIC_TOOLTIPS[metric] : null;
  const displayTitle = data ? data.title : title;
  const displayWhat = data ? data.what : (what || text);
  const displayHow = data ? data.how : formula;
  const displayInterpretation = data ? data.interpretation : interpretation;

  return (
    <span className="relative inline-block align-middle ml-1.5">
      <button
        type="button"
        className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-[9px] font-bold text-[#557aa8] bg-[#e4effc] hover:bg-[#05b89f] hover:text-white transition-colors cursor-pointer"
        aria-label="Подробнее"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        ?
      </button>

      {open && (
        <span
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-[#08275b] text-white text-[11px] leading-relaxed rounded-xl shadow-xl pointer-events-none text-left"
        >
          {displayTitle && (
            <b className="block text-[#4de5cb] mb-1.5 font-bold text-[12px] border-b border-white/15 pb-1">
              {displayTitle}
            </b>
          )}

          <div className="space-y-1.5">
            {displayWhat && (
              <div>
                <span className="text-slate-400 text-[10px] block font-semibold uppercase tracking-wider">
                  Что это:
                </span>
                <span className="text-slate-200">{displayWhat}</span>
              </div>
            )}

            {displayHow && (
              <div>
                <span className="text-slate-400 text-[10px] block font-semibold uppercase tracking-wider">
                  Как считается:
                </span>
                <span className="text-[#86c0ff] font-mono text-[10px]">
                  {displayHow}
                </span>
              </div>
            )}

            {displayInterpretation && (
              <div className="pt-1 border-t border-white/10 text-emerald-300 text-[10px]">
                💡 <span className="font-semibold text-emerald-200">Как трактовать:</span>{" "}
                {displayInterpretation}
              </div>
            )}
          </div>
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#08275b]" />
        </span>
      )}
    </span>
  );
}

// Модальное окно / Таблица «Мои проекты»
export function ProjectsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    savedProjects,
    activeProjectId,
    setActiveProjectId,
    setInputs,
    setCalculated,
    deleteSavedProject,
    duplicateSavedProject,
    saveCurrentProject,
  } = useCalculation();

  if (!isOpen) return null;

  const totalProjects = savedProjects.length;
  const profitableProjects = savedProjects.filter((p) => p.effect > 0).length;
  const avgROI =
    totalProjects > 0
      ? Math.round(savedProjects.reduce((sum, p) => sum + (p.roi || 0), 0) / totalProjects)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
      <div className="card w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 border-[#cfe0f3]">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-4 border-b border-[#e2edf9] bg-[#f8fbff]">
          <div className="flex items-center gap-2.5">
            <FolderKanban className="text-[#05b89f]" size={22} />
            <div>
              <h3 className="m-0 text-lg font-bold text-[#08275b] flex items-center gap-2">
                Мои проекты и сохранённые расчёты
                <span className="text-xs bg-[#e2f7f3] text-[#009b86] font-bold px-2 py-0.5 rounded-full">
                  {totalProjects}
                </span>
              </h3>
              <p className="text-[11px] text-[#637ba5] m-0">
                Все расчёты сохраняются локально в вашем браузере
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Закрыть"
          >
            <X size={20} />
          </button>
        </div>

        {/* Сводные карточки (максимум 3) */}
        {totalProjects > 0 && (
          <div className="grid grid-cols-3 gap-3 p-4 bg-[#f2f7fd] border-b border-[#e2edf9] text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-[#dbe8f8]">
              <span className="text-[#6582ac] block text-[11px]">Всего расчётов</span>
              <b className="text-base text-[#08275b]">{totalProjects} шт.</b>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-[#dbe8f8]">
              <span className="text-[#6582ac] block text-[11px]">Окупаются в 1-й год</span>
              <b className="text-base text-[#05b89f]">{profitableProjects} проектов</b>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-[#dbe8f8]">
              <span className="text-[#6582ac] block text-[11px]">Средний ROI портфеля</span>
              <b className="text-base text-[#0879e8]">{avgROI}%</b>
            </div>
          </div>
        )}

        {/* Список / Таблица */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-[#52749e] font-semibold">
              Список сохранённых сценариев:
            </span>
            <button
              onClick={() => {
                saveCurrentProject();
              }}
              className="btn btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <Plus size={14} /> Сохранить текущий расчёт
            </button>
          </div>

          {totalProjects === 0 ? (
            <div className="text-center py-10 px-4 rounded-xl border border-dashed border-[#cfe0f3] bg-[#f9fcff]">
              <Image
                src="/assets/empty-projects.png"
                alt="Нет сохранённых проектов"
                width={120}
                height={120}
                className="mx-auto mb-2 object-contain"
                unoptimized
              />
              <h4 className="font-bold text-base text-[#183a6f] m-0">
                У вас пока нет сохранённых расчётов
              </h4>
              <p className="text-xs text-[#637ba5] mt-1.5 max-w-sm mx-auto">
                Создайте расчёт в калькуляторе и нажмите «Сохранить», чтобы возвращаться к нему, сравнивать варианты и отслеживать пилот.
              </p>
              <Link
                href="/calculator"
                onClick={onClose}
                className="btn btn-primary text-xs py-2 px-4 mt-4 inline-flex items-center gap-1.5 no-underline"
              >
                Создать первый расчёт <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="table-wrap border border-[#e0edf8] rounded-xl overflow-hidden bg-white">
              <table className="w-full text-xs min-w-[620px] border-collapse">
                <thead>
                  <tr className="bg-[#f4f8fd] text-[#08275b] border-b border-[#e2edf9]">
                    <th className="p-2.5 text-left font-bold">Название и процесс</th>
                    <th className="p-2.5 text-right font-bold">Эффект E</th>
                    <th className="p-2.5 text-center font-bold">ROI</th>
                    <th className="p-2.5 text-center font-bold">Окупаемость</th>
                    <th className="p-2.5 text-center font-bold">Статус</th>
                    <th className="p-2.5 text-right font-bold">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf4fc]">
                  {savedProjects.map((p) => {
                    const isActive = p.id === activeProjectId;
                    const formattedDate = p.updatedAt
                      ? new Date(p.updatedAt).toLocaleDateString("ru-RU", {
                          day: "numeric",
                          month: "short",
                        })
                      : "";

                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-[#f8fbff] transition-colors ${
                          isActive ? "bg-[#f0fbf8]" : ""
                        }`}
                      >
                        <td className="p-2.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#08275b]">
                              {p.title || p.process}
                            </span>
                            {isActive && (
                              <span className="text-[10px] font-bold text-[#009b86] bg-[#d7f7f0] px-1.5 py-0.2 rounded-full">
                                Активен
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#607eab] mt-0.5 flex gap-2">
                            <span>{p.industry}</span>
                            {formattedDate && <span>• {formattedDate}</span>}
                          </div>
                        </td>

                        <td className="p-2.5 text-right font-bold">
                          <span
                            className={
                              p.effect >= 0 ? "text-[#05b89f]" : "text-rose-600"
                            }
                          >
                            {formatMoney(p.effect)}
                          </span>
                        </td>

                        <td className="p-2.5 text-center font-semibold text-[#08275b]">
                          {formatROI(p.roi)}
                        </td>

                        <td className="p-2.5 text-center font-medium text-[#496b99]">
                          {formatPayback(p.payback)}
                        </td>

                        <td className="p-2.5 text-center">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#edf4fd] text-[#1c4883]">
                            {p.status || "Расчёт"}
                          </span>
                        </td>

                        <td className="p-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setActiveProjectId(p.id);
                                setInputs(p.inputs);
                                setCalculated(p.inputs);
                                onClose();
                              }}
                              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md ${
                                isActive
                                  ? "bg-[#05b89f] text-white"
                                  : "bg-[#e8f3ff] text-[#0879e8] hover:bg-[#d5e9ff]"
                              }`}
                            >
                              Открыть
                            </button>
                            <Link
                              href="/compare"
                              onClick={onClose}
                              title="Сравнить варианты"
                              className="p-1 text-slate-400 hover:text-[#0879e8] rounded"
                            >
                              <Scale size={14} />
                            </Link>
                            <button
                              onClick={() => duplicateSavedProject(p.id)}
                              title="Дублировать"
                              className="p-1 text-slate-400 hover:text-slate-700 rounded"
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              onClick={() => deleteSavedProject(p.id)}
                              title="Удалить"
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-[#e2edf9] bg-[#f8fbff] flex justify-between items-center text-xs text-[#637ba5]">
          <span>Данные сохраняются в LocalStorage вашего браузера</span>
          <button onClick={onClose} className="btn btn-outline text-xs py-1 px-4">
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

// Упрощённый компактный Header со структурированной архитектурой
export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [pilotOpen, setPilotOpen] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const { savedProjects } = useCalculation();

  const isAnalysisActive =
    path === "/compare" || path === "/priorities" || path === "/scenarios";
  const isPilotActive = path === "/pilot";

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[#eaf2fb] bg-white/95 backdrop-blur">
        <div className="container flex h-15 items-center justify-between gap-4">
          <Logo small />

          {/* Desktop navigation: сгруппированная архитектура */}
          <nav className="desktop-nav flex h-full items-center gap-1">
            {/* 1. Калькулятор */}
            <Link
              href="/calculator"
              className={`relative h-full flex items-center px-3 text-[13px] font-semibold no-underline transition-colors ${
                path === "/calculator"
                  ? "text-[#082460] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:rounded-full after:bg-[#05b89f]"
                  : "text-[#284879] hover:text-[#05b89f]"
              }`}
            >
              Калькулятор
            </Link>

            {/* 2. Анализ (Dropdown: Сравнение, Приоритеты, Сценарии) */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => setAnalysisOpen(true)}
              onMouseLeave={() => setAnalysisOpen(false)}
            >
              <button
                type="button"
                className={`relative h-full flex items-center gap-1 px-3 text-[13px] font-semibold transition-colors cursor-pointer ${
                  isAnalysisActive
                    ? "text-[#082460] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:rounded-full after:bg-[#05b89f]"
                    : "text-[#284879] hover:text-[#05b89f]"
                }`}
                onClick={() => setAnalysisOpen(!analysisOpen)}
              >
                <span>Анализ</span>
                <span className="text-[10px] text-slate-400">▾</span>
              </button>

              {analysisOpen && (
                <div className="absolute top-full left-0 w-52 py-1.5 bg-white rounded-xl shadow-xl border border-[#e2edf8] animate-in fade-in zoom-in-95 duration-100 z-50">
                  <Link
                    href="/compare"
                    onClick={() => setAnalysisOpen(false)}
                    className={`block px-3.5 py-2 text-xs font-semibold no-underline transition-colors ${
                      path === "/compare"
                        ? "bg-[#eef9f6] text-[#009b86]"
                        : "text-[#08275b] hover:bg-[#f4f9ff]"
                    }`}
                  >
                    Сравнение решений
                    <span className="block text-[10px] font-normal text-[#6885ac]">
                      SaaS vs Интеграция vs Заказная
                    </span>
                  </Link>
                  <Link
                    href="/priorities"
                    onClick={() => setAnalysisOpen(false)}
                    className={`block px-3.5 py-2 text-xs font-semibold no-underline transition-colors ${
                      path === "/priorities"
                        ? "bg-[#eef9f6] text-[#009b86]"
                        : "text-[#08275b] hover:bg-[#f4f9ff]"
                    }`}
                  >
                    Матрица приоритетов
                    <span className="block text-[10px] font-normal text-[#6885ac]">
                      Что внедрять первым (2x2)
                    </span>
                  </Link>
                  <Link
                    href="/scenarios"
                    onClick={() => setAnalysisOpen(false)}
                    className={`block px-3.5 py-2 text-xs font-semibold no-underline transition-colors ${
                      path === "/scenarios"
                        ? "bg-[#eef9f6] text-[#009b86]"
                        : "text-[#08275b] hover:bg-[#f4f9ff]"
                    }`}
                  >
                    Сценарии & What-If
                    <span className="block text-[10px] font-normal text-[#6885ac]">
                      Стресс-тесты и ползунки
                    </span>
                  </Link>
                  <Link
                    href="/scenarios#what-if"
                    onClick={() => setAnalysisOpen(false)}
                    className="block px-3.5 py-2 text-xs font-semibold no-underline transition-colors text-[#08275b] hover:bg-[#f4f9ff]"
                  >
                    What-If / Чувствительность
                    <span className="block text-[10px] font-normal text-[#6885ac]">
                      2D-матрица и эластичность
                    </span>
                  </Link>
                </div>
              )}
            </div>

            {/* 3. Пилот (Dropdown: Пилот 30 дней, План vs факт) */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => setPilotOpen(true)}
              onMouseLeave={() => setPilotOpen(false)}
            >
              <button
                type="button"
                className={`relative h-full flex items-center gap-1 px-3 text-[13px] font-semibold transition-colors cursor-pointer ${
                  isPilotActive
                    ? "text-[#082460] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:rounded-full after:bg-[#05b89f]"
                    : "text-[#284879] hover:text-[#05b89f]"
                }`}
                onClick={() => setPilotOpen(!pilotOpen)}
              >
                <span>Пилот</span>
                <span className="text-[10px] text-slate-400">▾</span>
              </button>

              {pilotOpen && (
                <div className="absolute top-full left-0 w-48 py-1.5 bg-white rounded-xl shadow-xl border border-[#e2edf8] animate-in fade-in zoom-in-95 duration-100 z-50">
                  <Link
                    href="/pilot"
                    onClick={() => setPilotOpen(false)}
                    className="block px-3.5 py-2 text-xs font-semibold text-[#08275b] hover:bg-[#f4f9ff] no-underline"
                  >
                    Пилот 30 дней
                    <span className="block text-[10px] font-normal text-[#6885ac]">
                      Методология и чек-лист
                    </span>
                  </Link>
                  <Link
                    href="/pilot#plan-fact"
                    onClick={() => setPilotOpen(false)}
                    className="block px-3.5 py-2 text-xs font-semibold text-[#08275b] hover:bg-[#f4f9ff] no-underline"
                  >
                    План vs Факт
                    <span className="block text-[10px] font-normal text-[#6885ac]">
                      Замеры и итоговый вердикт
                    </span>
                  </Link>
                </div>
              )}
            </div>

            {/* 4. Кейсы */}
            <Link
              href="/cases"
              className={`relative h-full flex items-center px-3 text-[13px] font-semibold no-underline transition-colors ${
                path === "/cases"
                  ? "text-[#082460] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:rounded-full after:bg-[#05b89f]"
                  : "text-[#284879] hover:text-[#05b89f]"
              }`}
            >
              Кейсы
            </Link>

            {/* 5. О сервисе */}
            <Link
              href="/about"
              className={`relative h-full flex items-center px-3 text-[13px] font-semibold no-underline transition-colors ${
                path === "/about"
                  ? "text-[#082460] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:rounded-full after:bg-[#05b89f]"
                  : "text-[#284879] hover:text-[#05b89f]"
              }`}
            >
              О сервисе
            </Link>
          </nav>

          {/* Правая часть Header: Мои проекты и ненавязчивый CTA */}
          <div className="header-actions flex items-center gap-2">
            <button
              onClick={() => setShowProjects(true)}
              className="btn btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 font-medium"
              aria-label="Мои проекты"
            >
              <FolderKanban size={15} className="text-[#05b89f]" />
              <span>Мои проекты</span>
              {savedProjects.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-bold bg-[#e1f7f2] text-[#009b86] rounded-full">
                  {savedProjects.length}
                </span>
              )}
            </button>

            {path !== "/calculator" && (
              <Link
                href="/calculator"
                className="btn btn-outline text-xs py-1.5 px-3 no-underline font-semibold text-[#08275b] hover:bg-[#f2f7fc] border-[#cbe0f4] flex items-center gap-1"
              >
                Калькулятор <ArrowRight size={13} />
              </Link>
            )}

            <button
              className="mobile-menu hidden text-[#082460] p-1.5"
              onClick={() => setOpen(!open)}
              aria-label="Открыть меню"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Мобильное адаптивное меню */}
        {open && (
          <div className="container flex flex-col gap-2 pb-5 pt-3 border-t border-[#edf4fc] text-xs">
            <Link
              onClick={() => setOpen(false)}
              className="font-bold py-1.5 text-[#08275b] no-underline"
              href="/calculator"
            >
              Калькулятор
            </Link>

            <div className="py-1 border-y border-[#edf4fc] space-y-1.5">
              <span className="text-[10px] font-bold text-[#6a87ad] uppercase tracking-wider block">
                Анализ:
              </span>
              <Link
                onClick={() => setOpen(false)}
                className="block pl-2 py-1 text-[#08275b] no-underline"
                href="/compare"
              >
                • Сравнение решений
              </Link>
              <Link
                onClick={() => setOpen(false)}
                className="block pl-2 py-1 text-[#08275b] no-underline"
                href="/priorities"
              >
                • Матрица приоритетов
              </Link>
              <Link
                onClick={() => setOpen(false)}
                className="block pl-2 py-1 text-[#08275b] no-underline"
                href="/scenarios"
              >
                • Сценарии & What-If
              </Link>
              <Link
                onClick={() => setOpen(false)}
                className="block pl-2 py-1 text-[#08275b] no-underline"
                href="/scenarios#what-if"
              >
                • What-If / Чувствительность
              </Link>
            </div>

            <div className="py-1 border-b border-[#edf4fc] space-y-1.5">
              <span className="text-[10px] font-bold text-[#6a87ad] uppercase tracking-wider block">
                Пилот:
              </span>
              <Link
                onClick={() => setOpen(false)}
                className="block pl-2 py-1 text-[#08275b] no-underline"
                href="/pilot"
              >
                • Пилот 30 дней
              </Link>
              <Link
                onClick={() => setOpen(false)}
                className="block pl-2 py-1 text-[#08275b] no-underline"
                href="/pilot#plan-fact"
              >
                • План vs Факт
              </Link>
            </div>

            <Link
              onClick={() => setOpen(false)}
              className="font-bold py-1 text-[#08275b] no-underline"
              href="/cases"
            >
              Кейсы и каталог
            </Link>

            <Link
              onClick={() => setOpen(false)}
              className="font-bold py-1 text-[#08275b] no-underline"
              href="/about"
            >
              О сервисе
            </Link>

            <button
              onClick={() => {
                setOpen(false);
                setShowProjects(true);
              }}
              className="text-left font-bold text-[#05b89f] py-2 flex items-center gap-1.5 mt-1 border-t border-[#edf4fc]"
            >
              <FolderKanban size={16} /> Мои проекты ({savedProjects.length})
            </button>
          </div>
        )}
      </header>

      <ProjectsModal isOpen={showProjects} onClose={() => setShowProjects(false)} />
    </>
  );
}

export function Footer() {
  return (
    <footer className="mt-10 border-t border-[#e6f0fb] py-7">
      <div className="container footer-grid grid grid-cols-[1.6fr_2fr_1fr] gap-8 text-[11px] text-[#6280ae]">
        <div>
          <Logo small />
          <p className="mt-4">
            «ИИ Выгодно» — независимый сервис предварительной экономической оценки и поддержки решений по внедрению ИИ для малого и среднего бизнеса.
          </p>
        </div>
        <div className="flex flex-wrap content-start gap-x-6 gap-y-3 pt-2">
          {navigationLinks.map(([n, h]) => (
            <Link className="no-underline text-[#416899] hover:text-[#05b89f]" href={h} key={h}>
              {n}
            </Link>
          ))}
          <span className="text-[#87a1c4]">Все данные сохраняются локально в вашем браузере</span>
        </div>
        <div className="pt-2">
          © 2026 ИИ Выгодно
          <br />
          Все права защищены
        </div>
      </div>
    </footer>
  );
}

const ASSET_MAP: Record<string, string> = {
  benefit: "/assets/metric-effect.png",
  effect: "/assets/metric-effect.png",
  roi: "/assets/metric-roi.png",
  payback: "/assets/metric-payback.png",
  target: "/assets/metric-breakeven.png",
  breakeven: "/assets/metric-breakeven.png",
  readiness: "/assets/metric-readiness.png",
  risk: "/assets/metric-risk.png",
  tco: "/assets/metric-tco.png",
  growth: "/assets/metric-growth.png",
  rocket: "/assets/status-pilot.png",
  pilot: "/assets/status-pilot.png",
  prepare: "/assets/status-prepare.png",
  loss: "/assets/status-loss.png",
  scale: "/assets/verdict-scale.png",
  refine: "/assets/verdict-refine.png",
  stop: "/assets/verdict-stop.png",
  time: "/assets/benefit-time.png",
  quality: "/assets/benefit-quality.png",
  contractors: "/assets/benefit-contractors.png",
  revenue: "/assets/benefit-revenue.png",
  conversion: "/assets/benefit-conversion.png",
  speed: "/assets/benefit-speed.png",
  file: "/assets/cat-legal.png",
  folder: "/assets/cat-sales.png",
  sensitivity: "/assets/metric-growth.png",
};

export function ProductIcon({
  name,
  size = 22,
  className = "",
  alt = "",
}: {
  name: string;
  size?: number;
  className?: string;
  alt?: string;
}) {
  const src = name.startsWith("/")
    ? name
    : `/assets/${name.endsWith(".png") ? name : `${name}.png`}`;
  return (
    <Image
      src={src}
      alt={alt || name}
      width={size}
      height={size}
      className={`inline-block shrink-0 object-contain ${className}`}
      unoptimized
    />
  );
}

export function Icon({
  type,
  asset,
  size = 26,
  className = "",
}: {
  type?:
    | "sensitivity"
    | "benefit"
    | "roi"
    | "payback"
    | "risk"
    | "rocket"
    | "time"
    | "target"
    | "file"
    | "folder"
    | string;
  asset?: string;
  size?: number;
  className?: string;
}) {
  const assetSrc = asset || (type ? ASSET_MAP[type] : null);

  if (assetSrc) {
    return (
      <span className={`icon-disc shrink-0 ${type ? `icon-${type}` : ""} ${className}`}>
        <Image
          src={assetSrc}
          alt={type || "icon"}
          width={size}
          height={size}
          className="object-contain"
          unoptimized
        />
      </span>
    );
  }

  const I = {
    sensitivity: SlidersHorizontal,
    benefit: BarChart3,
    roi: Percent,
    payback: Clock3,
    risk: ShieldCheck,
    rocket: Rocket,
    time: Clock3,
    target: Target,
    file: FileText,
    folder: FolderKanban,
  }[type as "benefit"] || BarChart3;

  return (
    <span className={`icon-disc shrink-0 icon-${type} ${className}`}>
      <I size={size} strokeWidth={1.8} />
    </span>
  );
}

export function MetricCard({
  type,
  title,
  value,
  detail,
  tooltip,
  metricKey,
  asset,
}: {
  type: "benefit" | "roi" | "payback" | "risk" | "folder" | "rocket" | string;
  title: string;
  value: string;
  detail?: string;
  tooltip?: string;
  metricKey?: MetricKey;
  asset?: string;
}) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <Icon type={type} asset={asset} size={28} />
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-bold flex items-center text-[#08275b]">
          <span className="truncate">{title}</span>
          {(metricKey || tooltip) && (
            <TooltipInfo metric={metricKey} text={tooltip} />
          )}
        </div>
        <div className="metric-value mt-1.5">{value}</div>
        {detail && <div className="mt-1 text-[11px] text-[#05aa91] font-medium">{detail}</div>}
      </div>
    </div>
  );
}

export function EmptyState({
  illustration = "empty-projects",
  title,
  description,
  actionText,
  actionHref,
  onAction,
}: {
  illustration?: string;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}) {
  const src = illustration.startsWith("/")
    ? illustration
    : `/assets/${illustration.endsWith(".png") ? illustration : `${illustration}.png`}`;

  return (
    <div className="text-center py-10 px-4 rounded-xl border border-dashed border-[#cfe0f3] bg-[#f9fcff] my-4">
      <Image
        src={src}
        alt={title}
        width={130}
        height={130}
        className="mx-auto mb-3 object-contain"
        unoptimized
      />
      <h3 className="font-bold text-base text-[#08275b] m-0 mb-1">{title}</h3>
      <p className="text-xs text-[#52749e] max-w-md mx-auto m-0 mb-4 leading-relaxed">
        {description}
      </p>
      {actionText && (
        actionHref ? (
          <Link
            href={actionHref}
            className="btn btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 no-underline"
          >
            {actionText} <ArrowRight size={14} />
          </Link>
        ) : (
          <button
            type="button"
            onClick={onAction}
            className="btn btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
          >
            {actionText} <ArrowRight size={14} />
          </button>
        )
      )}
    </div>
  );
}

export function CTA({
  title = "Готовы узнать, какой реальный эффект может дать ИИ вашему бизнесу?",
  button = "Начать расчёт сейчас",
}: {
  title?: string;
  button?: string;
}) {
  return (
    <section className="container mt-8">
      <div className="flex flex-wrap items-center justify-between gap-5 rounded-xl bg-gradient-to-r from-[#eefaff] to-[#eafff9] px-6 py-5 border border-[#d6f2ec]">
        <div className="flex items-center gap-4">
          <Icon type="benefit" />
          <div>
            <h3 className="m-0 text-xl font-extrabold tracking-[-.03em]">{title}</h3>
            <p className="muted m-0 mt-1 text-[13px]">
              Прозрачные формулы, сценарное моделирование и расчёт точек безубыточности. Без скрытых подписок.
            </p>
          </div>
        </div>
        <Link href="/calculator" className="btn btn-primary no-underline">
          {button}
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}

export const CheckLine = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2 text-[13px] text-[#5d7aa8]">
    <span className="grid h-5 w-5 place-items-center rounded-full bg-[#e7fbf7] text-[#05b89f]">
      <Check size={13} />
    </span>
    {children}
  </div>
);
