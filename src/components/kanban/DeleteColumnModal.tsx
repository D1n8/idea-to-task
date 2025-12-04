import React from "react";
import Modal from "../ui/Modal";

interface DeleteColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskCount: number;
}

const DeleteColumnModal: React.FC<DeleteColumnModalProps> = ({ isOpen, onClose, onConfirm, taskCount }) => {
  return (
    <Modal open={isOpen} title="Удаление колонки" onClose={onClose}>
      <div style={{ paddingBottom: 16 }}>
        <p>Вы уверены, что хотите удалить эту колонку?</p>
        <p style={{ color: '#ef4444', fontSize: 14 }}>
          Все задачи ({taskCount}) внутри этой колонки будут удалены.
        </p>
      </div>
      <div className="modal-actions">
        <button onClick={onClose}>Отмена</button>
        <button onClick={onConfirm} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}>
          Удалить
        </button>
      </div>
    </Modal>
  );
};

export default DeleteColumnModal;