import React from "react";
import type { NodeProps } from "reactflow";
import type { ColumnData } from "../modules";

// Расширяем тип данных для пропсов
type ColumnNodeData = ColumnData & { onAdd?: (colId: string) => void };

const ColumnNode: React.FC<NodeProps<ColumnNodeData>> = ({ data }) => {
  return (
    <div
      style={{
        width: data.width,
        height: data.height,
        background: "#f3f4f6", // Чуть серый фон колонки
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Заголовок колонки */}
      <div
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
        }}
      >
        <span>{data.title}</span>
        
        {/* ВАЖНО: className="nodrag" позволяет кликать, не перетаскивая узел */}
        <button
          className="nodrag"
          onClick={(e) => {
            e.stopPropagation(); // Останавливаем всплытие на всякий случай
            if (data.onAdd) data.onAdd(data.id);
          }}
          style={{
            width: 24,
            height: 24,
            borderRadius: 4,
            border: "none",
            background: "#3b82f6",
            color: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            lineHeight: 1,
          }}
        >
          +
        </button>
      </div>
      
      {/* Тело колонки (пустое, так как задачи рендерятся отдельно поверх) */}
      <div style={{ flex: 1 }} />
    </div>
  );
};

export default ColumnNode;