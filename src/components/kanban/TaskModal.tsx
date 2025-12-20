import React, { useState, useEffect, useMemo } from "react";
import type { ITaskData, ColumnData } from "../../types/modules";
import { X, ArrowLeft, Calendar, History, User, AlertCircle, ArrowRight, ListTree, Plus, Link } from 'lucide-react';

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
  columns, allTasks, users, onSave, onOpenParent, onDelete, onEditSubtask, onAddSubtask 
}) => {
  const [formData, setFormData] = useState<Partial<ITaskData>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(editingTask || {
        title: "",
        description: "",
        status: initialStatus,
        priority: undefined,
        parentId: initialParentId,
        username: "",
        deadline: ""
      });
      setError(null);
    }
  }, [isOpen, editingTask, initialStatus, initialParentId]);

  // Фильтрация доступных родителей (исключаем себя и своих потомков, чтобы не было циклов)
  const availableParents = useMemo(() => {
    if (!editingTask) return allTasks;

    const isDescendant = (parentId: string, targetId: string): boolean => {
      if (parentId === targetId) return true;
      const children = allTasks.filter(t => t.parentId === parentId);
      return children.some(child => isDescendant(child.id, targetId));
    };

    return allTasks.filter(t => {
      // 1. Нельзя выбрать самого себя
      if (t.id === editingTask.id) return false;
      // 2. Нельзя выбрать своего потомка (проверка на цикл)
      if (isDescendant(editingTask.id, t.id)) return false;
      return true;
    });
  }, [allTasks, editingTask]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!formData.title?.trim()) {
      setError("У задачи должно быть название!");
      return;
    }
    onSave(formData);
  };

  const parentTask = allTasks.find(t => t.id === formData.parentId);
  const subtasks = editingTask ? allTasks.filter(t => t.parentId === editingTask.id) : [];

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[3000] p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-800">
              {editingTask ? "Редактирование задачи" : "Новая задача"}
            </h2>
            {/* Ссылка на родителя (если он есть) */}
            {parentTask && (
              <button 
                onClick={() => onOpenParent(parentTask.id)}
                className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline bg-blue-50 px-2 py-1 rounded transition-colors"
              >
                <ArrowLeft size={12} /> Родитель: {parentTask.title}
              </button>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-100 animate-bounce">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Заголовок */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Название задачи <span className="text-red-500">*</span></label>
            <input 
              autoFocus
              className={`w-full text-lg font-semibold border rounded-lg px-3 py-2 outline-none transition-all ${error ? 'border-red-300 bg-red-50/50' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'}`}
              placeholder="Введите название..."
              value={formData.title || ""}
              onChange={e => {setFormData({...formData, title: e.target.value}); setError(null)}}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Статус */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Колонка</label>
              <select 
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                {columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>

            {/* Выбор родителя */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Link size={12} /> Родительская задача
              </label>
              <select 
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={formData.parentId || ""}
                onChange={e => setFormData({...formData, parentId: e.target.value || undefined})}
              >
                <option value="">-- Нет --</option>
                {availableParents.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>

            {/* Дедлайн */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar size={12} /> Дедлайн
              </label>
              <input 
                type="date"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={formData.deadline || ""}
                onChange={e => setFormData({...formData, deadline: e.target.value})}
              />
            </div>

            {/* Приоритет */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Приоритет</label>
              <select 
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={formData.priority || ""} 
                onChange={e => setFormData({...formData, priority: e.target.value as any || undefined})}
              >
                <option value="">Без приоритета</option>
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </select>
            </div>

            {/* Исполнитель */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <User size={12} /> Исполнитель
              </label>
              <select 
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={formData.username || ""} 
                onChange={e => setFormData({...formData, username: e.target.value})}
              >
                <option value="">Без исполнителя</option>
                {users.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          {/* Описание */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Описание</label>
            <textarea 
              className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none min-h-[100px] resize-y"
              placeholder="Добавьте детали..."
              value={formData.description || ""}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* Подзадачи */}
          {editingTask && (
             <div className="pt-6 border-t border-slate-100">
               <div className="flex items-center justify-between mb-3">
                 <div className="flex items-center gap-2">
                   <ListTree size={14} className="text-slate-400" />
                   <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                     Подзадачи {subtasks.length > 0 && `(${subtasks.length})`}
                   </h4>
                 </div>
                 <button 
                    onClick={() => onAddSubtask(editingTask.id)}
                    className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                 >
                    <Plus size={12} /> Добавить
                 </button>
               </div>
               
               {subtasks.length > 0 ? (
                 <div className="grid gap-2">
                   {subtasks.map(sub => (
                     <div 
                       key={sub.id} 
                       onClick={() => onEditSubtask(sub)}
                       className="group flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-blue-200 rounded-lg cursor-pointer transition-all"
                     >
                        <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">{sub.title}</span>
                        <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-4 text-slate-400 text-xs italic bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                   Нет подзадач
                 </div>
               )}
             </div>
          )}

          {/* История изменений */}
          {editingTask && editingTask.history && (
             <div className="pt-6 border-t border-slate-100">
               <div className="flex items-center gap-2 mb-3">
                 <History size={14} className="text-slate-400" />
                 <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">История активности</h4>
               </div>
               <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                 <div className="text-xs text-slate-500 flex items-center gap-2 pl-2 border-l-2 border-green-300">
                    <span>Задача создана</span>
                    <span className="text-slate-400 text-[10px] ml-auto">{new Date(editingTask.createdAt).toLocaleString()}</span>
                 </div>
                 {[...editingTask.history].reverse().map((h, i) => {
                    if (h.action === "Задача создана") return null;
                    return (
                     <div key={i} className="text-xs text-slate-600 flex flex-col bg-slate-50 p-2 rounded border border-slate-100">
                       <span className="font-medium">{h.action}</span>
                       <span className="text-slate-400 text-[10px] mt-1 text-right">{new Date(h.updatedAt).toLocaleString()}</span>
                     </div>
                   );
                 })}
               </div>
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
           <div>
             {editingTask && (
               <button 
                 onClick={() => onDelete(editingTask.id)}
                 className="text-red-500 text-sm font-semibold hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
               >
                 Удалить
               </button>
             )}
           </div>
           <div className="flex gap-3">
             <button onClick={onClose} className="px-5 py-2 text-slate-600 font-semibold text-sm hover:bg-slate-200 rounded-lg transition-colors">Отмена</button>
             <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95">
               Сохранить
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;