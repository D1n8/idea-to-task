## Установка 
npm install idea-to-task-module

## Пример использования

```
import React, { useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState,
  type NodeTypes 
} from 'reactflow';
import 'reactflow/dist/style.css';

// Импорт виджета и функции обновления из пакета
import { IdeaToTaskWidget, getInfo } from 'idea-to-task-module';
import 'idea-to-task-module/style.css';

// ID тестового виджета
const TEST_WIDGET_ID = 555;

const INITIAL_DATA = {
  widgetId: TEST_WIDGET_ID,
  userId: 1,
  role: 'admin',
  config: {
    tasks: [],
    columns: [{ id: "todo", title: "Start Column", x: 0, y: 0, width: 300 }],
    measures: { width: 800, height: 500 }
  }
};

export default function App() {
  const nodeTypes = useMemo<NodeTypes>(() => ({
    'idea-widget': IdeaToTaskWidget,
  }), []);

  const [nodes, , onNodesChange] = useNodesState([
    {
      id: 'node-1',
      type: 'idea-widget',
      position: { x: 100, y: 100 },
      data: { ...INITIAL_DATA }, 
    },
  ]);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="flex-1 bg-slate-100">
        <ReactFlow
          nodes={nodes}
          onNodesChange={onNodesChange}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background gap={20} />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}
```