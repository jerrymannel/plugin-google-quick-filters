let filters = [];
const list = document.getElementById('list');
const save = () => chrome.storage.local.set({ filters });

function draw() {
  list.replaceChildren(...filters.map((f, i) => {
    const row = document.createElement('div');
    row.className = 'row';
    const field = (key, type, title) => {
      const el = document.createElement('input');
      el.type = type;
      el.title = el.placeholder = title;
      el.value = f[key];
      el.oninput = () => { f[key] = el.value; save(); };
      return el;
    };
    const btn = (text, fn) => {
      const b = document.createElement('button');
      b.textContent = text;
      b.onclick = () => { fn(); save(); draw(); };
      return b;
    };
    row.append(
      field('name', 'text', 'Name'),
      field('query', 'text', 'Gmail search'),
      field('color', 'color', 'Text color'),
      field('bg', 'color', 'Background color'),
      btn('↑', () => i && filters.splice(i - 1, 2, f, filters[i - 1])),
      btn('↓', () => i < filters.length - 1 && filters.splice(i, 2, filters[i + 1], f)),
      btn('✕', () => filters.splice(i, 1)),
    );
    return row;
  }));
}

document.getElementById('add').onclick = () => {
  filters.push({ name: 'New', query: '', color: '#202124', bg: '#e8eaed' });
  save();
  draw();
};

chrome.storage.local.get('filters').then((r) => { filters = r.filters || []; draw(); });
