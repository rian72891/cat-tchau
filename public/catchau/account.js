// Contas, pedidos e catálogo via Lovable Cloud
(function(){
  const SB_URL='https://wakqjiyhpggpcrmggrui.supabase.co';
  const SB_KEY='sb_publishable_gxBZUUfYClrjt85uBJAlpQ_aiZQdoKx';
  if(!window.supabase||!window.supabase.createClient)return;
  const sb=window.supabase.createClient(SB_URL,SB_KEY);
  const box=$('#acct'),body=$('#acctBody');
  let user=null,mode='in',after=null,view='orders';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  window.loadCatalog&&window.loadCatalog(sb);

  function open(o){box.classList.toggle('on',o);box.setAttribute('aria-hidden',!o);if(o)render()}
  window.openCatchauAccount=(requested='orders')=>{view=requested;mode='in';after=null;open(true)};
  async function render(){
    if(!user){
      const up=mode==='up';
      body.innerHTML=`<h2>${up?'Criar conta':'Entrar'}</h2><p class="m">${up?'Cadastre-se para finalizar pedidos e acompanhar suas compras.':'Acesse sua conta para finalizar a compra.'}</p>
      <form id="acctForm">${up?'<label for="aN">Nome</label><input id="aN" required maxlength="80" autocomplete="name">':''}
      <label for="aE">E-mail</label><input id="aE" type="email" required autocomplete="email">
      <label for="aP">Senha</label><input id="aP" type="password" required minlength="6" autocomplete="${up?'new-password':'current-password'}">
      <div class="err" id="aErr"></div><button class="btn" type="submit">${up?'Criar conta':'Entrar'}</button></form>
      <button class="sw" id="acctSw">${up?'Já tenho conta':'Não tem conta? Cadastre-se'}</button>`;
      return;
    }
    const name=user.user_metadata&&user.user_metadata.full_name||user.email;
    body.innerHTML=`<h2>Olá, ${esc(name)}</h2><p class="m">${esc(user.email)}</p><h3 style="margin:0">${view==='tracking'?'Andamento dos pedidos':'Meus pedidos'}</h3>${view==='tracking'?'<p class="m">Status registrado na conta. Rastreamento de transportadora não disponível.</p>':''}<div id="ords"><p class="m">Carregando...</p></div><button class="btn g" id="acctOut">Sair</button>`;
    const {data,error}=await sb.from('orders').select('id,total,discount,status,created_at,order_items(product_name,quantity)').order('created_at',{ascending:false});
    const el=$('#ords');if(!el)return;
    if(error){el.innerHTML='<p class="m" role="alert">Não foi possível consultar seus pedidos.</p><button class="btn" id="ordersRetry">Tentar novamente</button>';return}
    el.innerHTML=data&&data.length?data.map(o=>`<div class="ord"><b><span>Pedido #${o.id.slice(0,8).toUpperCase()}</span><span>${R(+o.total)}</span></b><small>${new Date(o.created_at).toLocaleString('pt-BR')} · ${esc(o.status)}</small><div>${(o.order_items||[]).map(i=>`${i.quantity}x ${esc(i.product_name)}`).join('<br>')}</div><details><summary>Detalhes do pedido</summary><p>Identificação: ${esc(o.id)}</p><p>Status: ${esc(o.status)}</p><p>Desconto: ${R(+o.discount)}</p><p>Pagamento e transportadora não integrados.</p></details></div>`).join(''):'<p class="m">Você ainda não fez pedidos.</p>';
  }

  document.addEventListener('click',async e=>{
    const t=e.target.closest('button');
    if(e.target===box){open(false);return}
    if(!t)return;
    if(t.id==='acctBtn'){view='orders';mode='in';open(true)}
    else if(t.id==='ordersRetry')render();
    else if(t.id==='acctCls')open(false);
    else if(t.id==='acctSw'){mode=mode==='in'?'up':'in';render()}
    else if(t.id==='acctOut'){await sb.auth.signOut();open(false);toast('Você saiu da conta')}
  });
  document.addEventListener('submit',async e=>{
    if(e.target.id!=='acctForm')return;
    e.preventDefault();
    const em=$('#aE').value.trim(),pw=$('#aP').value,err=$('#aErr');err.textContent='';
    const b=e.target.querySelector('button');b.disabled=true;
    if(mode==='up'){
      const {data,error}=await sb.auth.signUp({email:em,password:pw,options:{data:{full_name:$('#aN').value.trim()},emailRedirectTo:location.origin+'/'}});
      b.disabled=false;
      if(error){err.textContent=error.message==='User already registered'?'Este e-mail já tem conta':'Não foi possível criar a conta';return}
      if(!data.session){body.innerHTML='<h2>Confirme seu e-mail</h2><p class="m">Enviamos um link de confirmação para '+esc(em)+'. Depois é só entrar.</p>';return}
    }else{
      const {error}=await sb.auth.signInWithPassword({email:em,password:pw});
      b.disabled=false;
      if(error){err.textContent=/confirm/i.test(error.message)?'Confirme seu e-mail antes de entrar':'E-mail ou senha incorretos';return}
    }
  });
  addEventListener('keydown',e=>{if(e.key==='Escape')open(false)});

  sb.auth.onAuthStateChange((ev,s)=>{
    user=s&&s.user||null;
    if(ev==='SIGNED_IN'&&box.classList.contains('on')){
      if(after){const f=after;after=null;open(false);f()}else render();
    }
  });
  sb.auth.getSession().then(({data})=>{user=data.session&&data.session.user||null});

  window.checkout=async(cart,cupom,done)=>{
    if(!user){after=()=>window.checkout(cart,cupom,done);mode='in';open(true);toast('Entre na sua conta para finalizar');return}
    const {data,error}=await sb.rpc('place_order',{_items:cart,_coupon:cupom?cupom.code:null});
    if(error){toast('Não foi possível finalizar o pedido');return}
    done();toast('Pedido #'+String(data).slice(0,8).toUpperCase()+' realizado!');
  };
})();
