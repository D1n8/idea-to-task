import React, { useEffect } from 'react';
import ReactFlow, { Background, type Node, type NodeTypes, useNodesState } from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';

import { KanbanNode } from './components/KanbanNode';
import { MindMapNode } from './components/MindMapNode';
import { KanbanProvider, useKanbanContext } from './context/KanbanContext';

// Регистрируем типы узлов
const nodeTypes: NodeTypes = {
  kanbanBoard: KanbanNode,
  mindMap: MindMapNode,
};

// Внутренний компонент для доступа к контексту
const FlowBoard = () => {
  const { isMindMapVisible } = useKanbanContext();
  
  const initialNodes: Node[] = [
    {
      id: 'board-1',
      type: 'kanbanBoard',
      position: { x: 100, y: 100 },
      data: { label: 'Kanban Board' },
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  // Следим за флагом видимости MindMap и добавляем/удаляем узел
  useEffect(() => {
    setNodes((nds) => {
      const exists = nds.find(n => n.id === 'mindmap-1');
      
      if (isMindMapVisible && !exists) {
        return [...nds, {
          id: 'mindmap-1',
          type: 'mindMap',
          position: { x: 1000, y: 100 }, // Появляется справа
          data: { label: 'Mind Map' }
        }];
      } 
      
      if (!isMindMapVisible && exists) {
        // Опционально: можно не удалять, а просто оставлять как есть, 
        // но по логике "открытия по кнопке" можно и удалить.
        // В ТЗ сказано "появляется виджет", поэтому добавляем.
        // Чтобы пользователь мог его закрыть "крестиком" на виджете (setMindMapVisible(false)),
        // мы удаляем его из nodes.
        return nds.filter(n => n.id !== 'mindmap-1');
      }

      return nds;
    });
  }, [isMindMapVisible, setNodes]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#eef2f6' }}>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
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