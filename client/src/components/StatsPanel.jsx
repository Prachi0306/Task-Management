import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { taskService } from '../services/taskService';
import { CheckCircle, Clock, AlertCircle, AlertTriangle } from 'lucide-react';

const STATUS_COLORS = {
  'To-Do': '#6366f1',
  'In-Progress': '#f59e0b',
  'Completed': '#10b981',
};

const PRIORITY_COLORS = {
  Low: '#10b981',
  Medium: '#f59e0b',
  High: '#ef4444',
};

const KpiCard = ({ icon, label, value, color }) => (
  <div className="glass-panel" style={{
    padding: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flex: '1 1 200px',
  }}>
    <div style={{
      width: '48px', height: '48px', borderRadius: '12px',
      background: `${color}20`, display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: 0 }}>{label}</p>
      <p style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color }}>{value}</p>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(15, 17, 26, 0.95)', border: '1px solid var(--color-border)',
        borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '0.85rem',
      }}>
        <p style={{ margin: 0, fontWeight: 600 }}>{label || payload[0].name}</p>
        <p style={{ margin: '4px 0 0', color: payload[0].color || '#94a3b8' }}>
          {payload[0].value} tasks
        </p>
      </div>
    );
  }
  return null;
};

const StatsPanel = () => {
  const [stats, setStats] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, timelineData] = await Promise.all([
          taskService.fetchStats(),
          taskService.fetchTimeline(),
        ]);
        setStats(statsData);

        const formatted = timelineData.map((item) => ({
          name: `W${item._id.week}`,
          completed: item.count,
        }));
        setTimeline(formatted);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center" style={{ padding: '2rem' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (!stats) return null;

  const getCount = (arr, key) => {
    const found = arr.find((i) => i._id === key);
    return found ? found.count : 0;
  };

  const totalTasks = stats.byStatus.reduce((sum, s) => sum + s.count, 0);
  const todoCount = getCount(stats.byStatus, 'To-Do');
  const progressCount = getCount(stats.byStatus, 'In-Progress');
  const completedCount = getCount(stats.byStatus, 'Completed');

  const statusData = stats.byStatus.map((s) => ({ name: s._id, value: s.count }));
  const priorityData = stats.byPriority.map((p) => ({ name: p._id, value: p.count }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* KPI Row */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <KpiCard icon={<AlertCircle size={24} color="#6366f1" />} label="To Do" value={todoCount} color="#6366f1" />
        <KpiCard icon={<Clock size={24} color="#f59e0b" />} label="In Progress" value={progressCount} color="#f59e0b" />
        <KpiCard icon={<CheckCircle size={24} color="#10b981" />} label="Completed" value={completedCount} color="#10b981" />
        <KpiCard icon={<AlertTriangle size={24} color="#ef4444" />} label="Overdue" value={stats.overdue} color="#ef4444" />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Priority Distribution Pie */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {priorityData.map((entry) => (
                  <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] || '#6366f1'} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Completion Bar Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Tasks Completed (Last 8 Weeks)</h3>
          <ResponsiveContainer width="100%" height={220}>
            {timeline.length > 0 ? (
              <BarChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="completed" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            ) : (
              <div className="flex items-center justify-center" style={{ height: '100%', color: 'var(--color-text-muted)' }}>
                No completed tasks yet
              </div>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
