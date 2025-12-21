import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { ITaskData, ColumnData } from "../types/modules";
import { initialColumns, sampleTasks } from "../data/mockData";
import { nanoid } from "nanoid";

interface KanbanContextType {
  // Данные Канбан
  kanbanTasks: ITaskData[];
  setKanbanTasks: React.Dispatch<React.SetStateAction<ITaskData[]>>;
  columns: ColumnData[];
  setColumns: React.Dispatch<React.SetStateAction<ColumnData[]>>;
  
  // Данные MindMap (для рассинхрона)
  mindMapTasks: ITaskData[];
  setMindMapTasks: React.Dispatch<React.SetStateAction<ITaskData[]>>;
  
  // Состояние синхронизации
  isSynced: boolean;
  toggleSync: () => void;
  
  // Видимость MindMap (для открытия по кнопке)
  isMindMapVisible: boolean;
  setMindMapVisible: (v: boolean) => void;
  
  // Глобальные действия
  updateTasks: (newTasks: ITaskData[] | ((prev: ITaskData[]) => ITaskData[]), source: 'kanban' | 'mindmap') => void;
}

const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

export const KanbanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [kanbanTasks, setKanbanTasks] = useState<ITaskData[]>(sampleTasks);
  const [mindMapTasks, setMindMapTasks] = useState<ITaskData[]>([]); // Изначально пустой, если не синхронизирован
  const [columns, setColumns] = useState<ColumnData[]>(initialColumns);
  
  const [isSynced, setIsSynced] = useState(false);
  const [isMindMapVisible, setMindMapVisible] = useState(false);

  const toggleSync = useCallback(() => {
    setIsSynced(prev => {
      const nextState = !prev;
      if (nextState) {
        // ВКЛЮЧЕНИЕ СИНХРОНИЗАЦИИ:
        // MindMap получает данные Канбана (или объединяем, но по ТЗ берем с канбана)
        setMindMapTasks([...kanbanTasks]);
        setMindMapVisible(true); // Показываем виджет, если он был скрыт
      } else {
        // ВЫКЛЮЧЕНИЕ СИНХРОНИЗАЦИИ:
        // Данные расходятся, теперь они независимы
      }
      return nextState;
    });
  }, [kanbanTasks]);

  // Умное обновление задач в зависимости от источника и режима синхронизации
  const updateTasks = useCallback((
    newTasksInput: ITaskData[] | ((prev: ITaskData[]) => ITaskData[]), 
    source: 'kanban' | 'mindmap'
  ) => {
    if (isSynced) {
      // Если синхронизированы, обновляем ОБА состояния
      setKanbanTasks(prev => {
        const result = typeof newTasksInput === 'function' ? newTasksInput(prev) : newTasksInput;
        setMindMapTasks(result); // Синхронное обновление
        return result;
      });
    } else {
      // Если НЕ синхронизированы, обновляем только источник
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
      columns, setColumns,
      mindMapTasks, setMindMapTasks,
      isSynced, toggleSync,
      isMindMapVisible, setMindMapVisible,
      updateTasks
    }}>
      {children}
    </KanbanContext.Provider>
  );
};

export const useKanbanContext = () => {
  const context = useContext(KanbanContext);
  if (!context) throw new Error("useKanbanContext must be used within a KanbanProvider");
  return context;
};