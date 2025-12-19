import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Plus, MoreVertical } from 'lucide-react';

import TaskModal from "./kanban/TaskModal";
import DeleteColumnModal from "./kanban/DeleteColumnModal";
import DeleteTaskModal from "./kanban/DeleteTaskModal"; 
import { useKanbanBoard } from "../hooks/useKanbanBoard";
import { AVAILABLE_USERS } from "../data/mockData";
import { getPriorityWeight } from "../utils/kanbanUtils";

export const KanbanBoardWidget: React.FC = () => {
  const {
    columns,
    tasks,
    taskModal,
    setTaskModal,
    deleteColumnModal,
    setDeleteColumnModal,
    deleteTaskModal, 
    setDeleteTaskModal,
    handleDeleteTask,
    openDeleteTaskModal,
    handleSaveTask,
    handleDeleteColumn,
    openSubtaskModal,
    openEditTaskModal,
    handleCreateColumn,
    handleRenameColumn,
    confirmDeleteColumn,
    handleSetDoneColumn,
    openNewTaskModal,
    handleDragStart,
    handleDragOver,
    handleDrop
  } = useKanbanBoard();

  const tasksInColumnToDelete = deleteColumnModal.colId 
    ? tasks.filter(t => t.status === deleteColumnModal.colId).length 
    : 0;

  const subtasksCount = deleteTaskModal.taskId
    ? tasks.filter(t => t.parentId === deleteTaskModal.taskId).length
    : 0;

  return (
    <div className="kanban-widget-container">
      <div className="kanban-header">
        <h2 className="kanban-title">Доска задач</h2>
        <button className="add-column-btn" onClick={handleCreateColumn}>
          <Plus size={16} /> Добавить колонку
        </button>
      </div>

      <div className="kanban-columns-wrapper">
        {columns.map((col) => {
          const colTasks = tasks.filter(t => t.status === col.id)
            .sort((a, b) => getPriorityWeight(b.priority) - getPriorityWeight(a.priority));

          return (
            <div 
              key={col.id} 
              className="kanban-column"
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

              <div className="kanban-task-list">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="kanban-task-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => openEditTaskModal(task)}
                  >
                    <div className="task-header">
                      <span className="task-title">{task.title}</span>
                      {task.priority && (
                        <span className={`priority-badge priority-${task.priority}`} />
                      )}
                    </div>
                    {task.description && (
                      <p className="task-desc">{task.description}</p>
                    )}
                    {task.parentId && (
                      <div className="task-parent-badge">
                         ↳ Подзадача
                      </div>
                    )}
                    <div className="task-footer">
                        {task.username && <div className="user-avatar">{task.username[0]}</div>}
                        {task.deadline && <span className="task-date">{new Date(task.deadline).toLocaleDateString()}</span>}
                    </div>
                  </div>
                ))}
              </div>

              <button className="add-task-btn" onClick={() => openNewTaskModal(col.id)}>
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ColumnHeader = ({ col, onRename, onDelete, onSetDone, taskCount }: any) => {
    const [isEditing, setIsEditing] = useState(col.isEditing);
    const [title, setTitle] = useState(col.title);
    const [menuOpen, setMenuOpen] = useState(false);

    const handleRename = () => {
        setIsEditing(false);
        if (title.trim() && title !== col.title) onRename(col.id, title);
    };

    return (
        <div className="column-header">
            {isEditing ? (
                <input 
                    autoFocus
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    onBlur={handleRename}
                    onKeyDown={e => e.key === 'Enter' && handleRename()}
                    className="column-title-input"
                />
            ) : (
                <div className="column-title-wrapper">
                    {col.isDoneColumn && <span className="done-icon">✓</span>}
                    <span onDoubleClick={() => setIsEditing(true)} className="column-title">
                        {col.title} <span className="task-count">{taskCount}</span>
                    </span>
                </div>
            )}
            
            <div className="relative">
                <button className="column-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
                    <MoreVertical size={16} />
                </button>
                {menuOpen && (
                    <>
                        <div className="fixed inset-0" onClick={() => setMenuOpen(false)} />
                        <div className="column-dropdown">
                            <button onClick={() => { setIsEditing(true); setMenuOpen(false); }}>Переименовать</button>
                            <button onClick={() => { onSetDone(col.id); setMenuOpen(false); }}>Сделать завершающей</button>
                            <button className="delete-btn" onClick={() => { onDelete(col.id); setMenuOpen(false); }}>Удалить</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};