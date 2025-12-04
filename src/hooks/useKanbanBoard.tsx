import { useState, useCallback, useMemo } from "react";
import { type Node, type NodeDragHandler } from "reactflow";
import { nanoid } from "nanoid";
import type { ITaskData, ColumnData } from "../types/modules";
import { 
  COLUMN_HEADER_HEIGHT, NODE_PADDING, TASK_HEIGHT, TASK_GAP, TASK_WIDTH, COLUMN_WIDTH,
  getColumnHeight, getPriorityWeight, getUniqueTitle 
} from "../utils/kanbanUtils";

// ИМПОРТ МОКОВЫХ ДАННЫХ
import { initialColumns, sampleTasks } from "../data/mockData";

export const useKanbanBoard = () => {
  const [columns, setColumns] = useState<ColumnData[]>(initialColumns);
  const [tasks, setTasks] = useState<ITaskData[]>(sampleTasks);

  // --- MODALS STATE ---
  const [taskModal, setTaskModal] = useState<{ isOpen: boolean; editingTask: ITaskData | null; status: string; parentId?: string }>({
    isOpen: false, editingTask: null, status: "todo", parentId: undefined
  });

  const [deleteColumnModal, setDeleteColumnModal] = useState<{ isOpen: boolean; colId: string | null }>({
    isOpen: false, colId: null
  });

  // НОВОЕ: Стейт для модалки удаления задачи
  const [deleteTaskModal, setDeleteTaskModal] = useState<{ isOpen: boolean; taskId: string | null }>({
    isOpen: false, taskId: null
  });

  // --- CRUD COLUMNS (без изменений) ---
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
      if (isDuplicate) finalTitle = getUniqueTitle(newTitle, prev, colId);
      return prev.map(c => c.id === colId ? { ...c, title: finalTitle, isEditing: false } : c);
    });
  }, []);

  const confirmDeleteColumn = useCallback((colId: string) => setDeleteColumnModal({ isOpen: true, colId }), []);
  
  const handleDeleteColumn = useCallback(() => {
    if (!deleteColumnModal.colId) return;
    setColumns((prev) => prev.filter(c => c.id !== deleteColumnModal.colId));
    setTasks((prev) => prev.filter(t => t.status !== deleteColumnModal.colId));
    setDeleteColumnModal({ isOpen: false, colId: null });
  }, [deleteColumnModal.colId]);

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
        title: taskData.title!, description: taskData.description, status: taskData.status!,
        priority: taskData.priority, deadline: taskData.deadline, username: taskData.username, parentId: taskData.parentId,
      };
      return [...prev, newTask];
    });
    setTaskModal(prev => ({ ...prev, isOpen: false }));
  }, [taskModal.editingTask]);

  // --- DELETE TASK LOGIC ---
  const openDeleteTaskModal = useCallback((taskId: string) => {
    setDeleteTaskModal({ isOpen: true, taskId });
  }, []);

  const handleDeleteTask = useCallback((deleteSubtasks: boolean) => {
    const taskId = deleteTaskModal.taskId;
    if (!taskId) return;

    setTasks(prev => {
        // 1. Удаляем саму задачу
        let newTasks = prev.filter(t => t.id !== taskId);

        // 2. Логика чекбокса
        if (deleteSubtasks) {
            // Удаляем всех детей
            newTasks = newTasks.filter(t => t.parentId !== taskId);
        } else {
            // Оставляем детей, но убираем parentId
            newTasks = newTasks.map(t => t.parentId === taskId ? { ...t, parentId: undefined } : t);
        }
        return newTasks;
    });

    setDeleteTaskModal({ isOpen: false, taskId: null });
    setTaskModal(prev => ({ ...prev, isOpen: false })); // Закрываем также модалку редактирования
  }, [deleteTaskModal.taskId]);

  // --- NODES GENERATION (без изменений) ---
  const nodes: Node[] = useMemo(() => {
    const nodesArr: Node[] = [];
    const tasksByStatus: Record<string, ITaskData[]> = {};
    columns.forEach(c => { tasksByStatus[c.id] = [] });

    tasks.forEach((t) => { if(tasksByStatus[t.status]) tasksByStatus[t.status].push(t); });
    Object.keys(tasksByStatus).forEach((key) => {
      tasksByStatus[key].sort((a, b) => getPriorityWeight(b.priority) - getPriorityWeight(a.priority));
    });

    columns.forEach((col) => {
      const colTasks = tasksByStatus[col.id] || [];
      const dynamicHeight = getColumnHeight(colTasks.length);
      nodesArr.push({
        id: `col-${col.id}`, type: "column", position: { x: col.x, y: col.y },
        data: { ...col, height: dynamicHeight, onAddTask: openNewTaskModal, onDelete: confirmDeleteColumn, onRename: handleRenameColumn, onAddColumn: handleCreateColumn, onSetDone: handleSetDoneColumn },
        draggable: true, zIndex: 0, width: col.width, height: dynamicHeight,
      });
    });

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
    nodes, onNodeDragStop, columns, tasks,
    taskModal, setTaskModal,
    deleteColumnModal, setDeleteColumnModal,
    // Экспортируем состояния и методы для удаления задачи
    deleteTaskModal, setDeleteTaskModal,
    handleDeleteTask,
    openDeleteTaskModal,
    // 
    handleSaveTask, handleDeleteColumn, openSubtaskModal, openEditTaskModal
  };
};