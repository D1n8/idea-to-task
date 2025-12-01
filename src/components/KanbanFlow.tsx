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
const MIN_COLUMN_HEIGHT = 200;
const COLUMN_WIDTH = 320;
const COLUMN_HEADER_HEIGHT = 60;
const ADD_BUTTON_HEIGHT = 50;
const NODE_PADDING = 16;
const TASK_WIDTH = COLUMN_WIDTH - NODE_PADDING * 2;
const TASK_HEIGHT = 110;
const TASK_GAP = 12;

const initialColumns: ColumnData[] = [
  { id: "todo", title: "To do", x: 50, y: 50, width: COLUMN_WIDTH, height: 600, isDoneColumn: false },
  { id: "inprogress", title: "In progress", x: 400, y: 50, width: COLUMN_WIDTH, height: 600, isDoneColumn: false },
  // Помечаем колонку "Done" как завершающую
  { id: "done", title: "Done", x: 750, y: 50, width: COLUMN_WIDTH, height: 600, isDoneColumn: true },
];

const sampleTasks: ITaskData[] = [
  { id: "t1", title: "Критичный баг", description: "Починить логин", status: "todo", priority: "highest", deadline: "2023-10-01", username: "Ivan" },
  { id: "t2", title: "Обычная задача", description: "Поменять цвет кнопки", status: "inprogress", priority: "low", username: "Maria" },
];

const nodeTypes: NodeTypes = {
  column: ColumnNode,
  task: TaskNode,
};

const getPriorityWeight = (p?: Priority): number => {
  switch (p) {
    case "highest": return 5;
    case "high": return 4;
    case "medium": return 3;
    case "low": return 2;
    case "lowest": return 1;
    default: return 0;
  }
};

const KanbanFlow: React.FC = () => {
  const [columns, setColumns] = useState<ColumnData[]>(initialColumns);
  const [tasks, setTasks] = useState<ITaskData[]>(sampleTasks);

  // --- Modal States ---
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formStatus, setFormStatus] = useState<string>("todo");
  const [formPriority, setFormPriority] = useState<Priority | "none">("none");
  const [formDeadline, setFormDeadline] = useState("");
  const [formUser, setFormUser] = useState("");

  // --- Helper (Fixed) ---
  const getUniqueTitle = useCallback((baseTitle: string, excludeId?: string) => {
    let newTitle = baseTitle;
    let counter = 1;
    while (columns.some(col => col.title === newTitle && col.id !== excludeId)) {
      newTitle = `${baseTitle} (${counter})`;
      counter++;
    }
    return newTitle;
  }, [columns]);

  // --- LOGIC: COLUMNS ---
  const handleCreateColumn = useCallback(() => {
    const newId = nanoid();
    const title = getUniqueTitle("Новая колонка");
    
    const newColumn: ColumnData = {
      id: newId,
      title: title,
      x: columns.length > 0 ? columns[columns.length - 1].x + COLUMN_WIDTH + 50 : 50,
      y: 50,
      width: COLUMN_WIDTH,
      height: 500,
      isEditing: true,
      isDoneColumn: false, // Новая колонка не завершающая
    };
    setColumns((prev) => [...prev, newColumn]);
  }, [columns, getUniqueTitle]);

  const handleRenameColumn = useCallback((colId: string, newTitle: string) => {
    setColumns((prev) => {
        const isDuplicate = prev.some(c => c.title === newTitle && c.id !== colId);
        let finalTitle = newTitle;
        if (isDuplicate) {
             let counter = 1;
             while (prev.some(c => c.title === finalTitle && c.id !== colId)) {
                 finalTitle = `${newTitle} (${counter})`;
                 counter++;
             }
        }
        return prev.map(c => c.id === colId ? { ...c, title: finalTitle, isEditing: false } : c);
    });
  }, []);

  const confirmDeleteColumn = useCallback((colId: string) => {
    setColumnToDelete(colId);
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteColumn = useCallback(() => {
    if (!columnToDelete) return;
    setColumns((prev) => prev.filter(c => c.id !== columnToDelete));
    setTasks((prev) => prev.filter(t => t.status !== columnToDelete));
    setDeleteModalOpen(false);
    setColumnToDelete(null);
  }, [columnToDelete]);

  // Устанавливает колонку как завершающую
  const handleSetDoneColumn = useCallback((colId: string) => {
    setColumns(prev => prev.map(col => ({
        ...col,
        isDoneColumn: col.id === colId // Только эта колонка true, остальные false
    })));
  }, []);

  // --- LOGIC: TASKS ---
  const openAddModal = useCallback((colId: string) => {
    setEditingTaskId(null);
    setFormTitle("");
    setFormDesc("");
    setFormStatus(colId);
    setFormPriority("none");
    setFormDeadline("");
    setFormUser("");
    setTaskModalOpen(true);
  }, []);

  const openEditModal = useCallback((task: ITaskData) => {
    setEditingTaskId(task.id);
    setFormTitle(task.title);
    setFormDesc(task.description || "");
    setFormStatus(task.status);
    setFormPriority(task.priority || "none");
    setFormDeadline(task.deadline || "");
    setFormUser(task.username || "");
    setTaskModalOpen(true);
  }, []);

  const handleSaveTask = useCallback(() => {
    if (!formTitle.trim()) return;
    const priorityValue = formPriority === "none" ? undefined : formPriority;
    const deadlineValue = formDeadline === "" ? undefined : formDeadline;
    const userValue = formUser.trim() === "" ? undefined : formUser;

    setTasks((prev) => {
      if (editingTaskId) {
        return prev.map((t) => 
          t.id === editingTaskId 
            ? { ...t, title: formTitle, description: formDesc, status: formStatus, priority: priorityValue, deadline: deadlineValue, username: userValue }
            : t
        );
      }
      const newTask: ITaskData = {
        id: nanoid(),
        title: formTitle,
        description: formDesc,
        status: formStatus,
        priority: priorityValue,
        deadline: deadlineValue,
        username: userValue,
      };
      return [...prev, newTask];
    });
    setTaskModalOpen(false);
  }, [editingTaskId, formTitle, formDesc, formStatus, formPriority, formDeadline, formUser]);

  // --- HEIGHT CALCULATION ---
  const getColumnHeight = useCallback((taskCount: number) => {
    const contentHeight = COLUMN_HEADER_HEIGHT + NODE_PADDING + (taskCount * (TASK_HEIGHT + TASK_GAP)) + NODE_PADDING + ADD_BUTTON_HEIGHT; 
    return Math.max(contentHeight, MIN_COLUMN_HEIGHT);
  }, []);

  // --- NODES GENERATION ---
  const nodes: Node[] = useMemo(() => {
    const nodesArr: Node[] = [];
    const tasksByStatus: Record<string, ITaskData[]> = {};
    columns.forEach(c => { tasksByStatus[c.id] = [] });

    tasks.forEach((t) => {
        if(tasksByStatus[t.status]) tasksByStatus[t.status].push(t);
    });

    Object.keys(tasksByStatus).forEach((key) => {
      tasksByStatus[key].sort((a, b) => {
        const weightA = getPriorityWeight(a.priority);
        const weightB = getPriorityWeight(b.priority);
        return weightB - weightA;
      });
    });

    // 1. Columns
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
            onAddTask: openAddModal,
            onDelete: confirmDeleteColumn,
            onRename: handleRenameColumn,
            onAddColumn: handleCreateColumn,
            onSetDone: handleSetDoneColumn // передаем колбек
        },
        draggable: true,
        zIndex: 0,
        width: col.width,
        height: dynamicHeight,
      });
    });

    // 2. Tasks
    columns.forEach((col) => {
      const colTasks = tasksByStatus[col.id] || [];
      // Определяем, является ли эта колонка "Завершающей"
      const isColumnDone = col.isDoneColumn === true;

      colTasks.forEach((task, index) => {
        const x = col.x + NODE_PADDING;
        const y = col.y + COLUMN_HEADER_HEIGHT + NODE_PADDING + index * (TASK_HEIGHT + TASK_GAP);

        nodesArr.push({
          id: task.id,
          type: "task",
          position: { x, y },
          data: { 
              ...task, 
              width: TASK_WIDTH, 
              height: TASK_HEIGHT, 
              onEdit: openEditModal,
              isDone: isColumnDone // Передаем статус завершенности от колонки
          },
          draggable: true,
          zIndex: 10,
          extent: 'parent', 
        });
      });
    });

    return nodesArr;
  }, [columns, tasks, openAddModal, openEditModal, getColumnHeight, confirmDeleteColumn, handleRenameColumn, handleCreateColumn, handleSetDoneColumn]);

  // --- DRAG AND DROP ---
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
              t.id === node.id ? { ...t, status: targetColumn.id } : t
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

      {/* --- Task Modal --- */}
      <Modal open={taskModalOpen} title={editingTaskId ? "Редактировать задачу" : "Добавить задачу"} onClose={() => setTaskModalOpen(false)}>
        <input className="modal-input" placeholder="Название" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
        <textarea className="modal-textarea" placeholder="Описание" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} />
        <input className="modal-input" placeholder="Имя пользователя" value={formUser} onChange={(e) => setFormUser(e.target.value)} />

        <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: '#666' }}>Статус:</label>
                <select className="modal-input" value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
                    {columns.map(col => (<option key={col.id} value={col.id}>{col.title}</option>))}
                </select>
            </div>
            <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: '#666' }}>Приоритет:</label>
                <select className="modal-input" value={formPriority} onChange={(e) => setFormPriority(e.target.value as Priority | "none")}>
                    <option value="none">Нет приоритета</option>
                    <option value="highest">Highest (🔴)</option>
                    <option value="high">High (🟠)</option>
                    <option value="medium">Medium (🟡)</option>
                    <option value="low">Low (🔵)</option>
                    <option value="lowest">Lowest (🟢)</option>
                </select>
            </div>
        </div>
        <div>
             <label style={{ fontSize: 12, color: '#666' }}>Дедлайн:</label>
             <input type="date" className="modal-input" value={formDeadline} onChange={(e) => setFormDeadline(e.target.value)} />
        </div>

        <div className="modal-actions">
            <button onClick={() => setTaskModalOpen(false)}>Отмена</button>
            <button onClick={handleSaveTask} disabled={!formTitle} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}>Сохранить</button>
        </div>
      </Modal>

      {/* --- Delete Column Modal --- */}
      <Modal open={deleteModalOpen} title="Удаление колонки" onClose={() => setDeleteModalOpen(false)}>
          <div style={{ paddingBottom: 16 }}>
              <p>Вы уверены, что хотите удалить эту колонку?</p>
              <p style={{ color: '#ef4444', fontSize: 14 }}>Все задачи ({columnToDelete ? tasks.filter(t => t.status === columnToDelete).length : 0}) внутри этой колонки будут удалены.</p>
          </div>
          <div className="modal-actions">
                <button onClick={() => setDeleteModalOpen(false)}>Отмена</button>
                <button onClick={handleDeleteColumn} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}>Удалить</button>
          </div>
      </Modal>
    </div>
  );
};

export default KanbanFlow;