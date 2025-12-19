import React from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskCount: number;
}

const DeleteColumnModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, taskCount }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
        <h3 className="text-lg font-bold mb-4 text-red-600">Удаление колонки</h3>
        {taskCount > 0 ? (
          <p className="mb-6 text-gray-700">
            В этой колонке есть <b>{taskCount}</b> задач. <br/>
            Сначала переместите или удалите их.
          </p>
        ) : (
          <p className="mb-6 text-gray-700">Вы уверены, что хотите удалить эту колонку?</p>
        )}
        
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Отмена</button>
          {taskCount === 0 && (
             <button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Удалить</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteColumnModal;