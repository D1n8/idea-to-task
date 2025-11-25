import React, { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  useNodesState,
  useEdgesState,
  type Node,
  type NodeTypes,
  type NodeDragHandler,
} from "reactflow";
import "reactflow/dist/style.css";
import { nanoid } from "nanoid";

import ColumnNode from "./ColumnNode";
import TaskNode from "./TaskNode";
import Modal from "./Modal";
import type { ColumnData, ITaskData } from "../modules"; // Импорт типов

const COLUMN_WIDTH = 320;
const COLUMN_HEIGHT = 600;
const COLUMN_HEADER_HEIGHT = 60;
const NODE_PADDING = 16;
const TASK_WIDTH = COLUMN_WIDTH - NODE_PADDING * 2;
const TASK_HEIGHT = 80;
const TASK_GAP = 12;

const initialColumns: ColumnData[] = [
  { id: "todo", title: "To do", x: 50, y: 50, width: COLUMN_WIDTH, height: COLUMN_HEIGHT },
  { id: "inprogress", title: "In progress", x: 400, y: 50, width: COLUMN_WIDTH, height: COLUMN_HEIGHT },
  { id: "done", title: "Done", x: 750, y: 50, width: COLUMN_WIDTH, height: COLUMN_HEIGHT },
];

const sampleTasks: ITaskData[] = [
  { id: "t1", title: "Дизайн", description: "Сделать макет главной", status: "todo" },
  { id: "t2", title: "API", description: "Написать эндпоинты", status: "inprogress" },
  { id: "t3", title: "Тесты", description: "Покрыть тестами", status: "todo" },
  { id: "t4", title: "Релиз", status: "done" },
];

const nodeTypes: NodeTypes = {
  column: ColumnNode,
  task: TaskNode,
};

const KanbanFlow: React.FC = () => {
  const [columns, setColumns] = useState<ColumnData[]>(initialColumns);
  const [tasks, setTasks] = useState<ITaskData[]>(sampleTasks);

  // Состояние модалки
  const [modalOpen, setModalOpen] = useState(false);
  const [targetColId, setTargetColId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // --- Логика Модального окна ---
  const handleAddClick = useCallback((colId: string) => {
    setTargetColId(colId);
    setNewTitle("");
    setNewDesc("");
    setModalOpen(true);
  }, []);

  const handleSaveTask = useCallback(() => {
    if (!targetColId || !newTitle.trim()) return;
    
    const newTask: ITaskData = {
      id: nanoid(),
      title: newTitle,
      description: newDesc,
      status: targetColId as any,
    };

    setTasks((prev) => [...prev, newTask]);
    setModalOpen(false);
  }, [targetColId, newTitle, newDesc]);

  // --- Подготовка Nodes для React Flow ---
  const nodes: Node[] = useMemo(() => {
    const nodesArr: Node[] = [];

    // 1. Генерируем узлы колонок
    columns.forEach((col) => {
      nodesArr.push({
        id: `col-${col.id}`,
        type: "column",
        position: { x: col.x, y: col.y },
        data: { ...col, onAdd: handleAddClick },
        draggable: true,
        zIndex: 0, // Колонки на заднем плане
        width: col.width, // Важно для reactflow internal logic
        height: col.height,
      });
    });

    // 2. Группируем задачи по статусам
    const tasksByStatus: Record<string, ITaskData[]> = { todo: [], inprogress: [], done: [] };
    tasks.forEach((t) => {
        if(tasksByStatus[t.status]) tasksByStatus[t.status].push(t);
    });

    // 3. Генерируем узлы задач поверх колонок
    columns.forEach((col) => {
      const colTasks = tasksByStatus[col.id] || [];
      
      colTasks.forEach((task, index) => {
        // Вычисляем позицию задачи относительно колонки
        const x = col.x + NODE_PADDING;
        const y = col.y + COLUMN_HEADER_HEIGHT + NODE_PADDING + index * (TASK_HEIGHT + TASK_GAP);

        nodesArr.push({
          id: task.id,
          type: "task",
          position: { x, y },
          data: { ...task, width: TASK_WIDTH, height: TASK_HEIGHT },
          draggable: true,
          // Важно: задачи должны быть выше колонок
          zIndex: 10, 
          extent: 'parent', // Опционально, если хотим ограничить область
        });
      });
    });

    return nodesArr;
  }, [columns, tasks, handleAddClick]);

  // --- Обработчик окончания перетаскивания ---
  const onNodeDragStop: NodeDragHandler = useCallback(
    (event, node) => {
      // 1. Если тащим колонку
      if (node.type === "column") {
        const colId = node.id.replace("col-", "");
        setColumns((prev) =>
          prev.map((c) =>
            c.id === colId ? { ...c, x: node.position.x, y: node.position.y } : c
          )
        );
        return;
      }

      // 2. Если тащим задачу
      if (node.type === "task") {
        const taskWidth = TASK_WIDTH;
        const taskHeight = TASK_HEIGHT;
        
        // Центр перетаскиваемой задачи
        const taskCenterX = node.position.x + taskWidth / 2;
        const taskCenterY = node.position.y + taskHeight / 2;

        // Ищем колонку, в которую попадает центр задачи
        const targetColumn = columns.find((col) => {
          return (
            taskCenterX >= col.x &&
            taskCenterX <= col.x + col.width &&
            taskCenterY >= col.y &&
            taskCenterY <= col.y + col.height
          );
        });

        if (targetColumn) {
          // Если нашли новую колонку, обновляем статус задачи
          setTasks((prev) =>
            prev.map((t) =>
              t.id === node.id ? { ...t, status: targetColumn.id as any } : t
            )
          );
        } else {
            // Если бросили мимо, задача вернется на старое место благодаря перерендеру nodes
            // Можно добавить логику "отмены", но React Flow сам вернет её на место при следующем рендере nodes
        }
      }
    },
    [columns]
  );

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodeDragStop={onNodeDragStop}
        fitView
        // Отключаем выделение, чтобы не мешало
        elementsSelectable={false} 
        // Чтобы при зуме не улетало слишком далеко
        minZoom={0.1}
      >
        <Background gap={20} />
      </ReactFlow>

      <Modal
        open={modalOpen}
        title="Добавить задачу"
        onClose={() => setModalOpen(false)}
      >
        <input
          className="modal-input"
          placeholder="Название"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <textarea
          className="modal-textarea"
          placeholder="Описание"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
        />
        <div className="modal-actions">
          <button onClick={() => setModalOpen(false)}>Отмена</button>
          <button onClick={handleSaveTask} disabled={!newTitle}>
            Сохранить
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default KanbanFlow;