import React from "react";
import type { NodeProps } from "reactflow";
import type { ITaskData } from "../modules";

// Добавляем width/height в данные для удобства, хотя они приходят из positions
type TaskNodeData = ITaskData & { width: number; height: number };

const TaskNode: React.FC<NodeProps<TaskNodeData>> = ({ data }) => {
  return (
    <div
      style={{
        width: data.width,
        height: data.height,
        background: "#ffffff",
        borderRadius: 8,
        padding: "12px",
        border: "1px solid #d1d5db",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        cursor: "grab",
        boxSizing: "border-box",
      }}
    >
      <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: 4 }}>
        {data.title}
      </div>
      {data.description && (
        <div style={{ fontSize: "12px", color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {data.description}
        </div>
      )}
    </div>
  );
};

export default TaskNode;