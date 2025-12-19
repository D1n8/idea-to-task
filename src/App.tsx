import React, { useMemo } from 'react';
import ReactFlow, { Background, type Node, type NodeTypes } from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';

import { KanbanNode } from './components/KanbanNode.tsx';

// Регистрируем наш новый тип узла
const nodeTypes: NodeTypes = {
  kanbanBoard: KanbanNode,
};

function App() {
  // Создаем ОДИН узел, который содержит всю доску
  const initialNodes: Node[] = useMemo(() => [
    {
      id: 'board-1',
      type: 'kanbanBoard', // Используем наш кастомный тип
      position: { x: 100, y: 100 }, // Начальная позиция всего виджета на полотне
      data: { label: 'My Kanban Board' }, // Данные можно передавать внутрь
    },
  ], []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#eef2f6' }}>
      <ReactFlow
        defaultNodes={initialNodes}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={4}
      >
        <Background gap={20} color="#cbd5e1" />
      </ReactFlow>
    </div>
  );
}

export default App;