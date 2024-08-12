document.addEventListener('DOMContentLoaded', function () {
    const taskList = document.getElementById('taskList');
    const openModalBtn = document.getElementById('openModalBtn');
    const modal = document.getElementById('taskModal');
    const closeBtn = document.querySelector('.close');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const noTasksMessage = document.getElementById('noTasksMessage');
    const noTasksContainer = document.getElementById('noTasksContainer');

    openModalBtn.addEventListener('click', function () {
        modal.style.display = 'block';
    });

    closeBtn.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    function addTask(subject, description, color) {
        noTasksMessage.style.display = 'none';
        noTasksContainer.style.display = 'none';

        const listItem = document.createElement('li');

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
        colorInput.addEventListener('input', function () {
            colorPicker.style.backgroundColor = colorInput.value;
            listItem.style.borderLeftColor = colorInput.value;
        });

        // Position the hidden input over the color picker and trigger it on click
        colorPicker.addEventListener('click', function (event) {
            const rect = colorPicker.getBoundingClientRect();
            colorInput.style.left = `${rect.left}px`;
            colorInput.style.top = `${rect.top}px`;
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

        // Add the dropdown arrow next to the task name
        const dropdownBtn = document.createElement('button');
        dropdownBtn.innerText = '▼';
        dropdownBtn.classList.add('dropdown-btn');
        subjectHeaderContainer.appendChild(dropdownBtn);

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
        });
        listItem.appendChild(deleteBtn);

        // Toggle description visibility by clicking on the task box
        listItem.addEventListener('click', function () {
            const isDescriptionHidden = descriptionPara.style.display === 'none';
            descriptionPara.style.display = isDescriptionHidden ? 'block' : 'none';
            dropdownBtn.innerText = isDescriptionHidden ? '▲' : '▼';
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
