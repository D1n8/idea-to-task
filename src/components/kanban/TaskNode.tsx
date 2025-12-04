import React from "react";
import type { NodeProps } from "reactflow";
import type { ITaskData, Priority } from "../../types/modules";

type TaskNodeData = ITaskData & {
  width: number;
  height: number;
  onEdit: (task: ITaskData) => void;
  isDone: boolean;
};

const priorityColors: Record<Priority, string> = {
  highest: "#ef4444", high: "#f97316", medium: "#eab308", low: "#3b82f6", lowest: "#22c55e",
};

const TaskNode: React.FC<NodeProps<TaskNodeData>> = ({ data }) => {
  const isDone = data.isDone;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const deadlineDate = data.deadline ? new Date(data.deadline) : null;
  const isOverdue = !isDone && deadlineDate && deadlineDate < today;
  const priorityColor = data.priority ? priorityColors[data.priority] : null;

  let borderColor = "1px solid #d1d5db";
  if (isDone) borderColor = "2px solid #22c55e"; else if (isOverdue) borderColor = "2px solid #ef4444";
  const formattedDate = deadlineDate ? deadlineDate.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }) : null;

  return (
    <div
      className="task-node-wrapper"
      style={{
        width: data.width, height: data.height, background: "#ffffff", borderRadius: 8, padding: "12px", border: borderColor, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column",
        cursor: "grab", boxSizing: "border-box", position: "relative", opacity: isDone ? 0.7 : 1, transition: "border 0.2s, opacity 0.2s, box-shadow 0.2s, transform 0.1s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <div
          style={{
            fontWeight: 600, fontSize: "14px", marginRight: 24,
            textDecoration: isDone ? "line-through" : "none",
            color: isDone ? "#9ca3af" : isOverdue ? "#ef4444" : "#1f2937",
          }}
        >
          {data.title}
        </div>
        
        {/* НОВАЯ КНОПКА "Изучить подробнее" */}
        <button
          className="nodrag"
          onClick={(e) => { e.stopPropagation(); data.onEdit(data); }}
          title="Открыть подробности"
          style={{ position: "absolute", top: 8, right: 8, background: "transparent", border: "none", cursor: "pointer", padding: 4, color: "#6b7280", display: "flex", alignItems: "center" }}
        >
          {/* Иконка "Maximize" / "Open" */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6"></path>
            <path d="M10 14L21 3"></path>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          </svg>
        </button>
      </div>

      {data.description && (
        <div style={{ fontSize: "12px", color: isDone ? "#9ca3af" : "#6b7280", textDecoration: isDone ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "auto" }}>
          {data.description}
        </div>
      )}

      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
           {priorityColor && (
            <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: priorityColor, border: "1px solid rgba(0,0,0,0.1)" }} title={`Приоритет: ${data.priority}`} />
          )}
          <div style={{ fontSize: 11, color: isOverdue ? "#ef4444" : "#6b7280", fontWeight: isOverdue ? 600 : 400, display: 'flex', alignItems: 'center' }}>
            {data.deadline ? <span>{formattedDate}</span> : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            )}
          </div>
        </div>
        {data.username && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f3f4f6', padding: '2px 6px', borderRadius: 12, maxWidth: '110px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span style={{ fontSize: 10, fontWeight: 500, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {data.username}
                </span>
            </div>
        )}
      </div>
    </div>
  );
};

export default TaskNode;