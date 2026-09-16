"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowRight, CheckCircle2, Info } from "lucide-react";
import "../secondary.css";
import { Header, Footer, Icon, CTA, ProductIcon } from "@/components/ui";

const JOURNEY_STEPS = [
  { num: "01", title: "Вводные", subtitle: "Параметры процесса, команда, объём задач и ставка часа" },
  { num: "02", title: "Экономическая модель", subtitle: "Источники выгоды, CapEx / OpEx TCO, горизонт и ramp-up" },
  { num: "03", title: "E / ROI / PP", subtitle: "Чистый эффект первого года, рентабельность и срок окупаемости" },
  { num: "04", title: "Сценарии", subtitle: "Сравнение вариантов A vs B, What-If и пороги безубыточности" },
  { num: "05", title: "Пилот", subtitle: "30-дневный пилот с замерами до/после и Plan vs Fact" },
  { num: "06", title: "Решение", subtitle: "Инвест-вердикт: масштабировать, доработать или остановить" },
];

const METRICS_LIST = [
  { type: "benefit", title: "Экономический эффект E", desc: "Чистая выгода первого года с учётом затрат" },
  { type: "roi", title: "Рентабельность ROI", desc: "Возврат на вложенные инвестиции в %" },
  { type: "payback", title: "Срок окупаемости PP", desc: "Месяц выхода накопленного денежного потока в плюс" },
  { type: "target", title: "Точка безубыточности", desc: "Пороговые часы экономии для покрытия расходов" },
  { type: "readiness", title: "Индекс готовности", desc: "Оценка процесса по 5 ключевым факторам зрелости" },
  { type: "risk", title: "Категория рисков", desc: "Требования к безопасности и деперсонализации данных" },
];

const FORMULAS = [
  {
    title: "Экономический эффект",
    formula: "E = B − C",
    desc: "Годовая реализованная выгода B минус совокупная стоимость владения C (CapEx + OpEx).",
  },
  {
    title: "Реализуемая выгода",
    formula: "B = B_пот × q × k",
    desc: "Потенциальная выгода с поправкой на качество черновиков q (например, 0,8–0,95) и коэффициент реализации k (например, 0,7–0,85 в сценарной модели).",
  },
  {
    title: "Рентабельность инвестиций",
    formula: "ROI = (E / C) × 100%",
    desc: "Отношение чистого эффекта к суммарным затратам первого года. Если C = 0, процент не определяется.",
  },
  {
    title: "Срок окупаемости",
    formula: "PP = C₀ / (B_мес − C_мес)",
    desc: "Разовые затраты на запуск C₀ / ежемесячный чистый денежный поток с учётом динамики внедрения.",
  },
];

export default function About() {
  return (
    <>
      <Header />
      <main className="secondary-page about-page">
        {/* Hero Section */}
        <section className="soft-bg">
          <div className="container two-grid grid grid-cols-1 lg:grid-cols-[1.1fr_.9fr] items-center gap-6 lg:gap-10 py-8 lg:py-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ebf8f5] border border-[#a5dfd4] text-[11px] font-bold text-[#008775] mb-2">
                <ProductIcon name="accent-ai-roi" size={16} />
                <span>О СЕРВИСЕ</span>
              </div>
              <h1 className="mt-2 text-[44px] font-extrabold tracking-[-.06em] text-[#08275b] leading-tight">
                Что такое «ИИ Выгодно»
              </h1>
              <p className="muted max-w-xl text-[16px] leading-relaxed mt-2">
                Сервис предварительной оценки экономической эффективности и безопасного внедрения искусственного интеллекта для бизнеса. Превращает хайп вокруг нейросетей в точные расчёты: E, ROI, PP, риски и План vs Факт.
              </p>
              <div className="mt-5 flex gap-3">
                <Link href="/calculator" className="btn btn-primary text-xs">
                  Открыть калькулятор <ArrowRight size={14} />
                </Link>
                <Link href="/cases" className="btn btn-outline text-xs">
                  Смотреть кейсы
                </Link>
              </div>
            </div>

            {/* Visual 7-step Flow Scheme */}
            <div className="about-model card p-5 border-[#dce8f5]">
              <div className="model-label font-bold text-xs text-[#08275b] flex items-center justify-between pb-3 border-b border-[#eef3f9]">
                <span className="flex items-center gap-2">
                  <span className="model-dot" /> 6 ЭТАПОВ ПРИНЯТИЯ РЕШЕНИЯ
                </span>
                <span className="text-[10px] text-[#008775] bg-[#ebf8f5] px-2 py-0.5 rounded font-semibold">
                  Методология
                </span>
              </div>

              <div className="space-y-2 mt-3">
                {JOURNEY_STEPS.map((step, i) => (
                  <div
                    key={step.num}
                    className={`flex items-center gap-3 p-2 rounded-lg border transition-all ${
                      i === 1
                        ? "bg-[#ebf8f5] border-[#a5dfd4]"
                        : "bg-white border-[#edf3f8]"
                    }`}
                  >
                    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${i === 1 ? "bg-[#05b89f] text-white" : "bg-[#f0f5fb] text-[#5b7ea5]"}`}>
                      {step.num}
                    </span>
                    <div className="flex-1 min-w-0">
                      <b className={`text-xs block leading-tight ${i === 1 ? "text-[#008775]" : "text-[#08275b]"}`}>
                        {step.title}
                      </b>
                      <small className="text-[10px] text-[#637ba5] truncate block">
                        {step.subtitle}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Что рассчитываем */}
        <section className="container py-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="section-title text-2xl font-bold text-[#08275b] m-0">
                Что рассчитываем
              </h2>
              <p className="muted text-xs m-0 mt-1">
                Ключевые метрики инвестиционной привлекательности и рисков
              </p>
            </div>
          </div>

          <div className="three-grid grid grid-cols-1 md:grid-cols-3 gap-3">
            {METRICS_LIST.map((m) => (
              <article
                className="card p-4 flex items-start gap-3 border-[#e5effa] hover:border-[#b4d4f7] transition-all"
                key={m.title}
              >
                <Icon type={m.type as "benefit"} />
                <div>
                  <b className="text-sm text-[#08275b] block mb-0.5">{m.title}</b>
                  <p className="text-xs text-[#597da7] m-0 leading-relaxed">{m.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Что учитываем vs Что сервис не делает */}
        <section className="container about-groups py-4">
          <article className="about-considers card p-5 border-[#c8eee4] bg-linear-to-b from-[#f2fcf9] to-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="section-title text-xl font-bold text-[#08275b] m-0">
                  Что учитывает экономическая модель
                </h2>
                <Image
                  src="/assets/ill-roi-calculator.png"
                  alt="Экономическая модель"
                  width={40}
                  height={40}
                  className="object-contain shrink-0"
                  unoptimized
                />
              </div>
              <p className="muted text-xs mb-3">
                Выгода зависит не от теоретической скорости модели, а от организационных факторов:
              </p>
              <ul className="space-y-2.5 text-xs text-[#305988]">
                {[
                  "Число сотрудников, фактическую экономию часов и ставку часа с налогами",
                  "Полную стоимость владения TCO: софт, внедрение, интеграцию, обучение и поддержку",
                  "Коэффициент качества черновиков q (время на ревью человеком)",
                  "Коэффициент реализации k (сколько сэкономленного времени превращается в выгоду)",
                  "Динамику освоения (ramp-up) и горизонт планирования (от 1 до 5 лет)",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-[#05b89f] shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className="about-limits card p-5 border-[#dce8f5] bg-linear-to-b from-[#f6faff] to-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="section-title text-xl font-bold text-[#08275b] m-0">
                  Что не гарантируем (безопасность данных)
                </h2>
                <Image
                  src="/assets/ill-data-security.png"
                  alt="Безопасность данных"
                  width={40}
                  height={40}
                  className="object-contain shrink-0"
                  unoptimized
                />
              </div>
              <p className="muted text-xs mb-3">
                Мы защищаем бизнес от завышенных ожиданий и необдуманных инвестиций:
              </p>
              <ul className="space-y-2.5 text-xs text-[#52749e]">
                {[
                  "Не даёт безоговорочных гарантий прибыли без замеров на реальных процессах",
                  "Не заменяет пилотное тестирование в вашей команде (30-дневный пилот рекомендуется для подтверждения расчёта перед масштабированием)",
                  "Не отправляет конфиденциальные данные компании во внешние непроверенные сервисы",
                  "Не навязывает конкретного вендора или инструмент: расчёт объективен",
                  "Не заменяет управленческую ответственность руководителя",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <Info size={16} className="text-[#0879e8] shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </section>

        {/* Прозрачная экономика и формулы */}
        <section className="container py-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="section-title text-2xl font-bold text-[#08275b] m-0">
                Прозрачная экономика и формулы
              </h2>
              <p className="muted text-xs m-0 mt-1">
                Все формулы открыты: вы можете проверить каждую цифру на калькуляторе
              </p>
            </div>
            <span className="text-[11px] text-[#008775] font-semibold bg-[#ebf8f5] px-2.5 py-1 rounded border border-[#a5dfd4]">
              Один период для выгод и затрат
            </span>
          </div>

          <div className="formula-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {FORMULAS.map((item) => (
              <article className="formula-card card p-4 border-[#dbe8f6]" key={item.title}>
                <h3 className="text-xs font-semibold text-[#5a7ba3] m-0 mb-2">{item.title}</h3>
                <p className="text-base font-black text-[#008775] my-2 font-mono tracking-tight">
                  {item.formula}
                </p>
                <small className="text-[11px] text-[#6380a5] leading-relaxed block">
                  {item.desc}
                </small>
              </article>
            ))}
          </div>

          <div className="model-limit-note mt-4 p-3.5 rounded-xl bg-[#f4f9fd] border border-[#d6e7f8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#486e9e]">
            <div className="flex items-center gap-2.5">
              <Info size={18} className="text-[#0879e8] shrink-0" />
              <span>
                Высвобождённое время становится денежной выгодой, когда компания использует его для полезных задач или оптимизирует затраты. Всегда подтверждайте расчёты на 30-дневном пилоте.
              </span>
            </div>
            <Link href="/pilot" className="btn btn-outline text-xs whitespace-nowrap">
              Подробнее о пилоте <ArrowRight size={13} />
            </Link>
          </div>
        </section>

        <CTA
          title="Готовы проверить экономику вашего процесса?"
          button="Перейти к расчёту"
        />
      </main>
      <Footer />
    </>
  );
}
