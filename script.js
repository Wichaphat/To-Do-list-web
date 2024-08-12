document.addEventListener('DOMContentLoaded', function () {
    const taskList = document.getElementById('taskList');
    const openModalBtn = document.getElementById('openModalBtn');
    const modal = document.getElementById('taskModal');
    const closeBtn = document.querySelector('.close');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const noTasksMessage = document.getElementById('noTasksMessage');
    const noTasksContainer = document.getElementById('noTasksContainer');

    const sortable = new Sortable(taskList, {
        animation: 150,
    });

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

        // Create and style the color bullet
        const colorBullet = document.createElement('div');
        colorBullet.classList.add('color-bullet');
        colorBullet.style.backgroundColor = color;
        listItem.appendChild(colorBullet);

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
        deleteBtn.addEventListener('click', function () {
            taskList.removeChild(listItem);
            checkIfTasksExist();
        });
        listItem.appendChild(deleteBtn);

        taskList.appendChild(listItem);

        dropdownBtn.addEventListener('click', function () {
            if (descriptionPara.style.display === 'none') {
                descriptionPara.style.display = 'block';
                dropdownBtn.innerText = '▲';
            } else {
                descriptionPara.style.display = 'none';
                dropdownBtn.innerText = '▼';
            }
        });

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
