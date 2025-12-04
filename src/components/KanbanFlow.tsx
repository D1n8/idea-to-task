import React from "react";
import ReactFlow, { Background, type NodeTypes } from "reactflow";
import "reactflow/dist/style.css";

import ColumnNode from "../components/kanban/ColumnNode";
import TaskNode from "../components/kanban/TaskNode";
import TaskModal from "../components/kanban/TaskModal";
import DeleteColumnModal from "../components/kanban/DeleteColumnModal";
import DeleteTaskModal from "../components/kanban/DeleteTaskModal"; 
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
    deleteColumnModal,
    setDeleteColumnModal,
    deleteTaskModal, 
    setDeleteTaskModal,
    handleDeleteTask,
    openDeleteTaskModal,
    handleSaveTask,
    handleDeleteColumn,
    openSubtaskModal,
    openEditTaskModal
  } = useKanbanBoard();

  // Количество задач для удаления колонки
  const tasksInColumnToDelete = deleteColumnModal.colId 
    ? tasks.filter(t => t.status === deleteColumnModal.colId).length 
    : 0;

  // Количество подзадач для удаления задачи
  const subtasksCount = deleteTaskModal.taskId
    ? tasks.filter(t => t.parentId === deleteTaskModal.taskId).length
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

      {/* Модалка задачи */}
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
        onDelete={openDeleteTaskModal} // Передаем функцию удаления
      />

      {/* Модалка удаления колонки */}
      <DeleteColumnModal 
        isOpen={deleteColumnModal.isOpen}
        onClose={() => setDeleteColumnModal({ isOpen: false, colId: null })}
        onConfirm={handleDeleteColumn}
        taskCount={tasksInColumnToDelete}
      />

      {/* Модалка удаления задачи */}
      <DeleteTaskModal
        isOpen={deleteTaskModal.isOpen}
        onClose={() => setDeleteTaskModal({ isOpen: false, taskId: null })}
        onConfirm={handleDeleteTask}
        subtaskCount={subtasksCount}
      />
    </div>
  );
};

export default KanbanFlow;