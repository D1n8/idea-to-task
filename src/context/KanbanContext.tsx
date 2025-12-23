import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { ITaskData, ColumnData } from "../types/modules";
import { initialColumns, sampleTasks } from "../data/mockData";

interface KanbanContextType {
  kanbanTasks: ITaskData[];
  setKanbanTasks: React.Dispatch<React.SetStateAction<ITaskData[]>>;
  mindMapTasks: ITaskData[];
  setMindMapTasks: React.Dispatch<React.SetStateAction<ITaskData[]>>;
  columns: ColumnData[];
  setColumns: React.Dispatch<React.SetStateAction<ColumnData[]>>;
  
  isSynced: boolean;
  toggleSync: () => void;
  isMindMapVisible: boolean;
  setMindMapVisible: (v: boolean) => void;
  
  // Универсальные методы изменения данных
  updateTaskInStore: (task: ITaskData, source: 'kanban' | 'mindmap') => void;
  addTaskToStore: (task: ITaskData, source: 'kanban' | 'mindmap') => void;
  deleteTaskFromStore: (taskId: string, deleteSubtasks: boolean, source: 'kanban' | 'mindmap') => void;
}

const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

export const KanbanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 3. Общие моковые данные при инициализации
  const [kanbanTasks, setKanbanTasks] = useState<ITaskData[]>(sampleTasks);
  const [mindMapTasks, setMindMapTasks] = useState<ITaskData[]>([]); // Изначально пустой
  const [columns, setColumns] = useState<ColumnData[]>(initialColumns);
  
  const [isSynced, setIsSynced] = useState(false);
  const [isMindMapVisible, setMindMapVisible] = useState(false);

  // 2. Исправленная логика переключения синхронизации
  const toggleSync = useCallback(() => {
    setIsSynced(prev => {
      const nextState = !prev;
      if (nextState) {
        // ВКЛЮЧЕНИЕ: Mind Map полностью копирует состояние Канбана (Master -> Slave)
        // Это решает проблему "задача создалась на канбан, но не в mind map"
        setMindMapTasks([...kanbanTasks]);
        setMindMapVisible(true);
      } else {
        // ВЫКЛЮЧЕНИЕ: Они продолжают жить с текущими данными, но раздельно
      }
      return nextState;
    });
  }, [kanbanTasks]);

  // Хелпер для обновления списков
  const updateList = (list: ITaskData[], newTask: ITaskData) => {
    return list.map(t => t.id === newTask.id ? newTask : t);
  };

  const updateTaskInStore = useCallback((updatedTask: ITaskData, source: 'kanban' | 'mindmap') => {
    if (isSynced) {
      // 9. Синхронное обновление предотвращает рассинхрон
      setKanbanTasks(prev => updateList(prev, updatedTask));
      setMindMapTasks(prev => updateList(prev, updatedTask));
    } else {
      if (source === 'kanban') setKanbanTasks(prev => updateList(prev, updatedTask));
      else setMindMapTasks(prev => updateList(prev, updatedTask));
    }
  }, [isSynced]);

  const addTaskToStore = useCallback((newTask: ITaskData, source: 'kanban' | 'mindmap') => {
    if (isSynced) {
      setKanbanTasks(prev => [...prev, newTask]);
      setMindMapTasks(prev => [...prev, newTask]);
    } else {
      if (source === 'kanban') setKanbanTasks(prev => [...prev, newTask]);
      else setMindMapTasks(prev => [...prev, newTask]);
    }
  }, [isSynced]);

  const deleteTaskFromStore = useCallback((taskId: string, deleteSubtasks: boolean, source: 'kanban' | 'mindmap') => {
    const filterFn = (list: ITaskData[]) => {
      let newList = list.filter(t => t.id !== taskId);
      if (deleteSubtasks) {
        newList = newList.filter(t => t.parentId !== taskId);
      } else {
        newList = newList.map(t => t.parentId === taskId ? { ...t, parentId: undefined } : t);
      }
      return newList;
    };

    if (isSynced) {
      setKanbanTasks(prev => filterFn(prev));
      setMindMapTasks(prev => filterFn(prev));
    } else {
      if (source === 'kanban') setKanbanTasks(prev => filterFn(prev));
      else setMindMapTasks(prev => filterFn(prev));
    }
  }, [isSynced]);

  return (
    <KanbanContext.Provider value={{
      kanbanTasks, setKanbanTasks,
      mindMapTasks, setMindMapTasks,
      columns, setColumns,
      isSynced, toggleSync,
      isMindMapVisible, setMindMapVisible,
      updateTaskInStore, addTaskToStore, deleteTaskFromStore
    }}>
      {children}
    </KanbanContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useKanbanContext = () => {
  const context = useContext(KanbanContext);
  if (!context) throw new Error("useKanbanContext must be used within a KanbanProvider");
  return context;
};