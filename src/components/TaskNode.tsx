import React from "react";
import type { NodeProps } from "reactflow";
import type { ITaskData, Priority } from "../modules";

type TaskNodeData = ITaskData & {
  width: number;
  height: number;
  onEdit: (task: ITaskData) => void;
};

// Маппинг цветов для приоритетов
const priorityColors: Record<Priority, string> = {
  highest: "#ef4444", // Красный
  high: "#f97316",    // Оранжевый
  medium: "#eab308",  // Желтый
  low: "#3b82f6",     // Синий
  lowest: "#22c55e",  // Зеленый
};

const TaskNode: React.FC<NodeProps<TaskNodeData>> = ({ data }) => {
  const isDone = data.status === "done";
  
  // Определяем цвет кружка, если приоритет задан
  const priorityColor = data.priority ? priorityColors[data.priority] : null;

  return (
    <div
      className="task-node"
      style={{
        width: data.width,
        height: data.height,
        background: "#ffffff",
        borderRadius: 8,
        padding: "12px",
        border: isDone ? "2px solid #22c55e" : "1px solid #d1d5db",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        cursor: "grab",
        boxSizing: "border-box",
        position: "relative",
        opacity: isDone ? 0.8 : 1,
        transition: "border 0.2s, opacity 0.2s",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 4,
        }}
      >
        <div
          style={{
            fontWeight: 600,
            fontSize: "14px",
            marginRight: 24,
            textDecoration: isDone ? "line-through" : "none",
            color: isDone ? "#9ca3af" : "#1f2937",
          }}
        >
          {data.title}
        </div>

        <button
          className="nodrag"
          onClick={(e) => {
            e.stopPropagation();
            data.onEdit(data);
          }}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9ca3af",
          }}
          title="Редактировать"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
      </div>

      {data.description && (
        <div
          style={{
            fontSize: "12px",
            color: isDone ? "#9ca3af" : "#6b7280",
            textDecoration: isDone ? "line-through" : "none",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            marginTop: "auto",
          }}
        >
          {data.description}
        </div>
      )}

      {/* Кружок приоритета в правом нижнем углу */}
      {priorityColor && (
        <div
          style={{
            position: "absolute",
            bottom: 8,
            right: 8,
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: priorityColor,
            border: "1px solid rgba(0,0,0,0.1)", // легкая обводка для контраста
          }}
          title={`Приоритет: ${data.priority}`}
        />
      )}
    </div>
  );
};

export default TaskNode;