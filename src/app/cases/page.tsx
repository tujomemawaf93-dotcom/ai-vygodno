"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "../secondary.css";
import {
  ArrowRight,
  BarChart3,
  Calculator,
  LockKeyhole,
  Sparkles,
  Layers,
  Check,
} from "lucide-react";
import { Header, Footer, Icon, CTA, CheckLine, ProductIcon, EmptyState } from "@/components/ui";
import { PROCESS_CATALOG, ProcessTemplate } from "@/lib/presets";
import { useCalculation } from "@/components/calculation";

type Case = {
  id: string;
  category: string;
  image: string;
  title: string;
  description: string;
  metrics: { hours: string; roi: string; payback: string };
  status: string;
};

const cases: Case[] = [
  {
    id: "construction",
    category: "Строительство",
    image: "/case-construction.png",
    title: "Автоматизация подготовки смет и КП",
    description:
      "ООО «Строительные Системы»: сценарий подготовки коммерческих предложений с проверкой результата сметчиком.",
    metrics: { hours: "−120 ч", roi: "320%", payback: "2 мес." },
    status: "Сценарная модель на основе прототипа",
  },
  {
    id: "services",
    category: "Услуги",
    image: "/case-services.png",
    title: "ИИ-ассистент для клиентского сервиса",
    description:
      "Ответы на типовые вопросы и обработка заявок. Сотрудник проверяет сложные обращения.",
    metrics: { hours: "−80 ч", roi: "180%", payback: "3 мес." },
    status: "Демонстрационный кейс",
  },
  {
    id: "retail",
    category: "Розница",
    image: "/case-retail.png",
    title: "Анализ отзывов и улучшение ассортимента",
    description:
      "Анализ отзывов покупателей: повторяющиеся проблемы, запросы и предложения по ассортименту.",
    metrics: { hours: "−60 ч", roi: "240%", payback: "4 мес." },
    status: "Сценарный пример",
  },
  {
    id: "education",
    category: "Образование",
    image: "/case-education.png",
    title: "Персонализированные учебные материалы",
    description:
      "Подготовка учебных заданий и черновиков обратной связи с обязательной проверкой преподавателем.",
    metrics: { hours: "−100 ч", roi: "280%", payback: "3 мес." },
    status: "Демонстрационный кейс",
  },
];

const filters = [
  "Все отрасли",
  "Строительство",
  "Услуги",
  "Маркетинг",
  "Розница",
  "Образование",
  "ИТ и цифровые сервисы",
];

const getCategoryIcon = (cat: string) => {
  switch (cat) {
    case "Строительство":
      return "ind-construction";
    case "Услуги":
      return "cat-support";
    case "Розница":
      return "ind-retail";
    case "Образование":
      return "ind-education";
    case "Маркетинг":
      return "cat-marketing";
    case "ИТ и цифровые сервисы":
      return "ind-it";
    default:
      return "cat-analytics";
  }
};

const getFunctionIcon = (func: string) => {
  if (func.includes("Продаж")) return "cat-sales";
  if (func.includes("Поддержк") || func.includes("сервис") || func.includes("Клиент")) return "cat-support";
  if (func.includes("Маркетинг")) return "cat-marketing";
  if (func.includes("HR") || func.includes("Найм") || func.includes("Кадр")) return "cat-hr";
  if (func.includes("Юрист") || func.includes("Документ") || func.includes("Договор") || func.includes("Бухгалтер")) return "cat-legal";
  return "cat-analytics";
};

export default function Cases() {
  const [f, setF] = useState("Все отрасли");
  const router = useRouter();
  const { applyTemplate } = useCalculation();

  const shownCases = cases.filter((c) => f === "Все отрасли" || c.category === f);
  const shownTemplates = PROCESS_CATALOG.filter(
    (t) => f === "Все отрасли" || t.industry === f
  );

  const handleUseTemplate = (tpl: ProcessTemplate) => {
    applyTemplate(tpl);
    router.push("/calculator");
  };

  return (
    <>
      <Header />
      <main className="secondary-page cases-page">
        <section className="soft-bg">
          <div className="container py-8">
            <span className="eyebrow">ПРИМЕРЫ И ГОТОВЫЕ ШАБЛОНЫ</span>
            <h1 className="mt-4 text-[46px] font-extrabold tracking-[-.06em] text-[#08275b]">
              Кейсы и структурированный каталог процессов
            </h1>
            <p className="muted -mt-2 max-w-[620px] text-[16px] leading-relaxed">
              Изучайте сценарные примеры внедрения ИИ, выбирайте готовые отраслевые шаблоны (Отрасль → Функция → Процесс → Задача) и сразу рассчитывайте экономику на своих цифрах.
            </p>
            <div className="mt-4 flex gap-5">
              <CheckLine>Ориентиры модели (не вымышленные гарантии)</CheckLine>
              <CheckLine>1-клик перенос в калькулятор</CheckLine>
              <CheckLine>Все поля редактируемы</CheckLine>
            </div>
          </div>
        </section>

        {/* Фильтры отраслей */}
        <section className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="section-title">Отраслевые кейсы</h2>
              <p className="muted m-0 text-[12px]">
                Примеры сценариев: расчетные ориентиры модели для проверки гипотез.
              </p>
            </div>
            <span className="muted text-xs">{shownCases.length} из {cases.length} примеров</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {filters.map((x) => (
              <button
                onClick={() => setF(x)}
                aria-pressed={f === x}
                className={`rounded-full border px-4 py-2 text-[12px] font-bold transition-colors ${
                  f === x
                    ? "border-[#05b89f] bg-[#05b89f] text-white"
                    : "border-[#d5e6fa] bg-white text-[#35588a] hover:border-[#96c1f2]"
                }`}
                key={x}
              >
                {x}
              </button>
            ))}
          </div>

          <div
            className={`cases-results mt-4 ${
              shownCases.length === 1
                ? "single-result"
                : shownCases.length === 2
                ? "two-results"
                : ""
            }`}
          >
            {shownCases.map((c) => (
              <article className="card case-result" key={c.id}>
                <div className="case-photo">
                  <Image
                    src={c.image}
                    alt={c.category}
                    fill
                    sizes="(max-width: 760px) 100vw, 400px"
                  />
                </div>
                <div className="case-body">
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f0f6fd] text-[#245899] flex items-center gap-1">
                      <ProductIcon name={getCategoryIcon(c.category)} size={13} />
                      {c.category}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        c.status.includes("прототип")
                          ? "bg-[#ebf8f5] text-[#008775] border-[#a5dfd4]"
                          : "bg-[#f4f8fd] text-[#486e9e] border-[#d8e6f4]"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#08275b] m-0 mb-1">{c.title}</h3>
                  <p className="muted text-xs mb-3">{c.description}</p>
                  <div className="case-metrics">
                    <span>
                      <b>{c.metrics.hours}</b> в месяц
                    </span>
                    <span>
                      <b>{c.metrics.roi}</b> ROI
                    </span>
                    <span>
                      <b>{c.metrics.payback}</b> окупаемость
                    </span>
                  </div>
                  <details className="case-detail mt-2">
                    <summary className="cursor-pointer">
                      Подробнее о кейсе <ArrowRight size={14} />
                    </summary>
                    <p className="mt-2 text-xs leading-relaxed text-[#52749e]">
                      Показатели иллюстрируют возможный сценарный расчёт. Реальная экономия зависит от объёма задач, стоимости часа сотрудника, качества черновиков ИИ и времени на контроль.
                    </p>
                    <Link href="/calculator" className="btn btn-outline text-xs mt-2 w-full flex items-center justify-center gap-1">
                      Рассчитать на своих данных <ArrowRight size={13} />
                    </Link>
                  </details>
                </div>
              </article>
            ))}
            {shownCases.length === 0 && (
              <div className="col-span-full">
                <EmptyState
                  illustration="/assets/empty-search-report.png"
                  title="Для этой отрасли пока нет отдельного кейса"
                  description="Используйте готовый шаблон из каталога процессов ниже или введите свои параметры в калькуляторе."
                  actionText="Рассчитать эффект в калькуляторе"
                  actionHref="/calculator"
                />
              </div>
            )}
          </div>
        </section>

        {/* Каталог процессов (Отрасль → Функция → Процесс → Задача → AI use case) */}
        <section className="container py-6 border-t border-[#eaf2fb]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="section-title flex items-center gap-2">
                <Layers size={20} className="text-[#05b89f]" />
                Каталог процессов: Отрасль → Функция → Задача
              </h2>
              <p className="muted m-0 text-[12px]">
                Выберите готовый структурированный шаблон — значения мгновенно подставятся в калькулятор и будут доступны для изменения.
              </p>
            </div>
            <span className="text-xs text-[#637ba5]">
              {shownTemplates.length} доступных шаблонов
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
            {shownTemplates.map((tpl) => (
              <article
                key={tpl.id}
                className="card p-4 flex flex-col justify-between hover:border-[#9ac4ee] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#eef5fc] text-[#2c5b96] flex items-center gap-1">
                      <ProductIcon name={getCategoryIcon(tpl.industry)} size={12} />
                      {tpl.industry}
                    </span>
                    <span className="text-[10px] text-[#009b86] font-semibold bg-[#e7fbf7] px-2 py-0.5 rounded flex items-center gap-1">
                      <ProductIcon name={getFunctionIcon(tpl.businessFunction)} size={12} />
                      {tpl.businessFunction}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#08275b] m-0 mb-1">
                    {tpl.process}
                  </h3>

                  <div className="text-[11px] text-[#4d709e] space-y-1 mb-2">
                    <div>
                      <b>Задача:</b> {tpl.task}
                    </div>
                    <div>
                      <b>AI Use Case:</b> {tpl.aiUseCase}
                    </div>
                  </div>

                  <p className="text-[11px] text-[#637ba5] m-0 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-[#edf4fc] flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] text-[#6080ad] font-medium">
                    Ориентир: ~{tpl.defaults.hours} ч/мес.
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUseTemplate(tpl)}
                    className="btn btn-outline text-xs py-1.5 px-3 flex items-center gap-1 hover:border-[#05b89f] hover:text-[#008775]"
                  >
                    В калькулятор <ArrowRight size={13} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* База знаний (Контекстные гайды) */}
        <section className="container py-6 border-t border-[#eaf2fb]">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="section-title">База знаний и методология</h2>
              <p className="muted m-0 text-[12px]">
                Практические инструкции по подготовке данных, расчёту ROI и проведению пилотов.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            {[
              {
                id: "kb-data",
                title: "Какие данные нельзя загружать в ИИ",
                desc: "152-ФЗ, коммерческая тайна, маскирование персональных данных и выбор между облаком и on-premise.",
                tag: "Безопасность",
                time: "3 мин чтения",
                icon: LockKeyhole,
                illustration: "/assets/ill-data-security.png",
                color: "#008775",
                bg: "#ebf8f5",
                fullText:
                  "Перед передачей данных в сторонние LLM-сервисы проверьте пользовательское соглашение: не обучается ли модель на ваших запросах. Запрещено передавать в открытые облака: пароли, ключи доступа, паспортные данные клиентов, медицинские сведения и внутренние финансовые отчёты без деперсонализации.",
              },
              {
                id: "kb-roi",
                title: "Как считать ROI в проектах с ИИ",
                desc: "Методология расчёта E = B − C, поправки на качество черновиков q и коэффициент реализации k.",
                tag: "Экономика",
                time: "4 мин чтения",
                icon: Calculator,
                illustration: "/assets/ill-roi-calculator.png",
                color: "#0879e8",
                bg: "#eff6ff",
                fullText:
                  "Никогда не считайте всю высвобожденную минуту как 100% чистой прибыли. Время становится деньгами только если сотрудники берут больше задач или сокращаются внешние расходы на подрядчиков. Коэффициент k (например, 0,7–0,85 в сценарной модели) страхует модель от завышенных ожиданий.",
              },
              {
                id: "kb-measure",
                title: "Как измерять эффект и проводить пилот 30 дней",
                desc: "Пошаговый протокол: двойной замер, фиксация эталонов качества и сопоставление Плана с Фактом.",
                tag: "Практика",
                time: "3 мин чтения",
                icon: BarChart3,
                illustration: "/assets/ill-pilot-30days.png",
                color: "#18396f",
                bg: "#f3f0fc",
                fullText:
                  "Выберите 10–20 одинаковых задач. Сделайте замер времени эксперта без ИИ (baseline). Затем подключите настроенный промпт и замерьте общее время: генерация + проверка человеком. Сравните с плановыми показателями калькулятора.",
              },
            ].map((art) => (
              <article
                key={art.id}
                id={art.id}
                className="card overflow-hidden border border-[#dce8f5] bg-white flex flex-col justify-between hover:border-[#9dc5f2] transition-all"
              >
                <div>
                  {/* Editorial Top Banner */}
                  <div
                    className="p-3.5 border-b border-[#e9f2fa] flex items-center justify-between"
                    style={{ background: `linear-gradient(to right, ${art.bg}, #ffffff)` }}
                  >
                    <div className="flex items-center gap-2.5">
                      <Image
                        src={art.illustration}
                        alt={art.title}
                        width={32}
                        height={32}
                        className="object-contain shrink-0"
                        unoptimized
                      />
                      <span
                        className="text-[10px] font-extrabold uppercase tracking-wider"
                        style={{ color: art.color }}
                      >
                        {art.tag}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-[#7490b4] bg-white/80 px-2 py-0.5 rounded-full border border-slate-200/50">
                      {art.time}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-4">
                    <h3 className="text-[15px] font-bold text-[#08275b] m-0 mb-2 leading-snug">
                      {art.title}
                    </h3>
                    <p className="text-xs text-[#52739e] leading-relaxed m-0">
                      {art.desc}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <details className="text-xs border-t border-[#edf4fc] pt-2.5 text-[#3d6394] group">
                    <summary className="cursor-pointer font-bold text-[#0879e8] flex items-center justify-between hover:text-[#065eb8] transition-colors">
                      <span>Читать материал</span>
                      <ArrowRight size={13} className="transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="mt-2.5 text-[11.5px] leading-relaxed bg-[#f6faff] p-3 rounded-lg border border-[#e2eef9] text-[#2c4e77]">
                      {art.fullText}
                    </div>
                  </details>
                </div>
              </article>
            ))}
          </div>
        </section>

        <CTA
          title="Хотите сделать индивидуальный расчёт процесса?"
          button="Открыть калькулятор"
        />
      </main>
      <Footer />
    </>
  );
}
