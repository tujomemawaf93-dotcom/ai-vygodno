import {
  ComprehensiveInputs,
  DiagnosticResult,
  DiagnosticState,
  Industry,
  RiskCategoryAssessment,
  UserRole,
} from "@/types/economics";

export interface ProcessTemplate {
  id: string;
  industry: Industry;
  businessFunction: string;
  process: string;
  task: string;
  aiUseCase: string;
  description: string;
  defaults: {
    staff: number;
    hours: number;
    rate: number;
    oneTime: number;
    monthly: number;
    additional: number;
    quality: number;
    realization: number;
    readiness: number;
    data: string;
    owner: boolean;
    // Specific benefits hints
    contractorSavings?: number;
    errorsPerMonth?: number;
    costPerError?: number;
  };
}

export const PROCESS_CATALOG: ProcessTemplate[] = [
  {
    id: "const-estimate",
    industry: "Строительство",
    businessFunction: "Продажи и закупки",
    process: "Подготовка коммерческих предложений и смет",
    task: "Извлечение объёмов из ТЗ и чертежей, первичный черновик сметы",
    aiUseCase: "LLM + парсинг спецификаций и сметных баз",
    description: "Автоматизированный черновик сметы и КП с обязательной проверкой сметчиком.",
    defaults: {
      staff: 3,
      hours: 18,
      rate: 2200,
      oneTime: 280000,
      monthly: 35000,
      additional: 10000,
      quality: 0.9,
      realization: 0.8,
      readiness: 4,
      data: "Внутренние",
      owner: true,
      errorsPerMonth: 8,
      costPerError: 15000,
    },
  },
  {
    id: "const-docs",
    industry: "Строительство",
    businessFunction: "ПТО и документооборот",
    process: "Проверка актов и исполнительной документации",
    task: "Сверка объёмов КС-2, КС-3 с журналами работ и проектом",
    aiUseCase: "Интеллектуальный анализ сканов и актов",
    description: "Быстрый поиск нестыковок в объёмах и реквизитах строительной документации.",
    defaults: {
      staff: 2,
      hours: 24,
      rate: 1900,
      oneTime: 220000,
      monthly: 30000,
      additional: 5000,
      quality: 0.88,
      realization: 0.75,
      readiness: 3,
      data: "Внутренние",
      owner: true,
      errorsPerMonth: 12,
      costPerError: 25000,
    },
  },
  {
    id: "retail-reviews",
    industry: "Розница",
    businessFunction: "Маркетинг и сервис",
    process: "Анализ отзывов маркетплейсов и обратная связь",
    task: "Кластеризация жалоб, трендов качества и генерация ответов",
    aiUseCase: "Семантическая классификация + черновики ответов",
    description: "Быстрый разбор сотен отзывов в день и подготовка вежливых персонализированных ответов.",
    defaults: {
      staff: 4,
      hours: 15,
      rate: 1300,
      oneTime: 120000,
      monthly: 25000,
      additional: 5000,
      quality: 0.92,
      realization: 0.85,
      readiness: 4,
      data: "Публичные",
      owner: true,
      contractorSavings: 45000,
    },
  },
  {
    id: "retail-cards",
    industry: "Розница",
    businessFunction: "Каталог и контент",
    process: "Заполнение карточек товаров и SEO-описаний",
    task: "Генерация уникальных описаний и характеристик по атрибутам",
    aiUseCase: "Пакетная генерация описаний товаров по шаблонам",
    description: "Ускорение ввода новинок в каталог с сохранением стилистики бренда.",
    defaults: {
      staff: 3,
      hours: 20,
      rate: 1200,
      oneTime: 100000,
      monthly: 20000,
      additional: 5000,
      quality: 0.9,
      realization: 0.85,
      readiness: 4,
      data: "Публичные",
      owner: true,
      contractorSavings: 60000,
    },
  },
  {
    id: "services-support",
    industry: "Услуги",
    businessFunction: "Клиентский сервис",
    process: "Обработка обращений клиентов 1-й линии",
    task: "Мгновенные ответы на повторяющиеся вопросы, сбор вводных",
    aiUseCase: "ИИ-ассистент в Telegram / Web-виджете",
    description: "Круглосуточный ассистент, передающий сложные запросы оператору.",
    defaults: {
      staff: 5,
      hours: 16,
      rate: 1600,
      oneTime: 200000,
      monthly: 38000,
      additional: 10000,
      quality: 0.88,
      realization: 0.8,
      readiness: 4,
      data: "Внутренние",
      owner: true,
    },
  },
  {
    id: "services-invoices",
    industry: "Услуги",
    businessFunction: "Бухгалтерия и расчёты",
    process: "Первичная обработка счетов и актов",
    task: "Распознавание реквизитов и сумм из PDF и фото",
    aiUseCase: "OCR + LLM извлечение структурированных JSON-данных",
    description: "Ввод документов в учётную систему без ручного перепечатывания.",
    defaults: {
      staff: 2,
      hours: 18,
      rate: 1700,
      oneTime: 150000,
      monthly: 22000,
      additional: 5000,
      quality: 0.94,
      realization: 0.85,
      readiness: 4,
      data: "Коммерческая тайна",
      owner: true,
      errorsPerMonth: 6,
      costPerError: 8000,
    },
  },
  {
    id: "marketing-content",
    industry: "Маркетинг",
    businessFunction: "Контент-маркетинг",
    process: "Подготовка черновиков статей, постов и рассылок",
    task: "Рерайт, адаптация под каналы, генерация идей контент-плана",
    aiUseCase: "Генеративный ассистент автора и копирайтера",
    description: "Увеличение объёма качественного контента без расширения штата копирайтеров.",
    defaults: {
      staff: 3,
      hours: 22,
      rate: 1500,
      oneTime: 80000,
      monthly: 25000,
      additional: 5000,
      quality: 0.88,
      realization: 0.85,
      readiness: 4,
      data: "Публичные",
      owner: true,
      contractorSavings: 70000,
    },
  },
  {
    id: "education-tutor",
    industry: "Образование",
    businessFunction: "Методология и кураторы",
    process: "Проверка домашних заданий и генерация тестов",
    task: "Первичный анализ ответов студентов и черновик персональной рецензии",
    aiUseCase: "Ассистент тьютора с рубрикатором критериев",
    description: "Снятие 60% рутины с кураторов курса с сохранением живого контроля.",
    defaults: {
      staff: 6,
      hours: 14,
      rate: 1400,
      oneTime: 180000,
      monthly: 32000,
      additional: 8000,
      quality: 0.86,
      realization: 0.8,
      readiness: 3,
      data: "Внутренние",
      owner: true,
    },
  },
  {
    id: "it-support",
    industry: "ИТ и цифровые сервисы",
    businessFunction: "Техническая поддержка и документация",
    process: "Ответы по базе знаний и первичный траблшутинг",
    task: "Поиск решений в кодовой базе/Confluence и генерация шагов решения",
    aiUseCase: "RAG-ассистент инженера поддержки",
    description: "Сокращение времени первого ответа (TTFR) и ускорение закрытия типовых тикетов.",
    defaults: {
      staff: 5,
      hours: 15,
      rate: 2200,
      oneTime: 240000,
      monthly: 45000,
      additional: 10000,
      quality: 0.9,
      realization: 0.85,
      readiness: 5,
      data: "Внутренние",
      owner: true,
    },
  },
  {
    id: "hr-screening",
    industry: "HR и найм",
    businessFunction: "Рекрутмент",
    process: "Первичный скрининг резюме и подготовка вопросов",
    task: "Сверка резюме с профилем должности и подготовка тестовых кейсов",
    aiUseCase: "LLM-анализ соответствия профиля вакансии",
    description: "Фокус рекрутера на подходящих кандидатах, сокращение ручного отсева.",
    defaults: {
      staff: 2,
      hours: 25,
      rate: 1800,
      oneTime: 140000,
      monthly: 24000,
      additional: 6000,
      quality: 0.88,
      realization: 0.8,
      readiness: 4,
      data: "Персональные",
      owner: true,
    },
  },
  {
    id: "sales-leads",
    industry: "Продажи",
    businessFunction: "B2B продажи",
    process: "Квалификация лидов и персональные питчи",
    task: "Сбор открытой информации о компании клиента и подготовка черновика письма",
    aiUseCase: "AI-обогащение профиля лида + персонализированный аутрич",
    description: "Рост конверсии холодных и теплых контактов за счёт глубокой персонализации.",
    defaults: {
      staff: 4,
      hours: 16,
      rate: 2000,
      oneTime: 190000,
      monthly: 36000,
      additional: 8000,
      quality: 0.87,
      realization: 0.82,
      readiness: 4,
      data: "Внутренние",
      owner: true,
    },
  },
  {
    id: "analytics-reports",
    industry: "Аналитика и отчёты",
    businessFunction: "Управленческая отчётность",
    process: "Сборка еженедельных дайджестов и отчётов",
    task: "Агрегация цифр из таблиц и формулирование текстовых выводов о динамике",
    aiUseCase: "Автоматизированная интерпретация данных и генерация сводок",
    description: "Экономия времени аналитика на текстовом оформлении регулярных отчётов.",
    defaults: {
      staff: 2,
      hours: 20,
      rate: 2500,
      oneTime: 160000,
      monthly: 28000,
      additional: 6000,
      quality: 0.92,
      realization: 0.85,
      readiness: 4,
      data: "Коммерческая тайна",
      owner: true,
    },
  },
];

export const INDUSTRY_LIST: Industry[] = [
  "ИТ и цифровые сервисы",
  "Строительство",
  "Услуги",
  "Розница",
  "Маркетинг",
  "Образование",
  "Продажи",
  "Клиентский сервис",
  "Документы и бэк-офис",
  "HR и найм",
  "Аналитика и отчёты",
];

export const ROLE_ADVICE: Record<
  UserRole,
  { badge: string; focus: string; metricsPriority: string; tip: string }
> = {
  "Собственник бизнеса": {
    badge: "Стратегия и капитал",
    focus: "Окупаемость инвестиций, чистый экономический эффект E и TCO за 3 года.",
    metricsPriority: "E, Срок окупаемости, Риск данных",
    tip: "Оценивайте, высвободит ли ИИ реальные ресурсы и увеличит ли пропускную способность бизнеса.",
  },
  "Руководитель отдела": {
    badge: "Операционная эффективность",
    focus: "Экономия часов сотрудников, снижение рутины и качество результата (коэффициент q).",
    metricsPriority: "Часы/мес., Коэффициент качества q, Индекс готовности",
    tip: "ИИ не заменит ключевых экспертов, но разгрузит их от рутинных типовых шагов.",
  },
  Специалист: {
    badge: "Удобство работы",
    focus: "Устранение рутинных задач, помощь в подготовке черновиков и защита от ошибок.",
    metricsPriority: "Экономия часов, Сложность внедрения, Baseline",
    tip: "Замерьте время выполнения 10 типовых задач вручную перед началом тестирования промптов.",
  },
  "Консультант / аналитик": {
    badge: "Финансовое моделирование",
    focus: "Анализ чувствительности, пороги безубыточности (Break-even) и сценарное стресс-тестирование.",
    metricsPriority: "Sensitivity, Break-even пороги, Forecast error",
    tip: "Обязательно проверьте консервативный сценарий с пониженным коэффициентом реализации (k ≤ 0.7).",
  },
};

export const DIAGNOSTIC_QUESTIONS = [
  {
    key: "isRepetitive" as keyof DiagnosticState,
    title: "1. Задача повторяется регулярно?",
    hint: "ИИ эффективен на потоковых, повторяющихся задачах с однотипной логикой.",
  },
  {
    key: "hasExamples" as keyof DiagnosticState,
    title: "2. Есть ли достаточная база примеров и данных?",
    hint: "Примеры успешных ответов, регламенты, шаблоны или исторические тексты.",
  },
  {
    key: "humanCheckable" as keyof DiagnosticState,
    title: "3. Может ли результат быстро проверить человек?",
    hint: "Эксперт должен за 1–2 минуты оценить корректность черновика.",
  },
  {
    key: "nonCriticalError" as keyof DiagnosticState,
    title: "4. Ошибка не фатальна для бизнеса / жизни?",
    hint: "Нет риска уголовной ответственности, вреда здоровью или мгновенного банкротства.",
  },
  {
    key: "isStandardized" as keyof DiagnosticState,
    title: "5. Процесс уже стандартизирован и понятен без ИИ?",
    hint: "Если процесс хаотичен, ИИ лишь ускорит генерацию хаоса.",
  },
  {
    key: "noCheaperAutomation" as keyof DiagnosticState,
    title: "6. Обычная автоматизация (формулы, скрипты) не дешевле?",
    hint: "Для строгих таблиц и простых условий правила без ИИ работают надежнее и дешевле.",
  },
  {
    key: "hasBaseline" as keyof DiagnosticState,
    title: "7. Есть ли зафиксированный базовый замер (baseline)?",
    hint: "Известно текущее время выполнения задачи и стоимость ошибки.",
  },
  {
    key: "hasOwner" as keyof DiagnosticState,
    title: "8. Назначен ли ответственный владелец пилота?",
    hint: "Конкретный сотрудник отвечает за замеры, обучение коллег и обратную связь.",
  },
];

export function evaluateDiagnostic(d: DiagnosticState): {
  verdict: DiagnosticResult;
  advice: string;
  score: number; // 0..8
} {
  let score = 0;
  if (d.isRepetitive) score++;
  if (d.hasExamples) score++;
  if (d.humanCheckable) score++;
  if (d.nonCriticalError) score++;
  if (d.isStandardized) score++;
  if (d.noCheaperAutomation) score++;
  if (d.hasBaseline) score++;
  if (d.hasOwner) score++;

  if (!d.nonCriticalError || !d.humanCheckable) {
    return {
      verdict: "Высокий риск — требуется дополнительная проверка",
      advice:
        "Ошибки ИИ в этом процессе несут критический риск или их невозможно проверить человеком. Не запускайте полную автоматизацию без изолированного контура тестирования.",
      score,
    };
  }

  if (!d.noCheaperAutomation) {
    return {
      verdict: "Вероятно, здесь достаточно обычной автоматизации",
      advice:
        "Для этой задачи классические скрипты, интеграции CRM, формулы или шаблонные автоответы будут дешевле, быстрее и надежнее сложной языковой модели.",
      score,
    };
  }

  if (!d.isStandardized || !d.hasExamples) {
    return {
      verdict: "Сначала стандартизируйте процесс",
      advice:
        "Процесс пока недостаточно формализован или не хватает образцов эталонных результатов. Сначала зафиксируйте чек-лист и регламент, затем подключайте ИИ.",
      score,
    };
  }

  if (score >= 6) {
    return {
      verdict: "ИИ подходит для пилота",
      advice:
        "Процесс имеет все признаки хорошего кандидата: понятная структура, проверяемый результат и приемлемая цена ошибки. Рекомендуется запуск 30-дневного пилота.",
      score,
    };
  }

  return {
    verdict: "Сначала стандартизируйте процесс",
    advice:
      "Перед началом пилота зафиксируйте текущий baseline (время и затраты) и назначьте ответственного сотрудника.",
    score,
  };
}

export const STANDARD_RISKS: RiskCategoryAssessment[] = [
  {
    id: "risk-data",
    category: "Данные и безопасность",
    description: "Утечка конфиденциальных или персональных данных через сторонний облачный ИИ-сервис.",
    probability: 2,
    impact: 4,
    mitigation: "Обезличивание данных (деперсонализация), локальные/выделенные контуры или запрет обучения моделей на данных компании.",
  },
  {
    id: "risk-hallucination",
    category: "Качество и галлюцинации",
    description: "ИИ сгенерирует неверный факт, цифру или несуществующую норму права/стандарта.",
    probability: 4,
    impact: 3,
    mitigation: "Обязательная валидация человеком-экспертом (Human-in-the-loop), RAG с жестким ограничением источниками.",
  },
  {
    id: "risk-legal",
    category: "Юридические риски",
    description: "Претензии регуляторов по 152-ФЗ или авторским правам на сгенерированный контент.",
    probability: 2,
    impact: 4,
    mitigation: "Проверка пользовательского соглашения вендора, аудит собираемых данных и согласие субъектов.",
  },
  {
    id: "risk-adoption",
    category: "Сотрудники и адаптация",
    description: "Сотрудники саботируют инструмент из страха увольнения или неумения формулировать промпты.",
    probability: 3,
    impact: 3,
    mitigation: "Обучение команды, позиционирование ИИ как личного ассистента, а не замены людей.",
  },
  {
    id: "risk-vendor",
    category: "Зависимость от вендора",
    description: "Внезапное изменение тарифов API, блокировка аккаунта или закрытие сервиса.",
    probability: 2,
    impact: 3,
    mitigation: "Использование адаптеров с возможностью переключения между провайдерами (OpenAI / Anthropic / отечественные модели / open-source).",
  },
];

export const CONTEXTUAL_KNOWLEDGE_ARTICLES = [
  {
    id: "kb-data-security",
    title: "Какие данные нельзя загружать в ИИ",
    category: "Безопасность",
    tag: "Риск данных",
    condition: (inputs: ComprehensiveInputs) =>
      inputs.dataCategory === "Персональные" ||
      inputs.dataCategory === "Коммерческая тайна" ||
      inputs.dataCategory === "Чувствительные (финансы / здоровье)",
    summary:
      "Гайд по безопасной работе с корпоративными данными: маскирование персональных данных, работа по API без сохранения истории.",
    link: "/cases#kb-data",
  },
  {
    id: "kb-low-roi",
    title: "Как снизить стоимость внедрения и поднять ROI",
    category: "Экономика",
    tag: "Низкий ROI",
    condition: (inputs: ComprehensiveInputs, effect: number, roi: number) =>
      effect <= 0 || roi < 50,
    summary:
      "5 способов оптимизировать затраты: открытые модели, пакетная обработка, использование готовых SaaS вместо заказной разработки.",
    link: "/cases#kb-roi",
  },
  {
    id: "kb-readiness-boost",
    title: "Как подготовить процесс к внедрению за 7 шагов",
    category: "Методология",
    tag: "Подготовка",
    condition: (inputs: ComprehensiveInputs, effect: number, roi: number, readiness: number) =>
      readiness < 6,
    summary:
      "Пошаговый чеклист подготовки процесса: от фиксации эталонов качества до назначения ответственного и сбора обучающей выборки.",
    link: "/pilot#process",
  },
  {
    id: "kb-pilot-30d",
    title: "Как провести пилот за 30 дней без лишних рисков",
    category: "Практика",
    tag: "Пилот",
    condition: (inputs: ComprehensiveInputs, effect: number, roi: number, readiness: number) =>
      effect > 0 && readiness >= 6,
    summary:
      "Методика запуска ограниченного пилота: замер ДО, тестовый контур, ежедневный сбор метрик и итоговое решение о масштабировании.",
    link: "/pilot",
  },
];
