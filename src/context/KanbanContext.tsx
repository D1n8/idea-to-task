import React, { createContext, useContext, useState, useCallback, type ReactNode, useEffect, useRef } from "react";
import type { ITaskData, ColumnData } from "../types/modules";
import { widgetEventBus, WidgetUpdateEvent } from "../utils/eventBus";

const API_BASE_URL = "http://85.234.22.160:1111";

interface KanbanContextType {
  kanbanTasks: ITaskData[];
  setKanbanTasks: React.Dispatch<React.SetStateAction<ITaskData[]>>;
  columns: ColumnData[];
  setColumns: React.Dispatch<React.SetStateAction<ColumnData[]>>;
  
  measures: { width: number; height: number };
  setMeasures: React.Dispatch<React.SetStateAction<{ width: number; height: number }>>;

  isLoading: boolean;
  saveError: string | null;
  widgetId: string | null;
  userId: number | null;
  role: string | null;
  
  isSynced: boolean;
  toggleSync: () => void;
  isMindMapVisible: boolean;
  setMindMapVisible: (v: boolean) => void;

  saveAllData: () => Promise<void>;
  addTaskToStore: (task: ITaskData, source: 'kanban' | 'mindmap') => void;
  updateTaskInStore: (task: ITaskData, source: 'kanban' | 'mindmap') => void;
  deleteTaskFromStore: (taskId: string, deleteSubtasks: boolean, source: 'kanban' | 'mindmap') => void;
  
  mindMapTasks: ITaskData[];
  setMindMapTasks: React.Dispatch<React.SetStateAction<ITaskData[]>>;
}

const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

export const KanbanProvider: React.FC<{ children: ReactNode; initialData?: any }> = ({ children, initialData }) => {
  const [widgetId, setWidgetId] = useState<string | null>(initialData?.widgetId ? String(initialData.widgetId) : null);
  const [userId, setUserId] = useState<number | null>(initialData?.userId || null);
  const [role, setRole] = useState<string | null>(initialData?.role || null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [baseConfig, setBaseConfig] = useState<Record<string, any>>(initialData?.config || {});

  const [kanbanTasks, setKanbanTasks] = useState<ITaskData[]>(initialData?.config?.tasks || []);
  const [mindMapTasks, setMindMapTasks] = useState<ITaskData[]>(initialData?.config?.tasks || []);
  const [columns, setColumns] = useState<ColumnData[]>(initialData?.config?.columns || [
    { id: "todo", title: "К выполнению", x: 0, y: 0, width: 300 }
  ]);

  const [measures, setMeasures] = useState<{ width: number; height: number }>({
    width: initialData?.config?.measures?.width || 1000,
    height: initialData?.config?.measures?.height || 600,
  });

  const [isSynced, setIsSynced] = useState(true);
  const [isMindMapVisible, setMindMapVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const widgetIdRef = useRef(widgetId);
  useEffect(() => { widgetIdRef.current = widgetId; }, [widgetId]);

  // --- СЛУШАЕМ СОБЫТИЯ ЧЕРЕЗ EVENT BUS ---
  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const event = e as WidgetUpdateEvent;
      const data = event.detail;
      
      const incomingId = String(data.widgetId);
      const currentId = widgetIdRef.current;

      if (!currentId || currentId === incomingId) {
          setWidgetId(incomingId);
          setUserId(data.userId);
          setRole(data.role);

          if (data.config) {
            // 2. ОБНОВЛЯЕМ БАЗОВЫЙ КОНФИГ ПРИ ВХОДЯЩЕМ ОБНОВЛЕНИИ
            setBaseConfig(data.config);

            if (data.config.tasks) {
                setKanbanTasks(data.config.tasks);
                setMindMapTasks(data.config.tasks);
            }
            if (data.config.columns) setColumns(data.config.columns);
            if (data.config.measures) setMeasures(data.config.measures);
          }
      }
    };

    widgetEventBus.addEventListener('widget-update', handleUpdate);
    
    return () => {
       widgetEventBus.removeEventListener('widget-update', handleUpdate);
    };
  }, []);

  const getSetters = (source: 'kanban' | 'mindmap') => {
    if (isSynced) return [setKanbanTasks, setMindMapTasks];
    return source === 'kanban' ? [setKanbanTasks] : [setMindMapTasks];
  };

  const addTaskToStore = useCallback((task: ITaskData, source: 'kanban' | 'mindmap') => {
    const setters = getSetters(source);
    setters.forEach(setter => setter(prev => [...prev, task]));
  }, [isSynced]);

  const updateTaskInStore = useCallback((updatedTask: ITaskData, source: 'kanban' | 'mindmap') => {
    const setters = getSetters(source);
    setters.forEach(setter => setter(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t)));
  }, [isSynced]);

  const deleteTaskFromStore = useCallback((taskId: string, deleteSubtasks: boolean, source: 'kanban' | 'mindmap') => {
    const setters = getSetters(source);
    setters.forEach(setter => setter(prev => {
      if (deleteSubtasks) return prev.filter(t => t.id !== taskId && t.parentId !== taskId);
      return prev.map(t => t.parentId === taskId ? { ...t, parentId: undefined } : t).filter(t => t.id !== taskId);
    }));
  }, [isSynced]);

  const toggleSync = useCallback(() => {
    setIsSynced(prev => {
      const next = !prev;
      if (next) setMindMapTasks([...kanbanTasks]);
      return next;
    });
  }, [kanbanTasks]);

  const saveAllData = useCallback(async () => {
    if (!widgetId) {
        setSaveError("ID виджета не найден");
        return;
    }
    
    setIsLoading(true);
    setSaveError(null);


    const configPayload = {
      ...baseConfig,
      tasks: kanbanTasks,
      columns: columns,
      measures: measures, 
      updatedAt: new Date().toISOString()
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/widget/${widgetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: configPayload })
      });
      
      console.log("Saving payload:", configPayload);

      if (!response.ok) throw new Error(`Status: ${response.status}`);
    } catch (e: any) {
      console.error(e);
      setSaveError(e.message || "Ошибка сети");
    } finally {
      setIsLoading(false);
    }
  }, [widgetId, baseConfig, kanbanTasks, columns, measures]);

  return (
    <KanbanContext.Provider value={{
      kanbanTasks, setKanbanTasks,
      mindMapTasks, setMindMapTasks,
      columns, setColumns,
      measures, setMeasures, 
      isLoading, saveError, widgetId, userId, role,
      saveAllData,
      isMindMapVisible, setMindMapVisible,
      isSynced, toggleSync,
      addTaskToStore, updateTaskInStore, deleteTaskFromStore
    }}>
      {children}
    </KanbanContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useKanbanContext = () => {
  const context = useContext(KanbanContext);
  if (!context) throw new Error("useKanbanContext error");
  return context;
};