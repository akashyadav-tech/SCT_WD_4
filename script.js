
        // Task App Object
        const app = {
            tasks: [],
            currentFilter: 'all',
            currentSort: 'date',
            editingId: null,

            // Initialize app
            init() {
                this.loadTasks();
                this.setDefaultDate();
                this.render();
            },

            // Set default date to today
            setDefaultDate() {
                const today = new Date().toISOString().split('T')[0];
                document.getElementById('taskDate').value = today;
                document.getElementById('taskDate').min = today;
            },

            // Add new task
            addTask() {
                const title = document.getElementById('taskTitle').value.trim();
                const description = document.getElementById('taskDescription').value.trim();
                const date = document.getElementById('taskDate').value;
                const time = document.getElementById('taskTime').value;

                if (!title || !date || !time) {
                    alert('Please fill in all required fields');
                    return;
                }

                const task = {
                    id: Date.now(),
                    title,
                    description,
                    date,
                    time,
                    status: 'pending',
                    createdAt: new Date().toISOString()
                };

                this.tasks.unshift(task);
                this.saveTasks();
                this.resetForm();
                this.render();
            },

            // Reset form
            resetForm() {
                document.getElementById('taskTitle').value = '';
                document.getElementById('taskDescription').value = '';
                document.getElementById('taskTime').value = '';
                this.setDefaultDate();
            },

            // Delete task
            deleteTask(id) {
                if (confirm('Are you sure you want to delete this task?')) {
                    this.tasks = this.tasks.filter(t => t.id !== id);
                    this.saveTasks();
                    this.render();
                }
            },

            // Toggle task completion
            toggleComplete(id) {
                const task = this.tasks.find(t => t.id === id);
                if (task) {
                    task.status = task.status === 'pending' ? 'completed' : 'pending';
                    this.saveTasks();
                    this.render();
                }
            },

            // Open edit modal
            openEditModal(id) {
                this.editingId = id;
                const task = this.tasks.find(t => t.id === id);
                if (task) {
                    document.getElementById('editTitle').value = task.title;
                    document.getElementById('editDescription').value = task.description;
                    document.getElementById('editDate').value = task.date;
                    document.getElementById('editTime').value = task.time;
                    document.getElementById('editModal').classList.add('active');
                }
            },

            // Close modal
            closeModal() {
                document.getElementById('editModal').classList.remove('active');
                this.editingId = null;
            },

            // Save edited task
            saveEdit() {
                const task = this.tasks.find(t => t.id === this.editingId);
                if (task) {
                    task.title = document.getElementById('editTitle').value.trim();
                    task.description = document.getElementById('editDescription').value.trim();
                    task.date = document.getElementById('editDate').value;
                    task.time = document.getElementById('editTime').value;

                    if (!task.title || !task.date || !task.time) {
                        alert('Please fill in all required fields');
                        return;
                    }

                    this.saveTasks();
                    this.render();
                    this.closeModal();
                }
            },

            // Filter tasks
            filterTasks(filter) {
                this.currentFilter = filter;
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                event.target.classList.add('active');
                this.render();
            },

            // Get filtered tasks
            getFilteredTasks() {
                switch (this.currentFilter) {
                    case 'completed':
                        return this.tasks.filter(t => t.status === 'completed');
                    case 'pending':
                        return this.tasks.filter(t => t.status === 'pending');
                    default:
                        return this.tasks;
                }
            },

            // Sort tasks
            sortTasks(sortBy) {
                this.currentSort = sortBy;
                this.render();
            },

            // Get sorted tasks
            getSortedTasks(tasksToSort) {
                const sorted = [...tasksToSort];
                switch (this.currentSort) {
                    case 'time':
                        sorted.sort((a, b) => a.time.localeCompare(b.time));
                        break;
                    case 'status':
                        sorted.sort((a, b) => a.status.localeCompare(b.status));
                        break;
                    case 'date':
                    default:
                        sorted.sort((a, b) => a.date.localeCompare(b.date));
                }
                return sorted;
            },

            // Check if task is overdue
            isOverdue(date) {
                const today = new Date().toISOString().split('T')[0];
                return date < today;
            },

            // Format date and time
            formatDateTime(date, time) {
                const dateObj = new Date(date + 'T' + time);
                return dateObj.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }) + ' at ' + dateObj.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            },

            // Clear completed tasks
            clearCompleted() {
                if (confirm('Delete all completed tasks?')) {
                    this.tasks = this.tasks.filter(t => t.status !== 'completed');
                    this.saveTasks();
                    this.render();
                }
            },

            // Render tasks
            render() {
                const filtered = this.getFilteredTasks();
                const sorted = this.getSortedTasks(filtered);
                const taskList = document.getElementById('taskList');
                const taskCount = document.getElementById('taskCount');
                const clearBtn = document.getElementById('clearBtn');

                taskCount.textContent = this.tasks.length;
                clearBtn.disabled = !this.tasks.some(t => t.status === 'completed');

                if (sorted.length === 0) {
                    taskList.innerHTML = `
                        <div class="empty-state">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="9 11 12 14 22 4"></polyline>
                                <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path>
                            </svg>
                            <p>${this.currentFilter === 'completed' ? 'No completed tasks yet!' : 
                              this.currentFilter === 'pending' ? 'No pending tasks! Great job!' :
                              'No tasks yet. Create one to get started!'}</p>
                        </div>
                    `;
                    return;
                }

                taskList.innerHTML = sorted.map(task => {
                    const isOverdue = this.isOverdue(task.date) && task.status === 'pending';
                    const statusClass = isOverdue ? 'overdue' : task.status;
                    const statusText = isOverdue ? 'Overdue' : task.status;
                    const statusDisplay = isOverdue ? 'status-overdue' : 
                                        task.status === 'completed' ? 'status-completed' : 'status-pending';

                    return `
                        <div class="task-item ${task.status === 'completed' ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}">
                            <div class="task-title">${this.escapeHtml(task.title)}</div>
                            ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
                            <div class="task-meta">
                                <div class="task-datetime">📅 ${this.formatDateTime(task.date, task.time)}</div>
                                <span class="task-status ${statusDisplay}">${statusText}</span>
                            </div>
                            <div class="task-actions">
                                <button class="btn-small ${task.status === 'completed' ? 'btn-undo' : 'btn-complete'}" 
                                        onclick="app.toggleComplete(${task.id})">
                                    ${task.status === 'completed' ? '↺ Undo' : '✓ Complete'}
                                </button>
                                <button class="btn-small btn-edit" onclick="app.openEditModal(${task.id})">✎ Edit</button>
                                <button class="btn-small btn-delete" onclick="app.deleteTask(${task.id})">🗑 Delete</button>
                            </div>
                        </div>
                    `;
                }).join('');
            },

            // Escape HTML to prevent XSS
            escapeHtml(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            },

            // Save tasks to localStorage
            saveTasks() {
                localStorage.setItem('tasks', JSON.stringify(this.tasks));
            },

            // Load tasks from localStorage
            loadTasks() {
                const saved = localStorage.getItem('tasks');
                this.tasks = saved ? JSON.parse(saved) : [];
            }
        };

        // Initialize app when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => app.init());

        // Close modal when clicking outside
        document.getElementById('editModal').addEventListener('click', (e) => {
            if (e.target.id === 'editModal') {
                app.closeModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                app.closeModal();
            }
        });
    
