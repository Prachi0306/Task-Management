import React from 'react';
import TaskCard from './TaskCard';

const COLUMNS = [
  { id: 'To-Do', title: 'To Do', color: 'var(--status-todo)' },
  { id: 'In-Progress', title: 'In Progress', color: 'var(--status-progress)' },
  { id: 'Completed', title: 'Completed', color: 'var(--status-completed)' }
];

const TaskBoard = ({ tasks, onStatusChange, onDelete }) => {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
      gap: '1.5rem', 
      height: '100%',
      alignItems: 'start'
    }}>
      {COLUMNS.map(column => {
        const columnTasks = tasks.filter(t => t.status === column.id);
        
        return (
          <div key={column.id} className="glass-panel" style={{ 
            padding: '1.5rem', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem',
            background: 'rgba(15, 17, 26, 0.4)', // Slightly more transparent for columns
            height: '100%'
          }}>
            <div className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
              <div className="flex items-center gap-2">
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: column.color }}></div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{column.title}</h3>
              </div>
              <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>
                {columnTasks.length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {columnTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)', borderRadius: '8px' }}>
                  No tasks here
                </div>
              ) : (
                columnTasks.map(task => (
                  <TaskCard 
                    key={task._id} 
                    task={task} 
                    onStatusChange={onStatusChange}
                    onDelete={onDelete}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskBoard;
