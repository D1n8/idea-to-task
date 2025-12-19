import { useState, useCallback } from "react";
import { nanoid } from "nanoid";
import type { ITaskData, ColumnData } from "../types/modules";
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

  // --- INTERNAL DRAG AND DROP (HTML5) ---
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Разрешаем сброс
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    if (draggedTaskId) {
      setTasks((prev) => prev.map((t) => 
        t.id === draggedTaskId ? { ...t, status: targetColumnId } : t
      ));
      setDraggedTaskId(null);
    }
  };

  // --- CRUD COLUMNS ---
  const handleCreateColumn = useCallback(() => {
    const newId = nanoid();
    const newColumn: ColumnData = {
      id: newId, 
      title: "Новая колонка", 
      x: 0, y: 0, 
      width: 300, height: 500, 
      isEditing: true, 
      isDoneColumn: false,
    };
    setColumns((prev) => [...prev, newColumn]);
  }, []);

  const handleRenameColumn = useCallback((colId: string, newTitle: string) => {
    setColumns((prev) => prev.map(c => c.id === colId ? { ...c, title: newTitle, isEditing: false } : c));
  }, []);

  const confirmDeleteColumn = useCallback((colId: string) => setDeleteColumnModal({ isOpen: true, colId }), []);
  
  const handleDeleteColumn = useCallback(() => {
    if (!deleteColumnModal.colId) return;
    const tasksInColumn = tasks.filter(t => t.status === deleteColumnModal.colId);
    
    if (tasksInColumn.length > 0) {
      alert(`Нельзя удалить колонку. В ней ${tasksInColumn.length} задач.`);
      return; 
    }

    setColumns((prev) => prev.filter(c => c.id !== deleteColumnModal.colId));
    setDeleteColumnModal({ isOpen: false, colId: null });
  }, [deleteColumnModal.colId, tasks]);

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
      // ПРОВЕРКА ЦИКЛОВ
      if (taskModal.editingTask) {
        // Проверка: нельзя назначить родителем своего потомка
        if (taskData.parentId) {
            let checkId: string | undefined = taskData.parentId;
            while(checkId) {
                const parent = prev.find(p => p.id === checkId);
                if (parent?.id === taskModal.editingTask?.id) {
                    alert("Ошибка: Циклическая зависимость!");
                    return prev;
                }
                checkId = parent?.parentId;
            }
        }
        return prev.map((t) => t.id === taskModal.editingTask!.id ? { ...t, ...taskData } : t);
      }
      // NEW TASK
      const newTask: ITaskData = {
        id: nanoid(),
        title: taskData.title!, description: taskData.description, status: taskData.status!,
        priority: taskData.priority || 'low', deadline: taskData.deadline, username: taskData.username, parentId: taskData.parentId,
      };
      return [...prev, newTask];
    });
    setTaskModal(prev => ({ ...prev, isOpen: false }));
  }, [taskModal.editingTask]);

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
    handleSaveTask, handleDeleteColumn, 
    openSubtaskModal, openEditTaskModal,
    handleCreateColumn, handleRenameColumn, confirmDeleteColumn, handleSetDoneColumn, openNewTaskModal,
    handleDragStart, handleDragOver, handleDrop
  };
};