const MAX = 5;
const bar = document.createElement('div');
bar.id = 'qf-bar';
let filters = [];

document.head.append(Object.assign(document.createElement('style'), {
  textContent: `
#qf-bar{position:fixed;z-index:1000;display:none;gap:6px;align-items:center}
#qf-bar button{border:0;border-radius:14px;padding:4px 12px;font:13px "Google Sans",Roboto,sans-serif;cursor:pointer;white-space:nowrap}
#qf-menu{position:absolute;top:100%;right:0;display:flex;flex-direction:column;gap:4px;padding:8px;background:#fff;border-radius:8px;box-shadow:0 2px 10px #0004;z-index:9999}
#qf-menu[hidden]{display:none}`,
}));

function button(f) {
  const b = document.createElement('button');
  b.textContent = f.name;
  b.style.color = f.color;
  b.style.background = f.bg;
  b.onclick = () => {
    location.hash = 'search/' + encodeURIComponent(f.query);
    bar.querySelector('#qf-menu')?.setAttribute('hidden', '');
  };
  return b;
}

function render() {
  bar.replaceChildren(...filters.slice(0, MAX).map(button));
  const rest = filters.slice(MAX);
  if (!rest.length) return;
  const more = document.createElement('button');
  more.textContent = 'More ▾';
  const menu = document.createElement('div');
  menu.id = 'qf-menu';
  menu.hidden = true;
  menu.append(...rest.map(button));
  more.onclick = () => (menu.hidden = !menu.hidden);
  bar.append(more, menu);
}

// Gmail's header markup keeps changing, so don't nest in it: float the bar
// just right of the search pill, found via the search input's position.
function place() {
  // Preferred: sit just left of the "?" (Support) button.
  const help = document.querySelector('header [aria-label^="Support" i]')?.getBoundingClientRect();
  if (help?.width) {
    Object.assign(bar.style, {
      display: 'flex', top: help.top + 'px', height: help.height + 'px', left: 'auto',
      right: document.documentElement.clientWidth - help.left + 12 + 'px',
    });
    return;
  }
  // Fallback: just right of the search pill, found via the search input.
  const input = document.querySelector(
    'header input, [role=search] input, input[placeholder*="Ask Gmail" i], input[aria-label*="Search" i]');
  bar.style.display = input ? 'flex' : 'none';
  if (!input) return;
  let box = input.getBoundingClientRect();
  const left = box.left;
  // widen to the pill; the width cap keeps us from grabbing a container that spans to the right-hand icons
  for (let n = input.parentElement; n && n !== document.body; n = n.parentElement) {
    const b = n.getBoundingClientRect();
    if (b.left < left - 80 || b.height > 64 || b.width > 800) break;
    box = b;
  }
  Object.assign(bar.style, { top: box.top + 'px', height: box.height + 'px', right: 'auto', left: box.right + 12 + 'px' });
}

const load = () =>
  chrome.storage.local.get('filters').then((r) => {
    filters = r.filters || [];
    render();
    place();
  });

load();
chrome.storage.onChanged.addListener(load);
document.body.append(bar);
setInterval(place, 500); // ponytail: polling; Gmail's layout has no reliable event to hook
addEventListener('resize', place);
document.addEventListener('click', (e) => {
  if (!bar.contains(e.target)) bar.querySelector('#qf-menu')?.setAttribute('hidden', '');
}, true);
