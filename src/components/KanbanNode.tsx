import React from 'react';
import type { NodeProps } from 'reactflow';
import { KanbanBoardWidget } from './KanbanBoardWidget';

export const KanbanNode: React.FC<NodeProps> = () => {
  return (
    <div 
        style={{ 
            minWidth: 800, 
            minHeight: 600, 
            background: '#f8fafc', 
            borderRadius: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}
    >
      <KanbanBoardWidget />
    </div>
  );
};