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

export interface SubtaskListProps {
    parentId: string;
    tasks: ITaskData[];
    openEditModal: (task: ITaskData) => void;
    openAddSubtaskModal: (parentId: string) => void;
}