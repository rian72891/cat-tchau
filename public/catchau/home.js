/* Home storefront: depends on the existing catalog and cart globals. */
(() => {
  const main = document.querySelector('main');
  if (!main || document.querySelector('#homeStore')) return;
  const root = document.createElement('div');
  root.id = 'homeStore';
  main.prepend(root);
  main.classList.add('home-enhanced');
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const photo = (p, eager = false) => {
    let url = '';
    try { const u = new URL(p.img, location.href); if (['https:', 'http:'].includes(u.protocol) && p.img) url = u.href; } catch (_) {}
    return url ? `<img src="${esc(url)}" alt="${esc(p.name)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async">` : art(p.cat);
  };
  let active = 0, slides = [], hover = false, focused = false, touchX = null;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const shop = () => document.querySelector('#shop')?.scrollIntoView({behavior: reduce.matches ? 'auto' : 'smooth', block:'start'});
  const card = p => `<article class="hm-card" data-home-product="${p.id}">
    <div class="hm-picture">${photo(p)}${p.dc > 0 ? `<span class="hm-discount">−${Math.round(p.dc * 100)}%</span>` : ''}</div>
    <div class="hm-card-info"><span class="hm-brand">${esc(p.brand)}</span><button class="hm-product-name" data-product="${p.id}">${esc(p.name)}</button>
    <div class="hm-rating">★ ${esc(p.rate)} <span>(${esc(p.n)} avaliações)</span></div>
    <s>${R(p.old)}</s><strong class="hm-price">${R(pix(p))}</strong><span class="hm-pix">no PIX · 15% de desconto</span>
    <span class="hm-installment">ou 12x de <b>${R(p.price / 12)}</b> sem juros<br>Total no cartão: ${R(p.price)}</span>
    <button class="hm-add" data-add="${p.id}" aria-label="Adicionar ${esc(p.name)} ao carrinho">＋ Adicionar ao carrinho</button></div></article>`;
  const shelf = (id, title, subtitle, products, timer = false) => `<section class="hm-section" aria-labelledby="${id}-title"><div class="hm-heading"><div><span class="hm-eyebrow">${subtitle}</span><h2 id="${id}-title">${title}</h2></div><div class="hm-tools">${timer ? '<div class="hm-countdown">Termina em <b data-home-clock></b></div>' : ''}<button data-scroll="${id}" data-dir="-1" aria-label="Produtos anteriores: ${title}">‹</button><button data-scroll="${id}" data-dir="1" aria-label="Próximos produtos: ${title}">›</button></div></div><div class="hm-track" id="${id}" tabindex="0" aria-label="${title}">${products.map(card).join('')}</div></section>`;
  function show(index) {
    active = (index + slides.length) % slides.length;
    root.querySelectorAll('.hm-slide').forEach((el, i) => { el.hidden = i !== active; });
    root.querySelectorAll('[data-slide]').forEach((el, i) => { el.setAttribute('aria-current', String(i === active)); });
  }
  function clock() {
    const now = new Date(), end = new Date(now); end.setHours(24,0,0,0);
    const seconds = Math.max(0, Math.floor((end - now) / 1000));
    const el = root.querySelector('[data-home-clock]');
    if (el) el.textContent = [Math.floor(seconds/3600), Math.floor(seconds%3600/60), seconds%60].map(n => String(n).padStart(2,'0')).join(' : ');
  }
  function render() {
    const products = P.filter(Boolean);
    if (!products.length) { root.innerHTML = ''; main.classList.remove('home-enhanced'); return; }
    main.classList.add('home-enhanced');
    const choices = [
      {cat:'gpu', eyebrow:'Potência para ir além', title:'Seu próximo nível começa nos gráficos.', copy:'Explore placas de vídeo para transformar cada partida.', cta:'Explorar placas de vídeo'},
      {cat:'cpu', eyebrow:'O coração do seu setup', title:'Mais desempenho. Novas possibilidades.', copy:'Encontre o processador para jogar, criar e fazer mais.', cta:'Ver processadores'},
      {cat:'per', eyebrow:'Seu setup, do seu jeito', title:'Cada detalhe faz a diferença.', copy:'Descubra os periféricos que combinam com você.', cta:'Explorar periféricos'},
      {cat:'ram', eyebrow:'Escolha peça por peça', title:'Seu PC. Suas regras.', copy:'Combine os componentes no montador e planeje seu próximo PC.', cta:'Monte seu PC', build:true}
    ];
    slides = choices.map(s => ({...s, product:products.find(p => p.cat === s.cat) || products[0]}));
    const counts = new Map(); products.forEach(p => counts.set(p.brand, (counts.get(p.brand)||0)+1));
    const topBrands = [...counts].sort((a,b) => b[1]-a[1]).slice(0,10);
    root.innerHTML = `<section class="hm-banner" aria-roledescription="carrossel" aria-label="Destaques da loja" tabindex="0">${slides.map((s,i) => `<div class="hm-slide" ${i ? 'hidden' : ''} role="group" aria-label="${i+1} de ${slides.length}"><div class="hm-banner-copy"><span class="hm-eyebrow">${s.eyebrow}</span><h1>${s.title}</h1><p>${s.copy}</p><button class="hm-cta" ${s.build ? 'data-build' : `data-category="${s.cat}"`}>${s.cta} <span aria-hidden="true">↗</span></button><small>15% OFF no PIX · até 12x sem juros</small></div><button class="hm-banner-product" data-product="${s.product.id}" aria-label="Ver ${esc(s.product.name)}">${photo(s.product, i === 0)}<span>${esc(s.product.brand)} <b>${esc(s.product.name)}</b></span></button></div>`).join('')}<div class="hm-banner-controls"><button data-banner-prev aria-label="Destaque anterior">‹</button><div>${slides.map((s,i) => `<button data-slide="${i}" aria-label="Ir para destaque ${i+1}" aria-current="${i===0}"></button>`).join('')}</div><button data-banner-next aria-label="Próximo destaque">›</button><button class="hm-pause" data-pause aria-pressed="false" aria-label="Pausar rotação automática">Ⅱ</button></div></section>
      <div class="hm-benefits"><span><b>15% OFF</b> no PIX</span><span><b>12x sem juros</b> no cartão</span><span><b>Frete grátis</b> a partir de R$ 500</span></div>
      <section class="hm-categories" aria-label="Comprar por categoria">${Object.entries(CATS).filter(([cat]) => products.some(p=>p.cat===cat)).map(([cat,label]) => `<button data-category="${esc(cat)}"><span class="hm-category-art">${art(cat)}</span><b>${esc(label)}</b><small>${products.filter(p=>p.cat===cat).length} produtos</small></button>`).join('')}</section>
      ${shelf('hm-deals','Ofertas do dia','Seleção com os maiores descontos',[...products].sort((a,b)=>b.dc-a.dc).slice(0,12),true)}
      ${shelf('hm-bestsellers','Mais vendidos','Os favoritos da comunidade · por avaliações',[...products].sort((a,b)=>b.n-a.n).slice(0,12))}
      <section class="hm-section" aria-labelledby="hm-brands-title"><div class="hm-heading"><div><span class="hm-eyebrow">Encontre a sua favorita</span><h2 id="hm-brands-title">Marcas em destaque</h2></div></div><div class="hm-brands">${topBrands.map(([brand])=>`<button data-home-brand="${esc(brand)}">${esc(brand)}</button>`).join('')}</div></section>
      ${shelf('hm-toprated','Melhor avaliados','Qualidade que conquista',[...products].sort((a,b)=>b.rate-a.rate||b.n-a.n).slice(0,12))}
      <div class="hm-catalog-heading"><span class="hm-eyebrow">Explore todas as possibilidades</span><h2>Encontre o próximo upgrade</h2></div>`;
    active=0; clock();
  }
  let paused = false;
  root.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (b?.hasAttribute('data-add')) return;
    if (b?.hasAttribute('data-category')) { setCat(b.dataset.category); shop(); }
    else if (b?.hasAttribute('data-build')) document.querySelector('#buildBtn')?.click();
    else if (b?.hasAttribute('data-product')) pdOpen(Number(b.dataset.product));
    else if (b?.hasAttribute('data-home-brand')) { S.brands.clear(); S.brands.add(b.dataset.homeBrand); S.cat='all'; tabs(); brands(); grid(); shop(); }
    else if (b?.hasAttribute('data-slide')) show(Number(b.dataset.slide));
    else if (b?.hasAttribute('data-banner-prev')) show(active-1);
    else if (b?.hasAttribute('data-banner-next')) show(active+1);
    else if (b?.hasAttribute('data-pause')) { paused=!paused; b.setAttribute('aria-pressed',String(paused)); b.setAttribute('aria-label', paused?'Retomar rotação automática':'Pausar rotação automática'); b.textContent=paused?'▶':'Ⅱ'; }
    else if (b?.hasAttribute('data-scroll')) { const track=document.getElementById(b.dataset.scroll); track.scrollBy({left: Number(b.dataset.dir)*track.clientWidth*.85,behavior:reduce.matches?'auto':'smooth'}); }
    else if (!b) { const c=e.target.closest('[data-home-product]'); if(c) pdOpen(Number(c.dataset.homeProduct)); }
  });
  root.addEventListener('keydown',e=>{ if (!e.target.closest('.hm-banner')) return; if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();show(active+(e.key==='ArrowRight'?1:-1));} });
  root.addEventListener('pointerover', e=>{if(e.target.closest('.hm-banner'))hover=true;});
  root.addEventListener('pointerout', e=>{if(e.target.closest('.hm-banner')&&!e.relatedTarget?.closest?.('.hm-banner'))hover=false;});
  root.addEventListener('focusin',e=>{focused=!!e.target.closest('.hm-banner');});
  root.addEventListener('focusout',e=>{focused=!!e.relatedTarget?.closest?.('.hm-banner');});
  root.addEventListener('touchstart',e=>{if(e.target.closest('.hm-banner'))touchX=e.touches[0].clientX;},{passive:true});
  root.addEventListener('touchend',e=>{if(touchX!==null){const d=e.changedTouches[0].clientX-touchX;if(Math.abs(d)>45)show(active+(d<0?1:-1));touchX=null;}},{passive:true});
  root.addEventListener('error',e=>{if(e.target.tagName==='IMG')e.target.style.visibility='hidden';},true);
  document.addEventListener('catchau:catalog',render);
  setInterval(()=>{if(!paused&&!hover&&!focused&&!document.hidden&&!reduce.matches&&slides.length)show(active+1);},6000);
  setInterval(clock,1000);
  render();
})();
