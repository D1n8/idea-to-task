import type { Priority, ColumnData } from "../types/modules";

export const COLUMN_WIDTH = 320;
export const COLUMN_HEADER_HEIGHT = 60;
export const ADD_BUTTON_HEIGHT = 50;
export const NODE_PADDING = 16;
export const TASK_WIDTH = COLUMN_WIDTH - NODE_PADDING * 2;
export const TASK_HEIGHT = 110;
export const TASK_GAP = 12;
export const MIN_COLUMN_HEIGHT = 200;

export const getPriorityWeight = (p?: Priority): number => {
  switch (p) {
    case "highest": return 5;
    case "high": return 4;
    case "medium": return 3;
    case "low": return 2;
    case "lowest": return 1;
    default: return 0;
  }
};

export const getColumnHeight = (taskCount: number) => {
  const contentHeight = COLUMN_HEADER_HEIGHT + NODE_PADDING + (taskCount * (TASK_HEIGHT + TASK_GAP)) + NODE_PADDING + ADD_BUTTON_HEIGHT;
  return Math.max(contentHeight, MIN_COLUMN_HEIGHT);
};

export const getUniqueTitle = (baseTitle: string, columns: ColumnData[], excludeId?: string) => {
  let newTitle = baseTitle;
  let counter = 1;
  while (columns.some(col => col.title === newTitle && col.id !== excludeId)) {
    newTitle = `${baseTitle} (${counter})`;
    counter++;
  }
  return newTitle;
};