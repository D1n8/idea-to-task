import type React from "react";
import type { NodeProps } from "reactflow";
import type { ColumnData } from "../modules";
import "../styles/Kanban.css";

const ColumnNode: React.FC<NodeProps<ColumnData>> = ({ data }) => {
  return (
    <div
      className="react-flow__node-column"
      style={{
        position: "absolute",
        width: data.width,
        height: data.height,
        backgroundColor: "#f4f6f8",
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        padding: 8,
        boxSizing: "border-box"    
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{data.title}</div>
    </div>
  );
};

export default ColumnNode;
