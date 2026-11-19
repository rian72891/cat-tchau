/* Finalizar compra em etapas. Totais aqui são só exibição; o banco calcula o valor real. */
(function(){
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const UFS='AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ');
  const STEPS=['Endereço','Entrega','Pagamento','Revisão'];
  const PAY={pix:'PIX',cartao:'Cartão de crédito',boleto:'Boleto'};
  let st,done,box;
  function load(){try{return JSON.parse(localStorage.getItem('catchau-address')||'{}')||{}}catch(_){return{}}}
  function calc(){
    const f=st.pay==='pix'?.85:1;
    const sub=Object.keys(cart).reduce((a,k)=>P[k]?a+Math.round(P[k].price*f*100)/100*cart[k]:a,0);
    const disc=cupom?Math.round(sub*cupom.pct*100)/100:0;
    const ship=st.ship==='expresso'?49.9:(sub-disc>=500?0:29.9);
    return{sub,disc,ship,tot:sub-disc+ship,econ:sub-disc>=500?0:29.9};
  }
  function summary(){
    const c=calc();
    return `<aside class="co-sum"><button class="co-sumtog" type="button" data-co="sum" aria-expanded="${st.sumOpen}">Resumo do pedido <b>${R(c.tot)}</b></button><div class="co-sumbody ${st.sumOpen?'on':''}">
    ${Object.keys(cart).filter(k=>P[k]).map(k=>{const p=P[k];return `<div class="co-it"><img src="${esc(p.img||'')}" alt="" loading="lazy"><span>${cart[k]}x ${esc(p.name)}</span></div>`}).join('')}
    <dl><dt>Subtotal (${PAY[st.pay]})</dt><dd>${R(c.sub)}</dd>${c.disc?`<dt>Cupom ${esc(cupom.code.toUpperCase())}</dt><dd>- ${R(c.disc)}</dd>`:''}<dt>Frete</dt><dd>${c.ship?R(c.ship):'Grátis'}</dd><dt class="t">Total</dt><dd class="t">${R(c.tot)}</dd></dl>
    ${st.pay==='cartao'?`<p class="co-m">${st.inst}x de ${R(c.tot/st.inst)} sem juros</p>`:''}<p class="co-m">O valor final é confirmado pela loja ao registrar o pedido.</p></div></aside>`;
  }
  function stepAddr(){const a=st.addr;const f=(id,l,v,x='')=>`<label>${l}<input id="co-${id}" value="${esc(v||'')}" ${x}><small class="co-e" data-e="${id}"></small></label>`;
    return `<h2>Endereço de entrega</h2><div class="co-f">${f('nome','Nome completo',a.nome,'maxlength="100" autocomplete="name"')}
    ${f('cep','CEP',a.cep&&a.cep.replace(/^(\d{5})(\d{3})$/,'$1-$2'),'inputmode="numeric" maxlength="9" placeholder="00000-000" autocomplete="postal-code"')}<p class="co-m" id="co-cepmsg"></p>
    ${f('rua','Rua',a.rua,'maxlength="150"')}<div class="co-2">${f('numero','Número',a.numero,'maxlength="20"')}${f('complemento','Complemento (opcional)',a.complemento,'maxlength="100"')}</div>
    ${f('bairro','Bairro',a.bairro,'maxlength="100"')}<div class="co-2">${f('cidade','Cidade',a.cidade,'maxlength="100"')}<label>UF<select id="co-uf"><option value="">--</option>${UFS.map(u=>`<option ${a.uf===u?'selected':''}>${u}</option>`).join('')}</select><small class="co-e" data-e="uf"></small></label></div></div>`}
  function stepShip(){const c=calc();const o=(v,t,d,p)=>`<label class="co-opt ${st.ship===v?'on':''}"><input type="radio" name="co-ship" value="${v}" ${st.ship===v?'checked':''}><span><b>${t}</b><small>${d}</small></span><b>${p}</b></label>`;
    return `<h2>Forma de entrega</h2>${o('economico','Econômico','Prazo estimado: 5 a 9 dias úteis',c.econ?R(c.econ):'Grátis')}${o('expresso','Expresso','Prazo estimado: 2 a 4 dias úteis',R(49.9))}<p class="co-m">Frete econômico grátis a partir de R$ 500 (após cupom).</p>`}
  function stepPay(){const o=(v,t,d)=>`<label class="co-opt ${st.pay===v?'on':''}"><input type="radio" name="co-pay" value="${v}" ${st.pay===v?'checked':''}><span><b>${t}</b><small>${d}</small></span></label>`;
    const card=Object.keys(cart).reduce((a,k)=>P[k]?a+P[k].price*cart[k]:a,0);
    return `<h2>Pagamento</h2><div class="co-warn">Demonstração: nenhum valor será cobrado; o pagamento não está integrado.</div>
    ${o('pix','PIX — 15% de desconto',`Você economiza ${R(card*.15)} em relação ao cartão`)}${o('cartao','Cartão de crédito','Até 12x sem juros. Nenhum dado de cartão é solicitado.')}
    ${st.pay==='cartao'?`<label class="co-inst">Parcelas<select id="co-inst">${Array.from({length:12},(_,i)=>i+1).map(n=>{st.pay='cartao';const t=calc().tot;return `<option value="${n}" ${st.inst===n?'selected':''}>${n}x de ${R(t/n)} sem juros</option>`}).join('')}</select></label>`:''}
    ${o('boleto','Boleto bancário','Vencimento em 3 dias úteis')}`}
  function stepRev(){const a=st.addr,c=calc();
    return `<h2>Revise seu pedido</h2><section class="co-rv"><h3>Endereço <button type="button" data-go="0">Editar</button></h3><p>${esc(a.nome)}<br>${esc(a.rua)}, ${esc(a.numero)}${a.complemento?' - '+esc(a.complemento):''}<br>${esc(a.bairro)} · ${esc(a.cidade)}/${esc(a.uf)} · CEP ${esc(a.cep.replace(/^(\d{5})/,'$1-'))}</p></section>
    <section class="co-rv"><h3>Entrega <button type="button" data-go="1">Editar</button></h3><p>${st.ship==='expresso'?'Expresso (2 a 4 dias úteis)':'Econômico (5 a 9 dias úteis)'} · ${c.ship?R(c.ship):'Grátis'}</p></section>
    <section class="co-rv"><h3>Pagamento <button type="button" data-go="2">Editar</button></h3><p>${PAY[st.pay]}${st.pay==='cartao'?` em ${st.inst}x sem juros`:''}</p></section>
    <label class="co-terms"><input type="checkbox" id="co-terms" ${st.terms?'checked':''}> Li e aceito os <a href="/informacoes/termos-e-condicoes" target="_top">Termos e condições</a></label><p class="co-e" id="co-err" role="alert"></p>`}
  function render(){
    if(st.result)return renderDone();
    const body=[stepAddr,stepShip,stepPay,stepRev][st.step]();
    box.innerHTML=`<div class="co-panel" role="dialog" aria-modal="true" aria-label="Finalizar compra"><header class="co-h"><b>Finalizar compra</b><ol class="co-steps">${STEPS.map((s,i)=>`<li class="${i===st.step?'on':i<st.step?'ok':''}"><i>${i+1}</i>${s}</li>`).join('')}</ol><button class="co-x" type="button" data-co="close" aria-label="Fechar">✕</button></header>
    <div class="co-g"><form class="co-main" id="co-form" novalidate>${body}<div class="co-nav">${st.step?'<button type="button" class="btn g co-back" data-co="back">Voltar</button>':'<span></span>'}<button class="btn" type="submit" ${st.busy?'disabled':''}>${st.step<3?'Continuar':st.busy?'Registrando...':'Confirmar pedido'}</button></div></form>${summary()}</div></div>`;
    const first=box.querySelector('.co-main input,.co-main select');if(first&&st.focus){first.focus();st.focus=false}
  }
  function renderDone(){const r=st.result;
    box.innerHTML=`<div class="co-panel" role="dialog" aria-modal="true" aria-label="Pedido registrado"><header class="co-h"><b>Pedido registrado</b><button class="co-x" type="button" data-co="close" aria-label="Fechar">✕</button></header><div class="co-done">
    <div class="co-ok">✓</div><h2>Pedido #${esc(r.id.slice(0,8).toUpperCase())}</h2><p>Status: <b>${esc(r.status||'Aguardando pagamento')}</b></p>
    <p>Total: <b>${R(+r.total)}</b> · ${PAY[r.payment_method]||''}${r.payment_method==='cartao'?` em ${r.installments}x`:''} · ${r.shipping_method==='expresso'?'Expresso':'Econômico'}</p>
    <div class="co-warn">O pagamento não está integrado, então nada será cobrado.</div>
    <div class="co-nav"><button class="btn g co-back" type="button" data-co="orders">Ver meus pedidos</button><button class="btn" type="button" data-co="close">Continuar comprando</button></div></div></div>`}
  function readAddr(){const v=id=>(box.querySelector('#co-'+id)?.value||'').trim();
    st.addr={nome:v('nome'),cep:v('cep').replace(/\D/g,''),rua:v('rua'),numero:v('numero'),complemento:v('complemento'),bairro:v('bairro'),cidade:v('cidade'),uf:v('uf')}}
  function validAddr(){const a=st.addr,e={};
    if(a.nome.length<2)e.nome='Informe seu nome completo';if(!/^\d{8}$/.test(a.cep))e.cep='CEP deve ter 8 dígitos';
    if(a.rua.length<2)e.rua='Informe a rua';if(!a.numero)e.numero='Informe o número';if(a.bairro.length<2)e.bairro='Informe o bairro';
    if(a.cidade.length<2)e.cidade='Informe a cidade';if(!a.uf)e.uf='Escolha o estado';
    box.querySelectorAll('.co-e[data-e]').forEach(el=>el.textContent=e[el.dataset.e]||'');
    const k=Object.keys(e)[0];if(k)box.querySelector('#co-'+k)?.focus();return !k}
  async function cep(v){const m=box.querySelector('#co-cepmsg');if(!m)return;m.textContent='Buscando endereço...';
    try{const r=await fetch(`https://viacep.com.br/ws/${v}/json/`);const d=await r.json();if(d.erro)throw 0;
      const set=(id,x)=>{const el=box.querySelector('#co-'+id);if(el&&x)el.value=x};set('rua',d.logradouro);set('bairro',d.bairro);set('cidade',d.localidade);set('uf',d.uf);
      m.textContent='Endereço encontrado. Confira e informe o número.';box.querySelector('#co-numero')?.focus()}
    catch(_){m.textContent='Não encontramos esse CEP. Preencha o endereço manualmente.'}}
  async function submit(){
    if(!st.terms){box.querySelector('#co-err').textContent='Aceite os Termos e condições para continuar';return}
    const sb=CatchauAccount.sb;st.busy=true;render();
    const {data:id,error}=await sb.rpc('place_order_checkout',{_items:cart,_coupon:cupom?cupom.code:null,_payment:st.pay,_installments:st.pay==='cartao'?st.inst:1,_shipping:st.ship,_address:st.addr});
    st.busy=false;
    if(error){render();box.querySelector('#co-err').textContent='Não foi possível registrar o pedido. Seus dados foram mantidos; tente novamente.';return}
    const {data:row}=await sb.from('orders').select('id,total,status,payment_method,installments,shipping_method').eq('id',id).single();
    st.result=row||{id:String(id),total:calc().tot,payment_method:st.pay,installments:st.inst,shipping_method:st.ship};
    const d=done;done=null;d&&d();render()}
  function close(){box.classList.remove('on');document.body.style.overflow='';box.innerHTML=''}
  function openCheckout(d){
    if(!Object.keys(cart).length){toast('Adicione produtos antes de finalizar');return}
    const u=CatchauAccount.getUser(),a=load();
    if(!a.nome&&u&&u.user_metadata)a.nome=u.user_metadata.full_name||'';
    st={step:0,addr:a,ship:'economico',pay:'pix',inst:1,terms:false,busy:false,sumOpen:false,result:null,focus:true};done=d;
    drawer(false);box.classList.add('on');document.body.style.overflow='hidden';render()}
  box=document.createElement('div');box.className='co';document.body.appendChild(box);
  box.addEventListener('submit',e=>{e.preventDefault();
    if(st.step===0){readAddr();if(!validAddr())return;try{localStorage.setItem('catchau-address',JSON.stringify(st.addr))}catch(_){}}
    if(st.step===3)return submit();st.step++;st.focus=true;render();box.scrollTop=0});
  box.addEventListener('click',e=>{const b=e.target.closest('[data-co],[data-go]');if(e.target===box)return close();if(!b)return;
    if(b.dataset.go){if(st.step===0)readAddr();st.step=+b.dataset.go;render();return}
    const a=b.dataset.co;if(st.step===0&&!st.result)readAddr();
    if(a==='close')close();else if(a==='back'){st.step--;render()}else if(a==='sum'){st.sumOpen=!st.sumOpen;render()}
    else if(a==='orders'){close();window.openCatchauAccount&&openCatchauAccount('orders')}});
  box.addEventListener('change',e=>{const t=e.target;
    if(t.name==='co-ship'){st.ship=t.value;render()}else if(t.name==='co-pay'){st.pay=t.value;if(st.pay!=='cartao')st.inst=1;render()}
    else if(t.id==='co-inst'){st.inst=+t.value;render()}else if(t.id==='co-terms')st.terms=t.checked});
  box.addEventListener('input',e=>{if(e.target.id!=='co-cep')return;let v=e.target.value.replace(/\D/g,'').slice(0,8);e.target.value=v.length>5?v.slice(0,5)+'-'+v.slice(5):v;if(v.length===8)cep(v)});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&box.classList.contains('on')&&!document.querySelector('#acct.on'))close()});
  window.checkout=(c,cp,d)=>{if(!window.CatchauAccount){toast('Carregando, tente novamente');return}CatchauAccount.requireLogin(()=>openCheckout(d))};
})();
