import React, { useEffect } from 'react';
import ReactFlow, { Background, type Node, type NodeTypes, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';

import { KanbanNode } from './components/KanbanNode';
import { MindMapNode } from './components/MindMapNode';
import { KanbanProvider, useKanbanContext } from './context/KanbanContext';

const nodeTypes: NodeTypes = {
  kanbanBoard: KanbanNode,
  mindMap: MindMapNode,
};

const FlowBoard = () => {
  const { isMindMapVisible } = useKanbanContext();
  
  const initialNodes: Node[] = [
    {
      id: 'board-1',
      type: 'kanbanBoard',
      position: { x: 100, y: 100 },
      data: { label: 'Kanban Board' },
      dragHandle: '.kanban-header' // Заголовок Канбана
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    setNodes((nds) => {
      const exists = nds.find(n => n.id === 'mindmap-1');
      
      if (isMindMapVisible && !exists) {
        return [...nds, {
          id: 'mindmap-1',
          type: 'mindMap',
          position: { x: 1000, y: 100 },
          data: { label: 'Mind Map' },
          dragHandle: '.p-4' // Заголовок MindMap (класс .p-4)
        }];
      } 
      
      if (!isMindMapVisible && exists) {
        return nds.filter(n => n.id !== 'mindmap-1');
      }

      return nds;
    });
  }, [isMindMapVisible, setNodes]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#eef2f6' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={4}
      >
        <Background gap={20} color="#cbd5e1" />
      </ReactFlow>
    </div>
  );
};

function App() {
  return (
    <KanbanProvider>
      <FlowBoard />
    </KanbanProvider>
  );
}

export default App;