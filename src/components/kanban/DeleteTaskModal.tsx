import React, { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deleteSubtasks: boolean) => void;
  subtaskCount: number;
}

const DeleteTaskModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, subtaskCount }) => {
  if (!isOpen) return null;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [deleteSubtasks, setDeleteSubtasks] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
        <h3 className="text-lg font-bold mb-4 text-red-600">Удаление задачи</h3>
        <p className="mb-4 text-gray-700">Вы уверены, что хотите удалить задачу?</p>
        
        {subtaskCount > 0 && (
          <div className="mb-6 p-3 bg-red-50 rounded border border-red-100">
            <p className="text-sm text-red-700 font-medium mb-2">У этой задачи есть {subtaskCount} подзадач.</p>
            <label className="flex items-center gap-2 cursor-pointer">
                <input 
                    type="checkbox" 
                    checked={deleteSubtasks} 
                    onChange={e => setDeleteSubtasks(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded"
                />
                <span className="text-sm text-gray-700">Удалить также и подзадачи?</span>
            </label>
          </div>
        )}
        
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Отмена</button>
          <button onClick={() => onConfirm(deleteSubtasks)} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Удалить</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteTaskModal;