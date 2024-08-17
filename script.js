document.addEventListener('DOMContentLoaded', function () {
    const taskList = document.getElementById('taskList');
    const openModalBtn = document.getElementById('openModalBtn');
    const choiceModal = document.getElementById('choiceModal');
    const taskModal = document.getElementById('taskModal');
    const groupModal = document.getElementById('groupModal');
    const closeBtns = document.querySelectorAll('.close');
    const createTaskBtn = document.getElementById('createTaskBtn');
    const createGroupBtn = document.getElementById('createGroupBtn');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const addGroupBtn = document.getElementById('addGroupBtn');
    const noTasksMessage = document.getElementById('noTasksMessage');
    const noTasksContainer = document.getElementById('noTasksContainer');

    // Initialize SortableJS for the main task list
    const sortable = new Sortable(taskList, {
        animation: 150,
        delay: 200,
        delayOnTouchOnly: true,
        touchStartThreshold: 10,
        group: {
            name: 'tasks',
            pull: true,   // Allow dragging from this list
            put: true     // Allow dropping into this list
        },
        swapThreshold: 0.5,
        invertSwap: true,
        ghostClass: 'sortable-ghost',
        onEnd: function () {
            saveOrderToLocalStorage();
        }
    });

    // Load tasks from LocalStorage on page load
    function loadTasksFromLocalStorage() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => addTaskToUI(task));

        const groups = JSON.parse(localStorage.getItem('taskGroups')) || [];
        groups.forEach(group => addTaskGroupToUI(group));
    }

    // Save tasks to LocalStorage
    function saveTasksToLocalStorage(tasks) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Save task groups to LocalStorage
    function saveTaskGroupsToLocalStorage(groups) {
        localStorage.setItem('taskGroups', JSON.stringify(groups));
    }

    // Save the current order of tasks to LocalStorage
    function saveOrderToLocalStorage() {
        const orderedTasks = [];
        const orderedGroups = [];

        taskList.querySelectorAll('li.task-item').forEach((item) => {
            const taskId = item.dataset.id;
            const task = getTasksFromLocalStorage().find(t => t.id == taskId);
            if (task) {
                orderedTasks.push(task);
            }
        });

        taskList.querySelectorAll('li.task-group').forEach((group) => {
            const groupId = group.dataset.id;
            const taskGroup = getTaskGroupsFromLocalStorage().find(g => g.id == groupId);
            if (taskGroup) {
                orderedGroups.push(taskGroup);
            }
        });

        saveTasksToLocalStorage(orderedTasks);
        saveTaskGroupsToLocalStorage(orderedGroups);
    }

    // Get all tasks from LocalStorage
    function getTasksFromLocalStorage() {
        return JSON.parse(localStorage.getItem('tasks')) || [];
    }

    // Get all task groups from LocalStorage
    function getTaskGroupsFromLocalStorage() {
        return JSON.parse(localStorage.getItem('taskGroups')) || [];
    }

    // Open the choice modal when clicking the plus sign
    openModalBtn.addEventListener('click', function () {
        choiceModal.style.display = 'block';
    });

    // Close all modals
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            choiceModal.style.display = 'none';
            taskModal.style.display = 'none';
            groupModal.style.display = 'none';
        });
    });

    // Close modals when clicking outside of them
    window.addEventListener('click', function (event) {
        if (event.target == choiceModal) {
            choiceModal.style.display = 'none';
        } else if (event.target == taskModal) {
            taskModal.style.display = 'none';
        } else if (event.target == groupModal) {
            groupModal.style.display = 'none';
        }
    });

    // Open the task creation modal
    createTaskBtn.addEventListener('click', function () {
        choiceModal.style.display = 'none';
        taskModal.style.display = 'block';
    });

    // Open the group creation modal
    createGroupBtn.addEventListener('click', function () {
        choiceModal.style.display = 'none';
        groupModal.style.display = 'block';
    });

    // Add a task group to the UI
    function addTaskGroup(groupName, groupColor) {
        const groupId = Date.now();
        const taskGroup = { id: groupId, name: groupName, color: groupColor, tasks: [] };
        const groups = getTaskGroupsFromLocalStorage();
        groups.push(taskGroup);
        saveTaskGroupsToLocalStorage(groups);
        addTaskGroupToUI(taskGroup);
    }

    // Add a task group to the UI
    function addTaskGroupToUI(taskGroup) {
        const groupItem = document.createElement('li');
        groupItem.classList.add('task-group');
        groupItem.dataset.id = taskGroup.id;
        groupItem.style.borderColor = taskGroup.color;

        groupItem.innerHTML = `
            <h2 class="group-header">${taskGroup.name}</h2>
            <button class="delete">✖</button>
            <ul class="group-list"></ul>
            <div class="color-oval group-color-picker" style="background-color:${taskGroup.color};"></div>
        `;

        const groupList = groupItem.querySelector('.group-list');

        // Initialize SortableJS for the group list
        new Sortable(groupList, {
            group: {
                name: 'tasks',
                pull: true,
                put: true
            },
            animation: 150,
            swapThreshold: 0.5,
            invertSwap: true,
            ghostClass: 'sortable-ghost',
            onEnd: function () {
                saveOrderToLocalStorage();
            }
        });

        // Toggle task visibility within the group by clicking the group item
        groupItem.addEventListener('click', function (event) {
            // Ensure toggle only happens if the click is not on the delete button, group header, task inside the group, or color picker
            if (!event.target.classList.contains('delete') &&
                !event.target.classList.contains('group-header') &&
                !event.target.closest('.task-item') &&
                !event.target.closest('.group-color-picker')) {

                const isOpen = groupList.style.display !== 'none';
                if (groupList.children.length > 0) {  // Only allow closing if there are tasks inside
                    groupList.style.display = isOpen ? 'none' : 'block';
                    groupItem.classList.toggle('closed-group', !isOpen);
                }
            }
        });

        // Prevent parent group from closing when clicking a nested task group
        groupItem.addEventListener('click', function (event) {
            if (event.target.classList.contains('task-group')) {
                event.stopPropagation();
            }
        });

        // Ensure the task group can be interacted with after dragging tasks in/out
        groupList.addEventListener('dragover', function (event) {
            event.preventDefault();
            if (groupItem.classList.contains('closed-group')) {
                groupItem.classList.remove('closed-group');
                groupList.style.display = 'block';
            }
        });

        // Allow editing the group name by clicking the text
        groupItem.querySelector('.group-header').addEventListener('click', function (event) {
            event.stopPropagation(); // Prevent the group toggle click event from firing
            const header = groupItem.querySelector('.group-header');
            header.contentEditable = true;
            header.focus();
        });

        groupItem.querySelector('.group-header').addEventListener('blur', function () {
            const header = groupItem.querySelector('.group-header');
            header.contentEditable = false;

            // Update the group name in LocalStorage
            const groups = getTaskGroupsFromLocalStorage();
            const updatedGroups = groups.map(g => g.id === taskGroup.id ? { ...g, name: header.innerText } : g);
            saveTaskGroupsToLocalStorage(updatedGroups);
        });

        // Handle changing the group outline color
        const colorPicker = groupItem.querySelector('.group-color-picker');
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = taskGroup.color;
        colorInput.style.position = 'absolute';
        colorInput.style.opacity = '0';
        colorInput.style.width = '100%';
        colorInput.style.height = '100%';
        colorInput.style.cursor = 'pointer';

        colorInput.addEventListener('change', function () {
            const newColor = colorInput.value;
            colorPicker.style.backgroundColor = newColor;
            groupItem.style.borderColor = newColor;

            // Update the color in LocalStorage
            const groups = getTaskGroupsFromLocalStorage();
            const updatedGroups = groups.map(g => g.id === taskGroup.id ? { ...g, color: newColor } : g);
            saveTaskGroupsToLocalStorage(updatedGroups);
        });

        colorPicker.appendChild(colorInput);
        colorPicker.addEventListener('click', function () {
            colorInput.click();
        });

        // Handle deleting the group
        groupItem.querySelector('.delete').addEventListener('click', function () {
            taskList.removeChild(groupItem);
            const groups = getTaskGroupsFromLocalStorage();
            const updatedGroups = groups.filter(g => g.id !== taskGroup.id);
            saveTaskGroupsToLocalStorage(updatedGroups);
            checkIfTasksExist();
        });

        taskList.appendChild(groupItem);
        checkIfTasksExist();
    }

    // Handle creating a task group
    addGroupBtn.addEventListener('click', function () {
        const groupName = document.getElementById('groupNameInput').value.trim();
        const groupColor = document.getElementById('groupColorInput').value;

        if (groupName) {
            addTaskGroup(groupName, groupColor);
            document.getElementById('groupNameInput').value = '';
            document.getElementById('groupColorInput').value = '#000000'; // Reset to default color
            groupModal.style.display = 'none';
        } else {
            alert('Please enter a group name.');
        }
    });

    // Add a task to the UI and LocalStorage
    function addTask(subject, description, color) {
        const tasks = getTasksFromLocalStorage();
        const task = { id: Date.now(), subject, description, color };
        tasks.push(task);
        saveTasksToLocalStorage(tasks);
        addTaskToUI(task);
    }

    // Add task to the UI
    function addTaskToUI(task) {
        noTasksMessage.style.display = 'none';
        noTasksContainer.style.display = 'none';

        const listItem = document.createElement('li');
        listItem.style.borderLeftColor = task.color;
        listItem.dataset.id = task.id;
        listItem.classList.add('task-item');

        // Create and style the custom oval color picker
        const colorPicker = document.createElement('div');
        colorPicker.classList.add('color-oval');
        colorPicker.style.backgroundColor = task.color;

        // Hidden color input
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = task.color;
        colorInput.style.position = 'absolute';
        colorInput.style.opacity = '0';
        colorInput.style.width = '100%';
        colorInput.style.height = '100%';
        colorInput.style.cursor = 'pointer';

        // Update the oval and border color when a new color is selected
        colorInput.addEventListener('change', function () {
            const newColor = colorInput.value;
            colorPicker.style.backgroundColor = newColor;
            listItem.style.borderLeftColor = newColor;

            // Update the color in LocalStorage
            const tasks = getTasksFromLocalStorage();
            const updatedTasks = tasks.map(t => t.id === task.id ? { ...t, color: newColor } : t);
            saveTasksToLocalStorage(updatedTasks);
        });

        colorPicker.addEventListener('click', function () {
            colorInput.click();
        });

        colorPicker.appendChild(colorInput);
        listItem.appendChild(colorPicker);

        const subjectHeaderContainer = document.createElement('div');
        subjectHeaderContainer.classList.add('subject-header-container');

        const subjectHeader = document.createElement('h2');
        subjectHeader.innerText = task.subject;
        subjectHeader.classList.add('subject-header');

        // Allow editing the subject header
        subjectHeader.addEventListener('click', function (event) {
            event.stopPropagation(); // Prevent the task box click event from firing
            subjectHeader.contentEditable = true;
            subjectHeader.focus();
        });
        subjectHeader.addEventListener('blur', function () {
            subjectHeader.contentEditable = false;

            // Update the subject in LocalStorage
            const tasks = getTasksFromLocalStorage();
            const updatedTasks = tasks.map(t => t.id === task.id ? { ...t, subject: subjectHeader.innerText } : t);
            saveTasksToLocalStorage(updatedTasks);
        });
        subjectHeaderContainer.appendChild(subjectHeader);

        listItem.appendChild(subjectHeaderContainer);

        const descriptionPara = document.createElement('p');
        descriptionPara.innerText = task.description;
        descriptionPara.classList.add('description');
        descriptionPara.style.display = 'none'; // Start hidden and show when the task is clicked

        // Allow editing the description
        descriptionPara.addEventListener('click', function (event) {
            event.stopPropagation(); // Prevent the task box click event from firing
            descriptionPara.contentEditable = true;
            descriptionPara.focus();
        });
        descriptionPara.addEventListener('blur', function () {
            descriptionPara.contentEditable = false;

            // Update the description in LocalStorage
            const tasks = getTasksFromLocalStorage();
            const updatedTasks = tasks.map(t => t.id === task.id ? { ...t, description: descriptionPara.innerText } : t);
            saveTasksToLocalStorage(updatedTasks);
        });

        listItem.appendChild(descriptionPara);

        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = '✖';
        deleteBtn.classList.add('delete');
        deleteBtn.addEventListener('click', function (event) {
            event.stopPropagation(); // Prevent toggling the description
            taskList.removeChild(listItem);
            checkIfTasksExist();

            // Remove the task from LocalStorage
            const tasks = getTasksFromLocalStorage();
            const updatedTasks = tasks.filter(t => t.id !== task.id);
            saveTasksToLocalStorage(updatedTasks);
        });
        listItem.appendChild(deleteBtn);

        // Toggle description visibility by clicking on the task box
        listItem.addEventListener('click', function (event) {
            // Only toggle if the click wasn't on the description or the subject header
            if (!event.target.classList.contains('description') && !event.target.classList.contains('subject-header')) {
                const isDescriptionHidden = descriptionPara.style.display === 'none';
                descriptionPara.style.display = isDescriptionHidden ? 'block' : 'none';
            }
        });

        taskList.appendChild(listItem);

        checkIfTasksExist();
    }

    function checkIfTasksExist() {
        if (!taskList.children.length) {
            noTasksMessage.style.display = 'block';
            noTasksContainer.style.display = 'flex';
        } else {
            noTasksMessage.style.display = 'none';
            noTasksContainer.style.display = 'none';
        }
    }

    // Add the task and close the modal
    addTaskBtn.addEventListener('click', function () {
        const subjectInput = document.getElementById('subjectInput');
        const descriptionInput = document.getElementById('descriptionInput');
        const colorInput = document.getElementById('colorInput');

        const subject = subjectInput.value;
        const description = descriptionInput.value;
        const color = colorInput.value;

        if (subject.trim() === '') {
            alert('Please enter a task subject.');
            return;
        }

        addTask(subject, description, color);

        subjectInput.value = '';
        descriptionInput.value = '';

        taskModal.style.display = 'none';
    });

    // Initial load of tasks and groups from LocalStorage
    loadTasksFromLocalStorage();
    checkIfTasksExist();
});
