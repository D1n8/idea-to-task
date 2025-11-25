export type Priority = 'highest' | 'high' | 'medium' | 'low' | 'lowest';
export type Status = "todo" | "inprogress" | "done";

export interface ITaskData {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority?: Priority; 
}

export interface ColumnData {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
}