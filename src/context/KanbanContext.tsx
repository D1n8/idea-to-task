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
  
  updateTasks: (newTasks: ITaskData[] | ((prev: ITaskData[]) => ITaskData[]), source: 'kanban' | 'mindmap') => void;
}

const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

export const KanbanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Единый источник данных для обоих виджетов при старте
  const [kanbanTasks, setKanbanTasks] = useState<ITaskData[]>(sampleTasks);
  const [mindMapTasks, setMindMapTasks] = useState<ITaskData[]>([]); 
  const [columns, setColumns] = useState<ColumnData[]>(initialColumns);
  
  const [isSynced, setIsSynced] = useState(false);
  const [isMindMapVisible, setMindMapVisible] = useState(false);

  const toggleSync = useCallback(() => {
    setIsSynced(prev => {
      const nextState = !prev;
      if (nextState) {
        // При включении синхронизации MindMap получает данные Канбана
        setMindMapTasks([...kanbanTasks]);
        setMindMapVisible(true);
      }
      return nextState;
    });
  }, [kanbanTasks]);

  const updateTasks = useCallback((
    newTasksInput: ITaskData[] | ((prev: ITaskData[]) => ITaskData[]), 
    source: 'kanban' | 'mindmap'
  ) => {
    if (isSynced) {
      // Обновляем оба состояния синхронно
      setKanbanTasks(prev => {
        const result = typeof newTasksInput === 'function' ? newTasksInput(prev) : newTasksInput;
        setMindMapTasks(result);
        return result;
      });
    } else {
      // Обновляем только источник действия
      if (source === 'kanban') {
        setKanbanTasks(newTasksInput);
      } else {
        setMindMapTasks(newTasksInput);
      }
    }
  }, [isSynced]);

  return (
    <KanbanContext.Provider value={{
      kanbanTasks, setKanbanTasks,
      mindMapTasks, setMindMapTasks,
      columns, setColumns,
      isSynced, toggleSync,
      isMindMapVisible, setMindMapVisible,
      updateTasks
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