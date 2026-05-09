import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard';

const COLUMNS = [
  { id: 'To-Do', title: 'To Do', color: 'var(--status-todo)' },
  { id: 'In-Progress', title: 'In Progress', color: 'var(--status-progress)' },
  { id: 'Completed', title: 'Completed', color: 'var(--status-completed)' },
];


const DraggableTask = ({ task, onStatusChange, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
    data: { task },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    cursor: 'grab',
    touchAction: 'none',
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <TaskCard task={task} onStatusChange={onStatusChange} onDelete={onDelete} />
    </div>
  );
};


const DroppableColumn = ({ column, tasks, onStatusChange, onDelete, isOver }) => {
  const { setNodeRef } = useDroppable({ id: column.id });
  const [expanded, setExpanded] = useState(false);

  const displayTasks = expanded ? tasks : tasks.slice(0, 3);

  return (
    <div
      ref={setNodeRef}
      className="glass-panel"
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        background: isOver ? 'rgba(99, 102, 241, 0.08)' : 'rgba(15, 17, 26, 0.4)',
        border: isOver ? '1px solid rgba(99, 102, 241, 0.3)' : undefined,
        transition: 'background 0.2s ease, border 0.2s ease',
        minHeight: '200px',
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}
      >
        <div className="flex items-center gap-2">
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: column.color }}></div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{column.title}</h3>
        </div>
        <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>
          {tasks.length}
        </span>
      </div>


      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
        {tasks.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '2rem 1rem',
              color: 'var(--color-text-muted)',
              border: '1px dashed var(--color-border)',
              borderRadius: '8px',
            }}
          >
            {isOver ? '↓ Drop here' : 'No tasks here'}
          </div>
        ) : (
          <>
            {displayTasks.map((task) => (
              <DraggableTask key={task._id} task={task} onStatusChange={onStatusChange} onDelete={onDelete} />
            ))}
            {tasks.length > 3 && (
              <button 
                onClick={() => setExpanded(!expanded)} 
                style={{
                  background: 'none', border: '1px solid rgba(255,255,255,0.1)', 
                  color: 'var(--color-text-muted)', padding: '8px', 
                  borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem',
                  transition: 'background 0.2s', marginTop: '0.5rem'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                {expanded ? 'Show less' : `See more (${tasks.length - 3} more)`}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const TaskBoard = ({ tasks, onStatusChange, onDelete }) => {
  const [activeTask, setActiveTask] = useState(null);
  const [overId, setOverId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragStart = (event) => {
    const task = event.active.data.current?.task;
    setActiveTask(task || null);
  };

  const handleDragOver = (event) => {
    setOverId(event.over?.id || null);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);
    setOverId(null);

    if (!over) return;

    const draggedTask = active.data.current?.task;
    const targetColumnId = over.id;

    if (!draggedTask || !COLUMNS.find((c) => c.id === targetColumnId)) return;
    if (draggedTask.status === targetColumnId) return;

    onStatusChange(draggedTask._id, targetColumnId);
  };

  const handleDragCancel = () => {
    setActiveTask(null);
    setOverId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.id);
          return (
            <DroppableColumn
              key={column.id}
              column={column}
              tasks={columnTasks}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
              isOver={overId === column.id}
            />
          );
        })}
      </div>


      <DragOverlay>
        {activeTask ? (
          <div style={{ opacity: 0.9, transform: 'rotate(3deg)' }}>
            <TaskCard task={activeTask} onStatusChange={() => {}} onDelete={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default TaskBoard;
