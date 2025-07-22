await new Promise((resolve) => { document.addEventListener('DOMContentLoaded', resolve); });

const tables = await createTables();
const tablesContainer = document.getElementById('tables-container')!;
tablesContainer.classList.remove('invisible');
tablesContainer.append(...tables);

for (const table of tables) {
  table.tBodies[0].append(await createRows(table.id));

  // delete handler
  table.addEventListener('click', (event) => {
    if (!(event?.target instanceof HTMLButtonElement)) { return; }
    if (!event.target.classList.contains('delete')) { return; }
    const row = event.target.closest('tr');
    if (!row) { return; }
    fetch(`/api/${table.id}/${row.cells[1].textContent}`, { method: 'DELETE' }).then(() => location.reload());
  });

  // edit handler
  table.addEventListener('click', (event) => {
    if (!(event?.target instanceof HTMLButtonElement)) { return; }
    if (!event.target.classList.contains('edit')) { return; }
    const row = event.target.closest('tr');
    if (!row) { return; }
    document.getElementById('publication-id')!.textContent = row.dataset.id ?? null;
  });
}

const selector = document.getElementById('table-selector') as HTMLSelectElement;
{
  let lastSelected: HTMLTableElement | undefined;
  handler();
  selector.addEventListener('change', handler);

  function handler() {
    const table = document.getElementById(selector.value);
    if (!(table instanceof HTMLTableElement)) { return; }
    table.classList.add('selected');
    lastSelected?.classList.remove('selected');
    lastSelected = table;
  }
}

populateAuthors();
populateConferences();

// add row
{
  const form = document.getElementById('add-row-form') as HTMLFormElement;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    fetch('/api/publications', {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(() => location.reload());
  });
}

// edit row
{
  const form = document.getElementById('edit-row-form') as HTMLFormElement;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    console.log(Object.fromEntries(new FormData(form).entries()));
    return;
    fetch('/api/publications', {
      method: 'PUT',
      body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(() => location.reload());
  });
}

async function populateAuthors() {
  const authors = await fetch('/api/users').then((res) => res.json());
  for (const { id, first_name, last_name } of authors) {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = `${first_name} ${last_name}`;
    (document.getElementById('author-select') as HTMLSelectElement).add(option);
  }
}

async function populateConferences() {
  const conferenceRows = document.querySelectorAll('#conferences tr');
  for (const row of conferenceRows) {
    if (!(row instanceof HTMLElement)) { continue; }
    const { id, name, category } = row.dataset;
    const option = document.createElement('option');
    option.value = id ?? '';
    option.textContent = `${name} \u2014 ${category}`;
    option.disabled = !!document.querySelector(`#publications tr[data-conference_name="${name}"][data-conference_category="${category}"]`);
    (document.getElementById('conference-select') as HTMLSelectElement).add(option);
  }
}

async function createTables() {
  const ids = 'users conferences publications'.split(' ');
  return Promise.all([
    getModelFieldNames('user'),
    getModelFieldNames('conference'),
    getModelFieldNames('publication')
  ]).then((fields) => fields.map((field, i) => createTable(ids[i], field)));
}

function createTable(id: string, fieldNames: string[]) {
  const table = document.createElement('table');
  table.id = id;
  table.append(document.createElement('thead'), document.createElement('tbody'));
  
  for (const name of fieldNames) {
    const header = document.createElement('th');
    header.textContent = name;
    table.tHead?.append(header);
  }

  const deleteColGhost = document.createElement('th');
  const editColGhost = document.createElement('th');
  table.tHead?.prepend(editColGhost);
  table.tHead?.append(deleteColGhost);

  return table;
}

async function createRows(id: string) {
  const fragment = new DocumentFragment;
  const data = await fetch(`/api/${id}`).then((res) => res.json());

  for (const row of data) {
    const tr = document.createElement('tr');

    for (const [key, value] of Object.entries(row)) {
      tr.insertCell().textContent = value?.toString() ?? null;
      tr.setAttribute(`data-${key}`, value?.toString() ?? '');
    }

    const editButton = document.createElement('button');
    const deleteButton = document.createElement('button');
    editButton.classList.add('edit');
    deleteButton.classList.add('delete');
    tr.insertCell().append(editButton);
    tr.insertCell(0).append(deleteButton);

    fragment.append(tr);
  }

  return fragment;
}

function getModelFieldNames(model: string) {
  return fetch(`/api/${model}s/columns`).then((res) => res.json());
}

export {};
