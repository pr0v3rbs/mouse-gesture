const ACTIONS = {
  nextTab: 'Next Tab',
  prevTab: 'Prev Tab',
  closeTab: 'Close Tab',
  reloadTab: 'Reload'
};

const tbl = document.getElementById('tbl');
const addBtn = document.getElementById('add');

chrome.storage.sync.get('gestureMap', (res) => {
  const map = res.gestureMap || {};
  Object.entries(map).forEach(([pat, act]) => addRow(pat, act));
});

addBtn.onclick = () => addRow('', 'nextTab');

function addRow(pattern = '', action = 'nextTab') {
  const row = tbl.insertRow();
  const patCell = row.insertCell();
  const actCell = row.insertCell();
  const delCell = row.insertCell();

  const patInput = document.createElement('input');
  patInput.value = pattern;
  patCell.appendChild(patInput);

  const sel = document.createElement('select');
  for (const k in ACTIONS) {
    const opt = document.createElement('option');
    opt.value = k;
    opt.textContent = ACTIONS[k];
    if (k === action) opt.selected = true;
    sel.appendChild(opt);
  }
  actCell.appendChild(sel);

  const del = document.createElement('button');
  del.textContent = 'Delete';
  del.onclick = () => { row.remove(); save(); };
  delCell.appendChild(del);

  patInput.oninput = save;
  sel.onchange = save;
  save();
}

function save() {
  const map = {};
  for (const row of tbl.rows) {
    const pat = row.cells[0].firstChild.value.trim().toUpperCase();
    const act = row.cells[1].firstChild.value;
    if (pat) map[pat] = act;
  }
  chrome.storage.sync.set({ gestureMap: map });
}
