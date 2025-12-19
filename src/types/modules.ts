export interface ITaskData {
  id: string;
  title: string;
  description?: string;
  status: string; // id колонки
  priority?: 'low' | 'medium' | 'high';
  deadline?: string;
  username?: string; // Имя пользователя
  parentId?: string; // Для подзадач
  width?: number; // Для совместимости с node data
  height?: number; // Для совместимости с node data
}

export interface ColumnData {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isEditing: boolean;
  isDoneColumn?: boolean;
}