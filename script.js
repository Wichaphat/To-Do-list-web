document.addEventListener('DOMContentLoaded', function () {
    const taskList = document.getElementById('taskList');
    const openModalBtn = document.getElementById('openModalBtn');
    const modal = document.getElementById('taskModal');
    const closeBtn = document.querySelector('.close');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const noTasksMessage = document.getElementById('noTasksMessage');
    const noTasksContainer = document.getElementById('noTasksContainer');

    // IndexedDB setup
    let db;
    const request = indexedDB.open('tasksDatabase', 1);

    request.onupgradeneeded = function (event) {
        db = event.target.result;
        const objectStore = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('subject', 'subject', { unique: false });
        objectStore.createIndex('description', 'description', { unique: false });
        objectStore.createIndex('color', 'color', { unique: false });
    };

    request.onsuccess = function (event) {
        db = event.target.result;
        loadTasks(); // Load tasks on page load
    };

    request.onerror = function (event) {
        console.error('Database error:', event.target.errorCode);
    };

    // Function to add a task to IndexedDB
    function addTaskToDB(task) {
        const transaction = db.transaction(['tasks'], 'readwrite');
        const objectStore = transaction.objectStore('tasks');
        const request = objectStore.add(task);

        request.onsuccess = function () {
            console.log('Task added to the database');
        };

        request.onerror = function () {
            console.error('Error adding task to the database');
        };
    }

    // Function to load tasks from IndexedDB
    function loadTasks() {
        const transaction = db.transaction(['tasks'], 'readonly');
        const objectStore = transaction.objectStore('tasks');
        const request = objectStore.getAll();

        request.onsuccess = function (event) {
            const tasks = event.target.result;
            tasks.forEach(task => addTask(task.subject, task.description, task.color, false));
        };
    }

    // Function to delete a task from IndexedDB
    function deleteTaskFromDB(id) {
        const transaction = db.transaction(['tasks'], 'readwrite');
        const objectStore = transaction.objectStore('tasks');
        const request = objectStore.delete(id);

        request.onsuccess = function () {
            console.log('Task deleted from the database');
        };

        request.onerror = function () {
            console.error('Error deleting task from the database');
        };
    }

    // Function to add a task to the UI and optionally to IndexedDB
    function addTask(subject, description, color, saveToDB = true) {
        noTasksMessage.style.display = 'none';
        noTasksContainer.style.display = 'none';

        const listItem = document.createElement('li');
        listItem.style.borderLeftColor = color;

        // Create and style the custom oval color picker
        const colorPicker = document.createElement('div');
        colorPicker.classList.add('color-oval');
        colorPicker.style.backgroundColor = color;

        // Hidden color input
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = color;
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
        });

        colorPicker.addEventListener('click', function () {
            colorInput.click();
        });

        colorPicker.appendChild(colorInput);
        listItem.appendChild(colorPicker);

        const subjectHeaderContainer = document.createElement('div');
        subjectHeaderContainer.classList.add('subject-header-container');

        const subjectHeader = document.createElement('h2');
        subjectHeader.innerText = subject;
        subjectHeader.classList.add('subject-header');
        subjectHeader.addEventListener('click', function () {
            subjectHeader.contentEditable = true;
            subjectHeader.focus();
        });
        subjectHeader.addEventListener('blur', function () {
            subjectHeader.contentEditable = false;
        });
        subjectHeaderContainer.appendChild(subjectHeader);

        listItem.appendChild(subjectHeaderContainer);

        const descriptionPara = document.createElement('p');
        descriptionPara.innerText = description;
        descriptionPara.classList.add('description');
        descriptionPara.style.display = 'none';
        descriptionPara.addEventListener('click', function () {
            descriptionPara.contentEditable = true;
            descriptionPara.focus();
        });
        descriptionPara.addEventListener('blur', function () {
            descriptionPara.contentEditable = false;
        });
        listItem.appendChild(descriptionPara);

        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = '✖';
        deleteBtn.classList.add('delete');
        deleteBtn.addEventListener('click', function (event) {
            event.stopPropagation(); // Prevent toggling the description
            taskList.removeChild(listItem);
            checkIfTasksExist();

            // Delete from IndexedDB
            deleteTaskFromDB(listItem.dataset.id);
        });
        listItem.appendChild(deleteBtn);

        listItem.addEventListener('click', function () {
            const isDescriptionHidden = descriptionPara.style.display === 'none';
            descriptionPara.style.display = isDescriptionHidden ? 'block' : 'none';
        });

        // Append the task to the task list
        taskList.appendChild(listItem);

        // Save to IndexedDB if required
        if (saveToDB) {
            addTaskToDB({ subject, description, color });
        }

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

        modal.style.display = 'none';
    });

    checkIfTasksExist();
});
