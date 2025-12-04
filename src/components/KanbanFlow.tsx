import React from "react";
import ReactFlow, { Background, type NodeTypes } from "reactflow";
import "reactflow/dist/style.css";

import ColumnNode from "../components/kanban/ColumnNode";
import TaskNode from "../components/kanban/TaskNode";
import TaskModal from "../components/kanban/TaskModal";
import DeleteColumnModal from "../components/kanban/DeleteColumnModal";
import { useKanbanBoard } from "../hooks/useKanbanBoard";

const nodeTypes: NodeTypes = {
  column: ColumnNode,
  task: TaskNode,
};

const KanbanFlow: React.FC = () => {
  const {
    nodes,
    onNodeDragStop,
    columns,
    tasks,
    taskModal,
    setTaskModal,
    deleteModal,
    setDeleteModal,
    handleSaveTask,
    handleDeleteColumn,
    openSubtaskModal,
    openEditTaskModal
  } = useKanbanBoard();

  // Количество задач для удаления
  const tasksToDeleteCount = deleteModal.colId 
    ? tasks.filter(t => t.status === deleteModal.colId).length 
    : 0;

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

      {/* Модалка задачи (Создание / Редактирование) */}
      <TaskModal 
        isOpen={taskModal.isOpen}
        onClose={() => setTaskModal(prev => ({ ...prev, isOpen: false }))}
        editingTask={taskModal.editingTask}
        initialStatus={taskModal.status}
        initialParentId={taskModal.parentId}
        columns={columns}
        allTasks={tasks}
        onSave={handleSaveTask}
        onOpenParent={(parentId) => {
            const parent = tasks.find(t => t.id === parentId);
            if(parent) openEditTaskModal(parent);
        }}
        onAddSubtask={openSubtaskModal}
        onEditSubtask={openEditTaskModal}
      />

      {/* Модалка удаления колонки */}
      <DeleteColumnModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, colId: null })}
        onConfirm={handleDeleteColumn}
        taskCount={tasksToDeleteCount}
      />
    </div>
  );
};

export default KanbanFlow;