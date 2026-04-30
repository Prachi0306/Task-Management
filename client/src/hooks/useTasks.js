import { useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/taskService';

export const useTasks = (initialFilters = {}) => {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskService.fetchTasks(filters);
      setTasks(data.tasks);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (taskData) => {
    try {
      const newTask = await taskService.createTask(taskData);
      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      throw err.response?.data?.message || 'Failed to create task';
    }
  };

  const updateStatus = async (taskId, status) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status } : t))
    );

    try {
      await taskService.updateTaskStatus(taskId, status);
    } catch (err) {
      // Revert on failure
      fetchTasks();
      throw err.response?.data?.message || 'Failed to update status';
    }
  };

  const removeTask = async (taskId) => {
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    try {
      await taskService.deleteTask(taskId);
    } catch (err) {
      fetchTasks();
      throw err.response?.data?.message || 'Failed to delete task';
    }
  };

  return {
    tasks,
    pagination,
    loading,
    error,
    filters,
    setFilters,
    addTask,
    updateStatus,
    removeTask,
    refreshTasks: fetchTasks,
  };
};
