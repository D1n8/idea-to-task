import React from "react";
import type { NodeProps } from "reactflow";
import type { ITaskData, Priority } from "../modules";

type TaskNodeData = ITaskData & {
  width: number;
  height: number;
  onEdit: (task: ITaskData) => void;
};

const priorityColors: Record<Priority, string> = {
  highest: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#3b82f6",
  lowest: "#22c55e",
};

const TaskNode: React.FC<NodeProps<TaskNodeData>> = ({ data }) => {
  const isDone = data.status === "done";
  
  // Проверка на просрочку
  // Сравниваем только даты (без времени), чтобы задача на "сегодня" не горела красным
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const deadlineDate = data.deadline ? new Date(data.deadline) : null;
  const isOverdue = !isDone && deadlineDate && deadlineDate < today;

  const priorityColor = data.priority ? priorityColors[data.priority] : null;

  // Определяем цвет границы
  let borderColor = "1px solid #d1d5db"; // серый по дефолту
  if (isDone) borderColor = "2px solid #22c55e"; // зеленый
  else if (isOverdue) borderColor = "2px solid #ef4444"; // красный

  // Форматирование даты (ДД.ММ)
  const formattedDate = deadlineDate 
    ? deadlineDate.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }) 
    : null;

  return (
    <div
      className="task-node"
      style={{
        width: data.width,
        height: data.height,
        background: "#ffffff",
        borderRadius: 8,
        padding: "12px",
        border: borderColor,
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
      {/* Шапка с заголовком и кнопкой редактирования */}
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
            // Если просрочено - красный текст, если готово - серый, иначе черный
            color: isDone ? "#9ca3af" : isOverdue ? "#ef4444" : "#1f2937",
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

      {/* Описание */}
      {data.description && (
        <div
          style={{
            fontSize: "12px",
            color: isDone ? "#9ca3af" : "#6b7280",
            textDecoration: isDone ? "line-through" : "none",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            marginBottom: "auto", // Push footer down
          }}
        >
          {data.description}
        </div>
      )}

      {/* Footer: Приоритет и Дата */}
      <div 
        style={{ 
          marginTop: 'auto', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          gap: 8,
          paddingTop: 8 
        }}
      >

        {/* Дата или Иконка календаря */}
        <div 
          style={{ 
            fontSize: 11, 
            color: isOverdue ? "#ef4444" : "#6b7280", 
            fontWeight: isOverdue ? 600 : 400,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {data.deadline ? (
            <span>{formattedDate}</span>
          ) : (
             // Иконка календаря
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          )}
        </div>

        {/* Кружок приоритета */}
        {priorityColor && (
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: priorityColor,
              border: "1px solid rgba(0,0,0,0.1)",
            }}
            title={`Приоритет: ${data.priority}`}
          />
        )}

        
      </div>
    </div>
  );
};

export default TaskNode;