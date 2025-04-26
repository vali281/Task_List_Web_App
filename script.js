// Get DOM elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const clearAllBtn = document.getElementById('clear-all');
const themeToggleBtn = document.getElementById('theme-toggle');
const filterButtons = document.getElementById('filter-buttons');

// Initialize tasks array and filter state
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// Load saved theme or system preference
let savedTheme;
try {
    savedTheme = localStorage.getItem('theme');
} catch (e) {
    console.error('Failed to access localStorage for theme:', e);
}
const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (savedTheme === 'dark' || (!savedTheme && isSystemDark)) {
    document.documentElement.classList.add('dark-mode');
    themeToggleBtn.setAttribute('aria-label', 'Switch to light mode');
} else {
    themeToggleBtn.setAttribute('aria-label', 'Switch to dark mode');
}

// Load initial tasks
renderTasks();

// Form submit handler
taskForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const taskText = taskInput.value.trim();
    if (taskText) {
        addTask(taskText);
        taskInput.value = '';
        taskInput.focus();
    } else {
        taskInput.classList.add('error');
        setTimeout(() => taskInput.classList.remove('error'), 2000);
    }
});

// Add task function
function addTask(text) {
    if (tasks.some(t => t.text.toLowerCase() === text.toLowerCase())) return;
    const task = {
        id: Date.now(),
        text: text,
        completed: false
    };
    tasks.push(task);
    saveAndRender();
}

// Render all tasks
function renderTasks() {
    taskList.innerHTML = '';
    let filteredTasks = currentFilter === 'all' ? tasks :
        currentFilter === 'pending' ? tasks.filter(task => !task.completed) :
            tasks.filter(task => task.completed);
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.setAttribute('data-id', task.id);
        li.setAttribute('role', 'listitem');
        li.className = task.completed ? 'completed' : '';
        li.innerHTML = `
            <input type="checkbox" 
                ${task.completed ? 'checked aria-checked="true"' : 'aria-checked="false"'}
                aria-label="Mark ${task.text} as complete">
            <span class="task-text">${task.text}</span>
            <button class="delete-btn" aria-label="Delete ${task.text}">🗑️</button>
        `;
        taskList.appendChild(li);
    });
    clearAllBtn.disabled = tasks.length === 0;
}

// Toggle task completion
taskList.addEventListener('change', function (e) {
    if (e.target.matches('input[type="checkbox"]')) {
        const taskId = parseInt(e.target.closest('li').dataset.id);
        const task = tasks.find(t => t.id === taskId);
        task.completed = !task.completed;
        e.target.closest('li').classList.toggle('completed');
        saveAndRender();
    }
});

// Delete task
taskList.addEventListener('click', function (e) {
    if (e.target.matches('.delete-btn')) {
        const taskId = parseInt(e.target.closest('li').dataset.id);
        tasks = tasks.filter(t => t.id !== taskId);
        saveAndRender();
    }
});

// Clear all tasks
clearAllBtn.addEventListener('click', function () {
    if (!confirm('Are you sure you want to clear all tasks?')) return;
    tasks = [];
    localStorage.removeItem('tasks');
    saveAndRender();
});

// Toggle theme
themeToggleBtn.addEventListener('click', function() {
    const htmlElement = document.documentElement;
    htmlElement.classList.toggle('dark-mode');
    const isDarkMode = htmlElement.classList.contains('dark-mode');
    
    // Show feedback message
    const message = document.createElement('p');
    message.className = 'theme-message';
    message.textContent = `Switched to ${isDarkMode ? 'dark' : 'light'} mode`;
    message.setAttribute('aria-live', 'polite');
    taskList.insertAdjacentElement('beforebegin', message);
    setTimeout(() => message.remove(), 2000);

    // Save theme
    try {
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    } catch (e) {
        console.error('Failed to save theme to localStorage:', e);
    }

    // Update button accessibility
    themeToggleBtn.setAttribute('aria-label', 
        isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
    );
});

// Filter tasks
filterButtons.addEventListener('click', function (e) {
    if (e.target.matches('.filter')) {
        currentFilter = e.target.dataset.filter;
        document.querySelectorAll('.filter').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
        e.target.classList.add('active');
        e.target.setAttribute('aria-pressed', 'true');
        const message = document.createElement('p');
        message.className = 'filter-message';
        message.textContent = `Showing ${currentFilter} tasks`;
        message.setAttribute('aria-live', 'polite');
        taskList.insertAdjacentElement('beforebegin', message);
        setTimeout(() => message.remove(), 2000);
        renderTasks();
    }
});

// Save to localStorage and re-render
function saveAndRender() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}