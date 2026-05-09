import React, { useState, useEffect, useRef } from 'react';
import { useTasks } from '../hooks/useTasks';
import TaskBoard from '../components/TaskBoard';
import StatsPanel from '../components/StatsPanel';
import { Plus, Search, Filter, X } from 'lucide-react';

const Dashboard = () => {
  const [searchInput, setSearchInput] = useState('');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
  // New Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  const { 
    tasks, loading, error, filters, setFilters, updateStatus, addTask, removeTask 
  } = useTasks({ limit: 50 }); // fetch up to 50 for the board view

  // Debounced live search — triggers 400ms after user stops typing
  const debounceRef = useRef(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput || undefined }));
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  const clearSearch = () => {
    setSearchInput('');
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    try {
      await addTask({ 
        title: newTaskTitle, 
        description: newTaskDesc, 
        priority: newTaskPriority,
        ...(newTaskDueDate ? { dueDate: newTaskDueDate } : {})
      });
      setShowNewTaskModal(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskPriority('Medium');
      setNewTaskDueDate('');
    } catch (err) {
      alert(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Action Bar */}
      <div className="glass-panel flex items-center justify-between" style={{ padding: '1rem 1.5rem', flexWrap: 'wrap', gap: '1rem', zIndex: 10, position: 'relative' }}>
        <div className="flex items-center gap-2" style={{ flex: 1, minWidth: '250px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search tasks..." 
              style={{ paddingLeft: '38px', paddingRight: searchInput ? '36px' : '12px' }}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button
                onClick={clearSearch}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px', display: 'flex' }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div style={{ position: 'relative' }}>
            <button 
              className={`btn ${filters.priority ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
            >
              <Filter size={18} /> Filters {filters.priority && '(1)'}
            </button>
            
            {showFilterMenu && (
              <div 
                className="glass-panel animate-fade-in" 
                style={{ 
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0, 
                  width: '180px', padding: '1rem', zIndex: 100,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Priority</h4>
                  {filters.priority && (
                    <button 
                      onClick={() => setFilters(prev => ({ ...prev, priority: undefined }))}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['High', 'Medium', 'Low'].map(p => (
                    <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input 
                        type="radio" 
                        name="priority" 
                        checked={filters.priority === p}
                        onChange={() => {
                          setFilters(prev => ({ ...prev, priority: p }));
                          setShowFilterMenu(false);
                        }}
                      />
                      {p}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button className="btn btn-primary" onClick={() => setShowNewTaskModal(true)}>
            <Plus size={18} /> New Task
          </button>
        </div>
      </div>

      {/* Analytics Panel */}
      <StatsPanel refreshKey={tasks} />

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
          onDelete={removeTask}
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
              <div className="flex gap-4">
                <div className="flex-col" style={{ gap: '6px', flex: 1 }}>
                  <label>Priority</label>
                  <select className="input-field" value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="flex-col" style={{ gap: '6px', flex: 1 }}>
                  <label>Due Date (Optional)</label>
                  <input 
                    type="date" 
                    className="input-field" 
                    value={newTaskDueDate} 
                    onChange={e => setNewTaskDueDate(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
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
