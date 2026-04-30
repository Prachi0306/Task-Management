import React from 'react';
import { format } from 'date-fns';
import { Calendar, AlertCircle, Clock, CheckCircle } from 'lucide-react';

const priorityColors = {
  Low: '#10b981',    // Emerald
  Medium: '#f59e0b', // Amber
  High: '#ef4444',   // Red
};

const statusIcons = {
  'To-Do': <AlertCircle size={16} color="var(--status-todo)" />,
  'In-Progress': <Clock size={16} color="var(--status-progress)" />,
  'Completed': <CheckCircle size={16} color="var(--status-completed)" />,
};

const TaskCard = ({ task, onStatusChange, onDelete }) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed';

  return (
    <div 
      className="glass-panel animate-fade-in" 
      style={{ 
        padding: '1.25rem', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.75rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        borderLeft: `4px solid ${priorityColors[task.priority]}`,
      }}
    >
      <div className="flex justify-between items-start">
        <h4 style={{ fontWeight: 600, fontSize: '1rem', color: '#fff', margin: 0, wordBreak: 'break-word' }}>
          {task.title}
        </h4>
        <div style={{ marginLeft: '8px' }}>
          {statusIcons[task.status]}
        </div>
      </div>

      {task.description && (
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between" style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
        {task.dueDate ? (
          <div className="flex items-center gap-2" style={{ color: isOverdue ? '#ef4444' : 'var(--color-text-muted)', fontSize: '0.8rem' }}>
            <Calendar size={14} />
            <span style={{ fontWeight: isOverdue ? 600 : 400 }}>
              {format(new Date(task.dueDate), 'MMM d, yyyy')}
            </span>
          </div>
        ) : (
          <div /> /* Spacer */
        )}

        <div className="flex gap-2">
          {task.status === 'To-Do' && (
            <button 
              onClick={(e) => { e.stopPropagation(); onStatusChange(task._id, 'In-Progress'); }}
              className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}
            >
              Start
            </button>
          )}
          {task.status === 'In-Progress' && (
            <button 
              onClick={(e) => { e.stopPropagation(); onStatusChange(task._id, 'Completed'); }}
              className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
