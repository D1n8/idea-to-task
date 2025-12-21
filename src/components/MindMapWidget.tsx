import React, { useMemo } from 'react';
import ReactDOM from "react-dom";
import { Plus, RefreshCw, X, AlertCircle } from 'lucide-react';
import type { ITaskData } from '../types/modules';
import { useKanbanBoard } from '../hooks/useKanbanBoard';
import TaskModal from './kanban/TaskModal';
import DeleteTaskModal from './kanban/DeleteTaskModal';

// Компонент одной ноды дерева
const MindMapItem = ({ 
  task, 
  allTasks, 
  level, 
  onEdit, 
  onAddChild 
}: { 
  task: ITaskData, 
  allTasks: ITaskData[], 
  level: number,
  onEdit: (t: ITaskData) => void,
  onAddChild: (id: string) => void
}) => {
  const children = allTasks.filter(t => t.parentId === task.id);
  const isExpired = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done'; // упрощенная проверка статуса

  return (
    <div className="flex flex-col items-center relative">
      {/* Карточка задачи */}
      <div 
        className={`
          relative z-10 w-48 p-3 rounded-xl border-2 shadow-sm bg-white cursor-pointer hover:shadow-md transition-all
          ${isExpired ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-indigo-400'}
        `}
        onClick={() => onEdit(task)}
      >
        <div className="flex justify-between items-start mb-2">
            {task.priority ? (
                <div className={`h-1.5 w-6 rounded-full ${
                    task.priority === 'high' ? 'bg-red-500' : 
                    task.priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
                }`} />
            ) : <div className="h-1.5 w-6 rounded-full bg-slate-200" />}
            {isExpired && <AlertCircle size={12} className="text-red-500" />}
        </div>
        <h4 className="text-sm font-bold text-slate-700 truncate text-center">{task.title}</h4>
        
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50">
           <span className="text-[9px] text-slate-400 font-mono">#{task.id.slice(0,4)}</span>
           <button 
             onClick={(e) => { e.stopPropagation(); onAddChild(task.id); }}
             className="w-5 h-5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600 flex items-center justify-center transition-colors"
           >
             <Plus size={12} />
           </button>
        </div>
      </div>

      {/* Рендеринг детей и линий */}
      {children.length > 0 && (
        <div className="flex pt-8 gap-4 relative">
            {/* Вертикальная линия от родителя вниз */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-slate-300" />
            
            {/* Горизонтальная линия, соединяющая детей */}
            {children.length > 1 && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 h-0.5 bg-slate-300" 
                     style={{ width: `calc(100% - 12rem)` }} // Примерный расчет ширины
                /> 
            )}

            {children.map((child, idx) => (
               <div key={child.id} className="flex flex-col items-center relative">
                  {/* Соединитель для каждого ребенка */}
                   <div className="w-0.5 h-4 bg-slate-300 mb-0" />
                   {/* Рекурсивный вызов */}
                   <MindMapItem 
                     task={child} 
                     allTasks={allTasks} 
                     level={level + 1} 
                     onEdit={onEdit}
                     onAddChild={onAddChild}
                   />
               </div>
            ))}
        </div>
      )}
    </div>
  );
};

export const MindMapWidget: React.FC = () => {
  // Используем контекст с источником 'mindmap'
  const {
    tasks, columns,
    taskModal, setTaskModal,
    deleteTaskModal, setDeleteTaskModal,
    handleSaveTask, handleDeleteTask,
    openNewTaskModal, openEditTaskModal, openSubtaskModal, openDeleteTaskModal,
    isSynced, toggleSync, setMindMapVisible
  } = useKanbanBoard('mindmap');

  const rootTasks = useMemo(() => tasks.filter(t => !t.parentId), [tasks]);

  return (
    <div className="h-full flex flex-col bg-slate-50 font-sans relative overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center shadow-sm z-20">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            Mind Map
            {isSynced && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">Synced</span>}
        </h2>
        <div className="flex gap-2">
            <button 
                onClick={toggleSync}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    isSynced 
                    ? 'bg-green-500 text-white hover:bg-green-600 shadow-green-200 shadow-md' 
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
            >
                <RefreshCw size={14} className={isSynced ? "animate-spin-slow" : ""} />
                {isSynced ? "Синхронизировано" : "Синхронизировать"}
            </button>
            <button 
                onClick={() => setMindMapVisible(false)}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Закрыть виджет"
            >
                <X size={18} />
            </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto p-10 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]">
         <div className="flex justify-center gap-16 min-w-max">
            {rootTasks.map(root => (
                <MindMapItem 
                    key={root.id} 
                    task={root} 
                    allTasks={tasks} 
                    level={0} 
                    onEdit={openEditTaskModal}
                    onAddChild={openSubtaskModal}
                />
            ))}
            
            {/* Кнопка создания корневой задачи */}
            <div className="flex flex-col items-center justify-start pt-0">
                <button 
                    onClick={() => openNewTaskModal('todo')}
                    className="w-48 h-12 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-white transition-all flex items-center justify-center gap-2 font-bold text-sm"
                >
                    <Plus size={16} /> Новая ветка
                </button>
            </div>
         </div>
      </div>

      {/* Modals */}
      {taskModal.isOpen && ReactDOM.createPortal(
        <TaskModal 
            isOpen={taskModal.isOpen}
            onClose={() => setTaskModal(prev => ({ ...prev, isOpen: false }))}
            editingTask={taskModal.editingTask}
            initialStatus={taskModal.status}
            initialParentId={taskModal.parentId}
            columns={columns} // Колонки нужны для статуса, даже в MindMap
            allTasks={tasks}
            users={['Иван Иванов', 'Анна Смирнова']} // Можно прокинуть пропсом, тут хардкод для примера
            onSave={handleSaveTask}
            onOpenParent={(pid) => { const p = tasks.find(t => t.id === pid); if(p) openEditTaskModal(p); }}
            onAddSubtask={openSubtaskModal}
            onEditSubtask={openEditTaskModal}
            onDelete={openDeleteTaskModal} 
        />, document.body
      )}

       {deleteTaskModal.isOpen && ReactDOM.createPortal(
        <DeleteTaskModal
            isOpen={deleteTaskModal.isOpen}
            onClose={() => setDeleteTaskModal({ isOpen: false, taskId: null })}
            onConfirm={handleDeleteTask}
            subtaskCount={tasks.filter(t => t.parentId === deleteTaskModal.taskId).length}
        />, document.body
      )}
    </div>
  );
};