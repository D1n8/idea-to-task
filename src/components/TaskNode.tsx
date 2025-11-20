import type React from "react";
import type { NodeProps } from "reactflow";
import type { ITaskData } from "../modules";

const TaskNode: React.FC<NodeProps<ITaskData>> = ({ data }) => {
  return (
    <div
      style={{
        padding: 8,
        background: "#fff",
        borderRadius: 6,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        width: data.width ?? 160,
        boxSizing: "border-box",
      }}
    >
      <div style={{ fontWeight: 600 }}>{data.title}</div>
      {data.description && (
        <div style={{ fontSize: 12, color: "#666" }}>{data.description}</div>
      )}
    </div>
  );
};

export default TaskNode;
