document.addEventListener('DOMContentLoaded', function () {
    const taskList = document.getElementById('taskList');
    const openModalBtn = document.getElementById('openModalBtn');
    const modal = document.getElementById('taskModal');
    const closeBtn = document.querySelector('.close');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const noTasksMessage = document.getElementById('noTasksMessage');
    const noTasksContainer = document.getElementById('noTasksContainer');

    // Load tasks from LocalStorage on page load
    function loadTasksFromLocalStorage() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => addTaskToUI(task));
    }

    // Save tasks to LocalStorage
    function saveTasksToLocalStorage(tasks) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Get all tasks from LocalStorage
    function getTasksFromLocalStorage() {
        return JSON.parse(localStorage.getItem('tasks')) || [];
    }

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
        subjectHeader.addEventListener('click', function () {
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
        descriptionPara.style.display = 'none';
        descriptionPara.addEventListener('click', function () {
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
        listItem.addEventListener('click', function () {
            const isDescriptionHidden = descriptionPara.style.display === 'none';
            descriptionPara.style.display = isDescriptionHidden ? 'block' : 'none';
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

    // Open the modal when clicking the plus sign
    openModalBtn.addEventListener('click', function () {
        modal.style.display = 'block';
    });

    // Close the modal when clicking the close button
    closeBtn.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    // Close the modal when clicking anywhere outside the modal
    window.addEventListener('click', function (event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

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

        modal.style.display = 'none';
    });

    // Initial load of tasks from LocalStorage
    loadTasksFromLocalStorage();
    checkIfTasksExist();
});
