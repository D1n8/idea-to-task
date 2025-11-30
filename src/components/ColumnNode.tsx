import React, { useState, useRef, useEffect } from "react";
import type { NodeProps } from "reactflow";
import type { ColumnData } from "../modules";

type ColumnNodeData = ColumnData & { 
  onAddTask: (colId: string) => void;
  onDelete: (colId: string) => void;
  onRename: (colId: string, newTitle: string) => void;
  onAddColumn: () => void;
  // Новые пропсы
  isMenuOpen: boolean;
  onToggleMenu: (colId: string, isOpen: boolean) => void;
};

const ColumnNode: React.FC<NodeProps<ColumnNodeData>> = ({ data }) => {
  // Убираем локальный стейт menuOpen, используем data.isMenuOpen
  const [isEditing, setIsEditing] = useState(data.isEditing || false);
  const [title, setTitle] = useState(data.title);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleRename = () => {
    setIsEditing(false);
    if (title.trim()) {
      data.onRename(data.id, title);
    } else {
      setTitle(data.title);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleRename();
  };

  return (
    <div
      style={{
        width: data.width,
        height: data.height,
        background: "#f3f4f6",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        position: 'relative',
      }}
      // При уходе мыши можно закрывать, если хотите, но лучше оставить клик
      // onMouseLeave={() => data.onToggleMenu(data.id, false)} 
    >
      <div
        className="nodrag"
        style={{
          padding: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontWeight: "bold",
          fontSize: "16px",
          borderBottom: "1px solid #e5e7eb",
          background: "#fff",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          height: 60,
          boxSizing: 'border-box'
        }}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            style={{ width: "100%", padding: "4px 8px", border: "1px solid #3b82f6", borderRadius: 4, fontSize: 16, outline: "none" }}
          />
        ) : (
          <span style={{ flex: 1, cursor: 'text' }} onDoubleClick={() => setIsEditing(true)}>
            {data.title}
          </span>
        )}

        <button
          className="column-menu-btn"
          onClick={(e) => {
            e.stopPropagation();
            // Переключаем состояние через родителя
            data.onToggleMenu(data.id, !data.isMenuOpen);
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="12" cy="5" r="1"></circle>
            <circle cx="12" cy="19" r="1"></circle>
          </svg>
        </button>

        {/* Используем data.isMenuOpen вместо локального стейта */}
        {data.isMenuOpen && (
          <div className="column-dropdown">
            <button onClick={() => { 
                data.onAddColumn(); 
                data.onToggleMenu(data.id, false); // Закрываем
            }}>
              Создать колонку
            </button>
            <button onClick={() => { 
                setIsEditing(true); 
                data.onToggleMenu(data.id, false); // Закрываем
            }}>
              Редактировать
            </button>
            <button className="delete-btn" onClick={() => { 
                data.onDelete(data.id); 
                data.onToggleMenu(data.id, false); // Закрываем
            }}>
              Удалить
            </button>
          </div>
        )}
      </div>
      
      <div style={{ flex: 1 }} />

      <button
        className="add-task-btn nodrag"
        onClick={(e) => {
            e.stopPropagation();
            data.onAddTask(data.id);
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Добавить задачу
      </button>
    </div>
  );
};

export default ColumnNode;