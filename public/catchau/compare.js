(() => {
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read = key => { try { const a = JSON.parse(localStorage.getItem(key)); return Array.isArray(a) ? [...new Set(a.filter(Number.isInteger))] : []; } catch { return []; } };
  const store = (key, ids) => { try { localStorage.setItem(key, JSON.stringify(ids)); } catch {} };
  const product = id => P.find(p => p && p.id === id);
  let selected = read('catchau-compare'), recent = read('catchau-recent'), mode = '', returnFocus, differences = false;
  const items = ids => ids.map(product).filter(Boolean);
  function normalize() {
    const list = items(selected);
    selected = list.filter(p => p.cat === list[0]?.cat).slice(0, 4).map(p => p.id);
    recent = items(recent).slice(0, 12).map(p => p.id);
    store('catchau-compare', selected); store('catchau-recent', recent);
  }
  const photo = p => p.img ? `<img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy">` : `<span class="cx-placeholder" aria-label="Sem imagem">◇</span>`;
  const tray = document.createElement('aside'); tray.className = 'cx-tray'; tray.setAttribute('aria-label', 'Produtos para comparar'); document.body.append(tray);
  const overlay = document.createElement('div'); overlay.className = 'cx-overlay'; overlay.hidden = true;
  overlay.innerHTML = '<section class="cx-dialog" role="dialog" aria-modal="true" aria-labelledby="cx-title" tabindex="-1"><header><h2 id="cx-title"></h2><button type="button" data-cx-close aria-label="Fechar">×</button></header><div class="cx-content"></div></section>';
  document.body.append(overlay);
  const panel = overlay.querySelector('.cx-dialog'), content = overlay.querySelector('.cx-content');
  const heart = document.createElement('button'); heart.type = 'button'; heart.className = 'ib cx-heart'; heart.title = 'Meus favoritos';
  document.querySelector('#acctBtn')?.before(heart);
  const history = document.createElement('section'); history.className = 'cx-recent'; history.setAttribute('aria-label', 'Vistos recentemente');
  const perks = document.querySelector('main .perks');
  if (perks) perks.insertAdjacentElement('afterend', history); else document.querySelector('main')?.append(history);
  function badge() {
    heart.innerHTML = `<span aria-hidden="true">♡</span><small>${favs.size}</small>`;
    heart.setAttribute('aria-label', `Meus favoritos (${favs.size})`);
  }
  function buttons() {
    document.querySelectorAll('#grid .card[data-pid]').forEach(card => {
      if (!card.querySelector('[data-cmp]')) card.insertAdjacentHTML('beforeend', `<button type="button" class="cx-compare" data-cmp="${Number(card.dataset.pid)}">Comparar</button>`);
    });
    document.querySelectorAll('[data-cmp]').forEach(b => { const active = selected.includes(Number(b.dataset.cmp)); b.setAttribute('aria-pressed', String(active)); b.textContent = active ? 'Remover da comparação' : 'Comparar'; });
  }
  function renderTray() {
    tray.hidden = !selected.length;
    document.body.classList.toggle('cx-has-tray', !!selected.length);
    tray.innerHTML = `<div class="cx-thumbs">${items(selected).map(p => `<div>${photo(p)}<button type="button" data-cx-remove="${p.id}" aria-label="Remover ${esc(p.name)}">×</button></div>`).join('')}</div><button type="button" data-cx-clear>Limpar</button><button type="button" class="btn" data-cx-show>Comparar agora (${selected.length})</button>`;
    buttons();
  }
  function row(label, values, best = []) {
    if (differences && values.every(v => v === values[0])) return '';
    return `<tr><th scope="row">${esc(label)}</th>${values.map((v, i) => `<td class="${best.includes(i) ? 'cx-best' : ''}">${esc(v)}${best.includes(i) ? '<small>Melhor valor</small>' : ''}</td>`).join('')}</tr>`;
  }
  function comparison() {
    const ps = items(selected);
    if (!ps.length) return '<p>Nenhum produto selecionado. Use Comparar nos produtos.</p>';
    const best = (key, direction) => { const values = ps.map(key), target = Math[direction](...values); return values.flatMap((v, i) => v === target ? [i] : []); };
    return `<label class="cx-diff"><input type="checkbox" data-cx-diff ${differences ? 'checked' : ''}> Mostrar só diferenças</label><p class="cx-hint">Melhores preços e notas destacados. Deslize a tabela para ver todos os produtos.</p><div class="cx-table" tabindex="0" role="region" aria-label="Tabela de comparação"><table><thead><tr><th scope="col">Produto</th>${ps.map(p => `<th scope="col">${photo(p)}<b>${esc(p.name)}</b><button type="button" data-cx-remove="${p.id}">Remover</button></th>`).join('')}</tr></thead><tbody>${row('Nome', ps.map(p => p.name))}${row('Marca', ps.map(p => p.brand))}${row('PIX', ps.map(p => R(pix(p))), best(pix, 'min'))}${row('Cartão / 12x', ps.map(p => `${R(p.price)} / 12x de ${R(p.price / 12)}`), best(p => p.price, 'min'))}${row('Desconto no cartão', ps.map(p => `${Math.round(p.dc * 100)}%`))}${row('Nota', ps.map(p => `${p.rate} / 5 (${p.n} avaliações)`), best(p => p.rate, 'max'))}${(SPECS[ps[0].cat] || []).map(([label, value]) => row(label, ps.map(p => typeof value === 'function' ? value(p) : value))).join('')}<tr><th scope="row">Ações</th>${ps.map(p => `<td><button type="button" class="btn" data-add="${p.id}">Adicionar ao carrinho</button><button type="button" data-cx-product="${p.id}">Ver produto</button></td>`).join('')}</tr></tbody></table></div>`;
  }
  function tile(p, removable = false) {
    return `<article class="cx-tile">${photo(p)}<h3>${esc(p.name)}</h3><b>${esc(R(pix(p)))} no PIX</b><button type="button" class="btn" data-add="${p.id}">Adicionar ao carrinho</button><button type="button" data-cx-product="${p.id}">Ver produto</button>${removable ? `<button type="button" data-cx-unfav="${p.id}">Remover dos favoritos</button>` : ''}</article>`;
  }
  function favorites() {
    const ps = items([...favs]);
    return ps.length ? `<button type="button" class="btn" data-cx-all>Adicionar todos</button><div class="cx-tiles">${ps.map(p => tile(p, true)).join('')}</div>` : '<p>Você ainda não tem favoritos. Toque no coração de um produto para salvá-lo aqui.</p>';
  }
  function renderModal() {
    overlay.querySelector('h2').textContent = mode === 'compare' ? 'Comparar produtos' : 'Meus favoritos';
    content.innerHTML = mode === 'compare' ? comparison() : favorites();
  }
  function open(which) {
    returnFocus = document.activeElement; mode = which; renderModal(); overlay.hidden = false; panel.focus();
  }
  function close(restore = true) {
    if (overlay.hidden) return;
    overlay.hidden = true; mode = '';
    if (restore) (returnFocus?.isConnected ? returnFocus : heart).focus();
  }
  function renderHistory() {
    const ps = items(recent); history.hidden = !ps.length;
    history.innerHTML = `<header><h2>Vistos recentemente</h2><button type="button" data-cx-history>Limpar histórico</button></header><div class="cx-history">${ps.map(p => tile(p)).join('')}</div>`;
  }
  function refresh() { renderTray(); badge(); if (mode) renderModal(); }
  heart.addEventListener('click', () => open('favorites'));
  document.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) { if (e.target === overlay) close(); return; }
    if (b.hasAttribute('data-cmp')) {
      const id = Number(b.dataset.cmp), p = product(id); if (!p) return;
      if (selected.includes(id)) selected = selected.filter(x => x !== id);
      else if (selected.length && product(selected[0])?.cat !== p.cat) return toast('Compare apenas produtos da mesma categoria.');
      else if (selected.length >= 4) return toast('Você pode comparar no máximo 4 produtos.');
      else selected.push(id);
      store('catchau-compare', selected); refresh();
    } else if (b.hasAttribute('data-cx-remove')) {
      selected = selected.filter(id => id !== Number(b.dataset.cxRemove)); store('catchau-compare', selected); refresh(); if (mode) panel.focus();
    } else if (b.hasAttribute('data-cx-clear')) { selected = []; store('catchau-compare', selected); refresh(); }
    else if (b.hasAttribute('data-cx-show')) open('compare');
    else if (b.hasAttribute('data-cx-close')) close();
    else if (b.hasAttribute('data-cx-unfav')) { favs.delete(Number(b.dataset.cxUnfav)); save(); grid(); badge(); renderModal(); panel.focus(); }
    else if (b.hasAttribute('data-cx-all')) { items([...favs]).forEach(p => { cart[p.id] = (cart[p.id] || 0) + 1; }); cartUI(); toast('Favoritos adicionados ao carrinho'); }
    else if (b.hasAttribute('data-cx-product')) { close(false); pdOpen(Number(b.dataset.cxProduct)); }
    if (b.hasAttribute('data-fav')) queueMicrotask(() => { badge(); if (mode === 'favorites') renderModal(); });
  });
  overlay.addEventListener('change', e => { if (e.target.matches('[data-cx-diff]')) { differences = e.target.checked; renderModal(); overlay.querySelector('[data-cx-diff]')?.focus(); } });
  document.addEventListener('keydown', e => {
    if (overlay.hidden || document.querySelector('.acct.on')) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); close(); }
    if (e.key === 'Tab') {
      const controls = [...panel.querySelectorAll('button,input,[tabindex="0"],a[href]')].filter(el => el.getClientRects().length);
      const first = controls[0], last = controls[controls.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || document.activeElement === panel)) { e.preventDefault(); first?.focus(); }
    }
  }, true);
  document.addEventListener('catchau:grid', () => { buttons(); badge(); });
  document.addEventListener('catchau:catalog', () => { normalize(); refresh(); renderHistory(); });
  document.addEventListener('catchau:product', e => {
    const id = Number(e.detail.id); if (!product(id)) return;
    recent = [id, ...recent.filter(x => x !== id)].slice(0, 12); store('catchau-recent', recent); renderHistory();
    queueMicrotask(() => { const target = document.querySelector('#pdBody .pd-buyrow'); if (target && !target.querySelector('[data-cmp]')) { target.insertAdjacentHTML('afterend', `<button type="button" class="cx-compare" data-cmp="${id}">Comparar</button>`); buttons(); } });
  });
  history.addEventListener('click', e => { if (e.target.closest('[data-cx-history]')) { recent = []; store('catchau-recent', recent); renderHistory(); } });
  normalize(); refresh(); renderHistory();
})();
