"use client";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CirclePlay,
  TrendingDown,
  TrendingUp,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import { Header, Footer, Icon, CTA, CheckLine, Logo, ProductIcon } from "@/components/ui";
import {
  calculate,
  initialInputs,
  buildScenarios,
  formatMoney as money,
  formatROI,
  formatPayback as pp,
} from "@/components/calculation";

const sample = calculate(initialInputs);
const scenarioAssets = [
  "/assets/status-prepare.png",
  "/assets/status-pilot.png",
  "/assets/metric-growth.png",
];

const scenarios = buildScenarios(initialInputs).map((s, index) => ({
  title: s.name,
  subtitle: s.description,
  tone: ["negative", "base", "positive"][index],
  icon: [TrendingDown, BarChart3, TrendingUp][index],
  asset: scenarioAssets[index],
  result: s.result,
}));

const features = [
  ["benefit", "Экономический эффект", "Выгода от экономии времени, подрядчиков, брака и роста маржи.", "/assets/metric-effect.png"],
  ["roi", "ROI и TCO (1–5 лет)", "Рентабельность с учётом совокупной стоимости владения.", "/assets/metric-roi.png"],
  ["payback", "Срок окупаемости", "Период возврата инвестиций и выход на мощность (Ramp-up).", "/assets/metric-payback.png"],
  ["sensitivity", "Сравнение и What-If", "Сравнение вариантов решений и интерактивный стресс-тест.", "/assets/metric-growth.png"],
  ["risk", "Диагностика и риски", "Критерии применимости ИИ и проверка безопасности данных.", "/assets/metric-risk.png"],
  ["rocket", "Пилот и Plan vs Fact", "30-дневный протокол проверки и оценка ошибки прогноза.", "/assets/status-pilot.png"],
] as const;

function Dashboard() {
  const values = Array.from(
    { length: 13 },
    (_, n) => -initialInputs.oneTime + sample.monthlyNet * n * 3
  );
  const min = Math.min(0, ...values);
  const max = Math.max(1, ...values);
  const y = (v: number) => 112 - ((v - min) / (max - min)) * 96;
  const points = values.map((v, n) => `${28 + n * 23},${y(v)}`).join(" ");
  const savingShare = Math.round(
    initialInputs.quality * initialInputs.realization * 100
  );

  return (
    <div className="dashboard product-preview" aria-label="Пример расчёта в интерфейсе сервиса">
      <div className="product-frame">
        <div className="browser-bar">
          <i />
          <i />
          <i />
          <span>ИИ Выгодно · рабочее пространство</span>
        </div>
        <div className="product-topbar">
          <Logo small />
          <div className="product-tabs">
            <span className="active">Мой расчёт</span>
            <span>Сценарии</span>
            <span>Отчёт</span>
          </div>
          <span className="product-avatar">К</span>
        </div>
        <div className="product-body">
          <div className="product-caption">
            <span>Обработка обращений клиентов</span>
            <span>Пример · первый год</span>
          </div>
          <div className="preview-kpis">
            {[
              ["Экономический эффект", money(sample.effect), "за первый год", "metric-effect"],
              ["ROI", formatROI(sample.roi), "за первый год", "metric-roi"],
              ["Срок окупаемости", pp(sample.payback), "с момента запуска", "metric-payback"],
              ["Индекс готовности", `${sample.readiness} / 10`, "по факторам модели", "metric-readiness"],
            ].map(([t, v, d, iconName], i) => (
              <div className="preview-kpi" key={t}>
                <span className="flex items-center gap-1.5">
                  <ProductIcon name={iconName} size={15} />
                  {t}
                </span>
                <strong>{v}</strong>
                {i === 3 && (
                  <div className="mini-progress">
                    <i style={{ width: `${sample.readiness * 10}%` }} />
                  </div>
                )}
                <small>{d}</small>
              </div>
            ))}
          </div>
          <div className="preview-charts">
            <div className="preview-panel">
              <h3>
                Денежный поток <span>(накопительно)</span>
              </h3>
              <svg
                viewBox="0 0 326 145"
                role="img"
                aria-label="Накопленный денежный поток за 36 месяцев"
              >
                {[16, 48, 80, 112].map((v) => (
                  <line key={v} x1="28" x2="304" y1={v} y2={v} stroke="#e5eef7" />
                ))}
                {[0, 3, 6, 9, 12].map((n) => (
                  <line
                    key={n}
                    x1={28 + n * 23}
                    x2={28 + n * 23}
                    y1="16"
                    y2="112"
                    stroke="#eef3f8"
                  />
                ))}
                <polygon points={`28,112 ${points} 304,112`} fill="#e4f8f3" />
                <line
                  x1="28"
                  x2="304"
                  y1={y(0)}
                  y2={y(0)}
                  stroke="#a9bbd3"
                  strokeDasharray="3 3"
                />
                <polyline
                  points={points}
                  fill="none"
                  stroke="#05b89f"
                  strokeWidth="2.5"
                />
                {values.map((v, n) => (
                  <circle
                    key={n}
                    cx={28 + n * 23}
                    cy={y(v)}
                    r="2.6"
                    fill="#05b89f"
                  />
                ))}
                {[0, 6, 12, 18, 24, 30, 36].map((n) => (
                  <text
                    key={n}
                    x={28 + (n / 3) * 23}
                    y="131"
                    textAnchor="middle"
                    fill="#748aaa"
                    fontSize="9"
                  >
                    {n}
                  </text>
                ))}
                <text
                  x="167"
                  y="144"
                  textAnchor="middle"
                  fill="#748aaa"
                  fontSize="8"
                >
                  Месяцы
                </text>
              </svg>
              <div className="preview-callout">
                Выход в плюс <strong>{pp(sample.payback)}</strong>
              </div>
            </div>
            <div className="preview-panel">
              <h3>Потенциал экономии</h3>
              <div
                className="preview-donut"
                style={{
                  background: `conic-gradient(#05b89f 0 ${savingShare}%, #dceafb ${savingShare}% 100%)`,
                }}
              >
                <div>
                  <strong>{savingShare}%</strong>
                  <small>q × k</small>
                </div>
              </div>
              <div className="donut-legend">
                <span>
                  <i />
                  Реализуемый эффект <b>{savingShare}%</b>
                </span>
                <span>
                  <i />
                  Поправка модели <b>{100 - savingShare}%</b>
                </span>
              </div>
              <p className="preview-footnote">Качество × реализация</p>
            </div>
          </div>
        </div>
      </div>
      <span className="workspace-note">
        Цифры сегодня —<br />
        решения завтра
      </span>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="soft-bg home-hero">
          <div className="container hero-grid grid grid-cols-[.88fr_1.12fr] items-center gap-8 py-10 pb-7">
            <div className="hero-copy">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ebf8f5] text-[#008775] text-[11px] font-bold border border-[#a5dfd4] mb-3">
                <Image
                  src="/assets/accent-ai-roi.png"
                  alt="AI ROI"
                  width={18}
                  height={18}
                  className="object-contain"
                  unoptimized
                />
                <span>ДЛЯ МАЛОГО И СРЕДНЕГО БИЗНЕСА</span>
              </div>
              <h1 className="mt-2 font-extrabold leading-tight">
                Проверь, окупится ли
                <br />
                <span className="text-[#05b89f]">ИИ</span> в вашем бизнесе
              </h1>
              <p className="muted mt-4 max-w-[520px] text-[17px] leading-6">
                Оцените экономический эффект, ROI, срок окупаемости и возможные риски до внедрения. Принимайте решения на основе цифр, а не догадок.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/calculator" className="btn btn-primary no-underline">
                  Начать расчёт бесплатно <ArrowRight size={18} />
                </Link>
                <a href="#how" className="btn btn-outline">
                  <CirclePlay className="text-[#05b89f]" size={18} />
                  Как это работает?
                </a>
              </div>
              <div className="mt-5 flex flex-wrap gap-5">
                <CheckLine>Быстро и просто</CheckLine>
                <CheckLine>Без регистрации</CheckLine>
                <CheckLine>Результат за 5 минут</CheckLine>
              </div>
            </div>
            <Dashboard />
          </div>
        </section>

        {/* Что вы получите */}
        <section className="container py-7">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Что вы получите</h2>
            <Link href="/about" className="section-link">
              Все возможности <ArrowRight size={16} />
            </Link>
          </div>
          <div className="six-grid feature-grid grid grid-cols-6 gap-5">
            {features.map(([type, title, body, assetPath]) => (
              <article className="feature-item p-3 group transition-transform hover:-translate-y-0.5" key={title}>
                <div className="mb-3">
                  <Icon type={type} asset={assetPath} size={28} />
                </div>
                <h3 className="text-sm font-bold text-[#08275b] leading-snug m-0 mb-1.5 group-hover:text-[#008775] transition-colors">{title}</h3>
                <p className="text-xs text-[#52749e] leading-relaxed m-0">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Как это работает */}
        <section id="how" className="how-band py-6">
          <div className="container">
            <div className="flex items-center justify-between">
              <h2 className="section-title">Как это работает</h2>
              <Link href="/about" className="section-link">
                Подробнее о процессе <ArrowRight size={16} />
              </Link>
            </div>
            <div className="step-grid home-flow mt-5 grid grid-cols-3 gap-7">
              {[
                [
                  "Введите данные",
                  "Расскажите о процессе, времени сотрудников и затратах на внедрение.",
                  "file",
                  "/assets/cat-legal.png",
                ],
                [
                  "Получите расчёт",
                  "Сравните эффект, ROI, окупаемость и устойчивость результата.",
                  "benefit",
                  "/assets/metric-effect.png",
                ],
                [
                  "Проведите пилот",
                  "За 30 дней проверьте гипотезу на реальных задачах вашего бизнеса.",
                  "rocket",
                  "/assets/status-pilot.png",
                ],
              ].map(([t, b, i, assetPath], n) => (
                <div className="flow-step" key={t}>
                  <span className="flow-number">{n + 1}</span>
                  <Icon type={i as "file"} asset={assetPath} size={28} />
                  <div>
                    <h3>{t}</h3>
                    <p className="muted">{b}</p>
                  </div>
                  {n < 2 && <ArrowRight className="flow-arrow" size={22} />}
                </div>
              ))}
            </div>

            {/* Pipeline visual diagram */}
            <div className="mt-7 pt-5 border-t border-[#d8e6f4] flex flex-col md:flex-row items-center justify-between gap-6 bg-white/75 rounded-2xl p-5 border border-[#e2eef9] shadow-2xs">
              <div className="max-w-xs shrink-0">
                <span className="text-[10px] font-extrabold text-[#008775] uppercase tracking-wider block mb-1">
                  Сквозной пайплайн
                </span>
                <h3 className="text-base font-bold text-[#08275b] m-0 mb-1.5">
                  От сырых данных к бизнес-эффекту
                </h3>
                <p className="text-xs text-[#52749e] m-0 leading-relaxed">
                  Сервис связывает данные о рутинных задачах с TCO модели и рассчитывает точку безубыточности.
                </p>
              </div>
              <div className="flex-1 max-w-2xl w-full">
                <Image
                  src="/assets/ill-ai-pipeline.png"
                  alt="Пайплайн расчёта"
                  width={680}
                  height={200}
                  className="w-full h-auto object-contain"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </section>

        {/* Сценарии развития */}
        <section className="container py-7">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="section-title">Сценарии развития</h2>
              <p className="muted mb-0 text-sm">
                Пример на исходных данных калькулятора. Ваш результат зависит от вводных.
              </p>
            </div>
            <Link href="/scenarios" className="section-link mobile-hide">
              Сравнить сценарии <ArrowRight size={17} />
            </Link>
          </div>
          <div className="three-grid mt-4 grid grid-cols-3 gap-4">
            {scenarios.map(
              ({ title, subtitle, tone, asset, result }, idx) => (
                <article className={`home-scenario ${tone}`} key={title}>
                  <div className="scenario-heading">
                    <span className="scenario-icon grid place-items-center bg-white rounded-xl p-1 shadow-2xs">
                      <Image
                        src={asset}
                        alt={title}
                        width={28}
                        height={28}
                        className="object-contain"
                        unoptimized
                      />
                    </span>
                    <div>
                      <h3>{title}</h3>
                      <p>{subtitle}</p>
                    </div>
                    {idx === 1 && (
                      <span className="scenario-badge">Рекомендуем</span>
                    )}
                  </div>
                  <dl>
                    {[
                      ["Экономический эффект", money(result.effect) + " / год"],
                      ["ROI", formatROI(result.roi)],
                      ["Срок окупаемости", pp(result.payback)],
                    ].map(([t, v]) => (
                      <div key={t}>
                        <dt>{t}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                </article>
              )
            )}
          </div>
        </section>

        <CTA />
      </main>
      <Footer />
    </>
  );
}

