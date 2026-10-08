(function () {
  const rules = window.CatchauBuilder;
  const host = document.getElementById('pcBuilder');
  const picker = document.getElementById('pcPicker');
  const entry = document.getElementById('buildBtn');
  if (!rules || !host || !picker || !entry) return;
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let selection = {}, activeSlot = null, query = '', brand = '', order = 'relevant', lastFocus;
  try { const stored = JSON.parse(localStorage.getItem('catchau-build') || '{}'); if (stored && typeof stored === 'object' && !Array.isArray(stored)) selection = stored; } catch (_) {}
  const products = () => P.filter(Boolean);
  const plus = '<span aria-hidden="true">+</span>';
  function persist() { try { localStorage.setItem('catchau-build', JSON.stringify(selection)); } catch (_) { toast('Não foi possível salvar a configuração neste navegador'); } }
  function render() {
    const rows = rules.rows(selection, products()), total = rules.totals(selection, products());
    const required = rules.slots.filter(s => !s.optional).length;
    host.innerHTML = `<button class="pc-back" data-build-back>← Voltar à loja</button><div class="pc-top"><div><h1 id="buildTitle">Monte seu PC</h1><p>Minha configuração <span aria-hidden="true">/</span> ${total.items} ${total.items === 1 ? 'item' : 'itens'}</p></div><div class="pc-actions"><button class="pc-icon" data-build-export title="Baixar configuração" aria-label="Baixar configuração"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12m-5-5 5 5 5-5M5 17v4h14v-4"/></svg></button><button class="pc-icon" data-build-clear title="Limpar configuração" aria-label="Limpar configuração"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7"/></svg></button></div></div><div class="pc-layout"><div><h2 class="pc-section-title">Configuração</h2>${rules.slots.map(slot => {
      const row = rows.find(r => r.slot.key === slot.key), available = products().some(p => p.cat === slot.key);
      return `<article class="pc-slot"><div class="pc-slot-head">${art(slot.icon)}<div><h3>${slot.name}</h3><small>${slot.optional ? 'Opcional' : 'Componente do PC'}</small></div><button class="pc-icon" data-build-slot="${slot.key}" ${available ? '' : 'disabled'} aria-label="${row ? 'Trocar' : 'Selecionar'} ${slot.name}" title="${row ? 'Trocar' : 'Selecionar'} ${slot.name}">${plus}</button></div>${row ? `<div class="pc-selected"><img class="pc-photo" src="${esc(row.product.img || '')}" alt="${esc(row.product.name)}" width="84" height="84"><div class="pc-selected-info"><small>${esc(row.product.brand)}</small><h4>${esc(row.product.name)}</h4><strong>${R(pix(row.product) * row.quantity)} <small>no PIX</small></strong><div class="pc-selected-controls"><button class="pc-icon" data-build-qty="${slot.key}" data-delta="-1" aria-label="Diminuir quantidade de ${slot.name}" ${row.quantity === 1 ? 'disabled' : ''}>−</button><output>${row.quantity}</output><button class="pc-icon" data-build-qty="${slot.key}" data-delta="1" aria-label="Aumentar quantidade de ${slot.name}" ${row.quantity === 10 ? 'disabled' : ''}>+</button><button class="pc-remove" data-build-remove="${slot.key}">Remover</button></div></div></div>` : `<button class="pc-empty" data-build-slot="${slot.key}" ${available ? '' : 'disabled'}><span class="pc-plus" aria-hidden="true">${available ? '+' : '—'}</span><span><b>${available ? 'Selecionar ' + slot.name.toLowerCase() : 'Indisponível no catálogo'}</b><small>${available ? products().filter(p => p.cat === slot.key).length + ' opções disponíveis' : 'Nenhuma peça cadastrada nesta categoria'}</small></span></button>`}</article>`;
    }).join('')}</div><aside class="pc-summary" aria-label="Resumo da configuração"><h2 class="pc-section-title">Resumo</h2><div class="pc-total"><small>Total da configuração</small><strong>${R(total.pix)}</strong><p>no PIX com 15% de desconto</p><b class="pc-card-price">${R(total.card)}</b><p>ou 12x de ${R(total.card / 12)} sem juros</p><ul class="pc-summary-list">${rows.map(r => `<li><span>${r.quantity} × ${r.slot.name}</span><b>${R(pix(r.product) * r.quantity)}</b></li>`).join('')}</ul><button class="btn pc-buy" data-build-cart ${rows.length ? '' : 'disabled'}>Adicionar peças ao carrinho →</button><p>Compra de peças avulsas. Não inclui montagem.</p></div><div class="pc-status"><h3>Status da configuração</h3><div class="pc-status-line"><span>${total.count} de ${required} componentes</span><b>${Math.round(total.count / required * 100)}%</b></div><div class="pc-progress" role="progressbar" aria-label="Componentes selecionados" aria-valuenow="${total.count}" aria-valuemin="0" aria-valuemax="${required}"><i style="width:${total.count / required * 100}%"></i></div><p>${total.count === required ? 'Todas as etapas preenchidas.' : 'Configuração incompleta. Você pode comprar as peças selecionadas.'}</p></div><div class="pc-status"><h3 class="pc-warning">◇ Compatibilidade não verificada</h3><p>Soquete, memória, dimensões e conexões precisam de conferência nas especificações dos fabricantes.</p></div><div class="pc-status"><h3>ϟ Consumo de energia</h3><p>Sem estimativa: faltam dados técnicos de consumo e uma fonte no catálogo.</p></div></aside></div>`;
  }
  function openBuilder() {
    document.querySelector('main').hidden = true;
    host.hidden = false; entry.setAttribute('aria-current', 'true'); render(); window.scrollTo(0, 0);
    if (location.hash !== '#monte-seu-pc') history.replaceState(null, '', '#monte-seu-pc');
  }
  function closeBuilder() {
    host.hidden = true; document.querySelector('main').hidden = false; entry.removeAttribute('aria-current');
    history.replaceState(null, '', location.pathname + location.search); window.scrollTo(0, 0);
  }
  function optionRows() {
    let available = products().filter(p => p.cat === activeSlot && (!brand || p.brand === brand) && (!query || `${p.brand} ${p.name}`.toLowerCase().includes(query.toLowerCase())));
    if (order === 'low') available.sort((a,b) => a.price-b.price);
    if (order === 'high') available.sort((a,b) => b.price-a.price);
    document.getElementById('pickerCount').textContent = `${available.length} opções`;
    document.getElementById('pcOptions').innerHTML = available.length ? available.map(p => {
      const selected = selection[activeSlot]?.id === p.id;
      return `<article class="pc-option ${selected ? 'is-selected' : ''}"><img class="pc-photo" src="${esc(p.img || '')}" alt="${esc(p.name)}" loading="lazy" width="200" height="154"><small>${esc(p.brand)}</small><h3>${esc(p.name)}</h3><strong>${R(pix(p))}</strong><p>no PIX · ou 12x de ${R(p.price / 12)}</p><button class="btn" data-build-select="${p.id}">${selected ? 'Selecionado ✓' : 'Selecionar'}</button></article>`;
    }).join('') : '<div class="pc-no-results">Nenhuma peça encontrada para estes filtros.</div>';
  }
  function openPicker(key) {
    const slot = rules.slots.find(s => s.key === key);
    if (!slot) return;
    activeSlot = key; query = ''; brand = ''; order = 'relevant'; lastFocus = document.activeElement;
    const brands = [...new Set(products().filter(p => p.cat === key).map(p => p.brand))].sort();
    picker.innerHTML = `<div class="pc-picker-head"><div><h2 id="pickerTitle">${slot.name}</h2><p id="pickerCount"></p></div><button class="pc-icon" data-picker-close aria-label="Fechar seleção">×</button></div><div class="pc-picker-tools"><input type="search" id="pcSearch" placeholder="Buscar peça ou modelo" aria-label="Buscar peça"><select id="pcBrand" aria-label="Filtrar por marca"><option value="">Todas as marcas</option>${brands.map(b => `<option value="${esc(b)}">${esc(b)}</option>`).join('')}</select><select id="pcOrder" aria-label="Ordenar peças"><option value="relevant">Mais relevantes</option><option value="low">Menor preço</option><option value="high">Maior preço</option></select></div><div class="pc-options" id="pcOptions"></div>`;
    optionRows(); picker.showModal();
    document.getElementById('pcSearch').addEventListener('input', e => { query = e.target.value; optionRows(); });
    document.getElementById('pcBrand').addEventListener('change', e => { brand = e.target.value; optionRows(); });
    document.getElementById('pcOrder').addEventListener('change', e => { order = e.target.value; optionRows(); });
  }
  entry.addEventListener('click', openBuilder);
  document.getElementById('home').addEventListener('click', closeBuilder);
  document.getElementById('tabs').addEventListener('click', e => { if (e.target.closest('[data-cat]')) closeBuilder(); });
  host.addEventListener('click', e => {
    const button = e.target.closest('button'); if (!button || button.disabled) return;
    if (button.hasAttribute('data-build-back')) closeBuilder();
    else if (button.dataset.buildSlot) openPicker(button.dataset.buildSlot);
    else if (button.dataset.buildRemove) { delete selection[button.dataset.buildRemove]; persist(); render(); }
    else if (button.dataset.buildQty) { const item = selection[button.dataset.buildQty]; if (item) item.quantity = Math.min(10, Math.max(1, item.quantity + Number(button.dataset.delta))); persist(); render(); }
    else if (button.hasAttribute('data-build-clear')) { if (Object.keys(selection).length && confirm('Limpar todas as peças da configuração?')) { selection = {}; persist(); render(); } }
    else if (button.hasAttribute('data-build-cart')) {
      const rows = rules.rows(selection, products());
      if (!rows.length) return;
      rows.forEach(r => { cart[r.product.id] = (cart[r.product.id] || 0) + r.quantity; });
      cartUI(); drawer(true); toast('Peças da configuração adicionadas ao carrinho');
    } else if (button.hasAttribute('data-build-export')) {
      const total = rules.totals(selection, products());
      const text = ['CATCHAU — Minha configuração', ...rules.rows(selection, products()).map(r => `${r.slot.name}: ${r.quantity} x ${r.product.brand} ${r.product.name} — ${R(pix(r.product) * r.quantity)}`), '', `Total PIX: ${R(total.pix)}`, `Total cartão: ${R(total.card)}`, 'Peças avulsas. Compatibilidade não verificada.'].join('\n');
      const url = URL.createObjectURL(new Blob([text], {type:'text/plain;charset=utf-8'}));
      const link = document.createElement('a'); link.href = url; link.download = 'catchau-meu-pc.txt'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  });
  picker.addEventListener('click', e => {
    const button = e.target.closest('button');
    if (button?.hasAttribute('data-picker-close')) picker.close();
    if (button?.hasAttribute('data-build-select')) {
      const product = products().find(p => p.id === Number(button.dataset.buildSelect) && p.cat === activeSlot);
      if (!product) return;
      selection[activeSlot] = {id:product.id, quantity:1}; persist(); picker.close(); render();
      host.querySelector(`[data-build-slot="${activeSlot}"]`)?.focus();
    }
    if (e.target === picker) { const bounds = picker.getBoundingClientRect(); if (e.clientX < bounds.left || e.clientX > bounds.right || e.clientY < bounds.top || e.clientY > bounds.bottom) picker.close(); }
  });
  picker.addEventListener('close', () => { if (lastFocus?.isConnected) lastFocus.focus(); });
  const load = window.loadCatalog;
  window.loadCatalog = async (...args) => { await load?.(...args); if (!host.hidden) render(); };
  if (location.hash === '#monte-seu-pc') openBuilder();
})();