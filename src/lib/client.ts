// Client behaviour: mobile menu, global search, Work filters, reveal, count-up and draw-once.
// No dependencies. Everything degrades to plain HTML without JavaScript.
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => [...root.querySelectorAll<T>(s)];

/* ---------- Mobile menu ---------- */
function setMenu(open: boolean) {
  const h = document.getElementById('site-header');
  if (!h) return;
  h.dataset.open = String(open);
  const t = $('[data-nav-toggle]', h);
  t?.setAttribute('aria-expanded', String(open));
  const l = $('[data-nav-label]', h);
  if (l) l.textContent = open ? 'Close menu' : 'Open menu';
}
function syncCurrent() {
  // The header persists across view transitions: refresh the current-page marker.
  const path = location.pathname.replace(/\/?$/, '/');
  $$<HTMLAnchorElement>('[data-nav-link]').forEach((a) => {
    const href = a.getAttribute('href')!;
    if (path.startsWith(href)) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
}

/* ---------- Global search ---------- */
interface Item { t: string; s: string; u: string; g: string; k: string; b?: { label: string; variant: string }; ext?: boolean }
let index: Promise<Item[]> | null = null;
let results: Item[] = [];
let active = 0;
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\u2019']/g, '');
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

function highlight(text: string, terms: string[]) {
  let out = esc(text);
  for (const t of terms.filter((t) => t.length > 1)) {
    const i = norm(out).indexOf(norm(esc(t)));
    if (i >= 0) out = `${out.slice(0, i)}<mark>${out.slice(i, i + t.length)}</mark>${out.slice(i + t.length)}`;
  }
  return out;
}

function score(item: Item, terms: string[]) {
  const title = norm(item.t);
  const sub = norm(item.s);
  const rest = norm(item.k);
  let total = 0;
  for (const raw of terms) {
    const t = raw.replace(/^#/, '');
    if (title.includes(t)) total += title.startsWith(t) ? 6 : 4;
    else if (sub.includes(t)) total += 3;
    else if (rest.includes(t)) total += 1;
    else return 0; // every term must match somewhere
  }
  return total;
}

function renderResults(q: string) {
  const list = $('#search-results');
  const status = $('#search-status');
  if (!list || !index) return;
  index.then((all) => {
    const terms = norm(q).split(/\s+/).filter(Boolean);
    const groups = ['Work', 'Lab', 'Speaking', 'Writing', 'Pages'];
    results = terms.length
      ? all.map((i) => ({ i, s: score(i, terms) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s || groups.indexOf(a.i.g) - groups.indexOf(b.i.g)).map((x) => x.i).slice(0, 30)
      : all.filter((i) => i.g === 'Pages' || (i.g === 'Work' && i.b?.variant === 'merged')).sort((a, b) => groups.indexOf(a.g) - groups.indexOf(b.g));
    active = 0;
    if (!results.length) {
      list.innerHTML = `<li class="search-empty">No result for “${esc(q)}”. Try a repository, an issue number like 2582, or a topic like DOM.</li>`;
      if (status) status.textContent = 'No results';
      return;
    }
    let html = '';
    let last = '';
    results.forEach((r, n) => {
      if (r.g !== last) { html += `<li class="search-group" role="presentation">${terms.length ? r.g : r.g === 'Work' ? 'Merged pull requests' : 'Pages'}</li>`; last = r.g; }
      html += `<li role="option" id="sr-${n}" aria-selected="${n === 0}" data-i="${n}">
        <span class="r-title">${highlight(r.t, terms)}</span>
        ${r.b ? `<span class="badge badge--${r.b.variant}">${r.b.label}</span>` : `<span class="r-kind">${r.ext ? 'External' : ''}</span>`}
        <span class="r-sub">${highlight(r.s, terms)}</span></li>`;
    });
    list.innerHTML = html;
    $('#search-input')?.setAttribute('aria-activedescendant', 'sr-0');
    if (status) status.textContent = `${results.length} ${results.length === 1 ? 'result' : 'results'}`;
  });
}

function move(delta: number) {
  if (!results.length) return;
  active = (active + delta + results.length) % results.length;
  $$('#search-results [role="option"]').forEach((el) => el.setAttribute('aria-selected', String(Number(el.dataset.i) === active)));
  const el = document.getElementById(`sr-${active}`);
  el?.scrollIntoView({ block: 'nearest' });
  $('#search-input')?.setAttribute('aria-activedescendant', `sr-${active}`);
}

function go(i: number) {
  const r = results[i];
  if (!r) return;
  closeSearch();
  if (r.ext) { window.open(r.u, '_blank', 'noopener'); return; }
  const url = new URL(r.u, location.href);
  if (url.pathname === location.pathname && url.hash) { location.hash = url.hash; openFromHash(); return; }
  location.href = r.u;
}

function openSearch() {
  const d = $<HTMLDialogElement>('#search');
  if (!d || d.open) return;
  index ??= fetch('/search.json').then((r) => r.json()).catch(() => []);
  setMenu(false);
  d.showModal();
  const input = $<HTMLInputElement>('#search-input')!;
  input.select();
  renderResults(input.value);
}
function closeSearch() { $<HTMLDialogElement>('#search')?.close(); }

/* ---------- Work filters ---------- */
function applyFilters() {
  const root = $('[data-work]');
  if (!root) return;
  const val = (name: string) => $<HTMLInputElement>(`[name="${name}"]:checked`, root)?.value ?? $<HTMLSelectElement>(`[name="${name}"]`, root)?.value ?? 'all';
  const kind = val('kind');
  const status = val('status');
  const project = val('project');
  const q = norm($<HTMLInputElement>('[name="q"]', root)?.value.trim() ?? '');
  const terms = q.split(/\s+/).filter(Boolean).map((t) => t.replace(/^#/, ''));
  let shown = 0;
  $$('[data-group]', root).forEach((g) => {
    let n = 0;
    $$('[data-item]', g).forEach((r) => {
      const ok = (kind === 'all' || r.dataset.kind === kind)
        && (status === 'all' || r.dataset.status === status)
        && (project === 'all' || r.dataset.project === project)
        && terms.every((t) => r.dataset.text!.includes(t));
      r.toggleAttribute('data-out', !ok);
      if (ok) n++;
    });
    g.hidden = n === 0;
    const c = $('[data-group-count]', g);
    if (c) c.textContent = String(n);
    shown += n;
  });
  const total = $$('[data-item]', root).length;
  const out = $('[data-filter-count]', root);
  if (out) out.textContent = shown === total ? `Showing all ${total}` : `Showing ${shown} of ${total}`;
  const empty = $('[data-filter-empty]', root);
  if (empty) empty.hidden = shown > 0;
  const reset = $('[data-filter-reset]', root);
  if (reset) reset.hidden = shown === total && !q;
  // Keep the URL shareable: /work/?status=merged&q=dom
  const params = new URLSearchParams();
  if (kind !== 'all') params.set('kind', kind);
  if (status !== 'all') params.set('status', status);
  if (project !== 'all') params.set('project', project);
  if (q) params.set('q', q);
  const next = `${location.pathname}${params.size ? `?${params}` : ''}${location.hash}`;
  if (next !== `${location.pathname}${location.search}${location.hash}`) history.replaceState(history.state, '', next);
}

function initFiltersFromUrl() {
  const root = $('[data-work]');
  if (!root) return;
  const p = new URLSearchParams(location.search);
  for (const name of ['kind', 'status']) {
    const v = p.get(name);
    const r = v && $<HTMLInputElement>(`[name="${name}"][value="${CSS.escape(v)}"]`, root);
    if (r) r.checked = true;
  }
  const proj = p.get('project');
  const sel = $<HTMLSelectElement>('[name="project"]', root);
  if (sel && proj && [...sel.options].some((o) => o.value === proj)) sel.value = proj;
  const q = $<HTMLInputElement>('[name="q"]', root);
  if (q && p.get('q')) q.value = p.get('q')!;
  applyFilters();
}

/** /work/#typescript-dom-lib-generator-2582 opens and highlights that row. */
function openFromHash() {
  if (!location.hash) return;
  const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (!el) return;
  const det = el.matches('details') ? (el as HTMLDetailsElement) : el.querySelector('details');
  if (det) det.open = true;
  if (el.hasAttribute('data-out')) {
    const reset = $<HTMLButtonElement>('[data-filter-reset]');
    reset?.click();
  }
  el.setAttribute('data-target', '');
  setTimeout(() => el.removeAttribute('data-target'), 2400);
  el.scrollIntoView({ block: 'center', behavior: reduce() ? 'auto' : 'smooth' });
  $<HTMLElement>('summary', el)?.focus({ preventScroll: true });
}

/* ---------- Timeline filter ---------- */
function applyTimeline() {
  const root = $('[data-tl]');
  if (!root) return;
  const v = $<HTMLInputElement>('[name="tlkind"]:checked', root)?.value ?? 'all';
  let n = 0;
  $$('[data-tl-month]', root).forEach((m) => {
    let k = 0;
    $$('[data-tl-kind]', m).forEach((it) => { const ok = v === 'all' || it.dataset.tlKind === v; it.hidden = !ok; if (ok) k++; });
    m.hidden = k === 0;
    n += k;
  });
  const total = $$('[data-tl-kind]', root).length;
  const out = $('[data-tl-count]', root);
  if (out) out.textContent = n === total ? `Showing all ${total}` : `Showing ${n} of ${total}`;
}

/* ---------- Copy buttons (bio, abstracts) ---------- */
async function copyFrom(btn: HTMLElement) {
  const src = document.getElementById(btn.dataset.copy!);
  if (!src) return;
  const text = src.innerText.trim();
  try { await navigator.clipboard.writeText(text); } catch {
    // Clipboard unavailable (insecure context, denied): select the text so it can be copied by hand.
    const r = document.createRange(); r.selectNodeContents(src); const sel = getSelection(); sel?.removeAllRanges(); sel?.addRange(r);
    return;
  }
  const label = $('[data-copy-label]', btn);
  const before = label?.textContent;
  btn.setAttribute('data-copied', '');
  if (label) label.textContent = 'Copied';
  setTimeout(() => { btn.removeAttribute('data-copied'); if (label && before) label.textContent = before; }, 1800);
}

/* ---------- Count-up, once ----------
 * The true value is in the HTML and must always be what remains on screen. A timer that does not depend on
 * animation frames restores it, so a background tab or a full-page capture never freezes on an intermediate value. */
function countUp(el: HTMLElement) {
  const end = Number(el.dataset.count);
  const final = String(end);
  if (!Number.isFinite(end) || end <= 1 || reduce() || document.hidden) { el.textContent = final; return; }
  const dur = 1100;
  const start = performance.now();
  const guard = setTimeout(() => { el.textContent = final; }, dur + 100);
  el.textContent = '0';
  const step = (now: number) => {
    const p = Math.min(1, (now - start) / dur);
    el.textContent = p >= 1 ? final : String(Math.round(end * (1 - Math.pow(1 - p, 4))));
    if (p < 1) requestAnimationFrame(step); else clearTimeout(guard);
  };
  requestAnimationFrame(step);
}

function observe() {
  const targets = $$('[data-count], [data-observe], [data-draw], [data-reveal]');
  const show = (el: HTMLElement) => {
    el.setAttribute('data-drawn', '');
    el.setAttribute('data-shown', '');
    if (el.dataset.count) countUp(el);
    // Figures nested in a revealed section draw with it.
    $$('[data-observe], [data-draw]', el).forEach((c) => c.setAttribute('data-drawn', ''));
    $$('[data-count]', el).forEach(countUp);
  };
  if (!('IntersectionObserver' in window) || reduce()) { targets.forEach(show); return; }
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      io.unobserve(en.target);
      show(en.target as HTMLElement);
    }
  }, { threshold: 0.2, rootMargin: '0px 0px -5% 0px' });
  targets.filter((t) => !t.closest('[data-reveal]') || t.matches('[data-reveal]')).forEach((t) => io.observe(t));
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) $$('[data-count]').forEach((el) => (el.textContent = el.dataset.count!));
});

function initOnce() {
  const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-nav-toggle]')) setMenu(document.getElementById('site-header')?.dataset.open !== 'true');
    if (target.closest('[data-search-open]')) openSearch();
    if (target.closest('[data-search-close]')) closeSearch();
    const copyBtn = target.closest<HTMLElement>('[data-copy]');
    if (copyBtn) copyFrom(copyBtn);
    const opt = target.closest<HTMLElement>('#search-results [role="option"]');
    if (opt) go(Number(opt.dataset.i));
    const d = $<HTMLDialogElement>('#search');
    if (d?.open && target === d) closeSearch(); // click on the backdrop
    if (target.closest('[data-filter-reset]')) {
      const root = $('[data-work]')!;
      $$<HTMLInputElement>('input[value="all"]', root).forEach((i) => (i.checked = true));
      const sel = $<HTMLSelectElement>('[name="project"]', root);
      if (sel) sel.value = 'all';
      const q = $<HTMLInputElement>('[name="q"]', root);
      if (q) q.value = '';
      applyFilters();
    }
  });
  document.addEventListener('input', (e) => {
    const t = e.target as HTMLElement;
    if (t.id === 'search-input') renderResults((t as HTMLInputElement).value);
    if (t.closest('[data-work]')) applyFilters();
  });
  document.addEventListener('change', (e) => {
    const t = e.target as HTMLElement;
    if (t.closest('[data-work]')) applyFilters();
    if (t.closest('[data-tl]')) applyTimeline();
  });
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); const d = $<HTMLDialogElement>('#search'); d?.open ? closeSearch() : openSearch(); return; }
    if (e.key === '/' && !(e.target as HTMLElement).closest('input, textarea, select, [contenteditable]')) { e.preventDefault(); openSearch(); return; }
    if ((e.target as HTMLElement).id === 'search-input') {
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter') { e.preventDefault(); go(active); }
      else if (e.key === 'Escape') { e.preventDefault(); closeSearch(); }
    }
    if (e.key === 'Escape' && document.getElementById('site-header')?.dataset.open === 'true') { setMenu(false); $<HTMLElement>('[data-nav-toggle]')?.focus(); }
  });
  window.addEventListener('hashchange', openFromHash);
  $$('[data-search-kbd]').forEach((k) => (k.textContent = mac ? '⌘ K' : 'Ctrl K'));
}

export function boot() {
  initOnce();
  document.addEventListener('astro:page-load', () => {
    setMenu(false); syncCurrent(); observe(); initFiltersFromUrl(); applyTimeline(); openFromHash();
  });
  document.addEventListener('astro:after-swap', () => document.documentElement.classList.add('js'));
}
