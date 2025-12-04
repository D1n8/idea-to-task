import React, { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import { EditableField } from "../ui/EditableField";
import SubtaskList from "./SubtaskList";
import type { ITaskData, ColumnData, Priority } from "../../types/modules";

const AVAILABLE_USERS = [
  { id: 'u1', name: 'Иван Иванов' },
  { id: 'u2', name: 'Мария Петрова' },
  { id: 'u3', name: 'Алексей Сидоров' },
  { id: 'u4', name: 'Елена Смирнова' },
];

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Данные для редактирования или создания
  editingTask: ITaskData | null;
  initialStatus: string;
  initialParentId?: string;
  
  // Данные окружения
  columns: ColumnData[];
  allTasks: ITaskData[];
  
  // Действия
  onSave: (task: Partial<ITaskData>) => void;
  onOpenParent: (parentId: string) => void;
  onAddSubtask: (parentId: string) => void;
  onEditSubtask: (task: ITaskData) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen, onClose, editingTask, initialStatus, initialParentId,
  columns, allTasks, onSave, onOpenParent, onAddSubtask, onEditSubtask
}) => {
  // Локальный стейт формы
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState<Priority | "none">("none");
  const [deadline, setDeadline] = useState("");
  const [user, setUser] = useState("");
  const [parentId, setParentId] = useState<string | undefined>(undefined);

  // Синхронизация при открытии
  useEffect(() => {
    if (isOpen) {
      if (editingTask) {
        setTitle(editingTask.title);
        setDesc(editingTask.description || "");
        setStatus(editingTask.status);
        setPriority(editingTask.priority || "none");
        setDeadline(editingTask.deadline || "");
        setUser(editingTask.username || "");
        setParentId(editingTask.parentId);
      } else {
        // Режим создания
        setTitle("");
        setDesc("");
        setStatus(initialStatus);
        setPriority("none");
        setDeadline("");
        setUser("");
        setParentId(initialParentId);
      }
    }
  }, [isOpen, editingTask, initialStatus, initialParentId]);

  const handleSave = () => {
    const taskData: Partial<ITaskData> = {
      title,
      description: desc,
      status,
      priority: priority === "none" ? undefined : priority,
      deadline: deadline || undefined,
      username: user || undefined,
      // Предотвращаем цикличность
      parentId: (editingTask && parentId === editingTask.id) ? undefined : parentId
    };
    onSave(taskData);
  };

  const parentTaskTitle = parentId ? allTasks.find(t => t.id === parentId)?.title : null;

  return (
    <Modal
      open={isOpen}
      title={editingTask ? "Детали задачи" : "Новая задача"}
      onClose={onClose}
    >
      <div className="modal-body">
        {/* Родительский блок */}
        {parentId && (
          <div style={{ padding: '10px 15px', border: '1px solid #3b82f6', borderRadius: 8, background: '#eff6ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontWeight: 500, color: '#1d4ed8', fontSize: 14 }}>
              Подзадача для: <strong>{parentTaskTitle || 'Неизвестная задача'}</strong>
            </span>
            <button 
              onClick={() => onOpenParent(parentId)}
              style={{ border: 'none', background: '#3b82f6', color: 'white', padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}
            >
              Открыть родителя
            </button>
          </div>
        )}

        <div>
          <label style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4, display: 'block' }}>Название</label>
          <EditableField value={title} onChange={setTitle} placeholder="Введите название..." fontSize="24px" fontWeight="600" />
        </div>

        <div>
          <label style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4, display: 'block' }}>Описание</label>
          <EditableField value={desc} onChange={setDesc} placeholder="Добавить описание..." isTextarea={true} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, background: '#f9fafb', padding: 16, borderRadius: 8 }}>
          <div>
            <label style={{ fontSize: 12, color: '#666', marginBottom: 4, display: 'block' }}>Статус</label>
            <select className="modal-input" value={status} onChange={(e) => setStatus(e.target.value)}>
              {columns.map(col => (<option key={col.id} value={col.id}>{col.title}</option>))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, color: '#666', marginBottom: 4, display: 'block' }}>Приоритет</label>
            <select className="modal-input" value={priority} onChange={(e) => setPriority(e.target.value as Priority | "none")}>
              <option value="none">Нет приоритета</option>
              <option value="highest">Highest (🔴)</option>
              <option value="high">High (🟠)</option>
              <option value="medium">Medium (🟡)</option>
              <option value="low">Low (🔵)</option>
              <option value="lowest">Lowest (🟢)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, color: '#666', marginBottom: 4, display: 'block' }}>Дедлайн</label>
            <input type="date" className="modal-input" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>

          <div>
            <label style={{ fontSize: 12, color: '#666', marginBottom: 4, display: 'block' }}>Ответственный</label>
            <select className="modal-input" value={user} onChange={(e) => setUser(e.target.value)}>
              <option value="">Не назначен</option>
              {AVAILABLE_USERS.map(u => (<option key={u.id} value={u.name}>{u.name}</option>))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, color: '#666', marginBottom: 4, display: 'block' }}>Родительская задача</label>
            <select className="modal-input" value={parentId || ""} onChange={(e) => setParentId(e.target.value || undefined)}>
              <option value="">Нет родителя</option>
              {allTasks
                .filter(t => t.id !== editingTask?.id)
                .map(t => (<option key={t.id} value={t.id}>{t.title}</option>))}
            </select>
          </div>
        </div>

        {editingTask && (
          <SubtaskList 
            parentId={editingTask.id} 
            tasks={allTasks} 
            openEditModal={onEditSubtask} 
            openAddSubtaskModal={onAddSubtask} 
          />
        )}
      </div>

      <div className="modal-actions">
        <button onClick={onClose}>Отмена</button>
        <button onClick={handleSave} disabled={!title} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
          {editingTask ? "Сохранить изменения" : "Создать задачу"}
        </button>
      </div>
    </Modal>
  );
};

export default TaskModal;