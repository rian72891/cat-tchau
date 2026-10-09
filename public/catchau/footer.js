(function () {
  const pages = window.CatchauFooterPages;
  const main = document.querySelector('main');
  if (!pages || !main) return;
  const page = new URLSearchParams(location.search).get('page');
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const url = key => `/informacoes/${key}`;
  const home = '/';
  const host = document.createElement('section'); host.className = 'info-page wrap'; host.hidden = true;
  main.after(host);
  const action = (label,key) => `<button class="btn" data-footer-action="${key}">${label}</button>`;
  if (page && pages[page]) {
    const p = pages[page];
    main.hidden = true; host.hidden = false; document.title = `${p.title} | Catchau`;
    const form = p.form ? `<form class="info-form" id="infoForm"><h2>${p.form === 'career' ? 'Apresentação profissional' : p.form === 'return' ? 'Preparar solicitação' : 'Sua mensagem'}</h2><label>Nome<input name="name" required maxlength="80" autocomplete="name"></label><label>E-mail<input name="email" type="email" required maxlength="160" autocomplete="email"></label>${p.form === 'return' ? '<label>Número do pedido<input name="order" required maxlength="40" placeholder="Identificação do pedido"></label>' : ''}<label>${p.form === 'career' ? 'Área de interesse' : 'Assunto'}<input name="subject" required maxlength="120"></label><label>${p.form === 'career' ? 'Experiência e apresentação' : 'Mensagem'}<textarea name="message" required maxlength="5000"></textarea></label><small>Não inclua senhas ou dados de cartão. O documento não será enviado nem registrado como atendimento.</small><button class="btn" type="submit">Baixar ${p.form === 'career' ? 'apresentação' : 'solicitação'}</button><div id="infoResult" role="status"></div></form>` : '';
    host.innerHTML = `<div class="info-crumb"><a href="${home}" target="_top">Início</a><span>/</span><span>${p.category}</span><span>/</span><span>${p.title}</span></div><div class="info-heading"><small>CATCHAU / ${p.category.toUpperCase()}</small><h1>${p.title}</h1><p>${p.intro}</p></div><div class="info-layout"><div class="info-content">${(p.sections || []).map(([title,text]) => `<section><h2>${title}</h2><p>${text}</p></section>`).join('')}${p.faq ? p.faq.map(([title,text]) => `<details><summary>${title}</summary><p>${text}</p></details>`).join('') : ''}${p.connection ? `<section><h2>Esta conexão</h2><p>${location.protocol === 'https:' ? 'HTTPS ativo nesta página.' : 'Ambiente de prévia local. Consulte HTTPS no endereço publicado.'}</p></section>` : ''}${p.actions ? `<div class="info-actions">${p.actions.map(([label,key]) => action(label,key)).join('')}</div>` : ''}${form}</div><aside class="info-nav" aria-label="Outras informações"><h2>Informações e atendimento</h2>${Object.entries(pages).map(([key,data]) => `<a href="${url(key)}" target="_top" ${page === key ? 'aria-current="page"' : ''}>${data.title}</a>`).join('')}</aside></div>`;
    document.getElementById('infoForm')?.addEventListener('submit', e => {
      e.preventDefault();
      const data = new FormData(e.target);
      const text = [`CATCHAU — ${p.title}`, `Nome: ${data.get('name')}`, `E-mail: ${data.get('email')}`, ...(data.has('order') ? [`Pedido: ${data.get('order')}`] : []), `Assunto: ${data.get('subject')}`, '', String(data.get('message')), '', 'Documento preparado pelo visitante. Não enviado à Catchau.'].join('\n');
      const download = URL.createObjectURL(new Blob([text], {type:'text/plain;charset=utf-8'}));
      const a = document.createElement('a'); a.href = download; a.download = `catchau-${p.form}.txt`; a.click(); setTimeout(() => URL.revokeObjectURL(download), 1000);
      const result = document.getElementById('infoResult'); result.className = 'info-form-result'; result.textContent = 'Documento preparado para download. Nenhuma mensagem foi enviada.';
    });
  }
  function showShop() {
    host.hidden = true; document.getElementById('pcBuilder').hidden = true; main.hidden = false;
    document.getElementById('buildBtn').removeAttribute('aria-current');
  }
  document.getElementById('home').addEventListener('click', () => { if (page) window.top.location.href = home; });
  document.getElementById('tabs').addEventListener('click', () => { host.hidden = true; });
  document.getElementById('buildBtn').addEventListener('click', () => { host.hidden = true; });
  document.addEventListener('click', e => {
    const control = e.target.closest('[data-footer-action]'); if (!control) return;
    e.preventDefault(); const key = control.dataset.footerAction;
    if (key === 'orders' || key === 'tracking') { if (window.openCatchauAccount) window.openCatchauAccount(key); else toast('A conta ainda está carregando; tente novamente'); }
    else if (key === 'contact') window.top.location.href = url('fale-conosco');
    else if (key === 'cart') drawer(true);
    else if (key === 'builder' || key === 'upgrade') { host.hidden = true; document.getElementById('buildBtn').click(); if (key === 'upgrade') document.querySelector('[data-build-slot="cpu"]')?.focus(); }
    else { showShop(); reset(); if (key === 'per' || key === 'mon') setCat(key); if (key === 'hardware') { S.cat = 'all'; grid(); const ids = new Set(P.filter(p => ['cpu','gpu','ram','ssd'].includes(p.cat)).map(p => p.id)); document.querySelectorAll('#grid [data-pid]').forEach(el => { if (!ids.has(Number(el.dataset.pid))) el.remove(); }); document.getElementById('ttl').textContent = 'Hardware'; document.getElementById('res').textContent = `${document.querySelectorAll('#grid [data-pid]').length} produtos`; } document.getElementById('shop').scrollIntoView({behavior:'smooth'}); }
  });
})();