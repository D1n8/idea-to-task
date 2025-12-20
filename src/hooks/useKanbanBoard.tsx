import { useState, useCallback } from "react";
import { nanoid } from "nanoid";
import type { ITaskData, ColumnData, ITaskHistory } from "../types/modules";
import { initialColumns, sampleTasks } from "../data/mockData";

export const useKanbanBoard = () => {
  const [columns, setColumns] = useState<ColumnData[]>(initialColumns);
  const [tasks, setTasks] = useState<ITaskData[]>(sampleTasks);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // --- MODALS STATE ---
  const [taskModal, setTaskModal] = useState<{ isOpen: boolean; editingTask: ITaskData | null; status: string; parentId?: string }>({
    isOpen: false, editingTask: null, status: "todo", parentId: undefined
  });

  const [deleteColumnModal, setDeleteColumnModal] = useState<{ isOpen: boolean; colId: string | null }>({
    isOpen: false, colId: null
  });

  const [deleteTaskModal, setDeleteTaskModal] = useState<{ isOpen: boolean; taskId: string | null }>({
    isOpen: false, taskId: null
  });

  // --- ЛОГИКА КОЛОНОК ---
  const handleCreateColumn = useCallback(() => {
    const baseTitle = "Новая колонка";
    let newTitle = baseTitle;
    let counter = 1;
    
    while (columns.some(c => c.title.toLowerCase() === newTitle.toLowerCase())) {
      newTitle = `${baseTitle} (${counter++})`;
    }

    const newCol: ColumnData = {
      id: nanoid(),
      title: newTitle,
      x: 0, y: 0, width: 300
    };
    setColumns(prev => [...prev, newCol]);
  }, [columns]);

  const handleRenameColumn = useCallback((colId: string, newTitle: string) => {
    setColumns(prev => prev.map(c => c.id === colId ? { ...c, title: newTitle } : c));
  }, []);

  const handleSetDoneColumn = useCallback((colId: string) => {
    setColumns(prev => prev.map(col => ({ ...col, isDoneColumn: col.id === colId })));
  }, []);

  // --- ЛОГИКА ЗАДАЧ И ИСТОРИИ ---
  const handleSaveTask = useCallback((taskData: Partial<ITaskData>) => {
    const timestamp = Date.now();
    
    setTasks(prev => {
      if (taskModal.editingTask) {
        return prev.map(t => {
          if (t.id === taskModal.editingTask!.id) {
            const changes: string[] = [];
            
            if (taskData.title && t.title !== taskData.title) 
              changes.push(`Название изменено на "${taskData.title}"`);
            
            // 2. Исправленная логика записи смены статуса
            if (taskData.status && t.status !== taskData.status) {
              const newCol = columns.find(c => c.id === taskData.status);
              const colName = newCol ? newCol.title : taskData.status;
              changes.push(`Статус изменен на: ${colName}`);
            }

            if (taskData.deadline !== undefined && t.deadline !== taskData.deadline) 
              changes.push(`Дедлайн: ${taskData.deadline || 'удален'}`);
            
            if (taskData.priority !== t.priority)
              changes.push(`Приоритет: ${taskData.priority || 'снят'}`);

            const newHistoryItem: ITaskHistory = {
              updatedAt: timestamp,
              action: changes.length > 0 ? changes.join("; ") : "Обновление информации"
            };

            const updatedHistory = changes.length > 0 
                ? [...(t.history || []), newHistoryItem] 
                : (t.history || []);

            return { 
              ...t, 
              ...taskData, 
              history: updatedHistory 
            } as ITaskData;
          }
          return t;
        });
      } else {
        const newTask: ITaskData = {
          id: nanoid(),
          title: taskData.title || "Новая задача",
          description: taskData.description || "",
          status: taskData.status || taskModal.status,
          priority: taskData.priority,
          deadline: taskData.deadline,
          username: taskData.username,
          parentId: taskData.parentId,
          createdAt: timestamp,
          history: [{ updatedAt: timestamp, action: "Задача создана" }]
        };
        return [...prev, newTask];
      }
    });
    setTaskModal(prev => ({ ...prev, isOpen: false }));
  }, [taskModal, columns]);

  // --- DRAG AND DROP ---
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    if (draggedTaskId) {
      setTasks(prev => prev.map(t => {
        if (t.id === draggedTaskId && t.status !== colId) {
            // 2. Исправленная запись для Drag & Drop
            const targetCol = columns.find(c => c.id === colId);
            const colName = targetCol ? targetCol.title : colId;

            const historyItem: ITaskHistory = {
                updatedAt: Date.now(),
                action: `Статус изменен на: ${colName}`
            };
            return { ...t, status: colId, history: [...(t.history || []), historyItem] };
        }
        return t;
      }));
      setDraggedTaskId(null);
    }
  };

  // --- MODALS ---
  const openNewTaskModal = useCallback((status: string) => {
    setTaskModal({ isOpen: true, editingTask: null, status, parentId: undefined });
  }, []);

  const openEditTaskModal = useCallback((task: ITaskData) => {
    setTaskModal({ isOpen: true, editingTask: task, status: task.status });
  }, []);

  const openSubtaskModal = useCallback((parentId: string) => {
    const parent = tasks.find(t => t.id === parentId);
    setTaskModal({ isOpen: true, editingTask: null, status: parent?.status || 'todo', parentId });
  }, [tasks]);

  const confirmDeleteColumn = useCallback((colId: string) => {
    setDeleteColumnModal({ isOpen: true, colId });
  }, []);

  const handleDeleteColumn = useCallback(() => {
    if (deleteColumnModal.colId) {
      setTasks(prev => prev.filter(t => t.status !== deleteColumnModal.colId));
      setColumns(prev => prev.filter(c => c.id !== deleteColumnModal.colId));
      setDeleteColumnModal({ isOpen: false, colId: null });
    }
  }, [deleteColumnModal.colId]);

  const openDeleteTaskModal = useCallback((taskId: string) => {
    setDeleteTaskModal({ isOpen: true, taskId });
  }, []);

  const handleDeleteTask = useCallback((deleteSubtasks: boolean) => {
    const taskId = deleteTaskModal.taskId;
    if (!taskId) return;
    setTasks(prev => {
        let newTasks = prev.filter(t => t.id !== taskId);
        if (deleteSubtasks) {
            newTasks = newTasks.filter(t => t.parentId !== taskId);
        } else {
            newTasks = newTasks.map(t => t.parentId === taskId ? { ...t, parentId: undefined } : t);
        }
        return newTasks;
    });
    setDeleteTaskModal({ isOpen: false, taskId: null });
    setTaskModal(prev => ({ ...prev, isOpen: false }));
  }, [deleteTaskModal.taskId]);

  return {
    columns, tasks,
    taskModal, setTaskModal,
    deleteColumnModal, setDeleteColumnModal,
    deleteTaskModal, setDeleteTaskModal,
    handleDeleteTask, openDeleteTaskModal,
    handleSaveTask, handleCreateColumn, handleRenameColumn,
    confirmDeleteColumn, handleDeleteColumn, handleSetDoneColumn,
    openNewTaskModal, openEditTaskModal, openSubtaskModal,
    handleDragStart, handleDragOver, handleDrop
  };
};