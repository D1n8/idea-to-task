import React from 'react';
import type { NodeProps } from 'reactflow';
import { KanbanBoardWidget } from './KanbanBoardWidget';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const KanbanNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div 
        className="nodrag cursor-default" 
        style={{ 
            minWidth: 800, 
            minHeight: 600, 
            background: '#f8fafc', 
            borderRadius: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
        }}
    >
      <KanbanBoardWidget />
    </div>
  );
};