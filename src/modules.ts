export interface ITaskData {
  height?: number;
  width?: number;
  id: string;
  title: string;
  description?: string;
  status: "todo" | "inprogress" | "testing" | "done";
}

export type ColumnData = {
  id: string;
  title: string;
  width: number;
  height: number;
};
