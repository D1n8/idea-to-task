import type { ColumnData, ITaskData } from "../types/modules";

export const AVAILABLE_USERS = [
  "Иван Иванов",
  "Анна Смирнова",
  "Дмитрий Соколов",
  "Елена Кузнецова",
  "Алексей Попов"
];

export const initialColumns: ColumnData[] = [
  { id: "todo", title: "К выполнению", x: 0, y: 0, width: 300 },
  { id: "in-progress", title: "В работе", x: 320, y: 0, width: 300 },
  { id: "review", title: "Ревью", x: 640, y: 0, width: 300 },
  { id: "done", title: "Готово", x: 960, y: 0, width: 300, isDoneColumn: true },
];

const now = Date.now();
const dayInMs = 24 * 60 * 60 * 1000;

// Функция для генерации даты в формате YYYY-MM-DD
const getDateOffset = (days: number) => {
  const date = new Date(now + days * dayInMs);
  return date.toISOString().split('T')[0];
};

export const sampleTasks: ITaskData[] = [
  {
    id: "1",
    title: "Разработать дизайн системы",
    description: "Создать основные компоненты UI и палитру цветов в Figma.",
    status: "in-progress",
    priority: "high",
    username: "Анна Смирнова",
    deadline: getDateOffset(2), // Будущий дедлайн
    createdAt: now - dayInMs * 3,
    history: [
      { updatedAt: now - dayInMs * 3, action: "Задача создана" },
      { updatedAt: now - dayInMs, action: "Статус изменен на: В работе" }
    ]
  },
  {
    id: "2",
    title: "Исправить баги верстки",
    description: "Поправить отступы в мобильной версии личного кабинета.",
    status: "todo",
    priority: "medium",
    username: "Иван Иванов",
    deadline: getDateOffset(-1), // ПРОСРОЧЕННЫЙ дедлайн (вчера)
    createdAt: now - dayInMs * 5,
    history: [
      { updatedAt: now - dayInMs * 5, action: "Задача создана" }
    ]
  },
  {
    id: "3",
    title: "Написать документацию по API",
    description: "Описать все эндпоинты для модуля аутентификации.",
    status: "review",
    priority: undefined, // Задача без приоритета
    username: "", // Без исполнителя
    deadline: getDateOffset(5),
    createdAt: now - dayInMs * 2,
    history: [
      { updatedAt: now - dayInMs * 2, action: "Задача создана" }
    ]
  },
  {
    id: "4",
    title: "Интеграция с платежным шлюзом",
    description: "Подключить Stripe и протестировать тестовые платежи.",
    status: "todo",
    priority: "high",
    username: "Алексей Попов",
    createdAt: now - dayInMs * 1,
    history: [
      { updatedAt: now - dayInMs * 1, action: "Задача создана" }
    ]
  },
  {
    id: "5",
    title: "Подготовка презентации",
    status: "done",
    priority: "low",
    username: "Елена Кузнецова",
    createdAt: now - dayInMs * 10,
    history: [
      { updatedAt: now - dayInMs * 10, action: "Задача создана" },
      { updatedAt: now - dayInMs * 1, action: "Перемещена в: Готово" }
    ]
  },
  {
    id: "6",
    title: "Собрать требования от заказчика",
    status: "done",
    priority: "medium",
    parentId: "1", // Подзадача для задачи №1
    username: "Анна Смирнова",
    createdAt: now - dayInMs * 12,
    history: [
      { updatedAt: now - dayInMs * 12, action: "Задача создана" }
    ]
  }
];