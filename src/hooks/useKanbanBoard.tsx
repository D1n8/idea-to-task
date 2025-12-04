import { useState, useCallback, useMemo } from "react";
import { type Node, type NodeDragHandler } from "reactflow";
import { nanoid } from "nanoid";
import type { ITaskData, ColumnData } from "../types/modules";
import { 
  COLUMN_HEADER_HEIGHT, NODE_PADDING, TASK_HEIGHT, TASK_GAP, TASK_WIDTH, COLUMN_WIDTH,
  getColumnHeight, getPriorityWeight, getUniqueTitle 
} from "../utils/kanbanUtils";

// Исходные данные (можно тоже вынести в константы)
const initialColumns: ColumnData[] = [
  { id: "todo", title: "To do", x: 50, y: 50, width: COLUMN_WIDTH, height: 600, isDoneColumn: false },
  { id: "inprogress", title: "In progress", x: 400, y: 50, width: COLUMN_WIDTH, height: 600, isDoneColumn: false },
  { id: "done", title: "Done", x: 750, y: 50, width: COLUMN_WIDTH, height: 600, isDoneColumn: true },
];

const sampleTasks: ITaskData[] = [
  { id: "t1", title: "Критичный баг", description: "Починить логин", status: "todo", priority: "highest", deadline: "2023-10-01", username: "Иван Иванов" },
  { id: "t2", title: "Обычная задача", description: "Цвет кнопки", status: "inprogress", priority: "low", username: "Мария Петрова" },
  { id: "t3", title: "Unit тесты", description: "Для авторизации", status: "todo", priority: "medium", parentId: "t1" },
];

export const useKanbanBoard = () => {
  const [columns, setColumns] = useState<ColumnData[]>(initialColumns);
  const [tasks, setTasks] = useState<ITaskData[]>(sampleTasks);

  // Модальные состояния
  const [taskModal, setTaskModal] = useState<{ isOpen: boolean; editingTask: ITaskData | null; status: string; parentId?: string }>({
    isOpen: false, editingTask: null, status: "todo", parentId: undefined
  });

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; colId: string | null }>({
    isOpen: false, colId: null
  });

  // --- CRUD COLUMNS ---
  const handleCreateColumn = useCallback(() => {
    const newId = nanoid();
    const title = getUniqueTitle("Новая колонка", columns);
    const newColumn: ColumnData = {
      id: newId, title, x: columns.length > 0 ? columns[columns.length - 1].x + COLUMN_WIDTH + 50 : 50,
      y: 50, width: COLUMN_WIDTH, height: 500, isEditing: true, isDoneColumn: false,
    };
    setColumns((prev) => [...prev, newColumn]);
  }, [columns]);

  const handleRenameColumn = useCallback((colId: string, newTitle: string) => {
    setColumns((prev) => {
      const isDuplicate = prev.some(c => c.title === newTitle && c.id !== colId);
      let finalTitle = newTitle;
      if (isDuplicate) {
         finalTitle = getUniqueTitle(newTitle, prev, colId);
      }
      return prev.map(c => c.id === colId ? { ...c, title: finalTitle, isEditing: false } : c);
    });
  }, []);

  const confirmDeleteColumn = useCallback((colId: string) => setDeleteModal({ isOpen: true, colId }), []);
  
  const handleDeleteColumn = useCallback(() => {
    if (!deleteModal.colId) return;
    setColumns((prev) => prev.filter(c => c.id !== deleteModal.colId));
    setTasks((prev) => prev.filter(t => t.status !== deleteModal.colId));
    setDeleteModal({ isOpen: false, colId: null });
  }, [deleteModal.colId]);

  const handleSetDoneColumn = useCallback((colId: string) => {
    setColumns(prev => prev.map(col => ({ ...col, isDoneColumn: col.id === colId })));
  }, []);

  // --- CRUD TASKS ---
  const openNewTaskModal = useCallback((colId: string) => {
    setTaskModal({ isOpen: true, editingTask: null, status: colId, parentId: undefined });
  }, []);

  const openEditTaskModal = useCallback((task: ITaskData) => {
    setTaskModal({ isOpen: true, editingTask: task, status: task.status, parentId: task.parentId });
  }, []);

  const openSubtaskModal = useCallback((parentId: string) => {
    setTaskModal({ isOpen: true, editingTask: null, status: "todo", parentId });
  }, []);

  const handleSaveTask = useCallback((taskData: Partial<ITaskData>) => {
    setTasks((prev) => {
      if (taskModal.editingTask) {
        return prev.map((t) => t.id === taskModal.editingTask!.id ? { ...t, ...taskData } : t);
      }
      const newTask: ITaskData = {
        id: nanoid(),
        title: taskData.title!,
        description: taskData.description,
        status: taskData.status!,
        priority: taskData.priority,
        deadline: taskData.deadline,
        username: taskData.username,
        parentId: taskData.parentId,
      };
      return [...prev, newTask];
    });
    setTaskModal(prev => ({ ...prev, isOpen: false }));
  }, [taskModal.editingTask]);

  // --- NODES GENERATION ---
  const nodes: Node[] = useMemo(() => {
    const nodesArr: Node[] = [];
    const tasksByStatus: Record<string, ITaskData[]> = {};
    columns.forEach(c => { tasksByStatus[c.id] = [] });

    tasks.forEach((t) => { if(tasksByStatus[t.status]) tasksByStatus[t.status].push(t); });

    Object.keys(tasksByStatus).forEach((key) => {
      tasksByStatus[key].sort((a, b) => getPriorityWeight(b.priority) - getPriorityWeight(a.priority));
    });

    // Columns
    columns.forEach((col) => {
      const colTasks = tasksByStatus[col.id] || [];
      const dynamicHeight = getColumnHeight(colTasks.length);
      nodesArr.push({
        id: `col-${col.id}`, type: "column", position: { x: col.x, y: col.y },
        data: { 
          ...col, height: dynamicHeight, 
          onAddTask: openNewTaskModal, onDelete: confirmDeleteColumn, 
          onRename: handleRenameColumn, onAddColumn: handleCreateColumn, onSetDone: handleSetDoneColumn 
        },
        draggable: true, zIndex: 0, width: col.width, height: dynamicHeight,
      });
    });

    // Tasks
    columns.forEach((col) => {
      const colTasks = tasksByStatus[col.id] || [];
      const isColumnDone = col.isDoneColumn === true;
      colTasks.forEach((task, index) => {
        const x = col.x + NODE_PADDING;
        const y = col.y + COLUMN_HEADER_HEIGHT + NODE_PADDING + index * (TASK_HEIGHT + TASK_GAP);
        nodesArr.push({
          id: task.id, type: "task", position: { x, y },
          data: { ...task, width: TASK_WIDTH, height: TASK_HEIGHT, onEdit: openEditTaskModal, isDone: isColumnDone },
          draggable: true, zIndex: 10, extent: 'parent', 
        });
      });
    });
    return nodesArr;
  }, [columns, tasks, openNewTaskModal, openEditTaskModal, confirmDeleteColumn, handleRenameColumn, handleCreateColumn, handleSetDoneColumn]);

  // --- DRAG AND DROP ---
  const onNodeDragStop: NodeDragHandler = useCallback((_, node) => {
    if (node.type === "column") {
      const colId = node.id.replace("col-", "");
      setColumns((prev) => prev.map((c) => c.id === colId ? { ...c, x: node.position.x, y: node.position.y } : c));
      return;
    }
    if (node.type === "task") {
      const centerX = node.position.x + TASK_WIDTH / 2;
      const centerY = node.position.y + TASK_HEIGHT / 2;
      const targetColumn = columns.find((col) => {
        const tasksInCol = tasks.filter(t => t.status === col.id).length;
        const currentHeight = getColumnHeight(tasksInCol);
        return (centerX >= col.x && centerX <= col.x + col.width && centerY >= col.y && centerY <= col.y + currentHeight);
      });
      if (targetColumn) {
        setTasks((prev) => prev.map((t) => t.id === node.id ? { ...t, status: targetColumn.id } : t));
      }
    }
  }, [columns, tasks]);

  return {
    nodes,
    onNodeDragStop,
    columns,
    tasks,
    // Модалки
    taskModal,
    setTaskModal,
    deleteModal,
    setDeleteModal,
    // Обработчики
    handleSaveTask,
    handleDeleteColumn,
    openSubtaskModal,
    openEditTaskModal
  };
};