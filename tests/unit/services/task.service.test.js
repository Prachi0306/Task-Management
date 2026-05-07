const taskService = require('../../../src/services/task.service');
const taskRepository = require('../../../src/repositories/task.repository');
const cacheService = require('../../../src/services/cache.service');
const { emitToUser } = require('../../../src/config/socket');
const AppError = require('../../../src/utils/AppError');

jest.mock('../../../src/repositories/task.repository');
jest.mock('../../../src/services/cache.service');
jest.mock('../../../src/config/socket');

describe('TaskService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should create a task, invalidate cache, and emit socket event if assignedTo exists', async () => {
      const mockTaskData = { title: 'Test Task' };
      const mockUserId = 'user1';
      const mockCreatedTask = { _id: 'task1', title: 'Test Task', createdBy: mockUserId };
      const mockPopulatedTask = { ...mockCreatedTask, assignedTo: { _id: 'user2' } };

      taskRepository.create.mockResolvedValue(mockCreatedTask);
      taskRepository.findById.mockResolvedValue(mockPopulatedTask);
      cacheService.invalidatePattern.mockResolvedValue();

      const result = await taskService.createTask(mockUserId, mockTaskData);

      expect(taskRepository.create).toHaveBeenCalledWith({ ...mockTaskData, createdBy: mockUserId });
      expect(cacheService.invalidatePattern).toHaveBeenCalledWith(`tasks:user:${mockUserId}:*`);
      expect(emitToUser).toHaveBeenCalledWith('user2', 'task_assigned', expect.any(Object));
      expect(result).toEqual(mockPopulatedTask);
    });
  });

  describe('updateStatus', () => {
    it('should update status if transition is valid and user is creator', async () => {
      const mockTask = { _id: 'task1', status: 'To-Do', createdBy: { _id: 'user1' }, title: 'Test' };
      taskRepository.findById.mockResolvedValue(mockTask);
      taskRepository.updateById.mockResolvedValue({ ...mockTask, status: 'In-Progress' });

      const result = await taskService.updateStatus('task1', 'user1', 'user', 'In-Progress');

      expect(taskRepository.updateById).toHaveBeenCalledWith('task1', expect.objectContaining({ status: 'In-Progress' }));
      expect(result.status).toBe('In-Progress');
    });

    it('should throw AppError for invalid status transition', async () => {
      const mockTask = { _id: 'task1', status: 'To-Do', createdBy: { _id: 'user1' } };
      taskRepository.findById.mockResolvedValue(mockTask);

      await expect(taskService.updateStatus('task1', 'user1', 'user', 'Completed')).rejects.toThrow('Invalid status transition');
    });

    it('should throw AppError if task is already in the target status', async () => {
      const mockTask = { _id: 'task1', status: 'To-Do', createdBy: { _id: 'user1' } };
      taskRepository.findById.mockResolvedValue(mockTask);

      await expect(taskService.updateStatus('task1', 'user1', 'user', 'To-Do')).rejects.toThrow('Task is already in To-Do status');
    });

    it('should throw AppError if user has no permission', async () => {
      const mockTask = { _id: 'task1', status: 'To-Do', createdBy: { _id: 'user1' }, assignedTo: { _id: 'user2' } };
      taskRepository.findById.mockResolvedValue(mockTask);

      // 'user3' is neither admin, creator, nor assignee
      await expect(taskService.updateStatus('task1', 'user3', 'user', 'In-Progress')).rejects.toThrow('You do not have permission');
    });
  });
});
