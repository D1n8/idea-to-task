/* eslint-disable no-irregular-whitespace */
import React, { useCallback, useMemo } from "react";
import ReactFlow, {
  Background,
  useNodesState,
  applyNodeChanges,
  type Node,
  type NodeChange,
  type NodeTypes,
  type XYPosition,
} from "reactflow";

import "reactflow/dist/style.css";
import type { ColumnData, ITaskData } from "../modules";
import TaskNode from "./TaskNode";
import ColumnNode from "./ColumnNode";

type TaskStatus = ITaskData["status"];

const initialColumns = [
  { id: "todo", title: "Todo", x: 0, y: 0 },
  { id: "inprogress", title: "In Progress", x: 360, y: 0 },
  { id: "done", title: "Done", x: 720, y: 0 },
];

const sampleTasks: ITaskData[] = [
  { id: "t1", title: "Дизайн", status: "todo", description: "Главная" },
  { id: "t2", title: "Верстка", status: "inprogress", description: "Адаптив" },
  { id: "t3", title: "Тесты", status: "todo" },
  { id: "t4", title: "Деплой", status: "done" },
];

const COLUMN_WIDTH = 320;
const NODE_PADDING = 16;
const TASK_WIDTH = COLUMN_WIDTH - NODE_PADDING * 2;
// height fallback (если не успели измерить DOM)
const TASK_DEFAULT_HEIGHT = 72;
const TASK_GAP = 16; // одинаковый gap между карточками
const COLUMN_HEADER_HEIGHT = 40;

const KanbanFlow: React.FC = () => {
  const getColumnData = useCallback((columnId: string) => {
    return initialColumns.find((c) => c.id === columnId)!;
  }, []);

  // --- initial nodes
  const initialNodes: Node[] = useMemo(() => {
    const cols: Node<ColumnData>[] = initialColumns.map((c) => ({
      id: `col-${c.id}`,
      type: "column",
      position: { x: c.x, y: c.y },
      data: { id: c.id, title: c.title, width: COLUMN_WIDTH, height: 600 },
      draggable: false,
    }));

    const tasks: Node<ITaskData>[] = [];
    const taskCountByStatus: Record<string, number> = {};

    for (const t of sampleTasks) {
      const status = t.status;
      const index = taskCountByStatus[status] ?? 0;
      taskCountByStatus[status] = index + 1;

      const col = getColumnData(status);
      const x = col.x + NODE_PADDING;
      const y = col.y + COLUMN_HEADER_HEIGHT + index * (TASK_DEFAULT_HEIGHT + TASK_GAP);

      tasks.push({
        id: t.id,
        type: "task",
        position: { x, y },
        data: { ...t, width: TASK_WIDTH },
        draggable: true,
      });
    }

    return [...cols, ...tasks];
  }, [getColumnData]);

  const [nodes, setNodes] = useNodesState(initialNodes);

  // --- measure DOM heights for task nodes
  const measureNodeHeights = useCallback((currentNodes: Node[]) => {
    const map = new Map<string, number>();

    for (const n of currentNodes) {
      if (n.type !== "task") continue;
      const id = n.id;
      let el: Element | null = null;

      // стандартный селектор react-flow
      el = document.querySelector(`.react-flow__node[data-id="${id}"]`);
      if (!el) el = document.querySelector(`.react-flow__node[data-nodeid="${id}"]`);
      if (!el) el = document.querySelector(`.react-flow__node[id="${id}"]`);
      if (!el) {
        const candidates = Array.from(document.querySelectorAll(".react-flow__node"));
        el = candidates.find((c) => c.textContent?.includes(id)) ?? null;
      }

      const height = el ? (el as HTMLElement).getBoundingClientRect().height : TASK_DEFAULT_HEIGHT;
      map.set(id, Math.max(24, Math.round(height)));
    }

    return map;
  }, []);

  // --- build tasks map grouped by status and sorted visually
  const buildTasksMap = useCallback((currentNodes: Node[], heights: Map<string, number>) => {
    const taskNodes = currentNodes.filter((n) => n.type === "task") as Node<ITaskData>[];
    const map = new Map<TaskStatus, Node<ITaskData>[]>();
    for (const col of initialColumns) map.set(col.id as TaskStatus, []);
    for (const t of taskNodes) {
      const status = (t.data as ITaskData).status as TaskStatus;
      const arr = map.get(status);
      if (arr) arr.push(t);
      else map.set(status, [t]);
    }

    for (const [k, arr] of map) {
      arr.sort((a, b) => {
        const ay = a.positionAbsolute?.y ?? a.position.y ?? 0;
        const by = b.positionAbsolute?.y ?? b.position.y ?? 0;
        if (ay === by) {
          // fallback: use measured heights and ids to keep stable order
          return (heights.get(a.id) ?? TASK_DEFAULT_HEIGHT) - (heights.get(b.id) ?? TASK_DEFAULT_HEIGHT);
        }
        return ay - by;
      });
    }
    return map;
  }, []);

  // --- main recalculation: uses measured heights + fixed gap
  const calculateNewPositions = useCallback(
    (
      currentNodes: Node[],
      oldStatus: TaskStatus,
      newStatus: TaskStatus,
      movedNodeId: string,
      movedNode: Node<ITaskData>,
      newTasksOrder?: Node<ITaskData>[],
    ) => {
      const heights = measureNodeHeights(currentNodes);
      const map = buildTasksMap(currentNodes, heights);

      const oldList = map.get(oldStatus) ?? [];
      const filteredOld = oldList.filter((n) => n.id !== movedNodeId);
      map.set(oldStatus, filteredOld);

      if (oldStatus === newStatus) {
        const centerY =
          (movedNode.positionAbsolute?.y ?? movedNode.position.y ?? 0) +
          (heights.get(movedNodeId) ?? TASK_DEFAULT_HEIGHT) / 2;

        let idx = filteredOld.length;
        for (let i = 0; i < filteredOld.length; i++) {
          const candidateY = filteredOld[i].position.y ?? 0;
          const candidateHeight = heights.get(filteredOld[i].id) ?? TASK_DEFAULT_HEIGHT;
          if (centerY < candidateY + (candidateHeight + TASK_GAP) / 2) {
            idx = i;
            break;
          }
        }
        const newList = [...filteredOld];
        newList.splice(idx, 0, movedNode);
        map.set(newStatus, newList);
      } else {
        const targetList = newTasksOrder ?? (map.get(newStatus) ?? []);
        map.set(newStatus, [...targetList]);
      }

      // rebuild nodes with cumulative heights
      const updated = currentNodes.map((n) => {
        if (n.type !== "task") return n;
        const task = n as Node<ITaskData>;

        let finalStatus: TaskStatus = (task.data as ITaskData).status as TaskStatus;
        if (task.id === movedNodeId) finalStatus = (movedNode.data as ITaskData).status as TaskStatus;

        const list = map.get(finalStatus) ?? [];
        const indexInCol = list.findIndex((x) => x.id === task.id);
        if (indexInCol === -1) return task;

        const col = initialColumns.find((c) => c.id === finalStatus)!;

        // compute y by summing heights + gaps of previous items
        let y = col.y + COLUMN_HEADER_HEIGHT;
        for (let i = 0; i < indexInCol; i++) {
          const idPrev = list[i].id;
          const h = heights.get(idPrev) ?? TASK_DEFAULT_HEIGHT;
          y += h + TASK_GAP;
        }

        const newX = col.x + NODE_PADDING;
        const newY = Math.round(y);

        const newData: ITaskData = {
          ...(task.data as ITaskData),
          status: task.id === movedNodeId ? (movedNode.data as ITaskData).status : (task.data as ITaskData).status,
          width: TASK_WIDTH,
        };

        return {
          ...task,
          position: { x: newX, y: newY },
          data: newData,
        };
      });

      return updated;
    },
    [measureNodeHeights, buildTasksMap]
  );

  // --- onNodeDragStop
  const onNodeDragStop = useCallback(
    (event: any, node: Node<ITaskData>) => {
      if (node.type !== "task") return;

      const taskData = node.data as ITaskData;
      const oldStatus = taskData.status as TaskStatus;

      const taskCenter: XYPosition = {
        x: (node.position.x ?? 0) + (node.data.width ?? TASK_WIDTH) / 2,
        y: (node.position.y ?? 0) + (heightsFallback(node) / 2),
      };

      function heightsFallback(n: Node<ITaskData>) {
        // if data contains a sensible measurement use it, otherwise use default
        // (we avoid relying on data.height because it's not part of ITaskData)
        return TASK_DEFAULT_HEIGHT;
      }

      const colNodes = nodes.filter((n) => n.type === "column") as Node<ColumnData>[];
      const targetCol = colNodes.find((col) => {
        const colPos = col.position;
        const colData = col.data as ColumnData;
        const isInsideX = taskCenter.x >= colPos.x && taskCenter.x <= colPos.x + colData.width;
        const isInsideY = taskCenter.y >= colPos.y && taskCenter.y <= colPos.y + colData.height;
        return isInsideX && isInsideY;
      });

      const newStatus = targetCol ? ((targetCol.data as ColumnData).id as TaskStatus) : oldStatus;
      const isStatusChanged = oldStatus !== newStatus;

      if (!targetCol && !isStatusChanged) return;

      if (!isStatusChanged) {
        const tasksInCol = nodes
          .filter((n) => n.type === "task" && (n.data as ITaskData).status === oldStatus && n.id !== node.id) as Node<ITaskData>[];

        tasksInCol.sort((a, b) => (a.positionAbsolute?.y ?? a.position.y ?? 0) - (b.positionAbsolute?.y ?? b.position.y ?? 0));

        let insertIndex = tasksInCol.length;
        const centerY = (node.positionAbsolute?.y ?? node.position.y ?? 0) + TASK_DEFAULT_HEIGHT / 2;
        const heights = measureNodeHeights(nodes);
        for (let i = 0; i < tasksInCol.length; i++) {
          const candidateY = tasksInCol[i].position.y ?? 0;
          const candidateHeight = heights.get(tasksInCol[i].id) ?? TASK_DEFAULT_HEIGHT;
          if (centerY < candidateY + (candidateHeight + TASK_GAP) / 2) {
            insertIndex = i;
            break;
          }
        }

        const newNode: Node<ITaskData> = { ...node, data: { ...(node.data as ITaskData), width: TASK_WIDTH } };
        const newOrder = [...tasksInCol];
        newOrder.splice(insertIndex, 0, newNode);

        setNodes((nds) => calculateNewPositions(nds, oldStatus, oldStatus, node.id, newNode, newOrder));
        return;
      }

      // moving to another column
      const tasksInTargetCol = nodes
        .filter((n) => n.type === "task" && (n.data as ITaskData).status === newStatus) as Node<ITaskData>[];
      tasksInTargetCol.sort((a, b) => (a.positionAbsolute?.y ?? a.position.y ?? 0) - (b.positionAbsolute?.y ?? b.position.y ?? 0));

      let insertIndex = tasksInTargetCol.length;
      const centerY = (node.positionAbsolute?.y ?? node.position.y ?? 0) + TASK_DEFAULT_HEIGHT / 2;
      const heightsForTarget = measureNodeHeights(nodes);
      for (let i = 0; i < tasksInTargetCol.length; i++) {
        const candidateY = tasksInTargetCol[i].position.y ?? 0;
        const candidateHeight = heightsForTarget.get(tasksInTargetCol[i].id) ?? TASK_DEFAULT_HEIGHT;
        if (centerY < candidateY + (candidateHeight + TASK_GAP) / 2) {
          insertIndex = i;
          break;
        }
      }

      const movedNode: Node<ITaskData> = { ...node, data: { ...(node.data as ITaskData), status: newStatus, width: TASK_WIDTH } };
      const newOrder = [...tasksInTargetCol];
      newOrder.splice(insertIndex, 0, movedNode);

      setNodes((nds) => calculateNewPositions(nds, oldStatus, newStatus, node.id, movedNode, newOrder));
    },
    [nodes, setNodes, calculateNewPositions, measureNodeHeights]
  );

  const nodeTypes: NodeTypes = useMemo(() => ({ column: ColumnNode, task: TaskNode }), []);

  return (
    <div style={{ width: "100%", height: "800px" }}>
      <ReactFlow
        nodes={nodes}
        onNodesChange={(changes: NodeChange[]) => {
          // ignore ANY change that targets column nodes (by id prefix "col-")
          const filtered = changes.filter((change) => {
            if ("id" in change && typeof change.id === "string" && change.id.startsWith("col-")) {
              return false;
            }
            return true;
          });

          setNodes((nds) => applyNodeChanges(filtered, nds));
        }}
        nodeTypes={nodeTypes}
        onNodeDragStop={onNodeDragStop}
        fitView
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={false}
      >
        {/* background is preserved by ColumnNode styling */}
        <Background gap={16} />
      </ReactFlow>
    </div>
  );
};

export default KanbanFlow;
