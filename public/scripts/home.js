import { addUser, deleteUser } from './User.js';
import { addPublication, deletePublication } from './Publication.js';
await new Promise((resolve) => { document.addEventListener('DOMContentLoaded', resolve); });
const tablesContainer = document.getElementById('tables-container');
const userTable = document.getElementById('user');
const publicationTable = document.getElementById('publication');
let userData;
let publicationData;
const userDataMap = new Map;
const publicationDataMap = new Map;
const inputTypes = {
    user: ['email', 'text', 'text'],
    publication: ['number', 'text', 'number']
};
const addFunctions = {
    'user': addUser,
    'publication': addPublication
};
const deleteFunctions = {
    'user': deleteUser,
    'publication': deletePublication
};
const ghostTemplate = document.getElementById('ghost-row-template');
await loadRows();
const userForm = document.getElementById('user-table-form');
const publicationForm = document.getElementById('publication-table-form');
userForm.addEventListener('submit', formSubmitHandler);
publicationForm.addEventListener('submit', formSubmitHandler);
tablesContainer.addEventListener('click', (event) => {
    const { target } = event;
    if (!(event instanceof PointerEvent &&
        target instanceof HTMLElement)) {
        return;
    }
    const button = target.closest('button.delete');
    const row = target.closest('tr');
    const table = target.closest('table');
    if (!(row && button && table && row.cells[0].textContent)) {
        return;
    }
    deleteFunctions[table.id](parseInt(row.cells[0].textContent))
        .finally(() => loadRows());
});
[...document.getElementsByClassName('add-row')]
    .forEach((button) => {
    button.addEventListener('click', (event) => {
        if (!(event instanceof PointerEvent) ||
            !(event.target instanceof HTMLElement)) {
            return;
        }
        const table = event.target.previousElementSibling;
        addGhostRow(table.tBodies[0]);
    });
});
function formSubmitHandler(event) {
    event.preventDefault();
    const { currentTarget } = event;
    if (!(event instanceof SubmitEvent) ||
        !(currentTarget instanceof HTMLFormElement)) {
        return;
    }
    hideSubmit(event.submitter ?? document.body);
    const requests = [];
    {
        const temp = [...(new FormData(currentTarget)).entries()];
        for (let i = 0; i < temp.length; i += 3) {
            const entry = {};
            entry[temp[i][0]] = temp[i][1];
            entry[temp[i + 1][0]] = temp[i + 1][1];
            entry[temp[i + 2][0]] = temp[i + 2][1];
            requests.push(addFunctions[currentTarget.id.replace('-table-form', '')](entry));
        }
    }
    Promise.allSettled(requests).finally(() => loadRows());
}
function addGhostRow(...tbodies) {
    for (const tbody of tbodies) {
        const table = tbody.closest('table');
        tbody.append(createGhostRow());
        const row = tbody.lastElementChild;
        const { fields } = table.id === 'user'
            ? userData
            : publicationData;
        const inputs = row.getElementsByTagName('input');
        for (let i = 0; i < 3; i++) {
            inputs[i].setAttribute('type', inputTypes[table.id][i]);
            inputs[i].setAttribute('form', `${table.id}-table-form`);
            inputs[i].setAttribute('name', fields[i + 1]);
        }
    }
    for (const lastGhostRow of document.querySelectorAll('.ghost-row:last-child')) {
        lastGhostRow.addEventListener('input', lastRowEditedHandler, { once: true });
    }
}
function createGhostRow() {
    return ghostTemplate.content.cloneNode(true);
}
function lastRowEditedHandler(event) {
    if (!(event instanceof InputEvent)) {
        return;
    }
    const { currentTarget, target } = event;
    if (!(target instanceof HTMLElement) ||
        !(currentTarget instanceof HTMLElement)) {
        return;
    }
    const table = currentTarget.closest('table');
    if (!table) {
        return;
    }
    showSubmit(table);
}
function hideSubmit(button) {
    button.classList.remove('visible');
}
function showSubmit(table) {
    const button = document.querySelector(`.submit[form=${table.id}-table-form]`);
    if (!button) {
        return;
    }
    button.classList.add('visible');
}
function fetchData() {
    return Promise.all([
        fetch('/api/users').then((res) => res.json()),
        fetch('/api/publications').then((res) => res.json())
    ]);
}
async function loadRows() {
    userDataMap.clear();
    publicationDataMap.clear();
    [userData, publicationData] = await fetchData();
    tablesContainer.classList.remove('invisible');
    for (const row of tablesContainer.querySelectorAll('tbody tr')) {
        row.remove();
    }
    for (const row of userData.result) {
        userDataMap.set(addTableRow(row, userTable), row);
    }
    for (const row of publicationData.result) {
        publicationDataMap.set(addTableRow(row, publicationTable), row);
    }
    addGhostRow(...document.getElementsByTagName('tbody'));
}
function addTableRow(row, table) {
    const rowElement = document.createElement('tr');
    let isFirstKey = true;
    for (const key in row) {
        const cell = document.createElement('td');
        cell.textContent = row[key];
        rowElement.append(cell);
        if (!isFirstKey) {
            continue;
        }
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete');
        deleteButton.innerHTML = '<img src="/assets/trash.svg" alt="Delete row">';
        cell.prepend(deleteButton);
        isFirstKey = false;
    }
    const tbody = table.getElementsByTagName('tbody')[0];
    tbody.append(rowElement);
    return rowElement;
}
