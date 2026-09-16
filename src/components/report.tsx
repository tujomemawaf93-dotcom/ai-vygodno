"use client";
import { useState } from "react";
import Image from "next/image";
import {
  formatMoney,
  formatPayback,
  formatROI,
  readinessFactors,
  useCalculation,
} from "@/components/calculation";
import "@/app/report.css";

export function CalculationReport() {
  const [reportType, setReportType] = useState<"short" | "full">("full");
  const {
    calculatedInputs: i,
    calculatedAt,
    result: r,
    scenarios,
    recommendation,
    hasChanges,
  } = useCalculation();

  const number = (v: number) =>
    v.toLocaleString("ru-RU", { maximumFractionDigits: 1 });

  const rows = [
    ["Отрасль бизнеса", i.industry],
    ["Процесс", i.process],
    ["Роль пользователя", i.userRole || "Руководитель отдела"],
    ["Горизонт оценки", `${i.horizonYears || 1} ${(i.horizonYears || 1) === 1 ? "год" : "года"}`],
    ["Период разгона (Ramp-up)", i.rampUpMonths ? `${i.rampUpMonths} мес.` : "Сразу 100%"],
    ["Сотрудники в процессе", `${number(i.staff)} чел.`],
    ["Экономия на сотрудника", `${number(i.hours)} ч/мес.`],
    ["Суммарная экономия команды", `${number(i.staff * i.hours)} ч/мес.`],
    ["Стоимость часа сотрудника", formatMoney(i.rate)],
    ["Разовые затраты (CapEx)", formatMoney(r.detailed.costs.oneTimeTotal)],
    ["Регулярные расходы в месяц (OpEx)", formatMoney(r.detailed.costs.recurringMonthlyTotal)],
    ["Совокупные затраты 1-го года", formatMoney(r.cost)],
    ["TCO за весь горизонт", formatMoney(r.detailed.tcoHorizon)],
    ["Коэффициент качества q", number(i.quality)],
    ["Коэффициент реализации k", number(i.realization)],
    ["Готовность процесса", `${r.readiness} / 10`],
    ["Категория данных", i.dataCategory || i.data],
    ["Ответственный за пилот", i.owner ? "Назначен" : "Не назначен"],
  ];

  return (
    <article className="calculation-report" aria-label="Отчёт об эффективности ИИ">
      {/* Шапка отчёта */}
      <div className="report-heading">
        <Image
          src="/logo-ai-vygodno.png"
          width={180}
          height={46}
          alt="ИИ Выгодно"
          priority
        />
        <div>
          <b>Executive Report: Оценка эффективности ИИ</b>
          <p>
            {calculatedAt
              ? new Date(calculatedAt).toLocaleString("ru-RU")
              : "Исходный пример · расчёт ещё не сохранён"}
          </p>
        </div>
      </div>

      <h1>{i.process || "Оценка эффективности ИИ"}</h1>
      <p className="report-subtitle">
        {i.industry} · горизонт оценки — {i.horizonYears || 1} год(а) · статус: сценарная модель
      </p>

      {i.description && <p className="text-xs text-slate-600 mt-1">{i.description}</p>}

      {hasChanges && (
        <p className="report-note">
          Отчёт содержит последний подтверждённый расчёт. Несохранённые изменения формы не включены.
        </p>
      )}

      {/* Ключевые KPI */}
      <div className="report-kpis">
        <div>
          <span>Чистый эффект (1 год)</span>
          <strong>{formatMoney(r.effect)}</strong>
        </div>
        <div>
          <span>ROI 1-го года</span>
          <strong>{formatROI(r.roi)}</strong>
        </div>
        <div>
          <span>Срок окупаемости</span>
          <strong>{formatPayback(r.payback)}</strong>
        </div>
        <div>
          <span>Готовность и риск</span>
          <strong>{r.readiness}/10 · {r.risk}</strong>
        </div>
      </div>

      {/* Итоговая рекомендация */}
      <section className="report-recommendation">
        <h2>{recommendation.title}</h2>
        <p>{recommendation.reason}</p>
        {r.detailed.costOfDelayMonthly > 0 && (
          <p className="report-small">
            Расчётная цена откладывания: ~{formatMoney(r.detailed.costOfDelayMonthly)} упущенной выгоды в месяц.
          </p>
        )}
      </section>

      {/* Исходные данные и допущения */}
      <section>
        <h2>Параметры модели и допущения</h2>
        <dl className="report-inputs">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Экономика расчёта */}
      <section>
        <h2>Экономика и пороги окупаемости</h2>
        <div className="report-economics">
          <p>
            Скорректированная выгода B<br />
            <b>{formatMoney(r.benefit)} / год</b>
          </p>
          <p>
            Полные затраты 1 года C<br />
            <b>{formatMoney(r.cost)}</b>
          </p>
          <p>
            Чистый ежемесячный поток Bₘ − Cₘ<br />
            <b>{formatMoney(r.monthlyNet)} / мес.</b>
          </p>
        </div>
        <p className="mt-2">
          Общая точка безубыточности:{" "}
          <b>
            {r.breakEven !== null ? `${number(r.breakEven)} ч/мес.` : "Не определяется"}
          </b>
          .{" "}
          {r.breakEven !== null && i.staff > 0 && (
            <>
              На одного сотрудника: <b>{number(r.breakEven / i.staff)} ч/мес.</b>
            </>
          )}
        </p>
      </section>

      {/* Сценарии */}
      <section>
        <h2>Сценарии стресс-тестирования</h2>
        <table>
          <thead>
            <tr>
              <th>Сценарий</th>
              <th>q · k</th>
              <th>Эффект / год</th>
              <th>ROI / год</th>
              <th>Окупаемость</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((s) => (
              <tr key={s.name}>
                <th>{s.name}</th>
                <td>
                  {number(Math.min(1, i.quality * s.q))} ·{" "}
                  {number(Math.min(1, i.realization * s.k))}
                </td>
                <td>{formatMoney(s.result.effect)}</td>
                <td>{formatROI(s.result.roi)}</td>
                <td>{formatPayback(s.result.payback)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Факторы готовности */}
      <section>
        <h2>Индекс готовности к внедрению ({r.readiness} / 10)</h2>
        <ul className="text-[9px] text-slate-700 pl-4 space-y-0.5">
          {readinessFactors(i).map((f) => (
            <li key={f.label}>
              {f.label}: <b>{f.points} / {f.max}</b>
            </li>
          ))}
        </ul>
      </section>

      {/* Ограничения и методология */}
      <section className="report-limits">
        <h2>Методика и правовые ограничения</h2>
        <p>
          Базовая модель: E = B − C; ROI = E / C × 100%; PP = C₀ / (Bₘ − Cₘ); B = Bₚ × q × k.
          При неположительном чистом месячном потоке окупаемости нет.
        </p>
        <p>
          Высвобождённое время оценивается по ставке часа сотрудника и не гарантирует прямого денежного притока.
          Модель не учитывает налоги, инфляцию, дисконтирование и будущие изменения тарифов.
          Коэффициенты качества и реализации являются гипотезами пользователя и подлежат обязательной валидации в ходе 30-дневного пилотного проекта.
        </p>
      </section>

      <div className="report-bottom">
        Сервис «ИИ Выгодно» · Независимая экспертная оценка эффективности ИИ · Все права защищены
      </div>
    </article>
  );
}
