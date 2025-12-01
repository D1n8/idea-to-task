import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import type { NodeProps } from "reactflow";
import type { ColumnData } from "../modules";

type ColumnNodeData = ColumnData & { 
  onAddTask: (colId: string) => void;
  onDelete: (colId: string) => void;
  onRename: (colId: string, newTitle: string) => void;
  onAddColumn: () => void;
};

const ColumnNode: React.FC<NodeProps<ColumnNodeData>> = ({ data }) => {
  const [isEditing, setIsEditing] = useState(data.isEditing || false);
  const [title, setTitle] = useState(data.title);
  
  // Состояние для меню: открыто/закрыто и координаты
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Обработчик открытия меню
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (menuOpen) {
      setMenuOpen(false);
      return;
    }

    // Вычисляем позицию кнопки на экране
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 5, // Чуть ниже кнопки
        left: rect.left - 130 + rect.width, // Сдвиг влево, чтобы меню не уходило за экран
      });
      setMenuOpen(true);
    }
  };

  // Закрытие меню при клике в любое место окна
  useEffect(() => {
    const handleClickOutside = () => setMenuOpen(false);
    if (menuOpen) {
      window.addEventListener("click", handleClickOutside);
    }
    return () => window.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

  const handleRename = () => {
    setIsEditing(false);
    // Проверка на пустоту (валидация на дубликат будет в родителе)
    if (title.trim() && title !== data.title) {
      data.onRename(data.id, title);
    } else {
      setTitle(data.title); // Возврат старого, если отменили
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
        display: "flex", flexDirection: "column",
        position: 'relative',
      }}
    >
      {/* Header */}
      <div
        className="nodrag"
        style={{
          padding: "16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          fontWeight: "bold", fontSize: "16px",
          borderBottom: "1px solid #e5e7eb",
          background: "#fff",
          borderTopLeftRadius: 12, borderTopRightRadius: 12,
          height: 60, boxSizing: 'border-box'
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
          <span 
            style={{ flex: 1, cursor: 'text', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} 
            onDoubleClick={() => setIsEditing(true)}
            title={data.title}
          >
            {data.title}
          </span>
        )}

        {/* Кнопка меню */}
        <button
          ref={buttonRef}
          className="column-menu-btn"
          onClick={handleMenuClick}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="12" cy="5" r="1"></circle>
            <circle cx="12" cy="19" r="1"></circle>
          </svg>
        </button>

        {/* Рендерим меню через Портал в body */}
        {menuOpen && ReactDOM.createPortal(
          <div 
            className="column-dropdown-portal" 
            style={{ top: menuPos.top, left: menuPos.left }}
            onClick={(e) => e.stopPropagation()} // Чтобы клик внутри меню не закрывал его мгновенно
          >
            <button onClick={() => { data.onAddColumn(); setMenuOpen(false); }}>
              Создать колонку
            </button>
            <button onClick={() => { setIsEditing(true); setMenuOpen(false); }}>
              Редактировать
            </button>
            <button className="delete-btn" onClick={() => { data.onDelete(data.id); setMenuOpen(false); }}>
              Удалить
            </button>
          </div>,
          document.body
        )}
      </div>
      
      <div style={{ flex: 1 }} />

      {/* Footer Add Button */}
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