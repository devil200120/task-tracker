// ===== Task Tracker Application =====

const API_URL = '/api/tasks';

// DOM Elements
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const dueDateInput = document.getElementById('dueDateInput');
const tasksList = document.getElementById('tasksList');
const emptyState = document.getElementById('emptyState');
const totalTasksEl = document.getElementById('totalTasks');
const pendingTasksEl = document.getElementById('pendingTasks');
const completedTasksEl = document.getElementById('completedTasks');
const progressFill = document.getElementById('progressFill');
const progressPercent = document.getElementById('progressPercent');
const filterBtns = document.querySelectorAll('.filter-btn');
const priorityBtns = document.querySelectorAll('.priority-select:not(.edit-priority) .priority-btn');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const themeToggle = document.getElementById('themeToggle');
const searchInput = document.getElementById('searchInput');
const searchClear = document.getElementById('searchClear');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const confettiContainer = document.getElementById('confetti-container');

// Modal Elements
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const editTaskInput = document.getElementById('editTaskInput');
const editDueDate = document.getElementById('editDueDate');
const editPriorityBtns = document.querySelectorAll('.edit-priority .priority-btn');
const modalClose = document.getElementById('modalClose');
const cancelEdit = document.getElementById('cancelEdit');

// State
let tasks = [];
let currentFilter = 'all';
let selectedPriority = 'medium';
let editingTaskId = null;
let editingPriority = 'medium';
let searchQuery = '';

// ===== Theme Management =====

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// ===== API Functions =====

async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        if (data.success) {
            tasks = data.tasks;
            renderTasks();
            updateStats();
        }
    } catch (error) {
        console.error('Error fetching tasks:', error);
        showToast('Failed to load tasks', 'error');
    }
}

async function addTask(title, priority, dueDate) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, priority, dueDate })
        });
        const data = await response.json();
        
        if (data.success) {
            tasks.unshift(data.task);
            renderTasks();
            updateStats();
            showToast('Task added successfully!', 'success');
            return true;
        } else {
            showToast(data.message || 'Failed to add task', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error adding task:', error);
        showToast('Failed to add task', 'error');
        return false;
    }
}

async function toggleTask(id) {
    try {
        const response = await fetch(`${API_URL}/${id}/toggle`, {
            method: 'PATCH'
        });
        const data = await response.json();
        
        if (data.success) {
            const taskIndex = tasks.findIndex(t => t.id === id);
            if (taskIndex !== -1) {
                tasks[taskIndex] = data.task;
                renderTasks();
                updateStats();
                
                if (data.task.completed) {
                    showToast('Task completed! 🎉', 'success');
                    triggerConfetti();
                } else {
                    showToast('Task marked as pending', 'success');
                }
            }
        }
    } catch (error) {
        console.error('Error toggling task:', error);
        showToast('Failed to update task', 'error');
    }
}

async function updateTask(id, title, priority, dueDate) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, priority, dueDate })
        });
        const data = await response.json();
        
        if (data.success) {
            const taskIndex = tasks.findIndex(t => t.id === id);
            if (taskIndex !== -1) {
                tasks[taskIndex] = data.task;
                renderTasks();
                showToast('Task updated successfully!', 'success');
            }
            return true;
        } else {
            showToast(data.message || 'Failed to update task', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error updating task:', error);
        showToast('Failed to update task', 'error');
        return false;
    }
}

async function deleteTask(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        
        if (data.success) {
            tasks = tasks.filter(t => t.id !== id);
            renderTasks();
            updateStats();
            showToast('Task deleted', 'success');
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        showToast('Failed to delete task', 'error');
    }
}

async function clearCompletedTasks() {
    try {
        const response = await fetch(`${API_URL}/completed/clear`, {
            method: 'DELETE'
        });
        const data = await response.json();
        
        if (data.success) {
            tasks = tasks.filter(t => !t.completed);
            renderTasks();
            updateStats();
            showToast(`Cleared ${data.count} completed tasks`, 'success');
        }
    } catch (error) {
        console.error('Error clearing tasks:', error);
        showToast('Failed to clear tasks', 'error');
    }
}

// ===== Render Functions =====

function renderTasks() {
    let filteredTasks = filterTasks(tasks, currentFilter);
    
    // Apply search filter
    if (searchQuery) {
        filteredTasks = filteredTasks.filter(task => 
            task.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    
    if (filteredTasks.length === 0) {
        tasksList.innerHTML = '';
        emptyState.classList.remove('hidden');
        
        // Update empty state message based on filter
        const emptyTitle = emptyState.querySelector('h3');
        const emptyText = emptyState.querySelector('p');
        
        if (searchQuery) {
            emptyTitle.textContent = 'No matching tasks';
            emptyText.textContent = 'Try a different search term.';
        } else if (currentFilter === 'pending') {
            emptyTitle.textContent = 'No pending tasks';
            emptyText.textContent = 'All tasks are completed! Great job! 🎉';
        } else if (currentFilter === 'completed') {
            emptyTitle.textContent = 'No completed tasks';
            emptyText.textContent = 'Complete some tasks to see them here.';
        } else {
            emptyTitle.textContent = 'No tasks yet';
            emptyText.textContent = 'Add your first task to get started!';
        }
    } else {
        emptyState.classList.add('hidden');
        tasksList.innerHTML = filteredTasks.map(task => createTaskHTML(task)).join('');
        attachTaskEventListeners();
    }
}

function createTaskHTML(task) {
    const createdDate = formatDate(task.createdAt);
    const statusClass = task.completed ? 'completed' : 'pending';
    const statusText = task.completed ? 'Completed' : 'Pending';
    const priorityClass = task.priority || 'medium';
    const dueInfo = formatDueDate(task.dueDate, task.completed);
    
    return `
        <div class="task-item ${task.completed ? 'completed' : ''} priority-${priorityClass}" data-id="${task.id}">
            <label class="task-checkbox">
                <input type="checkbox" ${task.completed ? 'checked' : ''}>
                <span class="checkbox-custom">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </span>
            </label>
            <div class="task-content">
                <p class="task-title">${escapeHTML(task.title)}</p>
                <div class="task-meta">
                    <span class="task-date">${createdDate}</span>
                    ${dueInfo ? `<span class="task-due ${dueInfo.overdue ? 'overdue' : ''}">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                            <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        ${dueInfo.text}
                    </span>` : ''}
                    <span class="task-priority-badge ${priorityClass}">${priorityClass}</span>
                    <span class="task-status ${statusClass}">${statusText}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="edit-btn" title="Edit task">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <button class="delete-btn" title="Delete task">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
}

function attachTaskEventListeners() {
    // Checkbox listeners
    document.querySelectorAll('.task-checkbox input').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const taskItem = e.target.closest('.task-item');
            const taskId = taskItem.dataset.id;
            toggleTask(taskId);
        });
    });
    
    // Edit button listeners
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskItem = e.target.closest('.task-item');
            const taskId = taskItem.dataset.id;
            openEditModal(taskId);
        });
    });
    
    // Delete button listeners
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskItem = e.target.closest('.task-item');
            const taskId = taskItem.dataset.id;
            
            // Add delete animation
            taskItem.style.transform = 'translateX(100%)';
            taskItem.style.opacity = '0';
            
            setTimeout(() => {
                deleteTask(taskId);
            }, 200);
        });
    });
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    animateNumber(totalTasksEl, total);
    animateNumber(pendingTasksEl, pending);
    animateNumber(completedTasksEl, completed);
    
    // Update progress bar
    progressFill.style.width = `${progress}%`;
    progressPercent.textContent = `${progress}%`;
}

// ===== Modal Functions =====

function openEditModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    editingTaskId = taskId;
    editTaskInput.value = task.title;
    editDueDate.value = task.dueDate || '';
    editingPriority = task.priority || 'medium';
    
    // Set active priority button
    editPriorityBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.priority === editingPriority);
    });
    
    editModal.classList.add('active');
}

function closeEditModal() {
    editModal.classList.remove('active');
    editingTaskId = null;
}

// ===== Filter Functions =====

function filterTasks(tasks, filter) {
    switch (filter) {
        case 'pending':
            return tasks.filter(t => !t.completed);
        case 'completed':
            return tasks.filter(t => t.completed);
        default:
            return tasks;
    }
}

function setFilter(filter) {
    currentFilter = filter;
    
    // Update active button
    filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    
    renderTasks();
}

// ===== Confetti Effect =====

function triggerConfetti() {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#38ef7d', '#f2c94c'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            
            // Random shape
            if (Math.random() > 0.5) {
                confetti.style.borderRadius = '50%';
            }
            
            confettiContainer.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 4000);
        }, i * 20);
    }
}

// ===== Utility Functions =====

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 7) {
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    } else if (days > 0) {
        return days === 1 ? 'Yesterday' : `${days} days ago`;
    } else if (hours > 0) {
        return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    } else if (minutes > 0) {
        return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
    } else {
        return 'Just now';
    }
}

function formatDueDate(dueDate, completed) {
    if (!dueDate) return null;
    
    const due = new Date(dueDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    
    let text;
    let overdue = false;
    
    if (diffDays < 0) {
        text = `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} overdue`;
        overdue = !completed;
    } else if (diffDays === 0) {
        text = 'Due today';
    } else if (diffDays === 1) {
        text = 'Due tomorrow';
    } else if (diffDays <= 7) {
        text = `Due in ${diffDays} days`;
    } else {
        text = due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    return { text, overdue };
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function animateNumber(element, target) {
    const current = parseInt(element.textContent) || 0;
    const diff = target - current;
    const duration = 300;
    const steps = 20;
    const increment = diff / steps;
    let step = 0;
    
    const timer = setInterval(() => {
        step++;
        const value = Math.round(current + (increment * step));
        element.textContent = value;
        
        if (step >= steps) {
            element.textContent = target;
            clearInterval(timer);
        }
    }, duration / steps);
}

function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== Event Listeners =====

// Theme toggle
themeToggle.addEventListener('click', toggleTheme);

// Form submit
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = taskInput.value.trim();
    if (!title) {
        showToast('Please enter a task', 'error');
        taskInput.focus();
        return;
    }
    
    const dueDate = dueDateInput.value || null;
    const success = await addTask(title, selectedPriority, dueDate);
    if (success) {
        taskInput.value = '';
        dueDateInput.value = '';
        taskInput.focus();
    }
});

// Priority buttons
priorityBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        priorityBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedPriority = btn.dataset.priority;
    });
});

// Edit modal priority buttons
editPriorityBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        editPriorityBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        editingPriority = btn.dataset.priority;
    });
});

// Filter buttons
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        setFilter(btn.dataset.filter);
    });
});

// Search functionality
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    searchClear.classList.toggle('visible', searchQuery.length > 0);
    renderTasks();
});

searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    searchClear.classList.remove('visible');
    renderTasks();
});

// Clear completed button
clearCompletedBtn.addEventListener('click', () => {
    const completedCount = tasks.filter(t => t.completed).length;
    if (completedCount === 0) {
        showToast('No completed tasks to clear', 'error');
        return;
    }
    clearCompletedTasks();
});

// Edit modal events
modalClose.addEventListener('click', closeEditModal);
cancelEdit.addEventListener('click', closeEditModal);

document.querySelector('.modal-overlay')?.addEventListener('click', closeEditModal);

editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = editTaskInput.value.trim();
    if (!title) {
        showToast('Please enter a task title', 'error');
        return;
    }
    
    const dueDate = editDueDate.value || null;
    const success = await updateTask(editingTaskId, title, editingPriority, dueDate);
    if (success) {
        closeEditModal();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Focus input on '/' key
    if (e.key === '/' && document.activeElement !== taskInput && document.activeElement !== searchInput) {
        e.preventDefault();
        taskInput.focus();
    }
    
    // Escape to close modal or blur input
    if (e.key === 'Escape') {
        if (editModal.classList.contains('active')) {
            closeEditModal();
        } else {
            taskInput.blur();
            searchInput.blur();
        }
    }
    
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
    }
});

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    fetchTasks();
});
