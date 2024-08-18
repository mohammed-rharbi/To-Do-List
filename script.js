document.addEventListener('DOMContentLoaded', () => {
    let projects = loadProjectsFromLocalStorage();
    const projectForm = document.getElementById('project-form');
    const projectsContainer = document.getElementById('projects-container');
    const taskFormModal = document.getElementById('task-form-modal');
    let currentProjectId = null;
    let editTaskIndex = null;

    projects.forEach(project => addProjectToDOM(project));

    projectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const projectName = document.getElementById('project-name').value.trim();

        if (projectName) {
            const projectId = Date.now();
            const project = { id: projectId, name: projectName, tasks: [] };
            projects.push(project);
            saveProjectsToLocalStorage(projects);
            addProjectToDOM(project);
            document.getElementById('project-name').value = '';
        } else {
            alert("Please enter a project name.");
        }
    });

    function addProjectToDOM(project) {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.innerHTML = `
            <h3>${project.name}</h3>
            <button onclick="openTaskForm(${project.id})">Create Task</button>
            <button onclick="deleteProject(${project.id})">Delete Project</button>
            <div class="task-list" id="task-list-${project.id}"></div>
        `;
        projectsContainer.appendChild(projectCard);

        project.tasks.forEach((task, index) => addTaskToDOM(project.id, task, index));
    }

    window.openTaskForm = function (projectId, taskIndex = null) {
        currentProjectId = projectId;
        editTaskIndex = taskIndex;

        if (taskIndex !== null) {
            const project = projects.find(p => p.id === projectId);
            const task = project.tasks[taskIndex];
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-description').value = task.description;
            document.getElementById('task-priority').value = task.priority;
            document.getElementById('task-status').value = task.status;
        } else {
            resetTaskForm();
        }

        taskFormModal.style.display = 'flex';
    };

    document.getElementById('cancel-task-btn').addEventListener('click', () => {
        taskFormModal.style.display = 'none';
        resetTaskForm();
    });

    document.getElementById('save-task-btn').addEventListener('click', () => {
        const taskTitle = document.getElementById('task-title').value.trim();
        const taskDescription = document.getElementById('task-description').value.trim();
        const taskPriority = document.getElementById('task-priority').value;
        const taskStatus = document.getElementById('task-status').value;



        if(!taskTitle){
            document.getElementById('er-name').style.display = 'block';
        }

        if(!taskDescription){
            document.getElementById('er-desc').style.display = 'block';
        }

        
        if (taskTitle && taskDescription) {
            const project = projects.find(p => p.id === currentProjectId);

            if (editTaskIndex === null) {
                const task = { title: taskTitle, description: taskDescription, priority: taskPriority, status: taskStatus, done: false };
                project.tasks.push(task);
                addTaskToDOM(project.id, task, project.tasks.length - 1);
            } else {
                const task = project.tasks[editTaskIndex];
                task.title = taskTitle;
                task.description = taskDescription;
                task.priority = taskPriority;
                task.status = taskStatus;
                updateTaskInDOM(currentProjectId, editTaskIndex, task);
            }

            saveProjectsToLocalStorage(projects);
            taskFormModal.style.display = 'none';
            resetTaskForm();
        } else {
            alert("Please enter a task detales.");
        }
    });

    function addTaskToDOM(projectId, task, taskIndex) {
        const taskList = document.getElementById(`task-list-${projectId}`);
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        taskItem.innerHTML = `
            <h4>${task.title}</h4>
            <p>${task.description}</p>
            <p>Priority: ${task.priority} | Status: ${task.status}</p>
            <button onclick="openTaskForm(${projectId}, ${taskIndex})">Edit</button>
            <button onclick="deleteTask(${projectId}, ${taskIndex})">Delete</button>
            <button onclick="toggleTaskDone(${projectId}, ${taskIndex})">${task.done ? 'Undo' : 'Mark as Done'}</button>
        `;
        if (task.done) {
            taskItem.classList.add('task-done');
        }
        taskList.appendChild(taskItem);
    }

    function updateTaskInDOM(projectId, taskIndex, task) {
        const taskList = document.getElementById(`task-list-${projectId}`);
        const taskItem = taskList.children[taskIndex];
        taskItem.innerHTML = `
            <h4>${task.title}</h4>
            <p>${task.description}</p>
            <p>Priority: ${task.priority} | Status: ${task.status}</p>
            <button onclick="openTaskForm(${projectId}, ${taskIndex})">Edit</button>
            <button onclick="deleteTask(${projectId}, ${taskIndex})">Delete</button>
            <button onclick="toggleTaskDone(${projectId}, ${taskIndex})">${task.done ? 'Undo' : 'Mark as Done'}</button>
        `;
        taskItem.className = 'task-item';
        if (task.done) {
            taskItem.classList.add('task-done');
        }
    }

    window.toggleTaskDone = function (projectId, taskIndex) {
        const project = projects.find(p => p.id === projectId);
        const task = project.tasks[taskIndex];
        task.done = !task.done;
        task.status = task.done ? 'done' : 'todo';

        updateTaskInDOM(projectId, taskIndex, task);
        
        saveProjectsToLocalStorage(projects);
    };

    window.deleteTask = function (projectId, taskIndex) {
        if (confirm("Are you sure you want to delete this task?")) {
            const project = projects.find(p => p.id === projectId);
            project.tasks.splice(taskIndex, 1);
            saveProjectsToLocalStorage(projects);
            document.getElementById(`task-list-${projectId}`).children[taskIndex].remove();
        }
    };

    window.deleteProject = function (projectId) {
        if (confirm("Are you sure you want to delete this project?")) {
            projects = projects.filter(p => p.id !== projectId);
            saveProjectsToLocalStorage(projects);
            const projectCard = document.querySelector(`.project-card button[onclick="openTaskForm(${projectId})"]`).parentElement;
            projectCard.remove();
        }
    };

    function saveProjectsToLocalStorage(projects) {
        localStorage.setItem('projects', JSON.stringify(projects));
    }

    function loadProjectsFromLocalStorage() {
        const projects = localStorage.getItem('projects');
        return projects ? JSON.parse(projects) : [];
    }

    function resetTaskForm() {
        document.getElementById('task-title').value = '';
        document.getElementById('task-description').value = '';
        document.getElementById('task-priority').value = 'medium';
        document.getElementById('task-status').value = 'todo';
        editTaskIndex = null;
    }
});
