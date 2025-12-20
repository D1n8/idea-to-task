export interface ITaskHistory {
  updatedAt: number;
  action: string;
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