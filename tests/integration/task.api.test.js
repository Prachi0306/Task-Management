const request = require('supertest');
const app = require('../../src/app');

describe('Task API Integration Tests', () => {
  let userToken;
  let taskId;

  // Helper to register and return a token
  const createUser = async (name, email) => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name, email, password: 'Password1a' });
    return res.body.data.token;
  };

  beforeEach(async () => {
    userToken = await createUser('Task User', 'taskuser@example.com');
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Integration Test Task', priority: 'High' });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.task.title).toBe('Integration Test Task');
      expect(res.body.data.task.status).toBe('To-Do');
      taskId = res.body.data.task._id;
    });

    it('should fail to create task without title', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ priority: 'High' });

      expect(res.statusCode).toBe(400);
    });

    it('should fail without auth token', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'No Auth Task' });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/tasks', () => {
    it('should list tasks for the user', async () => {
      // Create a task first
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'List Test Task' });

      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.tasks.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should retrieve a single task by ID', async () => {
      const createRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Retrieve Me' });

      const id = createRes.body.data.task._id;

      const res = await request(app)
        .get(`/api/tasks/${id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.task._id).toBe(id);
      expect(res.body.data.task.title).toBe('Retrieve Me');
    });

    it('should return 404 for non-existent task', async () => {
      const res = await request(app)
        .get('/api/tasks/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/tasks/:id/status', () => {
    let createdTaskId;

    beforeEach(async () => {
      const createRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Status Test Task' });

      createdTaskId = createRes.body.data.task._id;
    });

    it('should update status from To-Do to In-Progress', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${createdTaskId}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'In-Progress' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.task.status).toBe('In-Progress');
    });

    it('should reject invalid transition (To-Do → Completed)', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${createdTaskId}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'Completed' });

      expect(res.statusCode).toBe(400);
    });

    it('should reject setting same status', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${createdTaskId}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'To-Do' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      const createRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Delete Me' });

      const id = createRes.body.data.task._id;

      const res = await request(app)
        .delete(`/api/tasks/${id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);

      // Verify it's gone
      const getRes = await request(app)
        .get(`/api/tasks/${id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(getRes.statusCode).toBe(404);
    });
  });
});
