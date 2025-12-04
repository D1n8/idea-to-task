import React, { useState, useEffect } from "react";
import Modal from "../ui/Modal";

interface DeleteTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deleteSubtasks: boolean) => void;
  subtaskCount: number; // Количество подзадач, чтобы знать, показывать ли чекбокс
}

const DeleteTaskModal: React.FC<DeleteTaskModalProps> = ({ isOpen, onClose, onConfirm, subtaskCount }) => {
  const [deleteSubtasks, setDeleteSubtasks] = useState(false);

  // Сбрасываем чекбокс при открытии
  useEffect(() => {
    if (isOpen) setDeleteSubtasks(false);
  }, [isOpen]);

  return (
    <Modal open={isOpen} title="Удаление задачи" onClose={onClose}>
      <div style={{ paddingBottom: 16 }}>
        <p>Вы уверены, что хотите удалить эту задачу?</p>
        
        {subtaskCount > 0 ? (
          <div style={{ marginTop: 16, background: '#fff1f2', padding: 12, borderRadius: 6, border: '1px solid #fecdd3' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: 14, color: '#be123c' }}>
              У этой задачи есть <strong>{subtaskCount} подзадач(и)</strong>.
            </p>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
              <input 
                type="checkbox" 
                checked={deleteSubtasks} 
                onChange={(e) => setDeleteSubtasks(e.target.checked)}
                style={{ width: 16, height: 16, cursor: 'pointer' }}
              />
              Удалить также все подзадачи
            </label>
            {!deleteSubtasks && (
               <p style={{ fontSize: 12, color: '#666', marginTop: 4, marginLeft: 24 }}>
                 * Если не отметить, у подзадач пропадет родитель.
               </p>
            )}
          </div>
        ) : (
          <p style={{ fontSize: 14, color: '#666' }}>Это действие необратимо.</p>
        )}
      </div>

      <div className="modal-actions">
        <button onClick={onClose}>Отмена</button>
        <button 
          onClick={() => onConfirm(deleteSubtasks)} 
          style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}
        >
          Удалить
        </button>
      </div>
    </Modal>
  );
};

export default DeleteTaskModal;