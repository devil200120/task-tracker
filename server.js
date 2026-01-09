const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'tasks.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize tasks file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Helper functions
const readTasks = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const writeTasks = (tasks) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
};

// API Routes

// Get all tasks
app.get('/api/tasks', (req, res) => {
    try {
        const tasks = readTasks();
        res.json({ success: true, tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
    }
});

// Add a new task
app.post('/api/tasks', (req, res) => {
    try {
        const { title, priority, dueDate } = req.body;
        
        if (!title || title.trim() === '') {
            return res.status(400).json({ success: false, message: 'Task title is required' });
        }

        const tasks = readTasks();
        const newTask = {
            id: uuidv4(),
            title: title.trim(),
            completed: false,
            priority: priority || 'medium',
            dueDate: dueDate || null,
            createdAt: new Date().toISOString()
        };
        
        tasks.unshift(newTask);
        writeTasks(tasks);
        
        res.status(201).json({ success: true, task: newTask });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to add task' });
    }
});

// Toggle task completion status
app.patch('/api/tasks/:id/toggle', (req, res) => {
    try {
        const { id } = req.params;
        const tasks = readTasks();
        const taskIndex = tasks.findIndex(task => task.id === id);
        
        if (taskIndex === -1) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        tasks[taskIndex].completedAt = tasks[taskIndex].completed ? new Date().toISOString() : null;
        writeTasks(tasks);
        
        res.json({ success: true, task: tasks[taskIndex] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update task' });
    }
});

// Update a task
app.put('/api/tasks/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { title, priority, dueDate } = req.body;
        const tasks = readTasks();
        const taskIndex = tasks.findIndex(task => task.id === id);
        
        if (taskIndex === -1) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        
        if (title) tasks[taskIndex].title = title.trim();
        if (priority) tasks[taskIndex].priority = priority;
        if (dueDate !== undefined) tasks[taskIndex].dueDate = dueDate;
        tasks[taskIndex].updatedAt = new Date().toISOString();
        
        writeTasks(tasks);
        res.json({ success: true, task: tasks[taskIndex] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update task' });
    }
});

// Clear all completed tasks
app.delete('/api/tasks/completed/clear', (req, res) => {
    try {
        let tasks = readTasks();
        const completedCount = tasks.filter(t => t.completed).length;
        tasks = tasks.filter(task => !task.completed);
        writeTasks(tasks);
        
        res.json({ success: true, message: `Cleared ${completedCount} completed tasks`, count: completedCount });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to clear tasks' });
    }
});

// Delete a task
app.delete('/api/tasks/:id', (req, res) => {
    try {
        const { id } = req.params;
        let tasks = readTasks();
        const taskIndex = tasks.findIndex(task => task.id === id);
        
        if (taskIndex === -1) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        
        tasks = tasks.filter(task => task.id !== id);
        writeTasks(tasks);
        
        res.json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete task' });
    }
});

// Serve the frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Task Tracker server running at http://localhost:${PORT}`);
});
