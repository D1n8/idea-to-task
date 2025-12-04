import type { ColumnData, ITaskData } from "../types/modules";
import { COLUMN_WIDTH } from "../utils/kanbanUtils";

export const AVAILABLE_USERS = [
  { id: 'u1', name: 'Иван Иванов' },
  { id: 'u2', name: 'Мария Петрова' },
  { id: 'u3', name: 'Алексей Сидоров' },
  { id: 'u4', name: 'Елена Смирнова' },
];

export const initialColumns: ColumnData[] = [
  { id: "todo", title: "To do", x: 50, y: 50, width: COLUMN_WIDTH, height: 600, isDoneColumn: false },
  { id: "inprogress", title: "In progress", x: 400, y: 50, width: COLUMN_WIDTH, height: 600, isDoneColumn: false },
  { id: "done", title: "Done", x: 750, y: 50, width: COLUMN_WIDTH, height: 600, isDoneColumn: true },
];

export const sampleTasks: ITaskData[] = [
  { id: "t1", title: "Критичный баг", description: "Починить логин на странице авторизации", status: "todo", priority: "highest", deadline: "2023-10-01", username: "Иван Иванов" },
  { id: "t2", title: "Обычная задача", description: "Поменять цвет кнопки", status: "inprogress", priority: "low", username: "Мария Петрова" },
  { id: "t3", title: "Unit тесты", description: "Для авторизации", status: "todo", priority: "medium", parentId: "t1" },
];