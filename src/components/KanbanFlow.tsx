import React, { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  type Node,
  type NodeTypes,
  type NodeDragHandler,
} from "reactflow";
import "reactflow/dist/style.css";
import { nanoid } from "nanoid";

import ColumnNode from "./ColumnNode";
import TaskNode from "./TaskNode";
import Modal from "./Modal";
import type { ColumnData, ITaskData, Priority } from "../modules";

// --- КОНСТАНТЫ ---
const MIN_COLUMN_HEIGHT = 600;
const COLUMN_WIDTH = 320;
const COLUMN_HEADER_HEIGHT = 60;
const NODE_PADDING = 16;
const TASK_WIDTH = COLUMN_WIDTH - NODE_PADDING * 2;
const TASK_HEIGHT = 80;
const TASK_GAP = 12;

const initialColumns: ColumnData[] = [
  { id: "todo", title: "To do", x: 50, y: 50, width: COLUMN_WIDTH, height: MIN_COLUMN_HEIGHT },
  { id: "inprogress", title: "In progress", x: 400, y: 50, width: COLUMN_WIDTH, height: MIN_COLUMN_HEIGHT },
  { id: "done", title: "Done", x: 750, y: 50, width: COLUMN_WIDTH, height: MIN_COLUMN_HEIGHT },
];

const sampleTasks: ITaskData[] = [
  { id: "t1", title: "Критичный баг", description: "Починить логин", status: "todo", priority: "highest" },
  { id: "t2", title: "Обычная задача", description: "Поменять цвет кнопки", status: "todo", priority: "low" },
  { id: "t3", title: "Без приоритета", description: "Когда-нибудь", status: "todo" },
];

const nodeTypes: NodeTypes = {
  column: ColumnNode,
  task: TaskNode,
};

// Хелпер для веса приоритета (чем больше число, тем выше задача)
const getPriorityWeight = (p?: Priority): number => {
  switch (p) {
    case "highest": return 5;
    case "high": return 4;
    case "medium": return 3;
    case "low": return 2;
    case "lowest": return 1;
    default: return 0; // Нет приоритета
  }
};

const KanbanFlow: React.FC = () => {
  const [columns, setColumns] = useState<ColumnData[]>(initialColumns);
  const [tasks, setTasks] = useState<ITaskData[]>(sampleTasks);

  // --- Modal State ---
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  
  // Поля формы
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formStatus, setFormStatus] = useState<ITaskData['status']>("todo");
  // "undefined" строка для select, чтобы обозначить отсутствие приоритета
  const [formPriority, setFormPriority] = useState<Priority | "none">("none");

  const openAddModal = useCallback((colId: string) => {
    setEditingTaskId(null);
    setFormTitle("");
    setFormDesc("");
    setFormStatus(colId as ITaskData['status']);
    setFormPriority("none");
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((task: ITaskData) => {
    setEditingTaskId(task.id);
    setFormTitle(task.title);
    setFormDesc(task.description || "");
    setFormStatus(task.status);
    setFormPriority(task.priority || "none");
    setModalOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!formTitle.trim()) return;

    // Преобразуем "none" обратно в undefined для данных
    const priorityValue = formPriority === "none" ? undefined : formPriority;

    setTasks((prev) => {
      if (editingTaskId) {
        return prev.map((t) => 
          t.id === editingTaskId 
            ? { ...t, title: formTitle, description: formDesc, status: formStatus, priority: priorityValue }
            : t
        );
      }
      const newTask: ITaskData = {
        id: nanoid(),
        title: formTitle,
        description: formDesc,
        status: formStatus,
        priority: priorityValue,
      };
      return [...prev, newTask];
    });
    setModalOpen(false);
  }, [editingTaskId, formTitle, formDesc, formStatus, formPriority]);

  const getColumnHeight = useCallback((taskCount: number) => {
    const contentHeight = 
      COLUMN_HEADER_HEIGHT + 
      NODE_PADDING + 
      (taskCount * (TASK_HEIGHT + TASK_GAP)) + 
      NODE_PADDING;
    return Math.max(contentHeight, MIN_COLUMN_HEIGHT);
  }, []);

  // --- ГЕНЕРАЦИЯ УЗЛОВ С СОРТИРОВКОЙ ---
  const nodes: Node[] = useMemo(() => {
    const nodesArr: Node[] = [];

    // Группируем задачи
    const tasksByStatus: Record<string, ITaskData[]> = { todo: [], inprogress: [], done: [] };
    
    // Сначала заполняем группы
    tasks.forEach((t) => {
        if(tasksByStatus[t.status]) tasksByStatus[t.status].push(t);
    });

    // ТЕПЕРЬ СОРТИРУЕМ ВНУТРИ ГРУПП
    Object.keys(tasksByStatus).forEach((key) => {
      tasksByStatus[key].sort((a, b) => {
        const weightA = getPriorityWeight(a.priority);
        const weightB = getPriorityWeight(b.priority);
        // Сортировка по убыванию веса (Highest -> Lowest -> None)
        return weightB - weightA;
      });
    });

    // Создаем узлы колонок
    columns.forEach((col) => {
      const colTasks = tasksByStatus[col.id] || [];
      const dynamicHeight = getColumnHeight(colTasks.length);

      nodesArr.push({
        id: `col-${col.id}`,
        type: "column",
        position: { x: col.x, y: col.y },
        data: { 
            ...col, 
            height: dynamicHeight, 
            onAdd: openAddModal 
        },
        draggable: true,
        zIndex: 0,
        width: col.width,
        height: dynamicHeight,
      });
    });

    // Создаем узлы задач (уже отсортированные)
    columns.forEach((col) => {
      const colTasks = tasksByStatus[col.id] || [];
      colTasks.forEach((task, index) => {
        const x = col.x + NODE_PADDING;
        const y = col.y + COLUMN_HEADER_HEIGHT + NODE_PADDING + index * (TASK_HEIGHT + TASK_GAP);

        nodesArr.push({
          id: task.id,
          type: "task",
          position: { x, y },
          data: { ...task, width: TASK_WIDTH, height: TASK_HEIGHT, onEdit: openEditModal },
          draggable: true,
          zIndex: 10,
          extent: 'parent', 
        });
      });
    });

    return nodesArr;
  }, [columns, tasks, openAddModal, openEditModal, getColumnHeight]);

  const onNodeDragStop: NodeDragHandler = useCallback(
    (_, node) => {
      if (node.type === "column") {
        const colId = node.id.replace("col-", "");
        setColumns((prev) =>
          prev.map((c) =>
            c.id === colId ? { ...c, x: node.position.x, y: node.position.y } : c
          )
        );
        return;
      }

      if (node.type === "task") {
        const centerX = node.position.x + TASK_WIDTH / 2;
        const centerY = node.position.y + TASK_HEIGHT / 2;

        const targetColumn = columns.find((col) => {
            const tasksInCol = tasks.filter(t => t.status === col.id).length;
            const currentHeight = getColumnHeight(tasksInCol);

            return (
                centerX >= col.x && 
                centerX <= col.x + col.width &&
                centerY >= col.y && 
                centerY <= col.y + currentHeight
            );
        });

        if (targetColumn) {
          setTasks((prev) =>
            prev.map((t) =>
              t.id === node.id ? { ...t, status: targetColumn.id as any } : t
            )
          );
        }
      }
    },
    [columns, tasks, getColumnHeight]
  );

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodeDragStop={onNodeDragStop}
        fitView
        elementsSelectable={false}
        minZoom={0.1}
      >
        <Background gap={20} />
      </ReactFlow>

      <Modal
        open={modalOpen}
        title={editingTaskId ? "Редактировать задачу" : "Добавить задачу"}
        onClose={() => setModalOpen(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
                className="modal-input"
                placeholder="Название"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
            />
            <textarea
                className="modal-textarea"
                placeholder="Описание"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
            />
            
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Статус:</label>
                <select 
                    className="modal-input"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ITaskData['status'])}
                >
                    <option value="todo">To Do</option>
                    <option value="inprogress">In Progress</option>
                    <option value="done">Done</option>
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Приоритет:</label>
                <select 
                    className="modal-input"
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as Priority | "none")}
                >
                    <option value="none">Нет приоритета</option>
                    <option value="highest">Highest (🔴)</option>
                    <option value="high">High (🟠)</option>
                    <option value="medium">Medium (🟡)</option>
                    <option value="low">Low (🔵)</option>
                    <option value="lowest">Lowest (🟢)</option>
                </select>
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: 8 }}>
                <button onClick={() => setModalOpen(false)}>Отмена</button>
                <button onClick={handleSave} disabled={!formTitle} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}>
                    Сохранить
                </button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default KanbanFlow;