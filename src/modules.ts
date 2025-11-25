export interface ITaskData {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "inprogress" | "done";
}

export interface ColumnData {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
}