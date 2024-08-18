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

    // Drag delay settings
    const dragDelay = 300; // Delay before drag starts
    const touchStartThreshold = 20; // Threshold for touch devices

    // Initialize SortableJS for the main task list
    const sortable = new Sortable(taskList, {
        animation: 150,
        delay: dragDelay,
        delayOnTouchOnly: true,
        touchStartThreshold: touchStartThreshold,
        group: {
            name: 'tasks',
            pull: true,
            put: true
        },
        swapThreshold: 0.5,
        invertSwap: true,
        ghostClass: 'sortable-ghost',
        onEnd: function () {
            saveOrderToLocalStorage();
        }
    });

    // Load tasks and task groups from LocalStorage on page load
    function loadTasksFromLocalStorage() {
        const data = JSON.parse(localStorage.getItem('todoData')) || { tasks: [], groups: [] };
        const groupsById = {};

        // Load groups first and keep a reference map
        data.groups.forEach(group => {
            const groupElement = addTaskGroupToUI(group);
            groupsById[group.id] = groupElement;
        });

        // Reassign task groups to their parent groups if necessary
        data.groups.forEach(group => {
            if (group.parentGroupId && groupsById[group.parentGroupId]) {
                const parentGroupElement = groupsById[group.parentGroupId];
                const groupElement = groupsById[group.id];

                if (parentGroupElement && groupElement && !parentGroupElement.contains(groupElement)) {
                    parentGroupElement.querySelector('.group-list').appendChild(groupElement);
                }
            }
        });

        // Load tasks in the correct order
        data.tasks.forEach(task => {
            if (task.groupId) {
                const groupElement = document.querySelector(`li.task-group[data-id="${task.groupId}"] .group-list`);
                if (groupElement) {
                    const taskElement = createTaskElement(task);
                    groupElement.appendChild(taskElement);
                }
            } else {
                addTaskToUI(task);
            }
        });
    }

    // Save tasks and groups to LocalStorage
    function saveDataToLocalStorage(data) {
        localStorage.setItem('todoData', JSON.stringify(data));
    }

    // Save the current order of tasks and groups to LocalStorage
    function saveOrderToLocalStorage() {
        const tasks = [];
        const groups = [];

        function processGroup(groupElement, parentGroupId = null) {
            const groupId = groupElement.dataset.id;

            // Process tasks within the group
            groupElement.querySelectorAll(':scope > .group-list > .task-item').forEach((item) => {
                tasks.push({
                    id: item.dataset.id,
                    subject: item.querySelector('.subject-header').innerText,
                    description: item.querySelector('.description').innerText,
                    color: item.querySelector('.color-oval').style.backgroundColor,
                    groupId: groupId
                });
            });

            // Process the group itself
            groups.push({
                id: groupId,
                name: groupElement.querySelector('.group-header').innerText,
                color: groupElement.style.borderColor,
                display: groupElement.querySelector('.group-list').style.display, // Save the display state
                parentGroupId: parentGroupId
            });

            // Recursively process nested groups
            groupElement.querySelectorAll(':scope > .group-list > .task-group').forEach((childGroup) => {
                processGroup(childGroup, groupId);
            });
        }

        // Process top-level tasks (those not in any group)
        taskList.querySelectorAll(':scope > .task-item').forEach((item) => {
            tasks.push({
                id: item.dataset.id,
                subject: item.querySelector('.subject-header').innerText,
                description: item.querySelector('.description').innerText,
                color: item.querySelector('.color-oval').style.backgroundColor,
                groupId: null
            });
        });

        // Process top-level groups
        taskList.querySelectorAll(':scope > .task-group').forEach((groupElement) => {
            processGroup(groupElement);
        });

        saveDataToLocalStorage({ tasks, groups });
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
        const data = JSON.parse(localStorage.getItem('todoData')) || { tasks: [], groups: [] };

        const taskGroup = { id: groupId, name: groupName, color: groupColor, tasks: [], display: 'block', parentGroupId: null };
        data.groups.push(taskGroup);
        saveDataToLocalStorage(data);
        return addTaskGroupToUI(taskGroup);
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
            <ul class="group-list" style="display: ${taskGroup.display || 'block'};"></ul>
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
            delay: dragDelay, // Apply drag delay for tasks inside groups
            delayOnTouchOnly: true,
            touchStartThreshold: touchStartThreshold, // Apply touch threshold for tasks inside groups
            swapThreshold: 0.5,
            invertSwap: true,
            ghostClass: 'sortable-ghost',
            onEnd: function () {
                saveOrderToLocalStorage();
            }
        });

        // Toggle task visibility within the group by clicking the group item
        groupItem.addEventListener('click', function (event) {
            if (!event.target.classList.contains('delete') &&
                !event.target.classList.contains('group-header') &&
                !event.target.closest('.task-item') &&
                !event.target.closest('.group-color-picker')) {

                const isOpen = groupList.style.display !== 'none';
                if (groupList.children.length > 0) {  // Only allow closing if there are tasks inside
                    groupList.style.display = isOpen ? 'none' : 'block';
                    saveOrderToLocalStorage(); // Save the state after toggle
                }
            }
        });

        // Prevent parent group from closing when clicking a nested task group
        groupItem.addEventListener('click', function (event) {
            if (event.target.classList.contains('task-group')) {
                event.stopPropagation();
            }
        });

        // Feature: Expand group when dragging over
        groupItem.addEventListener('dragover', function (event) {
            event.preventDefault(); // Necessary to allow drop
            if (groupList.style.display === 'none' && event.target !== groupItem) {
                groupList.style.display = 'block'; // Expand the group when dragging over
                saveOrderToLocalStorage(); // Save the new state
            }
        });

        // Feature: Preserve the display state when dragging the group itself
        groupItem.addEventListener('dragstart', function (event) {
            groupItem.classList.add('dragging');
        });

        groupItem.addEventListener('dragend', function (event) {
            groupItem.classList.remove('dragging');
            const isOpen = groupList.style.display !== 'none';
            groupList.style.display = isOpen ? 'block' : 'none'; // Restore the original state after drag
            saveOrderToLocalStorage(); // Save the new state
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

            const data = JSON.parse(localStorage.getItem('todoData')) || { tasks: [], groups: [] };
            const updatedGroups = data.groups.map(g => g.id === taskGroup.id ? { ...g, color: newColor } : g);
            saveDataToLocalStorage({ tasks: data.tasks, groups: updatedGroups });
        });

        colorPicker.appendChild(colorInput);
        colorPicker.addEventListener('click', function () {
            colorInput.click();
        });

        // Handle deleting the group
        groupItem.querySelector('.delete').addEventListener('click', function (event) {
            event.stopPropagation();
            deleteGroup(groupItem);
        });

        taskList.appendChild(groupItem);
        checkIfTasksExist();
        return groupItem;
    }

    function deleteGroup(groupItem) {
        const groupId = groupItem.dataset.id;
        const data = JSON.parse(localStorage.getItem('todoData')) || { tasks: [], groups: [] };

        // Remove the group and its associated tasks
        const updatedGroups = data.groups.filter(g => g.id !== groupId);
        const updatedTasks = data.tasks.filter(t => t.groupId !== groupId);

        saveDataToLocalStorage({ tasks: updatedTasks, groups: updatedGroups });

        // Immediately remove the group from the DOM
        groupItem.remove();
        checkIfTasksExist();
    }

    // Handle creating a task group
    addGroupBtn.addEventListener('click', function () {
        const groupName = document.getElementById('groupNameInput').value.trim();
        const groupColor = document.getElementById('groupColorInput').value;

        if (groupName) {
            const groupElement = addTaskGroup(groupName, groupColor);
            document.getElementById('groupNameInput').value = '';
            document.getElementById('groupColorInput').value = '#000000';
            groupModal.style.display = 'none';
        } else {
            alert('Please enter a group name.');
        }
    });

    // Add a task to the UI and LocalStorage
    function addTask(subject, description, color) {
        const data = JSON.parse(localStorage.getItem('todoData')) || { tasks: [], groups: [] };

        const task = { id: Date.now(), subject, description, color, groupId: null };
        data.tasks.push(task);
        saveDataToLocalStorage(data);
        addTaskToUI(task);
    }

    // Create a task element
    function createTaskElement(task) {
        const listItem = document.createElement('li');
        listItem.style.borderLeftColor = task.color;
        listItem.dataset.id = task.id;
        listItem.classList.add('task-item');

        const colorPicker = document.createElement('div');
        colorPicker.classList.add('color-oval');
        colorPicker.style.backgroundColor = task.color;

        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = task.color;
        colorInput.style.position = 'absolute';
        colorInput.style.opacity = '0';
        colorInput.style.width = '100%';
        colorInput.style.height = '100%';
        colorInput.style.cursor = 'pointer';

        colorInput.addEventListener('change', function () {
            const newColor = colorInput.value;
            colorPicker.style.backgroundColor = newColor;
            listItem.style.borderLeftColor = newColor;

            const data = JSON.parse(localStorage.getItem('todoData')) || { tasks: [], groups: [] };
            const updatedTasks = data.tasks.map(t => t.id === task.id ? { ...t, color: newColor } : t);
            saveDataToLocalStorage({ tasks: updatedTasks, groups: data.groups });
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

        // Disable dragging if the user is trying to edit or view the task details
        let isDraggingDisabled = false;

        subjectHeader.addEventListener('click', function (event) {
            event.stopPropagation();
            subjectHeader.contentEditable = true;
            subjectHeader.focus();
            isDraggingDisabled = true;
        });

        subjectHeader.addEventListener('blur', function () {
            subjectHeader.contentEditable = false;

            const data = JSON.parse(localStorage.getItem('todoData')) || { tasks: [], groups: [] };
            const updatedTasks = data.tasks.map(t => t.id === task.id ? { ...t, subject: subjectHeader.innerText } : t);
            saveDataToLocalStorage({ tasks: updatedTasks, groups: data.groups });

            // Re-enable dragging after editing
            setTimeout(() => {
                isDraggingDisabled = false;
            }, 300);
        });

        subjectHeaderContainer.appendChild(subjectHeader);
        listItem.appendChild(subjectHeaderContainer);

        const descriptionPara = document.createElement('p');
        descriptionPara.innerText = task.description;
        descriptionPara.classList.add('description');
        descriptionPara.style.display = 'none';

        descriptionPara.addEventListener('click', function (event) {
            event.stopPropagation();
            descriptionPara.contentEditable = true;
            descriptionPara.focus();
            isDraggingDisabled = true;
        });

        descriptionPara.addEventListener('blur', function () {
            descriptionPara.contentEditable = false;

            const data = JSON.parse(localStorage.getItem('todoData')) || { tasks: [], groups: [] };
            const updatedTasks = data.tasks.map(t => t.id === task.id ? { ...t, description: descriptionPara.innerText } : t);
            saveDataToLocalStorage({ tasks: updatedTasks, groups: data.groups });

            // Re-enable dragging after editing
            setTimeout(() => {
                isDraggingDisabled = false;
            }, 300);
        });

        listItem.appendChild(descriptionPara);

        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = '✖';
        deleteBtn.classList.add('delete');
        deleteBtn.addEventListener('click', function (event) {
            event.stopPropagation();
            listItem.parentElement.removeChild(listItem);
            checkIfTasksExist();

            const data = JSON.parse(localStorage.getItem('todoData')) || { tasks: [], groups: [] };
            const updatedTasks = data.tasks.filter(t => t.id !== task.id);
            saveDataToLocalStorage({ tasks: updatedTasks, groups: data.groups });
        });

        listItem.appendChild(deleteBtn);

        listItem.addEventListener('click', function (event) {
            if (isDraggingDisabled) {
                return; // Prevent dragging if an interaction is happening
            }

            if (!event.target.classList.contains('description') && !event.target.classList.contains('subject-header')) {
                const isDescriptionHidden = descriptionPara.style.display === 'none';
                descriptionPara.style.display = isDescriptionHidden ? 'block' : 'none';
            }
        });

        return listItem;
    }

    // Add task to the UI
    function addTaskToUI(task) {
        const taskElement = createTaskElement(task);
        taskList.appendChild(taskElement);
        checkIfTasksExist();
        return taskElement;
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

    loadTasksFromLocalStorage();
    checkIfTasksExist();
});
