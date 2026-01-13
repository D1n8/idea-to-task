import { useState, useCallback } from "react";
import { nanoid } from "nanoid";
import type { ITaskData, ColumnData, ITaskHistory } from "../types/modules";
import { useKanbanContext } from "../context/KanbanContext";

// Имитация текущего пользователя (в реальном приложении берется из AuthContext)
const CURRENT_USER = "Текущий Пользователь"; 

export const useKanbanBoard = (source: 'kanban' | 'mindmap' = 'kanban') => {
  const { 
    kanbanTasks, mindMapTasks, columns, setColumns, 
    updateTaskInStore, addTaskToStore, deleteTaskFromStore,
    isSynced, toggleSync, isMindMapVisible, setMindMapVisible 
  } = useKanbanContext();

  const tasks = source === 'kanban' ? kanbanTasks : mindMapTasks;
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // --- MODALS ---
  const [taskModal, setTaskModal] = useState<{ isOpen: boolean; editingTask: ITaskData | null; status: string; parentId?: string }>({
    isOpen: false, editingTask: null, status: "todo", parentId: undefined
  });

  const [deleteColumnModal, setDeleteColumnModal] = useState<{ isOpen: boolean; colId: string | null }>({
    isOpen: false, colId: null
  });

  const [deleteTaskModal, setDeleteTaskModal] = useState<{ isOpen: boolean; taskId: string | null }>({
    isOpen: false, taskId: null
  });

  // --- LOGIC ---

  const handleCreateColumn = useCallback(() => {
    const baseTitle = "Новая колонка";
    let newTitle = baseTitle;
    let counter = 1;
    while (columns.some(c => c.title.toLowerCase() === newTitle.toLowerCase())) {
      newTitle = `${baseTitle} (${counter++})`;
    }
    const newCol: ColumnData = { id: nanoid(), title: newTitle, x: 0, y: 0, width: 300 };
    setColumns(prev => [...prev, newCol]);
  }, [columns, setColumns]);

  const handleRenameColumn = useCallback((colId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    setColumns(prev => prev.map(c => c.id === colId ? { ...c, title: newTitle } : c));
  }, [setColumns]);

  const handleSetDoneColumn = useCallback((colId: string) => {
    setColumns(prev => prev.map(col => ({ ...col, isDoneColumn: col.id === colId })));
  }, [setColumns]);

  // 3. и 4. Улучшенная история изменений
  const handleSaveTask = useCallback((taskData: Partial<ITaskData>) => {
    if (!taskData.title?.trim()) {
      alert("Ошибка: У задачи должно быть название!");
      return;
    }

    const timestamp = Date.now();
    
    if (taskModal.editingTask) {
        // Редактирование
        const oldTask = taskModal.editingTask;
        const changes: string[] = [];
        
        if (taskData.title && oldTask.title !== taskData.title) {
            changes.push(`Название: "${oldTask.title}" -> "${taskData.title}"`);
        }
        
        if (taskData.status && oldTask.status !== taskData.status) {
            const oldCol = columns.find(c => c.id === oldTask.status)?.title || oldTask.status;
            const newCol = columns.find(c => c.id === taskData.status)?.title || taskData.status;
            changes.push(`Статус: "${oldCol}" -> "${newCol}"`);
        }
        
        if (taskData.deadline !== oldTask.deadline) {
            const oldDate = oldTask.deadline ? new Date(oldTask.deadline).toLocaleDateString() : 'нет';
            const newDate = taskData.deadline ? new Date(taskData.deadline).toLocaleDateString() : 'нет';
            changes.push(`Дедлайн: ${oldDate} -> ${newDate}`);
        }

        if (taskData.priority !== oldTask.priority) {
             const oldP = oldTask.priority || 'нет';
             const newP = taskData.priority || 'нет';
             changes.push(`Приоритет: ${oldP} -> ${newP}`);
        }

        if (taskData.username !== oldTask.username) {
             const oldU = oldTask.username || 'не назначен';
             const newU = taskData.username || 'не назначен';
             changes.push(`Исполнитель: ${oldU} -> ${newU}`);
        }

        // Если были изменения, добавляем запись
        const updatedHistory = [...(oldTask.history || [])];
        if (changes.length > 0) {
            updatedHistory.push({
                updatedAt: timestamp,
                action: changes.join("; "),
                changedBy: CURRENT_USER
            });
        }

        const updatedTask: ITaskData = {
            ...oldTask,
            ...taskData,
            history: updatedHistory
        };

        updateTaskInStore(updatedTask, source);
    } else {
        // Создание
        const newTask: ITaskData = {
          id: nanoid(),
          title: taskData.title,
          description: taskData.description || "",
          status: taskData.status || taskModal.status || columns[0]?.id || "todo",
          priority: taskData.priority,
          deadline: taskData.deadline,
          username: taskData.username,
          parentId: taskData.parentId,
          createdAt: timestamp,
          history: [{ 
              updatedAt: timestamp, 
              action: "Задача создана", 
              changedBy: CURRENT_USER 
          }]
        };
        
        addTaskToStore(newTask, source);
    }
    setTaskModal(prev => ({ ...prev, isOpen: false }));
  }, [taskModal, columns, updateTaskInStore, addTaskToStore, source]);

  // Drag & Drop
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
      const task = tasks.find(t => t.id === draggedTaskId);
      if (task && task.status !== colId) {
          const oldCol = columns.find(c => c.id === task.status)?.title || task.status;
          const newCol = columns.find(c => c.id === colId)?.title || colId;
          
          const historyItem: ITaskHistory = {
              updatedAt: Date.now(),
              action: `Статус (Drag&Drop): "${oldCol}" -> "${newCol}"`,
              changedBy: CURRENT_USER
          };
          const updatedTask = { ...task, status: colId, history: [...(task.history || []), historyItem] };
          updateTaskInStore(updatedTask, source);
      }
      setDraggedTaskId(null);
    }
  };

  // Modals helpers
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
      const tasksToDelete = tasks.filter(t => t.status === deleteColumnModal.colId);
      tasksToDelete.forEach(t => deleteTaskFromStore(t.id, false, source));
      setColumns(prev => prev.filter(c => c.id !== deleteColumnModal.colId));
      setDeleteColumnModal({ isOpen: false, colId: null });
    }
  }, [deleteColumnModal.colId, tasks, deleteTaskFromStore, source, setColumns]);

  const openDeleteTaskModal = useCallback((taskId: string) => {
    setDeleteTaskModal({ isOpen: true, taskId });
  }, []);

  const handleDeleteTask = useCallback((deleteSubtasks: boolean) => {
    const taskId = deleteTaskModal.taskId;
    if (!taskId) return;
    deleteTaskFromStore(taskId, deleteSubtasks, source);
    setDeleteTaskModal({ isOpen: false, taskId: null });
    setTaskModal(prev => ({ ...prev, isOpen: false }));
  }, [deleteTaskModal.taskId, deleteTaskFromStore, source]);

  return {
    columns, tasks,
    taskModal, setTaskModal,
    deleteColumnModal, setDeleteColumnModal,
    deleteTaskModal, setDeleteTaskModal,
    handleDeleteTask, openDeleteTaskModal,
    handleSaveTask, handleCreateColumn, handleRenameColumn,
    confirmDeleteColumn, handleDeleteColumn, handleSetDoneColumn,
    openNewTaskModal, openEditTaskModal, openSubtaskModal,
    handleDragStart, handleDragOver, handleDrop,
    isSynced, toggleSync, isMindMapVisible, setMindMapVisible
  };
};