import type { ITaskData, ColumnData } from "../types/modules";

export const AVAILABLE_USERS = ["Alex", "Maria", "John", "Kate"];

export const initialColumns: ColumnData[] = [
  { id: "todo", title: "К выполнению", x: 0, y: 0, width: 300, height: 500, isEditing: false },
  { id: "in-progress", title: "В работе", x: 320, y: 0, width: 300, height: 500, isEditing: false },
  { id: "done", title: "Готово", x: 640, y: 0, width: 300, height: 500, isEditing: false, isDoneColumn: true },
];

export const sampleTasks: ITaskData[] = [
  { id: "1", title: "Анализ требований", status: "todo", priority: "high", description: "Собрать требования заказчика", username: "Alex" },
  { id: "2", title: "Создание макетов", status: "in-progress", priority: "medium", description: "Figma прототипы", username: "Maria", parentId: "1" },
  { id: "3", title: "Настройка репозитория", status: "done", priority: "low", description: "GitHub init", username: "John" },
];