import React, { useState, useEffect } from "react";
import type { ITaskData, ColumnData } from "../../types/modules";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTask: ITaskData | null;
  initialStatus: string;
  initialParentId?: string;
  columns: ColumnData[];
  allTasks: ITaskData[];
  users: string[];
  onSave: (data: Partial<ITaskData>) => void;
  onOpenParent: (parentId: string) => void;
  onAddSubtask: (parentId: string) => void;
  onEditSubtask: (task: ITaskData) => void;
  onDelete: (taskId: string) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ 
  isOpen, onClose, editingTask, initialStatus, initialParentId, 
  columns, allTasks, users, onSave, onOpenParent, onAddSubtask, onEditSubtask, onDelete 
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<Partial<ITaskData>>({
    title: "", description: "", status: initialStatus, priority: "low", parentId: initialParentId, username: ""
  });

  useEffect(() => {
    if (editingTask) setFormData(editingTask);
    else setFormData({ title: "", description: "", status: initialStatus, priority: "low", parentId: initialParentId, username: users[0] || "" });
  }, [editingTask, initialStatus, initialParentId, users]);

  const handleSubmit = () => {
    if (!formData.title?.trim()) return;
    onSave(formData);
  };

  const subtasks = editingTask ? allTasks.filter(t => t.parentId === editingTask.id) : [];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xl font-bold text-gray-800">
            {editingTask ? "Редактирование задачи" : "Новая задача"}
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <span className="text-2xl leading-none">✕</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Заголовок</label>
            <input 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-700"
              placeholder="Введите название задачи..."
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Описание</label>
            <textarea 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-700 min-h-[100px]"
              placeholder="Добавьте описание задачи..."
              value={formData.description || ""} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Статус</label>
              <select 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-700 bg-white"
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                {columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Приоритет</label>
              <select 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-700 bg-white"
                value={formData.priority} 
                onChange={e => setFormData({...formData, priority: e.target.value as any})}
              >
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Исполнитель</label>
              <select 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-700 bg-white"
                value={formData.username || ""} 
                onChange={e => setFormData({...formData, username: e.target.value})}
              >
                <option value="">Без исполнителя</option>
                {users.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Родительская задача</label>
              <select 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-700 bg-white"
                value={formData.parentId || ""} 
                onChange={e => setFormData({...formData, parentId: e.target.value || undefined})}
              >
                <option value="">Нет</option>
                {allTasks.filter(t => !editingTask || t.id !== editingTask.id).map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          </div>

          {editingTask && subtasks.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Подзадачи ({subtasks.length})</p>
              <div className="grid gap-2">
                {subtasks.map(sub => (
                  <div 
                    key={sub.id} 
                    onClick={() => onEditSubtask(sub)} 
                    className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg cursor-pointer transition-colors text-sm text-gray-700 flex justify-between items-center"
                  >
                    <span>{sub.title}</span>
                    <span className="text-gray-400">→</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div>
            {editingTask && (
              <button 
                onClick={() => onDelete(editingTask.id)} 
                className="text-red-500 hover:text-red-700 font-medium transition-colors text-sm px-2 py-1"
              >
                Удалить задачу
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose} 
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 font-semibold hover:bg-gray-100 transition-colors"
            >
              Отмена
            </button>
            <button 
              onClick={handleSubmit} 
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95"
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;