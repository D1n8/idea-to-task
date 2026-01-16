export interface ITaskHistory {
  updatedAt: number;
  action: string;
  changedBy: string;
}

export interface ITaskData {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: 'low' | 'medium' | 'high';
  username?: string;
  parentId?: string;
  deadline?: string; 
  createdAt: number;
  history: ITaskHistory[];
}

export interface ColumnData {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  isDoneColumn?: boolean;
}

export interface IHostInfo {
  widgetId: number;
  userId: number;
  role: string;
  config: {
    tasks?: ITaskData[];
    columns?: ColumnData[];
    // Размеры виджета
    measures?: {
      width: number;
      height: number;
    };
    [key: string]: any;
  };
  board: {
    id: number;
    name: string;
    parentId: number;
  };
}