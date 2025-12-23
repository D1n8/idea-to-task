import React from "react";
import ReactDOM from "react-dom";
import { Plus, MoreVertical, Calendar, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

import TaskModal from "./kanban/TaskModal";
import DeleteColumnModal from "./kanban/DeleteColumnModal";
import DeleteTaskModal from "./kanban/DeleteTaskModal"; 
import { useKanbanBoard } from "../hooks/useKanbanBoard";
import { AVAILABLE_USERS } from "../data/mockData";
import { getPriorityWeight } from "../utils/kanbanUtils";

export const KanbanBoardWidget: React.FC = () => {
  const {
    columns, tasks, taskModal, setTaskModal, deleteColumnModal, setDeleteColumnModal,
    deleteTaskModal, setDeleteTaskModal, handleDeleteTask, openDeleteTaskModal,
    handleSaveTask, handleDeleteColumn, openSubtaskModal, openEditTaskModal,
    handleCreateColumn, handleRenameColumn, confirmDeleteColumn, handleSetDoneColumn,
    openNewTaskModal, handleDragStart, handleDragOver, handleDrop,
    isSynced, toggleSync
  } = useKanbanBoard('kanban');

  const tasksInColumnToDelete = deleteColumnModal.colId 
    ? tasks.filter(t => t.status === deleteColumnModal.colId).length 
    : 0;

  const subtasksCount = deleteTaskModal.taskId
    ? tasks.filter(t => t.parentId === deleteTaskModal.taskId).length
    : 0;

  return (
    <div className="kanban-widget-container h-full flex flex-col font-sans text-slate-800">
      <div className="kanban-header flex justify-between items-center mb-6 px-4 py-2 border-b border-slate-200 bg-white cursor-move">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
          Задачи проекта
        </h2>
        
        <div className="flex gap-3 nodrag">
            <button 
                onClick={toggleSync}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all border ${
                    isSynced 
                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                    : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}
                title={isSynced ? "Отключить синхронизацию" : "Включить синхронизацию с Mind Map"}
            >
                <RefreshCw size={16} className={isSynced ? "animate-spin-slow" : ""} />
                {isSynced ? "Synced" : "Sync"}
            </button>

            <button 
            onClick={handleCreateColumn} 
            className="add-column-btn flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-semibold shadow-lg shadow-indigo-100 transition-all active:scale-95"
            >
            <Plus size={18} /> <span>Колонка</span>
            </button>
        </div>
      </div>

      <div className="kanban-columns-wrapper flex gap-6 overflow-x-auto pb-6 px-4 flex-1 items-start nodrag cursor-default">
        {columns.map((col) => {
          const colTasks = tasks.filter(t => t.status === col.id)
            .sort((a, b) => getPriorityWeight(b.priority) - getPriorityWeight(a.priority));

          return (
            <div 
              key={col.id} 
              className="kanban-column w-80 shrink-0 flex flex-col bg-slate-100/80 rounded-2xl border border-slate-200 shadow-sm max-h-full"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <ColumnHeader 
                col={col} 
                onRename={handleRenameColumn} 
                onDelete={confirmDeleteColumn}
                onSetDone={handleSetDoneColumn}
                taskCount={colTasks.length}
              />

              <div className="kanban-task-list p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar min-h-[50px]">
                {colTasks.map((task) => {
                  // 6. Исправленная логика Done и подсветки
                  const isColumnDone = columns.find(c => c.id === task.status)?.isDoneColumn;
                  const isExpired = task.deadline && new Date(task.deadline) < new Date() && !isColumnDone;
                  
                  return (
                    <div
                      key={task.id}
                      className={`kanban-task-card p-4 rounded-xl shadow-sm bg-white cursor-grab active:cursor-grabbing border-2 transition-all hover:shadow-md relative group
                        ${isExpired ? 'border-red-400 bg-red-50' : 'border-transparent hover:border-indigo-300'}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => openEditTaskModal(task)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        {task.priority ? (
                           <span className={`h-1.5 w-8 rounded-full ${
                             task.priority === 'high' ? 'bg-red-500' : 
                             task.priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
                           }`} />
                        ) : <span className="h-1.5 w-8 rounded-full bg-slate-200" />}
                        
                        {task.deadline && (
                          <div className={`text-[10px] font-bold flex items-center gap-1 ${isExpired ? 'text-red-600 animate-pulse' : 'text-slate-400'}`}>
                            {isExpired && <AlertCircle size={10} />}
                            <Calendar size={10} /> {new Date(task.deadline).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {/* 8. Троеточие при переполнении */}
                      <h4 className="text-sm font-bold text-slate-700 leading-snug mb-1 group-hover:text-indigo-700 transition-colors truncate" title={task.title}>
                        {task.title}
                      </h4>
                      
                      <div className="flex items-end justify-between mt-2">
                        {task.parentId && (
                          <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                             ↳ Подзадача
                          </span>
                        )}
                        {task.username && (
                           <div className="w-6 h-6 rounded-full bg-slate-200 text-[10px] flex items-center justify-center font-bold text-slate-600 border border-white shadow-sm ml-auto" title={task.username}>
                             {task.username[0]}
                           </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button className="add-task-btn p-3 text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 rounded-b-2xl transition-colors font-semibold text-sm flex items-center justify-center gap-2 border-t border-slate-200" onClick={() => openNewTaskModal(col.id)}>
                <Plus size={16} /> Добавить задачу
              </button>
            </div>
          );
        })}
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
            users={AVAILABLE_USERS}
            onSave={handleSaveTask}
            onOpenParent={(pid) => { const p = tasks.find(t => t.id === pid); if(p) openEditTaskModal(p); }}
            onAddSubtask={openSubtaskModal}
            onEditSubtask={openEditTaskModal}
            onDelete={openDeleteTaskModal} 
        />, document.body
      )}

      {deleteColumnModal.isOpen && ReactDOM.createPortal(
        <DeleteColumnModal 
            isOpen={deleteColumnModal.isOpen}
            onClose={() => setDeleteColumnModal({ isOpen: false, colId: null })}
            onConfirm={handleDeleteColumn}
            taskCount={tasksInColumnToDelete}
        />, document.body
      )}

      {deleteTaskModal.isOpen && ReactDOM.createPortal(
        <DeleteTaskModal
            isOpen={deleteTaskModal.isOpen}
            onClose={() => setDeleteTaskModal({ isOpen: false, taskId: null })}
            onConfirm={handleDeleteTask}
            subtaskCount={subtasksCount}
        />, document.body
      )}
    </div>
  );
};

const ColumnHeader = ({ col, onRename, onDelete, onSetDone, taskCount }: any) => {
    const [isEditing, setIsEditing] = React.useState(col.isEditing);
    const [title, setTitle] = React.useState(col.title);
    const [menuOpen, setMenuOpen] = React.useState(false);

    const handleRename = () => {
        setIsEditing(false);
        if (title.trim() && title !== col.title) onRename(col.id, title);
    };

    return (
        <div className="column-header p-4 flex justify-between items-center bg-white rounded-t-2xl border-b border-slate-200">
            {isEditing ? (
                <input 
                    autoFocus
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    onBlur={handleRename}
                    onKeyDown={e => e.key === 'Enter' && handleRename()}
                    className="w-full text-sm font-bold border-b-2 border-indigo-500 outline-none pb-1"
                />
            ) : (
                <div className="flex items-center gap-2">
                    {col.isDoneColumn && <CheckCircle2 size={16} className="text-emerald-500 font-bold" />}
                    <span onDoubleClick={() => setIsEditing(true)} className="font-bold text-slate-700 text-sm uppercase tracking-wide cursor-text">
                        {col.title}
                    </span>
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">{taskCount}</span>
                </div>
            )}
            
            <div className="relative">
                <button className="text-slate-400 hover:bg-slate-100 p-1 rounded-md transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
                    <MoreVertical size={16} />
                </button>
                {menuOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                            <button className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50" onClick={() => { setIsEditing(true); setMenuOpen(false); }}>Переименовать</button>
                            <button className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50" onClick={() => { onSetDone(col.id); setMenuOpen(false); }}>Сделать завершающей</button>
                            <div className="h-px bg-slate-100 my-1" />
                            <button className="w-full text-left px-4 py-2 text-xs font-semibold text-red-500 hover:bg-red-50" onClick={() => { onDelete(col.id); setMenuOpen(false); }}>Удалить</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};