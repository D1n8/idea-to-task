import React from 'react';
import type { ITaskData, Priority } from '../../types/modules';

interface SubtaskListProps {
    parentId: string;
    tasks: ITaskData[];
    openEditModal: (task: ITaskData) => void;
    openAddSubtaskModal: (parentId: string) => void;
}

const getPriorityColor = (p?: Priority) => {
    switch (p) {
        case "highest": return "#ef4444";
        case "high": return "#f97316";
        case "medium": return "#eab308";
        case "low": return "#3b82f6";
        case "lowest": return "#22c55e";
        default: return "#9ca3af";
    }
};

const SubtaskList: React.FC<SubtaskListProps> = ({ parentId, tasks, openEditModal, openAddSubtaskModal }) => {
    const subtasks = tasks.filter(t => t.parentId === parentId);
    
    return (
        <div style={{ borderTop: '1px dashed #e5e7eb', paddingTop: 20 }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Подзадачи ({subtasks.length})
                <button 
                    onClick={() => openAddSubtaskModal(parentId)} 
                    style={{ background: '#4c4c4c', color: 'white', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, border: 'none' }}
                >
                    + Добавить подзадачу
                </button>
            </h4>

            {subtasks.length === 0 ? (
                <p style={{ color: '#6b7280', fontStyle: 'italic', fontSize: 14 }}>
                    У этой задачи пока нет подзадач.
                </p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {subtasks.map(task => (
                        <div key={task.id} style={{ display: 'flex', alignItems: 'center', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff' }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: getPriorityColor(task.priority), marginRight: 10 }} title={`Приоритет: ${task.priority || 'Нет'}`}/>
                            <div style={{ flexGrow: 1, fontSize: 14, fontWeight: 500, cursor: 'pointer' }} onClick={() => openEditModal(task)}>
                                {task.title}
                                <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 10, fontWeight: 400 }}>
                                    (В статусе: {task.status})
                                </span>
                            </div>
                            <button 
                                onClick={() => openEditModal(task)} 
                                style={{ border: 'none', background: 'transparent', color: '#6b7280', padding: '5px 10px', cursor: 'pointer' }}
                                title="Редактировать подзадачу"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"></path><path d="M10 14L21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SubtaskList;