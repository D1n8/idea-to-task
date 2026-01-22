import React from 'react';
import type { NodeProps } from '@xyflow/react';
import { MindMapWidget } from './MindMapWidget';

export const MindMapNode: React.FC<NodeProps> = () => {
  return (
    <div 
        style={{ 
            minWidth: 900, 
            minHeight: 700, 
            background: '#ffffff', 
            borderRadius: 24,
            boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}
    >
      <MindMapWidget />
    </div>
  );
};