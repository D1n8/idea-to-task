import React, { useMemo } from 'react';
import ReactDOM from "react-dom";
import { Plus, RefreshCw, X, AlertCircle, Calendar, User, CheckCircle2 } from 'lucide-react';
import type { ITaskData, ColumnData } from '../types/modules';
import { useKanbanBoard } from '../hooks/useKanbanBoard';
import TaskModal from './modals/TaskModal';
import DeleteTaskModal from './modals/DeleteTaskModal';

const MindMapItem = ({ 
  task, 
  allTasks, 
  columns,
  onEdit, 
  onAddChild 
}: { 
  task: ITaskData, 
  allTasks: ITaskData[], 
  columns: ColumnData[],
  onEdit: (t: ITaskData) => void,
  onAddChild: (id: string) => void
}) => {
  const children = allTasks.filter(t => t.parentId === task.id);
  
  // 1. и 2. Логика статусов (Выполнено и Просрочено)
  const currentColumn = columns.find(c => c.id === task.status);
  const isDone = currentColumn?.isDoneColumn;
  const isExpired = task.deadline && new Date(task.deadline) < new Date() && !isDone;

  // Стили карточки
  let borderClass = 'border-slate-200 hover:border-indigo-400';
  let bgClass = 'bg-white';
  
  if (isDone) {
      borderClass = 'border-green-400';
      bgClass = 'bg-green-50';
  } else if (isExpired) {
      borderClass = 'border-red-400';
      bgClass = 'bg-red-50';
  }

  return (
    <div className="flex flex-col items-center relative">
      <div 
        className={`
          relative z-10 w-56 p-3 rounded-xl border-2 shadow-sm cursor-pointer hover:shadow-md transition-all
          ${bgClass} ${borderClass}
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
            
            {isDone && <CheckCircle2 size={14} className="text-green-600" />}
            {isExpired && <AlertCircle size={14} className="text-red-500 animate-pulse" />}
        </div>
        
        <h4 className="text-sm font-bold text-slate-700 truncate text-center mb-2">{task.title}</h4>
        
        <div className="flex justify-between items-center text-[10px] text-slate-500 mb-2 px-1">
            {task.deadline ? (
                <div className="flex items-center gap-1">
                    <Calendar size={10} /> 
                    <span className={isExpired ? 'text-red-600 font-bold' : (isDone ? 'text-green-700 font-bold' : '')}>
                        {new Date(task.deadline).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                    </span>
                </div>
            ) : <span></span>}
            
            {task.username && (
                <div className="flex items-center gap-1 max-w-[80px]">
                    <User size={10} />
                    <span className="truncate">{task.username.split(' ')[0]}</span>
                </div>
            )}
        </div>

        <div className="flex justify-center mt-1 pt-2 border-t border-slate-200/50">
           <button 
             onClick={(e) => { e.stopPropagation(); onAddChild(task.id); }}
             className="w-full py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600 flex items-center justify-center gap-1 transition-colors text-[10px] font-bold"
           >
             <Plus size={10} /> Добавить подзадачу
           </button>
        </div>
      </div>

      {children.length > 0 && (
        <div className="flex pt-8 gap-6 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-slate-300" />
            {children.length > 1 && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 h-0.5 bg-slate-300" 
                     style={{ width: `calc(100% - 14rem)` }} 
                /> 
            )}
            {children.map((child) => (
               <div key={child.id} className="flex flex-col items-center relative">
                   <div className="w-0.5 h-4 bg-slate-300 mb-0" />
                   <MindMapItem 
                     task={child} 
                     allTasks={allTasks}
                     columns={columns}
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
  const {
    tasks, columns, users, // <--- Достаем users
    taskModal, setTaskModal,
    deleteTaskModal, setDeleteTaskModal,
    handleSaveTask, handleDeleteTask,
    openNewTaskModal, openEditTaskModal, openSubtaskModal, openDeleteTaskModal,
    isSynced, toggleSync, setMindMapVisible
  } = useKanbanBoard('mindmap');

  const rootTasks = useMemo(() => tasks.filter(t => !t.parentId), [tasks]);

  return (
    <div className="h-full flex flex-col bg-slate-50 font-sans relative overflow-hidden rounded-2xl">
      <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center shadow-sm z-20 cursor-move">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            Mind Map
            {isSynced && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">Synced</span>}
        </h2>
        
        <div className="flex gap-2 nodrag">
            <button 
                onClick={toggleSync}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    isSynced 
                    ? 'bg-green-500 text-white hover:bg-green-600 shadow-green-200 shadow-md' 
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
            >
                <RefreshCw size={14} className={isSynced ? "animate-spin-slow" : ""} />
                {isSynced ? "Synced" : "Sync"}
            </button>
            <button 
                onClick={() => setMindMapVisible(false)}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
                <X size={18} />
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-10 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] nodrag cursor-default">
         <div className="flex justify-center gap-16 min-w-max">
            {rootTasks.map(root => (
                <MindMapItem 
                    key={root.id} 
                    task={root} 
                    allTasks={tasks}
                    columns={columns}
                    onEdit={openEditTaskModal}
                    onAddChild={openSubtaskModal}
                />
            ))}
            
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

      {taskModal.isOpen && ReactDOM.createPortal(
        <TaskModal 
            isOpen={taskModal.isOpen}
            onClose={() => setTaskModal(prev => ({ ...prev, isOpen: false }))}
            editingTask={taskModal.editingTask}
            initialStatus={taskModal.status}
            initialParentId={taskModal.parentId}
            columns={columns}
            allTasks={tasks}
            users={users} 
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