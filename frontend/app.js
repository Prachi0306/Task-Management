// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// State Management
let currentUser = null;
let authToken = null;

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
  // Check server connectivity
  await checkServerConnection();
  checkAuth();
  setupEventListeners();
});

// Check if server is reachable
async function checkServerConnection() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      showNotification('Server is not responding correctly', 'error');
    }
  } catch (error) {
    showNotification('Cannot connect to server. Make sure the backend is running on http://localhost:5000', 'error');
    console.error('Server connection error:', error);
  }
}

// Check if user is authenticated
function checkAuth() {
  authToken = localStorage.getItem('authToken');
  const userData = localStorage.getItem('userData');
  
  if (authToken && userData) {
    currentUser = JSON.parse(userData);
    showDashboard();
  } else {
    showLandingPage();
  }
}

// Setup event listeners
function setupEventListeners() {
  // Landing page buttons
  const signUpBtn = document.querySelector('.box-3 button[aria-label="Sign up"]');
  const loginBtn = document.querySelector('.box-3 button[aria-label="Login"]');
  const getStartedBtn = document.querySelector('.get-started');
  
  if (signUpBtn) signUpBtn.addEventListener('click', () => showAuthModal('signup'));
  if (loginBtn) loginBtn.addEventListener('click', () => showAuthModal('login'));
  if (getStartedBtn) getStartedBtn.addEventListener('click', () => showAuthModal('signup'));
}

// Show landing page
function showLandingPage() {
  document.querySelector('.hero-section').style.display = 'flex';
  document.querySelector('.dashboard-container')?.remove();
}

// Show dashboard
function showDashboard() {
  document.querySelector('.hero-section').style.display = 'none';
  loadDashboard();
  loadTasks();
}

// Load dashboard HTML
function loadDashboard() {
  if (document.querySelector('.dashboard-container')) return;
  
  const dashboardHTML = `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <div class="header-content">
          <h1><i class="fa-brands fa-stack-exchange"></i> TaskHub</h1>
          <div class="user-info">
            <span>Welcome, ${currentUser.name}</span>
            <span class="user-role">${currentUser.role}</span>
            <button class="btn-logout" onclick="logout()">
              <i class="fa-solid fa-sign-out"></i> Logout
            </button>
          </div>
        </div>
      </header>

      <div class="dashboard-main">
        <aside class="sidebar">
          <button class="btn-create-task" onclick="showCreateTaskModal()">
            <i class="fa-solid fa-plus"></i> Create Task
          </button>
          
          <div class="filters">
            <h3>Filters</h3>
            <select id="filterStatus" onchange="applyFilters()">
              <option value="">All Status</option>
              <option value="To-Do">To-Do</option>
              <option value="In-Progress">In-Progress</option>
              <option value="Completed">Completed</option>
            </select>
            
            <select id="filterPriority" onchange="applyFilters()">
              <option value="">All Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            
            <input type="text" id="searchInput" placeholder="Search tasks..." onkeyup="applyFilters()">
          </div>

          <div class="stats">
            <h3>Statistics</h3>
            <div id="statsContent">Loading...</div>
          </div>
        </aside>

        <main class="tasks-container">
          <div class="tasks-header">
            <h2>My Tasks</h2>
            <div class="view-toggle">
              <button class="view-btn active" onclick="setView('kanban')">
                <i class="fa-solid fa-columns"></i> Kanban
              </button>
              <button class="view-btn" onclick="setView('list')">
                <i class="fa-solid fa-list"></i> List
              </button>
            </div>
          </div>

          <div id="tasksView" class="kanban-view">
            <div class="kanban-column" data-status="To-Do">
              <h3>To-Do</h3>
              <div class="tasks-list" id="tasks-todo"></div>
            </div>
            <div class="kanban-column" data-status="In-Progress">
              <h3>In-Progress</h3>
              <div class="tasks-list" id="tasks-inprogress"></div>
            </div>
            <div class="kanban-column" data-status="Completed">
              <h3>Completed</h3>
              <div class="tasks-list" id="tasks-completed"></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', dashboardHTML);
  loadTaskStats();
  
  // Setup drag and drop after a short delay to ensure DOM is ready
  setTimeout(() => {
    setupDragAndDrop();
  }, 100);
}

// Setup drag and drop for columns
function setupDragAndDrop() {
  const columns = document.querySelectorAll('.kanban-column');
  columns.forEach(column => {
    column.addEventListener('dragover', handleDragOver);
    column.addEventListener('drop', handleDrop);
    column.addEventListener('dragenter', handleDragEnter);
    column.addEventListener('dragleave', handleDragLeave);
  });
}

// API Functions
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    },
    ...options
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    
    // Check if response is ok before parsing JSON
    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    
    // Provide more specific error messages
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Cannot connect to server. Please ensure the backend server is running on http://localhost:5000');
    }
    
    throw error;
  }
}

// Authentication Functions
async function register(name, email, password, role = 'user') {
  try {
    const response = await apiCall('/auth/register', {
      method: 'POST',
      body: { name, email, password, role }
    });

    if (response.success) {
      authToken = response.data.token;
      currentUser = response.data.user;
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('userData', JSON.stringify(currentUser));
      closeAuthModal();
      showDashboard();
      showNotification('Registration successful!', 'success');
    }
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

async function login(email, password) {
  try {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: { email, password }
    });

    if (response.success) {
      authToken = response.data.token;
      currentUser = response.data.user;
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('userData', JSON.stringify(currentUser));
      closeAuthModal();
      showDashboard();
      showNotification('Login successful!', 'success');
    }
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

function logout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  document.querySelector('.dashboard-container')?.remove();
  showLandingPage();
  showNotification('Logged out successfully', 'success');
}

// Task Functions
async function loadTasks() {
  try {
    const status = document.getElementById('filterStatus')?.value || '';
    const priority = document.getElementById('filterPriority')?.value || '';
    const search = document.getElementById('searchInput')?.value || '';
    
    let endpoint = '/tasks?';
    const params = [];
    if (status) params.push(`status=${status}`);
    if (priority) params.push(`priority=${priority}`);
    if (search) params.push(`search=${search}`);
    endpoint += params.join('&');

    const response = await apiCall(endpoint);
    
    if (response.success) {
      displayTasks(response.data.tasks);
    }
  } catch (error) {
    showNotification('Failed to load tasks', 'error');
  }
}

async function loadTaskStats() {
  try {
    const response = await apiCall('/tasks/stats');
    
    if (response.success) {
      const stats = response.data;
      const statsHTML = `
        <div class="stat-item">
          <span class="stat-label">Total:</span>
          <span class="stat-value">${stats.total}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">To-Do:</span>
          <span class="stat-value">${stats.byStatus['To-Do'] || 0}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">In-Progress:</span>
          <span class="stat-value">${stats.byStatus['In-Progress'] || 0}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Completed:</span>
          <span class="stat-value">${stats.byStatus['Completed'] || 0}</span>
        </div>
      `;
      document.getElementById('statsContent').innerHTML = statsHTML;
    }
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}

function displayTasks(tasks) {
  // Clear existing tasks
  document.getElementById('tasks-todo').innerHTML = '';
  document.getElementById('tasks-inprogress').innerHTML = '';
  document.getElementById('tasks-completed').innerHTML = '';

  tasks.forEach(task => {
    const taskCard = createTaskCard(task);
    const container = document.getElementById(`tasks-${task.status.toLowerCase().replace('-', '')}`);
    if (container) {
      container.appendChild(taskCard);
    }
  });
}

function createTaskCard(task) {
  const card = document.createElement('div');
  card.className = 'task-card';
  card.draggable = true;
  card.dataset.taskId = task._id;
  card.dataset.status = task.status;

  const priorityClass = task.priority.toLowerCase();
  const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
  
  card.innerHTML = `
    <div class="task-header">
      <span class="task-priority ${priorityClass}">${task.priority}</span>
      <div class="task-actions">
        <button onclick="editTask('${task._id}')" class="btn-icon" title="Edit">
          <i class="fa-solid fa-edit"></i>
        </button>
        <button onclick="deleteTask('${task._id}')" class="btn-icon" title="Delete">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
    <h4 class="task-title">${task.title}</h4>
    <p class="task-description">${task.description || 'No description'}</p>
    <div class="task-footer">
      <div class="task-assigned">
        <i class="fa-solid fa-user"></i>
        <span>${task.assignedTo?.name || 'Unassigned'}</span>
      </div>
      <div class="task-due">
        <i class="fa-solid fa-calendar"></i>
        <span>${dueDate}</span>
      </div>
    </div>
    ${task.tags && task.tags.length > 0 ? `
      <div class="task-tags">
        ${task.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
    ` : ''}
  `;

  // Add drag event listeners
  card.addEventListener('dragstart', handleDragStart);
  card.addEventListener('dragend', handleDragEnd);

  return card;
}

// Drag and Drop
let draggedElement = null;

function handleDragStart(e) {
  draggedElement = this;
  this.style.opacity = '0.5';
}

function handleDragEnd(e) {
  this.style.opacity = '1';
}


function handleDragOver(e) {
  e.preventDefault();
}

function handleDragEnter(e) {
  e.preventDefault();
  this.classList.add('drag-over');
}

function handleDragLeave(e) {
  this.classList.remove('drag-over');
}

async function handleDrop(e) {
  e.preventDefault();
  this.classList.remove('drag-over');

  if (draggedElement) {
    const newStatus = this.dataset.status;
    const taskId = draggedElement.dataset.taskId;

    if (newStatus && taskId) {
      try {
        await apiCall(`/tasks/${taskId}/status`, {
          method: 'PATCH',
          body: { status: newStatus }
        });
        
        draggedElement.dataset.status = newStatus;
        this.querySelector('.tasks-list').appendChild(draggedElement);
        loadTaskStats();
        showNotification('Task status updated', 'success');
      } catch (error) {
        showNotification('Failed to update task status', 'error');
        loadTasks(); // Reload to reset
      }
    }
  }
}

// Create Task
async function createTask(taskData) {
  try {
    const response = await apiCall('/tasks', {
      method: 'POST',
      body: taskData
    });

    if (response.success) {
      closeCreateTaskModal();
      loadTasks();
      loadTaskStats();
      showNotification('Task created successfully', 'success');
    }
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

// Update Task
async function updateTask(taskId, taskData) {
  try {
    const response = await apiCall(`/tasks/${taskId}`, {
      method: 'PUT',
      body: taskData
    });

    if (response.success) {
      closeCreateTaskModal();
      loadTasks();
      loadTaskStats();
      showNotification('Task updated successfully', 'success');
    }
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

// Delete Task
async function deleteTask(taskId) {
  if (!confirm('Are you sure you want to delete this task?')) return;

  try {
    const response = await apiCall(`/tasks/${taskId}`, {
      method: 'DELETE'
    });

    if (response.success) {
      loadTasks();
      loadTaskStats();
      showNotification('Task deleted successfully', 'success');
    }
  } catch (error) {
    showNotification('Failed to delete task', 'error');
  }
}

// Edit Task
let editingTaskId = null;

async function editTask(taskId) {
  editingTaskId = taskId;
  try {
    const response = await apiCall(`/tasks/${taskId}`);
    
    if (response.success) {
      const task = response.data.task;
      showCreateTaskModal(task);
    }
  } catch (error) {
    showNotification('Failed to load task', 'error');
  }
}

// Filter Functions
function applyFilters() {
  loadTasks();
}

function setView(view) {
  const viewContainer = document.getElementById('tasksView');
  const buttons = document.querySelectorAll('.view-btn');
  
  buttons.forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  
  if (view === 'list') {
    viewContainer.className = 'list-view';
    // Convert kanban to list view
    const allTasks = [];
    document.querySelectorAll('.task-card').forEach(card => {
      allTasks.push(card);
    });
    
    viewContainer.innerHTML = '<div class="tasks-list-container"></div>';
    const container = viewContainer.querySelector('.tasks-list-container');
    allTasks.forEach(card => {
      card.style.width = '100%';
      container.appendChild(card);
    });
  } else {
    viewContainer.className = 'kanban-view';
    loadTasks();
  }
}

// Modal Functions
function showAuthModal(type) {
  const modalHTML = `
    <div class="modal-overlay" onclick="closeAuthModal()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <button class="modal-close" onclick="closeAuthModal()">&times;</button>
        <h2>${type === 'login' ? 'Login' : 'Sign Up'}</h2>
        <form id="authForm" onsubmit="handleAuth(event, '${type}')">
          ${type === 'signup' ? `
            <input type="text" name="name" placeholder="Name" required>
            ${currentUser?.role === 'admin' ? `
              <select name="role">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            ` : ''}
          ` : ''}
          <input type="email" name="email" placeholder="Email" required>
          <input type="password" name="password" placeholder="Password" required>
          <button type="submit">${type === 'login' ? 'Login' : 'Sign Up'}</button>
        </form>
        <p class="auth-switch">
          ${type === 'login' ? "Don't have an account? " : "Already have an account? "}
          <a href="#" onclick="event.preventDefault(); showAuthModal('${type === 'login' ? 'signup' : 'login'}'); closeAuthModal(); setTimeout(() => showAuthModal('${type === 'login' ? 'signup' : 'login'}'), 100);">${type === 'login' ? 'Sign Up' : 'Login'}</a>
        </p>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeAuthModal() {
  document.querySelector('.modal-overlay')?.remove();
}

function handleAuth(e, type) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  if (type === 'login') {
    login(data.email, data.password);
  } else {
    register(data.name, data.email, data.password, data.role);
  }
}

async function showCreateTaskModal(task = null) {
  editingTaskId = task?._id || null;
  
  // Get all users for assignment
  let usersHTML = '';
  try {
    if (currentUser?.role === 'admin') {
      const response = await apiCall('/auth/users');
      if (response.success) {
        usersHTML = response.data.users.map(user => {
          const userId = user._id || user.id;
          const isSelected = task?.assignedTo?._id === userId || task?.assignedTo === userId;
          const isCurrentUser = userId === currentUser.id;
          return `<option value="${userId}" ${isSelected ? 'selected' : ''}>${user.name}${isCurrentUser ? ' (You)' : ''}</option>`;
        }).join('');
      }
    } else {
      usersHTML = `<option value="${currentUser.id}" ${task?.assignedTo?._id === currentUser.id || task?.assignedTo === currentUser.id ? 'selected' : ''}>${currentUser.name} (You)</option>`;
    }
  } catch (error) {
    // Fallback to current user only
    usersHTML = `<option value="${currentUser.id}">${currentUser.name} (You)</option>`;
  }

  // Wait for users to load if needed
  const modalHTML = `
    <div class="modal-overlay" onclick="closeCreateTaskModal()">
      <div class="modal-content task-modal" onclick="event.stopPropagation()">
        <button class="modal-close" onclick="closeCreateTaskModal()">&times;</button>
        <h2>${task ? 'Edit Task' : 'Create New Task'}</h2>
        <form id="taskForm" onsubmit="handleTaskSubmit(event)">
          <input type="text" name="title" placeholder="Task Title" value="${task?.title || ''}" required>
          <textarea name="description" placeholder="Description">${task?.description || ''}</textarea>
          <select name="status">
            <option value="To-Do" ${task?.status === 'To-Do' ? 'selected' : ''}>To-Do</option>
            <option value="In-Progress" ${task?.status === 'In-Progress' ? 'selected' : ''}>In-Progress</option>
            <option value="Completed" ${task?.status === 'Completed' ? 'selected' : ''}>Completed</option>
          </select>
          <select name="priority">
            <option value="Low" ${task?.priority === 'Low' ? 'selected' : ''}>Low</option>
            <option value="Medium" ${task?.priority === 'Medium' ? 'selected' : ''}>Medium</option>
            <option value="High" ${task?.priority === 'High' ? 'selected' : ''}>High</option>
          </select>
          <select name="assignedTo" required>
            ${usersHTML || `<option value="${currentUser.id}">${currentUser.name}</option>`}
          </select>
          <input type="date" name="dueDate" value="${task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}">
          <input type="text" name="tags" placeholder="Tags (comma separated)" value="${task?.tags?.join(', ') || ''}">
          <button type="submit">${task ? 'Update Task' : 'Create Task'}</button>
        </form>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeCreateTaskModal() {
  document.querySelector('.modal-overlay')?.remove();
  editingTaskId = null;
}

function handleTaskSubmit(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = {
    title: formData.get('title'),
    description: formData.get('description'),
    status: formData.get('status'),
    priority: formData.get('priority'),
    assignedTo: formData.get('assignedTo'),
    dueDate: formData.get('dueDate') || undefined,
    tags: formData.get('tags') ? formData.get('tags').split(',').map(t => t.trim()).filter(t => t) : []
  };

  if (editingTaskId) {
    updateTask(editingTaskId, data);
  } else {
    createTask(data);
  }
}

// Notification System
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Make functions globally available
window.register = register;
window.login = login;
window.logout = logout;
window.showCreateTaskModal = showCreateTaskModal;
window.closeCreateTaskModal = closeCreateTaskModal;
window.showAuthModal = showAuthModal;
window.closeAuthModal = closeAuthModal;
window.handleAuth = handleAuth;
window.editTask = editTask;
window.deleteTask = deleteTask;
window.applyFilters = applyFilters;
window.setView = setView;
