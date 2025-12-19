import type { ColumnData } from "../types/modules";

export const COLUMN_WIDTH = 300;
export const NODE_PADDING = 10;
export const COLUMN_HEADER_HEIGHT = 50;
export const TASK_HEIGHT = 100;
export const TASK_GAP = 10;
export const TASK_WIDTH = COLUMN_WIDTH - NODE_PADDING * 2;

export const getColumnHeight = (itemsCount: number) => {
  return COLUMN_HEADER_HEIGHT + NODE_PADDING + itemsCount * (TASK_HEIGHT + TASK_GAP) + NODE_PADDING;
};

export const getPriorityWeight = (priority?: string) => {
  switch (priority) {
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 0;
  }
};

export const getUniqueTitle = (baseTitle: string, columns: ColumnData[], excludeId?: string) => {
  let title = baseTitle;
  let counter = 1;
  const isDuplicate = (t: string) => columns.some(c => c.title === t && c.id !== excludeId);
  
  while (isDuplicate(title)) {
    title = `${baseTitle} (${counter})`;
    counter++;
  }
  return title;
};