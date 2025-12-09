export type Priority = 'highest' | 'high' | 'medium' | 'low' | 'lowest';

export interface ITaskData {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: Priority;
  deadline?: string;
  username?: string;
  parentId?: string;
}

export interface ColumnData {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isEditing?: boolean;
  isDoneColumn?: boolean;
}

export interface KanbanBoardProps {
  tasks: ITaskData[];
  columns: ColumnData[];
  users: { id: string; name: string }[];
  
  onTaskCreate: (task: Partial<ITaskData>) => void;
  onTaskUpdate: (task: ITaskData) => void;
  onTaskDelete: (taskId: string, deleteChildren: boolean) => void;
  onTaskMove: (taskId: string, newStatus: string) => void;

  onColumnCreate: () => void;
  onColumnRename: (colId: string, newTitle: string) => void;
  onColumnDelete: (colId: string) => void;
  onColumnMove: (colId: string, newX: number, newY: number) => void;
  onSetDoneColumn: (colId: string) => void;
  onColumnUpdate: (column: ColumnData) => void; 
}