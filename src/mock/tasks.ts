import { localize } from "@/utils/i18n";
import type { Task } from "@/types/task";

export function buildMockTasks(): Task[] {
  return [
    {
      id: "task-algorithms-log-window",
      domain: "algorithms",
      title: localize("Скользящее окно по логам", "Sliding window over request logs"),
      difficulty: "easy",
      overview: localize(
        "Нужно посчитать максимальное число запросов внутри окна фиксированной длины.",
        "Count the maximum number of requests inside a fixed-length time window."
      ),
      statement: localize(
        "На вход подаётся отсортированный массив таймстампов в миллисекундах и длина окна. Верните максимальное количество запросов, попадающих в одно окно длиной windowMs. Ожидается решение за O(n).",
        "You are given a sorted array of request timestamps in milliseconds and the window length. Return the maximum number of requests that fit into a single window of length windowMs. An O(n) solution is expected."
      ),
      inputFormat: localize(
        "timestamps: number[] — отсортированный массив; windowMs: number — длина окна.",
        "timestamps: number[] — sorted timestamps; windowMs: number — window size."
      ),
      outputFormat: localize(
        "number — максимальное количество запросов внутри одного окна.",
        "number — the maximum number of requests in a single window."
      ),
      constraints: [
        localize("1 ≤ timestamps.length ≤ 10^5", "1 ≤ timestamps.length ≤ 10^5"),
        localize("timestamps отсортированы по возрастанию", "timestamps are sorted in ascending order"),
        localize("Требуемая сложность — O(n)", "Target complexity is O(n)")
      ],
      examples: [
        {
          input: "timestamps = [1, 2, 3, 10, 11], windowMs = 3",
          output: "3",
          explanation: localize(
            "В окне [1, 3] оказываются три запроса.",
            "The window [1, 3] contains three requests."
          )
        }
      ],
      hints: [
        localize("Поддерживайте левую и правую границы окна.", "Track the left and right edges of the window."),
        localize("Не сортируйте массив повторно.", "Do not sort the input again.")
      ],
      starterCode: {
        TypeScript:
          "function maxRequestsInWindow(timestamps: number[], windowMs: number): number {\n  let left = 0;\n  let answer = 0;\n\n  for (let right = 0; right < timestamps.length; right += 1) {\n    while (timestamps[right] - timestamps[left] > windowMs) {\n      left += 1;\n    }\n\n    answer = Math.max(answer, right - left + 1);\n  }\n\n  return answer;\n}",
        Python:
          "def max_requests_in_window(timestamps: list[int], window_ms: int) -> int:\n    left = 0\n    answer = 0\n\n    for right, value in enumerate(timestamps):\n        while value - timestamps[left] > window_ms:\n            left += 1\n\n        answer = max(answer, right - left + 1)\n\n    return answer",
        Java:
          "public static int maxRequestsInWindow(int[] timestamps, int windowMs) {\n  int left = 0;\n  int answer = 0;\n\n  for (int right = 0; right < timestamps.length; right++) {\n    while (timestamps[right] - timestamps[left] > windowMs) {\n      left++;\n    }\n\n    answer = Math.max(answer, right - left + 1);\n  }\n\n  return answer;\n}"
      },
      tags: ["two-pointers", "arrays", "sliding-window"],
      estimatedMinutes: 15,
      evaluationFocus: [
        localize("Линейная сложность и корректность границ окна", "Linear complexity and correct window boundaries"),
        localize("Аккуратная работа с пограничными значениями", "Careful handling of edge cases")
      ],
      recommendedFor: ["junior", "middle"]
    },
    {
      id: "task-algorithms-lru",
      domain: "algorithms",
      title: localize("LRU cache для активных сессий", "LRU cache for active sessions"),
      difficulty: "medium",
      overview: localize(
        "Нужно реализовать LRU cache с операциями get и put за O(1).",
        "Implement an LRU cache with O(1) get and put operations."
      ),
      statement: localize(
        "Реализуйте структуру LRUCache с ограничением capacity. Операции get(key) и put(key, value) должны работать за O(1). Ожидается решение на базе hash map и двусвязного списка либо эквивалентной структуры.",
        "Implement an LRUCache with a fixed capacity. Both get(key) and put(key, value) must run in O(1). Use a hash map plus a doubly linked list or an equivalent approach."
      ),
      inputFormat: localize(
        "Последовательность команд get/put и значения key/value.",
        "A sequence of get/put commands and key/value pairs."
      ),
      outputFormat: localize(
        "Для get — вернуть значение или -1, для put — обновить состояние кэша.",
        "For get return the value or -1; for put mutate the cache state."
      ),
      constraints: [
        localize("1 ≤ capacity ≤ 3000", "1 ≤ capacity ≤ 3000"),
        localize("До 2 × 10^5 операций", "Up to 2 × 10^5 operations"),
        localize("Кэш должен вытеснять самый давно использованный элемент", "Evict the least recently used item")
      ],
      examples: [
        {
          input: "capacity = 2, put(1, 1), put(2, 2), get(1), put(3, 3), get(2)",
          output: "1, -1",
          explanation: localize(
            "После добавления ключа 3 вытесняется ключ 2.",
            "After inserting key 3, key 2 gets evicted."
          )
        }
      ],
      hints: [
        localize("Храните порядок использования отдельно от словаря значений.", "Keep usage order separate from the value lookup."),
        localize("Подумайте о том, как перемещать узлы без полной перезагрузки структуры.", "Think about how to move nodes without rebuilding the structure.")
      ],
      starterCode: {
        TypeScript:
          "class LRUCache {\n  constructor(private readonly capacity: number) {}\n\n  get(key: number): number {\n    return -1;\n  }\n\n  put(key: number, value: number): void {\n    void key;\n    void value;\n  }\n}",
        Python:
          "class LRUCache:\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n\n    def get(self, key: int) -> int:\n        return -1\n\n    def put(self, key: int, value: int) -> None:\n        pass",
        Java:
          "class LRUCache {\n  public LRUCache(int capacity) {}\n\n  public int get(int key) {\n    return -1;\n  }\n\n  public void put(int key, int value) {}\n}"
      },
      tags: ["hash-map", "linked-list", "design"],
      estimatedMinutes: 25,
      evaluationFocus: [
        localize("Операции за O(1)", "True O(1) operations"),
        localize("Читаемость и инкапсуляция структуры", "Readable structure encapsulation")
      ],
      recommendedFor: ["middle", "senior"]
    },
    {
      id: "task-algorithms-interval-merge",
      domain: "algorithms",
      title: localize("Слияние конфликтующих интервалов", "Merging conflicting intervals"),
      difficulty: "hard",
      overview: localize(
        "Нужно обработать большой поток интервалов и выделить финальные блоки без пересечений.",
        "Process a large stream of intervals and derive the final non-overlapping merged blocks."
      ),
      statement: localize(
        "Получив список временных интервалов, нужно вернуть объединённый набор непересекающихся диапазонов. Дополнительно объясните, как адаптировать решение для потоковой обработки или батчевой загрузки с ограничением памяти.",
        "Given a list of time intervals, return the merged non-overlapping ranges. Also explain how you would adapt the approach for stream ingestion or batch processing under memory constraints."
      ),
      inputFormat: localize(
        "intervals: Array<[number, number]>",
        "intervals: Array<[number, number]>"
      ),
      outputFormat: localize(
        "Массив объединённых интервалов в отсортированном порядке.",
        "Merged intervals in sorted order."
      ),
      constraints: [
        localize("До 10^5 интервалов", "Up to 10^5 intervals"),
        localize("Нужно корректно учитывать касание границ", "Boundary-touching intervals must be handled correctly"),
        localize("Ожидается объяснение trade-offs по памяти", "Explain the memory trade-offs")
      ],
      examples: [
        {
          input: "[[1, 3], [2, 5], [8, 10], [9, 12]]",
          output: "[[1, 5], [8, 12]]",
          explanation: localize(
            "Первые два и последние два интервала объединяются попарно.",
            "The first two and the last two intervals merge pairwise."
          )
        }
      ],
      hints: [
        localize("Начните с сортировки по левым границам.", "Start by sorting by the left boundary."),
        localize("Подумайте, как сохранить только текущий активный интервал.", "Keep only the active merged interval in memory.")
      ],
      starterCode: {
        TypeScript:
          "function mergeIntervals(intervals: Array<[number, number]>): Array<[number, number]> {\n  return [];\n}",
        Python:
          "def merge_intervals(intervals: list[tuple[int, int]]) -> list[tuple[int, int]]:\n    return []",
        Java:
          "public static List<int[]> mergeIntervals(List<int[]> intervals) {\n  return new ArrayList<>();\n}"
      },
      tags: ["sorting", "intervals", "streaming"],
      estimatedMinutes: 35,
      evaluationFocus: [
        localize("Корректность слияния и работа с памятью", "Correct merging and memory handling"),
        localize("Умение объяснить продакшен-адаптацию", "Ability to discuss a production-ready adaptation")
      ],
      recommendedFor: ["senior", "lead"]
    },
    {
      id: "task-backend-webhook-dedupe",
      domain: "backend",
      title: localize("Идемпотентная обработка webhook", "Idempotent webhook handling"),
      difficulty: "easy",
      overview: localize(
        "Нужно гарантировать, что повторная доставка одного события не создаёт дубликаты.",
        "Ensure that repeated delivery of the same event does not create duplicates."
      ),
      statement: localize(
        "Спроектируйте функцию processWebhook(event) и сопутствующие структуры так, чтобы один и тот же eventId обрабатывался ровно один раз. Объясните, где хранить ключ идемпотентности и как очищать старые записи.",
        "Design processWebhook(event) and the supporting structures so that the same eventId is processed exactly once. Explain where the idempotency key is stored and how old records are cleaned up."
      ),
      inputFormat: localize(
        "event: { eventId: string; payload: unknown }",
        "event: { eventId: string; payload: unknown }"
      ),
      outputFormat: localize(
        "Флаг обработки и side effects только один раз.",
        "A processed flag and side effects executed at most once."
      ),
      constraints: [
        localize("События могут приходить повторно", "Events may arrive more than once"),
        localize("Окно хранения dedupe-ключей ограничено", "The dedupe retention window is limited"),
        localize("Нужно коротко описать отказоустойчивость", "Briefly cover failure handling")
      ],
      examples: [
        {
          input: "eventId = evt-101 arrives twice",
          output: "processed once",
          explanation: localize(
            "Повторное событие распознаётся по ключу идемпотентности.",
            "The duplicate event is detected via the idempotency key."
          )
        }
      ],
      hints: [
        localize("Разделяйте проверку и запись ключа идемпотентности атомарно.", "Make the idempotency check-and-write atomic."),
        localize("Подумайте о TTL для ключей.", "Consider TTL for stored keys.")
      ],
      starterCode: {
        TypeScript:
          "type WebhookEvent = { eventId: string; payload: unknown };\n\nasync function processWebhook(event: WebhookEvent): Promise<boolean> {\n  void event;\n  return false;\n}",
        Python:
          "from typing import Any\n\nasync def process_webhook(event: dict[str, Any]) -> bool:\n    return False",
        Java:
          "record WebhookEvent(String eventId, Object payload) {}\n\nboolean processWebhook(WebhookEvent event) {\n  return false;\n}"
      },
      tags: ["backend", "idempotency", "webhooks"],
      estimatedMinutes: 20,
      evaluationFocus: [
        localize("Идемпотентность и корректные side effects", "Idempotency and safe side effects"),
        localize("Реалистичное хранение ключей", "Realistic key storage strategy")
      ],
      recommendedFor: ["junior", "middle"]
    },
    {
      id: "task-backend-retry-queue",
      domain: "backend",
      title: localize("Очередь повторных попыток для jobs", "Retry queue for background jobs"),
      difficulty: "medium",
      overview: localize(
        "Нужно организовать очередь задач с retry, backoff и защитой от бесконечных циклов.",
        "Design a job queue with retries, backoff and protection from endless retry loops."
      ),
      statement: localize(
        "Реализуйте или опишите компонент RetryQueue для фоновых задач: job можно переотправлять с экспоненциальным backoff, ограничением по числу попыток и переводом в dead-letter поток. В коде ожидается ядро логики и понятные статусы.",
        "Implement or describe a RetryQueue component for background jobs: a job can be retried with exponential backoff, limited attempts and a dead-letter path. The code should capture the core logic with clear statuses."
      ),
      inputFormat: localize(
        "job: { id: string; attempts: number; payload: unknown }",
        "job: { id: string; attempts: number; payload: unknown }"
      ),
      outputFormat: localize(
        "Новый статус задачи и время следующего запуска.",
        "The next job status and the next scheduled run time."
      ),
      constraints: [
        localize("Повторы не должны идти бесконечно", "Retries must stop after a limit"),
        localize("Нужен backoff по попыткам", "Backoff should depend on the attempt count"),
        localize("Падения должны вести к DLQ", "Failures should flow into a DLQ")
      ],
      examples: [
        {
          input: "attempts = 2, maxAttempts = 5",
          output: "status = scheduled, nextRunAt = now + backoff",
          explanation: localize(
            "Задача ещё не исчерпала лимит повторов.",
            "The job still has remaining retries."
          )
        }
      ],
      hints: [
        localize("Сделайте backoff детерминированным и наблюдаемым.", "Make the backoff deterministic and observable."),
        localize("Отделите retry-логику от основного обработчика.", "Separate retry logic from the worker itself.")
      ],
      starterCode: {
        TypeScript:
          "type Job = { id: string; attempts: number; payload: unknown };\n\nfunction scheduleRetry(job: Job, maxAttempts: number): { status: string; nextRunAt?: string } {\n  void maxAttempts;\n  return { status: 'scheduled' };\n}",
        Python:
          "def schedule_retry(job: dict, max_attempts: int) -> dict:\n    return {'status': 'scheduled'}",
        Java:
          "record Job(String id, int attempts, Object payload) {}\n\nMap<String, String> scheduleRetry(Job job, int maxAttempts) {\n  return Map.of('status', 'scheduled');\n}"
      },
      tags: ["queues", "retries", "backoff"],
      estimatedMinutes: 30,
      evaluationFocus: [
        localize("Политика retry и backoff", "Retry policy and backoff logic"),
        localize("Наблюдаемость и безопасный failure flow", "Observability and safe failure flow")
      ],
      recommendedFor: ["middle", "senior"]
    },
    {
      id: "task-backend-rate-limiter",
      domain: "backend",
      title: localize("Rate limiter для API gateway", "Rate limiter for an API gateway"),
      difficulty: "hard",
      overview: localize(
        "Нужно ограничить количество запросов пользователя в заданном временном окне.",
        "Limit the number of user requests within a configurable time window."
      ),
      statement: localize(
        "Реализуйте shouldAllow(userId, timestamp) для sliding window rate limiter. Нужно поддерживать большое число пользователей, корректно обрабатывать пограничные значения окна и коротко описать продакшен-версию с Redis или аналогичным хранилищем.",
        "Implement shouldAllow(userId, timestamp) for a sliding window rate limiter. Support a large number of users, handle boundary conditions correctly and briefly describe a production version with Redis or a similar store."
      ),
      inputFormat: localize(
        "userId: string, timestamp: number, config: { maxRequests, intervalMs }",
        "userId: string, timestamp: number, config: { maxRequests, intervalMs }"
      ),
      outputFormat: localize("boolean — пропускать запрос или нет.", "boolean — whether the request should be allowed."),
      constraints: [
        localize("До 10^6 пользователей", "Up to 10^6 users"),
        localize("Нужна амортизированная эффективность", "Amortized efficiency is required"),
        localize("Нужно обсудить продакшен-ограничения памяти", "Discuss memory constraints in production")
      ],
      examples: [
        {
          input: "maxRequests = 3, intervalMs = 1000; calls at [0, 100, 200, 300]",
          output: "true, true, true, false",
          explanation: localize(
            "Четвёртый вызов попадает в то же окно и должен быть отклонён.",
            "The fourth call falls into the same window and must be rejected."
          )
        }
      ],
      hints: [
        localize("Храните только релевантные таймстампы.", "Keep only relevant timestamps."),
        localize("Сразу продумайте модель для распределённой среды.", "Think about the distributed version from the start.")
      ],
      starterCode: {
        TypeScript:
          "type RateLimitConfig = { maxRequests: number; intervalMs: number };\n\nfunction createLimiter(config: RateLimitConfig) {\n  return function shouldAllow(userId: string, timestamp: number): boolean {\n    void userId;\n    void timestamp;\n    return true;\n  };\n}",
        Python:
          "def create_limiter(max_requests: int, interval_ms: int):\n    def should_allow(user_id: str, timestamp: int) -> bool:\n        return True\n\n    return should_allow",
        Java:
          "class RateLimiter {\n  RateLimiter(int maxRequests, int intervalMs) {}\n\n  boolean shouldAllow(String userId, long timestamp) {\n    return true;\n  }\n}"
      },
      tags: ["rate-limiter", "distributed-systems", "backend"],
      estimatedMinutes: 40,
      evaluationFocus: [
        localize("Корректность окна и память", "Window correctness and memory footprint"),
        localize("Понимание продакшен-реализации", "Understanding of a production-grade implementation")
      ],
      recommendedFor: ["senior", "lead"]
    },
    {
      id: "task-frontend-filter-bar",
      domain: "frontend",
      title: localize("Панель фильтров без лишних перерисовок", "Filter bar with stable rendering"),
      difficulty: "easy",
      overview: localize(
        "Нужно собрать компактную панель фильтров с контролируемыми полями и предсказуемым state.",
        "Build a compact filter bar with controlled inputs and predictable state handling."
      ),
      statement: localize(
        "Реализуйте компонент FilterBar для списка событий. Требуются текстовый поиск, выбор статуса и кнопка очистки фильтров. Важно не плодить лишние состояния и не дублировать derived state.",
        "Implement a FilterBar component for an events list. It should support text search, a status selector and a reset action. Avoid redundant state and duplicated derived values."
      ),
      inputFormat: localize(
        "props: { query: string; status?: string; onChange(...) }",
        "props: { query: string; status?: string; onChange(...) }"
      ),
      outputFormat: localize("React-компонент панели фильтров.", "A React filter bar component."),
      constraints: [
        localize("Управляемые поля без лишних эффектов", "Controlled fields without unnecessary effects"),
        localize("Ясная модель состояния", "Clear state model"),
        localize("Корректная доступность кнопок и полей", "Good accessibility for controls")
      ],
      examples: [
        {
          input: "query = 'timeout', status = 'failed'",
          output: "Only failed timeout events remain visible",
          explanation: localize(
            "Фильтрация должна применяться на основе текущего состояния формы.",
            "Filtering should derive from the current form state."
          )
        }
      ],
      hints: [
        localize("Не храните отдельно отфильтрованный список без необходимости.", "Avoid storing a filtered list if it can be derived."),
        localize("Грамотно типизируйте события ввода.", "Type the input handlers cleanly.")
      ],
      starterCode: {
        TypeScript:
          "type FilterBarProps = { query: string; status?: string; onChange: (next: { query: string; status?: string }) => void };\n\nexport function FilterBar(props: FilterBarProps) {\n  void props;\n  return null;\n}",
        Python: "# Use TypeScript for frontend tasks",
        Java: "// Use TypeScript for frontend tasks"
      },
      tags: ["react", "forms", "state"],
      estimatedMinutes: 18,
      evaluationFocus: [
        localize("Чистое управление формой", "Clean form state management"),
        localize("Доступность и читаемость JSX", "Accessibility and readable JSX")
      ],
      recommendedFor: ["junior", "middle"]
    },
    {
      id: "task-frontend-virtual-list",
      domain: "frontend",
      title: localize("Виртуализированный список логов", "Virtualized log list"),
      difficulty: "medium",
      overview: localize(
        "Нужно отрисовать большой список без просадки по FPS.",
        "Render a large list without tanking frame rate."
      ),
      statement: localize(
        "Спроектируйте и реализуйте компонент LogsList, который отображает 50k+ строк. Нужны виртуализация, sticky header и debounce для поиска. Объясните, где будет мемоизация и как отделить вычисление окна от UI.",
        "Design and implement a LogsList component for 50k+ rows. It should support virtualization, a sticky header and debounced search. Explain where memoization belongs and how to separate viewport math from UI."
      ),
      inputFormat: localize(
        "rows: LogRow[]; query: string",
        "rows: LogRow[]; query: string"
      ),
      outputFormat: localize("React-компонент со стабильным scroll UX.", "A React component with stable scrolling UX."),
      constraints: [
        localize("Большой список не должен рендериться целиком", "Do not render the full list at once"),
        localize("Нужен debounce поиска", "Search should be debounced"),
        localize("Sticky header не должен ломать прокрутку", "Sticky header should not break scrolling")
      ],
      examples: [
        {
          input: "50 000 rows, scrollTop = 1800",
          output: "Only the visible viewport rows are rendered",
          explanation: localize(
            "Остальные элементы заменяются spacer-отступами.",
            "All other rows are represented via spacer blocks."
          )
        }
      ],
      hints: [
        localize("Разделите filteredRows и virtualRows.", "Separate filteredRows from virtualRows."),
        localize("Обновляйте viewport только по необходимым событиям.", "Recompute the viewport only when needed.")
      ],
      starterCode: {
        TypeScript:
          "type LogRow = { id: string; ts: string; level: string; message: string };\n\nexport function LogsList({ rows }: { rows: LogRow[] }) {\n  return <div>TODO</div>;\n}",
        Python: "# Use TypeScript for frontend tasks",
        Java: "// Use TypeScript for frontend tasks"
      },
      tags: ["react", "virtualization", "performance"],
      estimatedMinutes: 30,
      evaluationFocus: [
        localize("Производительность и структура компонентов", "Performance and component structure"),
        localize("Понимание viewport math", "Understanding of viewport calculations")
      ],
      recommendedFor: ["middle", "senior"]
    },
    {
      id: "task-frontend-client-cache",
      domain: "frontend",
      title: localize("Клиентский кэш для связанных экранов", "Client cache across related screens"),
      difficulty: "hard",
      overview: localize(
        "Нужно продумать cache layer между списком кандидатов, карточкой и секциями.",
        "Design a cache layer shared across the candidates list, profile and section screens."
      ),
      statement: localize(
        "Опишите и частично реализуйте клиентский cache для сущностей candidate и section. Нужны cache keys, stale-метки, invalidation после createSection и placeholder-данные для loading UI. Упор на архитектуру, а не на конкретную библиотеку.",
        "Describe and partially implement a client cache for candidate and section entities. Define cache keys, stale markers, invalidation after createSection and placeholder data for loading UI. Focus on architecture rather than a specific library."
      ),
      inputFormat: localize(
        "entities: Candidate, Section; operations: getCandidate, createSection, invalidate",
        "entities: Candidate, Section; operations: getCandidate, createSection, invalidate"
      ),
      outputFormat: localize("Набор хуков или утилит для согласованного кэша.", "A set of hooks or utilities for a coherent cache layer."),
      constraints: [
        localize("После мутаций связанные экраны должны обновляться согласованно", "Related screens must update coherently after mutations"),
        localize("Нельзя плодить лишние запросы", "Avoid duplicate network calls"),
        localize("Нужен хороший loading UX", "Support a good loading UX")
      ],
      examples: [
        {
          input: "getCandidateById -> createSection -> refetch candidate",
          output: "Candidate profile and sections list update consistently",
          explanation: localize(
            "Зависимые cache keys должны инвалидироваться вместе.",
            "Dependent cache keys should be invalidated together."
          )
        }
      ],
      hints: [
        localize("Сначала продумайте query keys и границы ответственности.", "Start with query keys and ownership boundaries."),
        localize("Сделайте stale state явным в интерфейсе.", "Make stale state explicit in the UI.")
      ],
      starterCode: {
        TypeScript:
          "export function useCandidate(candidateId: string) {\n  return { data: null, isLoading: true };\n}",
        Python: "# Use TypeScript for frontend tasks",
        Java: "// Use TypeScript for frontend tasks"
      },
      tags: ["cache", "state-management", "react"],
      estimatedMinutes: 38,
      evaluationFocus: [
        localize("Консистентность данных", "Data consistency"),
        localize("Готовность архитектуры к API-слою", "Readiness for a future API layer")
      ],
      recommendedFor: ["senior", "lead"]
    },
    {
      id: "task-system-entity-map",
      domain: "system_design",
      title: localize("Карта сущностей интервью", "Interview entity map"),
      difficulty: "easy",
      overview: localize(
        "Нужно быстро разложить сущности платформы собеседований и их связи.",
        "Quickly map the core entities of the interview platform and their relationships."
      ),
      statement: localize(
        "Опишите сущности candidate, section, invitation, task result и report, а также основные связи между ними. Важно отделить жизненный цикл приглашения от жизненного цикла самой сессии.",
        "Describe the candidate, section, invitation, task result and report entities together with their relationships. Make sure to separate the invitation lifecycle from the actual session lifecycle."
      ),
      inputFormat: localize("Текстовое описание и список требований.", "Plain text requirements and system notes."),
      outputFormat: localize("Набор сущностей и связей на уровне ER-модели.", "An ER-level list of entities and relationships."),
      constraints: [
        localize("Нужно разделить start window и session timer", "Separate the start window from the session timer"),
        localize("Результаты должен видеть только администратор", "Only administrators should see detailed results"),
        localize("Приглашение может быть отключено отдельно от секции", "Invitation state should be independent from section state")
      ],
      examples: [
        {
          input: "Section starts after clicking Start",
          output: "invitation.startedAt and section.runtime.startedAt are different fields",
          explanation: localize(
            "Это упрощает повторный вход и управление ссылкой.",
            "That makes resume logic and invitation management clearer."
          )
        }
      ],
      hints: [
        localize("Не смешивайте read model с operational lifecycle.", "Do not mix the read model with the operational lifecycle."),
        localize("Подумайте о состоянии ссылки после завершения секции.", "Think about the invitation after completion.")
      ],
      starterCode: {
        TypeScript:
          "type Candidate = { id: string; fullName: string };\n\ninterface Invitation {\n  hash: string;\n  opensAt: string;\n  closesAt: string;\n}",
        Python: "class Candidate: ...",
        Java: "record Candidate(String id, String fullName) {}"
      },
      tags: ["entities", "er-model", "domain-model"],
      estimatedMinutes: 18,
      evaluationFocus: [
        localize("Разделение жизненных циклов", "Separation of lifecycles"),
        localize("Ясность модели данных", "Clarity of the data model")
      ],
      recommendedFor: ["junior", "middle"]
    },
    {
      id: "task-system-read-model",
      domain: "system_design",
      title: localize("Read model для отчётности", "Read model for reporting"),
      difficulty: "medium",
      overview: localize(
        "Нужно построить удобную read model для отчётов и административной панели.",
        "Build a practical read model for reports and the administrative panel."
      ),
      statement: localize(
        "Предложите read model для страницы результатов: список секций, итоговый балл, решение, anti-cheat риск, дата завершения и ссылка на отчёт. Опишите, как обновлять read model после завершения секции и после появления финального отчёта.",
        "Propose a read model for the results page: section list, total score, decision, anti-cheat risk, completion date and a report link. Explain how the read model is updated when a section finishes and when the final report is generated."
      ),
      inputFormat: localize("Функциональные требования к списку результатов.", "Functional requirements for a results list."),
      outputFormat: localize("Структура read model и сценарий обновления.", "A read-model structure and update flow."),
      constraints: [
        localize("Нужно отделить оперативные данные от итоговой витрины", "Separate operational data from reporting views"),
        localize("Экспорт отчёта должен быть идемпотентным", "Report export must be idempotent"),
        localize("Риск anti-cheat должен агрегироваться отдельно", "Anti-cheat risk should be aggregated separately")
      ],
      examples: [
        {
          input: "section.completedAt + report.createdAt",
          output: "admin_results_read_model row is enriched asynchronously",
          explanation: localize(
            "Итоговая запись может появиться не в тот же момент, что и завершение секции.",
            "The final reporting row may appear after the section itself is complete."
          )
        }
      ],
      hints: [
        localize("Подумайте о derived полях для фильтров и сортировки.", "Include derived fields that help filtering and sorting."),
        localize("Опишите, как модель переживёт повторную генерацию отчёта.", "Explain how the model handles report regeneration.")
      ],
      starterCode: {
        TypeScript:
          "type AdminResultRow = { sectionId: string; candidateName: string; score?: number };",
        Python: "class AdminResultRow: ...",
        Java: "record AdminResultRow(String sectionId, String candidateName, Integer score) {}"
      },
      tags: ["read-model", "reporting", "admin"],
      estimatedMinutes: 28,
      evaluationFocus: [
        localize("Практичность read model", "Practical read-model design"),
        localize("Понимание асинхронного обновления", "Understanding of asynchronous enrichment")
      ],
      recommendedFor: ["middle", "senior"]
    },
    {
      id: "task-system-reporting-platform",
      domain: "system_design",
      title: localize("Архитектура платформы отчётности интервью", "Interview reporting platform architecture"),
      difficulty: "hard",
      overview: localize(
        "Нужно спроектировать backend-friendly архитектуру результатов, отчётов и ссылок-приглашений.",
        "Design a backend-friendly architecture for results, reports and invitation links."
      ),
      statement: localize(
        "Спроектируйте систему для candidate, section, result, report и invitation link. Учтите стартовое окно, таймер после нажатия Start, возможность возобновления сессии, деактивацию ссылки после завершения, историю попыток, anti-cheat события и экспорт отчётов.",
        "Design a system for candidate, section, result, report and invitation link. Account for a configurable start window, the timer that begins only after Start, session resume, deactivation after completion, attempt history, anti-cheat events and report export."
      ),
      inputFormat: localize("Описание продукта и пользовательских сценариев.", "Product description and user scenarios."),
      outputFormat: localize("Архитектурная схема, сущности и API endpoints.", "Architecture, entities and API endpoints."),
      constraints: [
        localize("Ссылка живёт дольше, чем сама сессия", "The invitation link lives longer than the actual session"),
        localize("Результаты недоступны кандидату", "Detailed results stay hidden from the candidate"),
        localize("Нужна готовность к экспорту и аудиту", "The design must support export and auditability")
      ],
      examples: [
        {
          input: "Candidate starts on day 6 of a 7-day window",
          output: "session timer starts immediately but the link still expires independently",
          explanation: localize(
            "Окно старта и лимит сессии — разные сущности.",
            "The start window and the session timer are different concerns."
          )
        }
      ],
      hints: [
        localize("Разделите write model, read model и event log.", "Separate the write model, read model and event log."),
        localize("Подумайте о пересборке отчёта без повторного прохождения секции.", "Consider regenerating a report without replaying the interview.")
      ],
      starterCode: {
        TypeScript:
          "interface ReportService {\n  export(sectionId: string): Promise<Blob>;\n}\n\ninterface InvitationService {\n  create(sectionId: string): Promise<string>;\n}",
        Python: "class ReportService:\n    def export(self, section_id: str):\n        raise NotImplementedError",
        Java:
          "interface ReportService {\n  byte[] export(String sectionId);\n}\n\ninterface InvitationService {\n  String create(String sectionId);\n}"
      },
      tags: ["architecture", "events", "reporting"],
      estimatedMinutes: 45,
      evaluationFocus: [
        localize("Модель жизненного цикла секции", "Section lifecycle modeling"),
        localize("Готовность к API и масштабированию", "API readiness and scalability")
      ],
      recommendedFor: ["senior", "lead"]
    },
    {
      id: "task-mobile-offline-queue",
      domain: "mobile",
      title: localize("Очередь офлайн-синхронизации", "Offline sync queue"),
      difficulty: "easy",
      overview: localize(
        "Нужно сохранить действия пользователя локально и безопасно отправить их после восстановления сети.",
        "Persist user actions locally and flush them safely after connectivity is restored."
      ),
      statement: localize(
        "Опишите или реализуйте очередь офлайн-действий для мобильного клиента: запись, повторная отправка, дедупликация и очистка после успешной синхронизации.",
        "Describe or implement an offline action queue for a mobile client: persistence, retries, deduplication and cleanup after successful sync."
      ),
      inputFormat: localize(
        "Список локальных действий и признак доступности сети.",
        "A list of local actions and a network availability flag."
      ),
      outputFormat: localize(
        "Состояние очереди и порядок отправки действий.",
        "Queue state and flush order."
      ),
      constraints: [
        localize("Не терять действия при перезапуске приложения", "Do not lose actions after app restart"),
        localize("Не дублировать успешно отправленные элементы", "Do not duplicate successfully flushed items"),
        localize("Нужна аккуратная обработка ошибок сети", "Handle transient network failures safely")
      ],
      examples: [
        {
          input: "actions = [a1, a2], online = false",
          output: "queued locally",
          explanation: localize(
            "Действия не теряются и ждут восстановления сети.",
            "Actions are persisted and wait for connectivity."
          )
        }
      ],
      hints: [
        localize("Разделите локальное хранилище и транспортный слой.", "Separate local storage from the transport layer."),
        localize("Подумайте о стратегии повторных попыток.", "Think about a retry strategy.")
      ],
      starterCode: {
        TypeScript:
          "type OfflineAction = { id: string; payload: unknown };\n\nfunction enqueueAction(action: OfflineAction): void {\n  void action;\n}",
        Python:
          "def enqueue_action(action: dict) -> None:\n    pass",
        Java:
          "void enqueueAction(Map<String, Object> action) {}"
      },
      tags: ["mobile", "offline", "queue"],
      estimatedMinutes: 20,
      evaluationFocus: [
        localize("Надёжность локального хранения", "Reliability of local persistence"),
        localize("Поведение при восстановлении сети", "Behavior on reconnect")
      ],
      recommendedFor: ["junior", "middle"]
    },
    {
      id: "task-mobile-image-cache",
      domain: "mobile",
      title: localize("Кэш изображений для ленты", "Image cache for a feed"),
      difficulty: "medium",
      overview: localize(
        "Нужно спроектировать кэш для изображений с контролем памяти и повторным использованием.",
        "Design an image cache with memory control and reuse."
      ),
      statement: localize(
        "Спроектируйте кэш изображений для мобильной ленты: memory cache, disk cache, eviction policy и поведение при повторном открытии экрана.",
        "Design an image cache for a mobile feed: memory cache, disk cache, eviction policy and behavior on screen revisit."
      ),
      inputFormat: localize(
        "URL изображений и события прокрутки ленты.",
        "Image URLs and scrolling events."
      ),
      outputFormat: localize(
        "Политика загрузки, хранения и очистки кэша.",
        "A loading, storage and eviction policy."
      ),
      constraints: [
        localize("Нужно ограничивать память", "Memory usage must be bounded"),
        localize("Повторные запросы должны сокращаться", "Duplicate network requests should be reduced"),
        localize("Важно плавное поведение при прокрутке", "Smooth scrolling is important")
      ],
      examples: [
        {
          input: "Feed reopens with previously seen images",
          output: "memory or disk hit",
          explanation: localize(
            "Изображения берутся из кэша, если они ещё валидны.",
            "Images are served from cache while still valid."
          )
        }
      ],
      hints: [
        localize("Разделите стратегию по размеру объекта и времени жизни.", "Split policy by object size and TTL."),
        localize("Подумайте о prefetch при прокрутке.", "Consider prefetch while scrolling.")
      ],
      starterCode: {
        TypeScript:
          "interface ImageCache {\n  get(url: string): Promise<Blob | null>;\n  put(url: string, value: Blob): Promise<void>;\n}",
        Python:
          "class ImageCache:\n    async def get(self, url: str):\n        return None",
        Java:
          "interface ImageCache {\n  byte[] get(String url);\n  void put(String url, byte[] value);\n}"
      },
      tags: ["mobile", "cache", "performance"],
      estimatedMinutes: 30,
      evaluationFocus: [
        localize("Контроль памяти и жизненного цикла", "Memory control and lifecycle"),
        localize("Пользовательская отзывчивость", "User responsiveness")
      ],
      recommendedFor: ["middle", "senior"]
    },
    {
      id: "task-mobile-state-recovery",
      domain: "mobile",
      title: localize("Восстановление состояния после background", "State recovery after backgrounding"),
      difficulty: "hard",
      overview: localize(
        "Нужно восстановить незавершённый экран после выгрузки приложения системой.",
        "Restore an unfinished screen after the app is killed in the background."
      ),
      statement: localize(
        "Опишите стратегию восстановления состояния сложного экрана после background/kill: draft формы, позиция списка, временные файлы и сетевые запросы.",
        "Describe a state-recovery strategy for a complex screen after background/kill: draft form, list position, temporary files and network requests."
      ),
      inputFormat: localize(
        "События жизненного цикла приложения и снимок состояния.",
        "Application lifecycle events and a state snapshot."
      ),
      outputFormat: localize(
        "Модель сохранения и восстановления состояния.",
        "A persistence and restoration model."
      ),
      constraints: [
        localize("Нельзя восстанавливать устаревшие данные бесконтрольно", "Do not blindly restore stale data"),
        localize("Нужен баланс между UX и объёмом сохраняемого состояния", "Balance UX and the amount of persisted state"),
        localize("Важно покрыть сбои и миграции версии", "Handle failures and version migrations")
      ],
      examples: [
        {
          input: "User edits a draft and app is killed",
          output: "draft restored on reopen",
          explanation: localize(
            "Черновик и контекст экрана должны быть восстановлены безопасно.",
            "The draft and screen context should be restored safely."
          )
        }
      ],
      hints: [
        localize("Разделите критичное и вторичное состояние.", "Separate critical from secondary state."),
        localize("Добавьте версионирование сохранённого снапшота.", "Version the stored snapshot.")
      ],
      starterCode: {
        TypeScript:
          "type ScreenSnapshot = { version: number; payload: unknown };\n\nfunction restoreSnapshot(snapshot: ScreenSnapshot | null): void {\n  void snapshot;\n}",
        Python:
          "def restore_snapshot(snapshot: dict | None) -> None:\n    pass",
        Java:
          "void restoreSnapshot(Map<String, Object> snapshot) {}"
      },
      tags: ["mobile", "lifecycle", "state"],
      estimatedMinutes: 40,
      evaluationFocus: [
        localize("Надёжность восстановления", "Recovery reliability"),
        localize("Работа с миграциями и stale state", "Handling migrations and stale state")
      ],
      recommendedFor: ["senior", "lead"]
    },
    {
      id: "task-data-dedup-batch",
      domain: "data",
      title: localize("Дедупликация батча событий", "Batch event deduplication"),
      difficulty: "easy",
      overview: localize(
        "Нужно удалить дубликаты событий по ключу и времени обработки.",
        "Remove duplicate events by key and processing time."
      ),
      statement: localize(
        "Опишите или реализуйте дедупликацию батча событий по composite key. Нужно учитывать late duplicates и оставлять корректную запись для дальнейшей загрузки в хранилище.",
        "Describe or implement batch deduplication by composite key. Account for late duplicates and keep the correct record for downstream loading."
      ),
      inputFormat: localize(
        "Список событий с ключом, timestamp и payload.",
        "A list of events with key, timestamp and payload."
      ),
      outputFormat: localize(
        "Очищенный набор событий.",
        "A deduplicated set of events."
      ),
      constraints: [
        localize("Нужно сохранить детерминированность результата", "The result must be deterministic"),
        localize("Поведение с late duplicates должно быть понятным", "Late duplicates should be handled clearly"),
        localize("Ожидается объяснение trade-offs", "Explain the trade-offs")
      ],
      examples: [
        {
          input: "[(u1, t1), (u1, t1)]",
          output: "single record",
          explanation: localize(
            "Дубликаты по ключу и времени схлопываются.",
            "Duplicates collapse into a single record."
          )
        }
      ],
      hints: [
        localize("Определите правило winner record.", "Define the winner-record rule."),
        localize("Подумайте о late arrivals отдельно от exact duplicates.", "Treat late arrivals separately from exact duplicates.")
      ],
      starterCode: {
        TypeScript:
          "function dedupeEvents(events: Array<{ key: string; ts: string }>) {\n  return events;\n}",
        Python:
          "def dedupe_events(events: list[dict]) -> list[dict]:\n    return events",
        Java:
          "List<Map<String, Object>> dedupeEvents(List<Map<String, Object>> events) { return events; }"
      },
      tags: ["data", "deduplication", "batch"],
      estimatedMinutes: 20,
      evaluationFocus: [
        localize("Детерминированность и качество правила", "Determinism and rule quality"),
        localize("Корректность обработки late duplicates", "Correct handling of late duplicates")
      ],
      recommendedFor: ["junior", "middle"]
    },
    {
      id: "task-data-window-aggregation",
      domain: "data",
      title: localize("Оконная агрегация по событиям", "Event window aggregation"),
      difficulty: "medium",
      overview: localize(
        "Нужно объяснить или реализовать агрегацию по временным окнам с late arrivals.",
        "Explain or implement time-window aggregation with late arrivals."
      ),
      statement: localize(
        "Опишите стратегию оконной агрегации по событиям: window size, watermark, late data policy и публикация результатов downstream-потребителям.",
        "Describe an event-window aggregation strategy: window size, watermark, late-data policy and downstream result publication."
      ),
      inputFormat: localize(
        "Поток событий с event time и processing time.",
        "A stream of events with event time and processing time."
      ),
      outputFormat: localize(
        "Описание окон, watermark и late-data handling.",
        "A description of windows, watermark and late-data handling."
      ),
      constraints: [
        localize("Важно различать event time и processing time", "Differentiate event time from processing time"),
        localize("Нужно описать поведение при late arrivals", "Explain late-arrival behavior"),
        localize("Результаты должны быть понятны потребителям", "Results must remain understandable for consumers")
      ],
      examples: [
        {
          input: "Late event arrives 2 minutes after watermark",
          output: "drop or side-output by policy",
          explanation: localize(
            "Политика обработки late data должна быть явной.",
            "Late-data handling must be explicit."
          )
        }
      ],
      hints: [
        localize("Опишите роль watermark отдельно от окна.", "Describe watermark separately from the window."),
        localize("Подумайте о corrected results и их контракте.", "Consider corrected results and their contract.")
      ],
      starterCode: {
        TypeScript:
          "type WindowState = { key: string; count: number };",
        Python:
          "class WindowState:\n    pass",
        Java:
          "record WindowState(String key, long count) {}"
      },
      tags: ["data", "streaming", "windows"],
      estimatedMinutes: 30,
      evaluationFocus: [
        localize("Понимание streaming semantics", "Understanding of streaming semantics"),
        localize("Работа с late data", "Handling late data")
      ],
      recommendedFor: ["middle", "senior"]
    },
    {
      id: "task-data-scd-dimension",
      domain: "data",
      title: localize("SCD Type 2 для измерения", "SCD Type 2 for a dimension"),
      difficulty: "hard",
      overview: localize(
        "Нужно спроектировать историзацию изменений измерения в аналитическом слое.",
        "Design historization of dimension changes in an analytical layer."
      ),
      statement: localize(
        "Опишите реализацию SCD Type 2 для измерения: natural key, surrogate key, valid_from, valid_to, active record и обработка запоздалых апдейтов.",
        "Describe an SCD Type 2 implementation for a dimension: natural key, surrogate key, valid_from, valid_to, active record and late-update handling."
      ),
      inputFormat: localize(
        "Изменения атрибутов измерения во времени.",
        "Dimension attribute changes over time."
      ),
      outputFormat: localize(
        "Модель таблицы и правила обновления записей.",
        "A table model and update rules."
      ),
      constraints: [
        localize("История должна быть непротиворечивой", "History must remain consistent"),
        localize("Нужно объяснить обработку late updates", "Explain late-update handling"),
        localize("Важно продумать идемпотентность загрузки", "Consider idempotent loads")
      ],
      examples: [
        {
          input: "Customer city changes from A to B",
          output: "close old row, open new row",
          explanation: localize(
            "Старая запись закрывается, новая становится активной.",
            "The old row closes and a new active row opens."
          )
        }
      ],
      hints: [
        localize("Определите natural key и surrogate key.", "Define the natural key and surrogate key."),
        localize("Продумайте идемпотентность загрузки.", "Think through idempotent loading.")
      ],
      starterCode: {
        TypeScript:
          "interface DimensionRow { key: string; validFrom: string; validTo?: string }",
        Python:
          "class DimensionRow:\n    pass",
        Java:
          "record DimensionRow(String key, String validFrom, String validTo) {}"
      },
      tags: ["data", "warehouse", "scd"],
      estimatedMinutes: 40,
      evaluationFocus: [
        localize("Историзация и идемпотентность", "Historization and idempotency"),
        localize("Понимание data pipeline trade-offs", "Data pipeline trade-offs")
      ],
      recommendedFor: ["senior", "lead"]
    },
    {
      id: "task-devops-healthcheck",
      domain: "devops",
      title: localize("Разделение readiness и liveness", "Separating readiness and liveness"),
      difficulty: "easy",
      overview: localize(
        "Нужно определить, какие health-check сигналы должен отдавать сервис.",
        "Define which health-check signals a service should expose."
      ),
      statement: localize(
        "Объясните различие между readiness и liveness probe и предложите набор проверок для HTTP-сервиса с базой данных и очередью сообщений.",
        "Explain readiness vs liveness probes and propose checks for an HTTP service with a database and a message queue."
      ),
      inputFormat: localize(
        "Описание сервиса и зависимостей.",
        "Service and dependency description."
      ),
      outputFormat: localize(
        "Набор probe и условия ответа 200/500.",
        "A set of probes and 200/500 conditions."
      ),
      constraints: [
        localize("Не перегружать probes тяжёлыми запросами", "Do not overload probes with heavy checks"),
        localize("Liveness не должен вызывать лишних рестартов", "Liveness should not trigger unnecessary restarts"),
        localize("Readiness должен отражать реальную готовность к трафику", "Readiness must reflect true traffic readiness")
      ],
      examples: [
        {
          input: "DB is reconnecting but process is alive",
          output: "liveness=ok, readiness=fail",
          explanation: localize(
            "Процесс жив, но не готов принимать трафик.",
            "The process is alive but not ready for traffic."
          )
        }
      ],
      hints: [
        localize("Проверьте критичные зависимости отдельно.", "Check critical dependencies separately."),
        localize("Не смешивайте диагностику и оркестрацию.", "Do not mix diagnostics with orchestration.")
      ],
      starterCode: {
        TypeScript:
          "type ProbeResult = { ok: boolean; message?: string };",
        Python:
          "class ProbeResult:\n    pass",
        Java:
          "record ProbeResult(boolean ok, String message) {}"
      },
      tags: ["devops", "kubernetes", "healthcheck"],
      estimatedMinutes: 20,
      evaluationFocus: [
        localize("Корректное разделение probe", "Correct probe separation"),
        localize("Операционная реалистичность", "Operational realism")
      ],
      recommendedFor: ["junior", "middle"]
    },
    {
      id: "task-devops-rollout",
      domain: "devops",
      title: localize("Безопасный rollout сервиса", "Safe service rollout"),
      difficulty: "medium",
      overview: localize(
        "Нужно предложить стратегию развертывания без потери трафика и с возможностью быстрого отката.",
        "Propose a rollout strategy with no traffic loss and quick rollback."
      ),
      statement: localize(
        "Опишите безопасный rollout новой версии сервиса: health-checks, progressive traffic shift, метрики успеха и условия отката.",
        "Describe a safe rollout for a new service version: health checks, progressive traffic shifting, success metrics and rollback criteria."
      ),
      inputFormat: localize(
        "Описание текущего сервиса и новой версии.",
        "Description of the current service and the new version."
      ),
      outputFormat: localize(
        "План rollout и rollback.",
        "A rollout and rollback plan."
      ),
      constraints: [
        localize("Нельзя терять пользовательский трафик", "User traffic must not be lost"),
        localize("Нужны измеримые критерии успеха", "Success criteria must be measurable"),
        localize("Важно учитывать конфигурационные и схематические изменения", "Account for config and schema changes")
      ],
      examples: [
        {
          input: "5% traffic to v2 shows elevated errors",
          output: "rollback to v1",
          explanation: localize(
            "У rollout должны быть чёткие guardrails.",
            "A rollout needs clear guardrails."
          )
        }
      ],
      hints: [
        localize("Разделяйте code rollout и data migration.", "Separate code rollout and data migration."),
        localize("Добавьте автоматический rollback trigger.", "Add an automatic rollback trigger.")
      ],
      starterCode: {
        TypeScript:
          "interface RolloutStep { trafficPercent: number; durationMinutes: number }",
        Python:
          "class RolloutStep:\n    pass",
        Java:
          "record RolloutStep(int trafficPercent, int durationMinutes) {}"
      },
      tags: ["devops", "rollout", "reliability"],
      estimatedMinutes: 30,
      evaluationFocus: [
        localize("Управление риском релиза", "Release risk management"),
        localize("Мониторинг и откат", "Monitoring and rollback")
      ],
      recommendedFor: ["middle", "senior"]
    },
    {
      id: "task-devops-capacity-plan",
      domain: "devops",
      title: localize("Планирование ёмкости кластера", "Cluster capacity planning"),
      difficulty: "hard",
      overview: localize(
        "Нужно оценить ёмкость и ограничения кластера под рост нагрузки.",
        "Estimate cluster capacity and limits under load growth."
      ),
      statement: localize(
        "Опишите подход к capacity planning для сервиса с переменной дневной нагрузкой: CPU, память, autoscaling, лимиты, резервы и аварийный запас.",
        "Describe a capacity-planning approach for a service with variable daily load: CPU, memory, autoscaling, limits, headroom and emergency reserve."
      ),
      inputFormat: localize(
        "История нагрузки и характеристики workload.",
        "Load history and workload characteristics."
      ),
      outputFormat: localize(
        "Модель расчёта ёмкости и autoscaling policy.",
        "A capacity model and autoscaling policy."
      ),
      constraints: [
        localize("Нужно учитывать пики и неравномерность трафика", "Consider spikes and uneven traffic"),
        localize("Нужен запас на деградацию узлов", "Reserve headroom for node degradation"),
        localize("Важно объяснить допущения и стоимость", "Explain assumptions and cost")
      ],
      examples: [
        {
          input: "Traffic doubles during daily peak",
          output: "scale out before saturation",
          explanation: localize(
            "План должен учитывать предсказуемые пики.",
            "The plan should account for predictable peaks."
          )
        }
      ],
      hints: [
        localize("Разделите baseline, peak и emergency reserve.", "Separate baseline, peak and emergency reserve."),
        localize("Опишите SLO-связь с autoscaling.", "Connect autoscaling to SLOs.")
      ],
      starterCode: {
        TypeScript:
          "type CapacityPoint = { cpu: number; memoryMb: number; requestsPerSecond: number };",
        Python:
          "class CapacityPoint:\n    pass",
        Java:
          "record CapacityPoint(double cpu, int memoryMb, int rps) {}"
      },
      tags: ["devops", "capacity", "autoscaling"],
      estimatedMinutes: 40,
      evaluationFocus: [
        localize("Точность модели и допущений", "Quality of the model and assumptions"),
        localize("Баланс надёжности и стоимости", "Reliability-cost balance")
      ],
      recommendedFor: ["senior", "lead"]
    },
    {
      id: "task-qa-testdata-factory",
      domain: "qa",
      title: localize("Фабрика тестовых данных", "Test data factory"),
      difficulty: "easy",
      overview: localize(
        "Нужно генерировать воспроизводимые наборы тестовых данных для UI и API сценариев.",
        "Generate reproducible test data sets for UI and API scenarios."
      ),
      statement: localize(
        "Опишите подход к фабрике тестовых данных: шаблоны сущностей, детерминированность, очистка после прогонов и независимость кейсов.",
        "Describe a test-data factory approach: entity templates, determinism, cleanup after runs and test isolation."
      ),
      inputFormat: localize(
        "Описание сущностей и тестовых сценариев.",
        "Entities and test scenarios."
      ),
      outputFormat: localize(
        "Подход к генерации и жизненному циклу данных.",
        "A generation and lifecycle approach for test data."
      ),
      constraints: [
        localize("Тесты не должны зависеть друг от друга", "Tests must remain isolated"),
        localize("Нужна повторяемость прогонов", "Runs should be reproducible"),
        localize("Очистка должна быть безопасной", "Cleanup must be safe")
      ],
      examples: [
        {
          input: "Create candidate + invitation",
          output: "deterministic fixture set",
          explanation: localize(
            "Фикстуры должны повторяемо создавать нужный сценарий.",
            "Fixtures should reproduce the needed scenario."
          )
        }
      ],
      hints: [
        localize("Используйте seed и генераторы сущностей.", "Use seeds and entity builders."),
        localize("Разделите smoke-данные и большие наборы.", "Separate smoke data from larger sets.")
      ],
      starterCode: {
        TypeScript:
          "function createCandidateFixture(seed: string) {\n  return { seed };\n}",
        Python:
          "def create_candidate_fixture(seed: str):\n    return {'seed': seed}",
        Java:
          "Map<String, Object> createCandidateFixture(String seed) { return Map.of('seed', seed); }".replace(/'/g, '"')
      },
      tags: ["qa", "fixtures", "test-data"],
      estimatedMinutes: 20,
      evaluationFocus: [
        localize("Повторяемость и независимость тестов", "Reproducibility and isolation"),
        localize("Удобство использования фикстур", "Fixture usability")
      ],
      recommendedFor: ["junior", "middle"]
    },
    {
      id: "task-qa-flaky-suite",
      domain: "qa",
      title: localize("Стабилизация flaky-набора", "Stabilizing a flaky suite"),
      difficulty: "medium",
      overview: localize(
        "Нужно локализовать причины нестабильности и предложить план стабилизации тестов.",
        "Localize flakiness causes and propose a stabilization plan."
      ),
      statement: localize(
        "Опишите план работы с flaky-набором e2e тестов: наблюдаемость, категоризация причин, quarantine-подход и метрики улучшения.",
        "Describe a plan for a flaky e2e suite: observability, root-cause categories, a quarantine approach and improvement metrics."
      ),
      inputFormat: localize(
        "История падений и пример CI pipeline.",
        "Failure history and an example CI pipeline."
      ),
      outputFormat: localize(
        "План стабилизации и метрики качества.",
        "A stabilization plan and quality metrics."
      ),
      constraints: [
        localize("Нельзя просто отключить половину тестов", "You cannot simply disable half the suite"),
        localize("Нужны измеримые критерии flaky rate", "Flaky-rate criteria must be measurable"),
        localize("Важно не замедлить CI критично", "Do not critically slow down CI")
      ],
      examples: [
        {
          input: "Random timeout in login flow",
          output: "instrument + isolate + fix root cause",
          explanation: localize(
            "Сначала нужна наблюдаемость, затем исправление причины.",
            "Observability comes first, then the root-cause fix."
          )
        }
      ],
      hints: [
        localize("Разделяйте product bugs и test bugs.", "Separate product bugs from test bugs."),
        localize("Отслеживайте flaky rate по тесту и по пайплайну.", "Track flaky rate per test and per pipeline.")
      ],
      starterCode: {
        TypeScript:
          "type FailureEvent = { testId: string; reason: string };",
        Python:
          "class FailureEvent:\n    pass",
        Java:
          "record FailureEvent(String testId, String reason) {}"
      },
      tags: ["qa", "e2e", "flaky"],
      estimatedMinutes: 30,
      evaluationFocus: [
        localize("Системность стабилизации", "Systematic stabilization thinking"),
        localize("Метрики и обратная связь", "Metrics and feedback loops")
      ],
      recommendedFor: ["middle", "senior"]
    },
    {
      id: "task-qa-risk-based-plan",
      domain: "qa",
      title: localize("Риск-ориентированный тест-план", "Risk-based test plan"),
      difficulty: "hard",
      overview: localize(
        "Нужно построить тестовую стратегию для релиза с ограниченным временем.",
        "Build a test strategy for a release under time constraints."
      ),
      statement: localize(
        "Составьте риск-ориентированный план тестирования нового релиза: какие области идут в smoke, regression, exploratory, automation и что можно осознанно отложить.",
        "Create a risk-based test plan for a new release: what goes into smoke, regression, exploratory, automation and what can be consciously deferred."
      ),
      inputFormat: localize(
        "Описание релиза, рисков и ограничений команды.",
        "Release scope, risks and team constraints."
      ),
      outputFormat: localize(
        "Приоритизированный план тестирования.",
        "A prioritized test plan."
      ),
      constraints: [
        localize("Времени на полный regression нет", "There is no time for a full regression"),
        localize("Нужно объяснить критерии приоритизации", "Explain prioritization criteria"),
        localize("Важно связать риски с бизнес-эффектом", "Connect risks to business impact")
      ],
      examples: [
        {
          input: "Payment flow + profile UI updates",
          output: "payments first, profile selective",
          explanation: localize(
            "Критичные денежные сценарии тестируются в приоритете.",
            "Critical money flows are tested first."
          )
        }
      ],
      hints: [
        localize("Сортируйте риски по влиянию и вероятности.", "Sort risks by impact and likelihood."),
        localize("Свяжите приоритеты с типами тестирования.", "Link priorities to test types.")
      ],
      starterCode: {
        TypeScript:
          "interface RiskItem { area: string; impact: number; likelihood: number }",
        Python:
          "class RiskItem:\n    pass",
        Java:
          "record RiskItem(String area, int impact, int likelihood) {}"
      },
      tags: ["qa", "strategy", "risk"],
      estimatedMinutes: 40,
      evaluationFocus: [
        localize("Качество приоритизации", "Quality of prioritization"),
        localize("Связь рисков и стратегии", "Link between risk and strategy")
      ],
      recommendedFor: ["senior", "lead"]
    }
    ,
    {
      id: "task-algosql-top-customers",
      domain: "algorithms_sql",
      title: localize("Топ клиентов по сумме заказов", "Top customers by total order value"),
      difficulty: "easy",
      overview: localize(
        "Нужно посчитать агрегаты по заказам и вернуть top-N клиентов.",
        "Compute order aggregates and return the top-N customers."
      ),
      statement: localize(
        "Даны таблицы customers(id, name) и orders(id, customer_id, amount). Напишите SQL-запрос, который вернёт 3 клиентов с наибольшей суммой amount. При равенстве сортируйте по customer_id.",
        "You are given customers(id, name) and orders(id, customer_id, amount). Write an SQL query that returns the top 3 customers by total amount. Break ties by customer_id."
      ),
      inputFormat: localize("SQL schema customers + orders.", "SQL schema customers + orders."),
      outputFormat: localize("customer_id, name, total_amount", "customer_id, name, total_amount"),
      constraints: [
        localize("Используйте GROUP BY и ORDER BY", "Use GROUP BY and ORDER BY"),
        localize("Нужно корректно обработать клиентов без заказов", "Handle customers without orders correctly")
      ],
      examples: [{
        input: "customers, orders",
        output: "top 3 rows",
        explanation: localize("Суммы считаются по каждому customer_id.", "Totals are aggregated per customer_id.")
      }],
      hints: [
        localize("Подумайте о LEFT JOIN.", "Consider a LEFT JOIN."),
        localize("Используйте COALESCE для пустых сумм.", "Use COALESCE for empty totals.")
      ],
      starterCode: {
        SQL: "SELECT c.id AS customer_id, c.name, COALESCE(SUM(o.amount), 0) AS total_amount\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nGROUP BY c.id, c.name\nORDER BY total_amount DESC, c.id ASC\nLIMIT 3;",
        Python: "def solve(rows: list[tuple[int, str, float]]) -> list[tuple[int, str, float]]:\n    return []",
        TypeScript: "type Row = { customerId: number; name: string; amount: number };\n\nfunction topCustomers(rows: Row[]): Row[] {\n  return [];\n}",
        Java: "class Solution {\n  List<String> solve() {\n    return List.of();\n  }\n}"
      },
      tags: ["sql", "aggregation", "joins"],
      estimatedMinutes: 18,
      evaluationFocus: [
        localize("Корректность агрегации", "Aggregation correctness"),
        localize("Чистота SQL", "SQL clarity")
      ],
      recommendedFor: ["intern", "junior", "middle"]
    },
    {
      id: "task-algosql-repeat-buyers",
      domain: "algorithms_sql",
      title: localize("Повторные покупки по месяцам", "Repeat buyers by month"),
      difficulty: "medium",
      overview: localize(
        "Нужно выделить клиентов, которые покупали минимум в двух разных месяцах.",
        "Identify customers who made purchases in at least two distinct months."
      ),
      statement: localize(
        "Есть таблица orders(customer_id, created_at). Напишите SQL-запрос, который вернёт customer_id клиентов, покупавших минимум в двух разных календарных месяцах.",
        "Given orders(customer_id, created_at), write an SQL query returning customer_id values for customers who purchased in at least two distinct calendar months."
      ),
      inputFormat: localize("orders(customer_id, created_at)", "orders(customer_id, created_at)"),
      outputFormat: localize("customer_id", "customer_id"),
      constraints: [
        localize("Считайте месяцы по дате created_at", "Group months by created_at"),
        localize("Избегайте повторного счёта заказов в одном месяце", "Do not double-count orders within the same month")
      ],
      examples: [{
        input: "customer 1: Jan, Jan, Feb",
        output: "1",
        explanation: localize("Считаются уникальные месяцы.", "Only unique months count.")
      }],
      hints: [
        localize("Используйте COUNT(DISTINCT ...).", "Use COUNT(DISTINCT ...)."),
        localize("Подумайте о DATE_TRUNC или эквиваленте.", "Consider DATE_TRUNC or an equivalent.")
      ],
      starterCode: {
        SQL: "SELECT customer_id\nFROM orders\nGROUP BY customer_id\nHAVING COUNT(DISTINCT DATE_TRUNC('month', created_at)) >= 2;",
        Python: "def repeat_buyers(rows: list[tuple[int, str]]) -> list[int]:\n    return []",
        TypeScript: "type Order = { customerId: number; createdAt: string };\n\nfunction repeatBuyers(orders: Order[]): number[] {\n  return [];\n}",
        Java: "class Solution {\n  List<Integer> repeatBuyers() {\n    return List.of();\n  }\n}"
      },
      tags: ["sql", "dates", "distinct"],
      estimatedMinutes: 24,
      evaluationFocus: [
        localize("Работа с датами", "Date handling"),
        localize("Корректность условия HAVING", "Correct HAVING logic")
      ],
      recommendedFor: ["junior", "middle", "senior"]
    },
    {
      id: "task-algosql-session-gap",
      domain: "algorithms_sql",
      title: localize("Разрывы между сессиями", "Gaps between sessions"),
      difficulty: "hard",
      overview: localize(
        "Нужно найти пользователей, у которых между соседними сессиями был большой разрыв.",
        "Find users whose neighboring sessions have a large gap."
      ),
      statement: localize(
        "Есть таблица sessions(user_id, started_at). Напишите SQL-запрос, который для каждого user_id находит максимальный разрыв в днях между соседними started_at. Верните пользователей, у которых этот разрыв больше 30 дней.",
        "Given sessions(user_id, started_at), write an SQL query that computes the largest gap in days between neighboring started_at values for each user_id. Return users whose largest gap exceeds 30 days."
      ),
      inputFormat: localize("sessions(user_id, started_at)", "sessions(user_id, started_at)"),
      outputFormat: localize("user_id, max_gap_days", "user_id, max_gap_days"),
      constraints: [
        localize("Ожидается оконная функция", "A window function is expected"),
        localize("Нужно сравнивать соседние записи внутри user_id", "Compare neighboring rows within the same user_id")
      ],
      examples: [{
        input: "user 7: 2026-01-01, 2026-01-10, 2026-03-01",
        output: "7, 50",
        explanation: localize("Максимальный разрыв считается по соседним датам после сортировки.", "The largest gap is computed on sorted neighboring timestamps.")
      }],
      hints: [
        localize("Используйте LAG().", "Use LAG()."),
        localize("Разбейте решение на CTE.", "Break the query into CTEs.")
      ],
      starterCode: {
        SQL: "WITH ordered AS (\n  SELECT user_id, started_at,\n         LAG(started_at) OVER (PARTITION BY user_id ORDER BY started_at) AS prev_started_at\n  FROM sessions\n), gaps AS (\n  SELECT user_id, MAX(DATE_PART('day', started_at - prev_started_at)) AS max_gap_days\n  FROM ordered\n  WHERE prev_started_at IS NOT NULL\n  GROUP BY user_id\n)\nSELECT user_id, max_gap_days\nFROM gaps\nWHERE max_gap_days > 30;",
        Python: "def max_gap(rows: list[tuple[int, str]]) -> list[tuple[int, int]]:\n    return []",
        TypeScript: "type SessionRow = { userId: number; startedAt: string };\n\nfunction maxGap(rows: SessionRow[]): Array<{ userId: number; gap: number }> {\n  return [];\n}",
        Java: "class Solution {\n  List<String> maxGap() {\n    return List.of();\n  }\n}"
      },
      tags: ["sql", "window-functions", "analytics"],
      estimatedMinutes: 32,
      evaluationFocus: [
        localize("Оконные функции", "Window functions"),
        localize("Структура решения", "Solution structure")
      ],
      recommendedFor: ["middle", "senior", "lead"]
    }

  ];
}