import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import TaskBoard from '../components/TaskBoard';
import StatsPanel from '../components/StatsPanel';
import { Plus, Search, Filter } from 'lucide-react';

const Dashboard = () => {
  const [searchInput, setSearchInput] = useState('');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  
  // New Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');

  const { 
    tasks, loading, error, filters, setFilters, updateStatus, addTask 
  } = useTasks({ limit: 50 }); // fetch up to 50 for the board view

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchInput }));
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    try {
      await addTask({ 
        title: newTaskTitle, 
        description: newTaskDesc, 
        priority: newTaskPriority 
      });
      setShowNewTaskModal(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskPriority('Medium');
    } catch (err) {
      alert(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Action Bar */}
      <div className="glass-panel flex items-center justify-between" style={{ padding: '1rem 1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <form onSubmit={handleSearch} className="flex items-center gap-2" style={{ flex: 1, minWidth: '250px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search tasks..." 
              style={{ paddingLeft: '38px' }}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary">Search</button>
        </form>

        <div className="flex items-center gap-3">
          <button className="btn btn-secondary" title="Filters (Coming Soon)">
            <Filter size={18} /> Filters
          </button>
          <button className="btn btn-primary" onClick={() => setShowNewTaskModal(true)}>
            <Plus size={18} /> New Task
          </button>
        </div>
      </div>

      {/* Analytics Panel */}
      <StatsPanel />

      {/* Main Board Area */}
      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', color: '#fca5a5', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)' }}>
          {error}
        </div>
      )}

      {loading && tasks.length === 0 ? (
        <div className="flex justify-center" style={{ padding: '4rem' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
      ) : (
        <TaskBoard 
          tasks={tasks} 
          onStatusChange={updateStatus} 
        />
      )}

      {/* Simple Modal for New Task */}
      {showNewTaskModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Create New Task</h2>
            <form onSubmit={handleCreateTask} className="flex-col gap-4">
              <div className="flex-col" style={{ gap: '6px' }}>
                <label>Title</label>
                <input required type="text" className="input-field" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} />
              </div>
              <div className="flex-col" style={{ gap: '6px' }}>
                <label>Description (Optional)</label>
                <textarea className="input-field" rows={3} value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)}></textarea>
              </div>
              <div className="flex-col" style={{ gap: '6px' }}>
                <label>Priority</label>
                <select className="input-field" value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value)}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="flex gap-4" style={{ marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowNewTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
