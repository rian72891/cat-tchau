const $=s=>document.querySelector(s), R=v=>v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const CATS=          {
  cpu:'Processadores',gpu:'Placas de vídeo',ram:'Memórias',ssd:'SSD',per:'Periféricos',mon:'Monitores'

};
const ART=          {
  cpu:'<rect x="30" y="30" width="60" height="60" rx="8"/><rect x="44" y="44" width="32" height="32" rx="4" fill="currentColor" opacity=".3"/><path d="M42 20v10M60 20v10M78 20v10M42 90v10M60 90v10M78 90v10M20 42h10M20 60h10M20 78h10M90 42h10M90 60h10M90 78h10"/>',

  gpu:'<rect x="8" y="34" width="104" height="46" rx="6"/><circle cx="40" cy="57" r="15"/><circle cx="80" cy="57" r="15"/><circle cx="40" cy="57" r="4" fill="currentColor"/><circle cx="80" cy="57" r="4" fill="currentColor"/><path d="M20 88h80"/>',

  ram:'<rect x="8" y="42" width="104" height="34" rx="4"/><rect x="18" y="50" width="16" height="18" fill="currentColor" opacity=".3"/><rect x="42" y="50" width="16" height="18" fill="currentColor" opacity=".3"/><rect x="66" y="50" width="16" height="18" fill="currentColor" opacity=".3"/><path d="M14 84h92" stroke-dasharray="3 3"/>',

  ssd:'<rect x="30" y="20" width="60" height="80" rx="8"/><rect x="40" y="32" width="40" height="24" rx="3" fill="currentColor" opacity=".3"/><path d="M44 74h32M44 84h20"/>',

  per:'<rect x="38" y="16" width="44" height="88" rx="22"/><path d="M60 16v36M38 52h44"/>',

  mon:'<rect x="12" y="22" width="96" height="60" rx="5"/><path d="M60 82v14M40 98h40"/>'

};
const art=c=>`<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ART[c]}</svg>`;
// [categoria, marca, nome, preço no cartão, preço antigo, nota, avaliações]

const P=[

['cpu','Intel','Core i9-14900K 6.0GHz 24 núcleos LGA1700',3999,4799,4.8,412,'https://www.gigantec.com.br/media/catalog/product/cache/66c3fa0fb26d248d0ca40a64a387c3da/p/r/processador-core-i9-1490-bx8071514900-intel-01_1.jpg'],

['cpu','Intel','Core i7-14700K 5.6GHz 20 núcleos LGA1700',2790,3290,4.7,308,'https://www.gigantec.com.br/media/catalog/product/cache/66c3fa0fb26d248d0ca40a64a387c3da/p/r/processador-intel-core-i7-14700k-14-geracao-33mb-cache-lga-1700-bx8071514700k-001_1.jpg'],

['cpu','Intel','Core i5-14600K 5.3GHz 14 núcleos LGA1700',1799,2199,4.7,521,'https://www.daithuanpc.vn/thumbs/700x700x1/upload/product/annotation-2024-11-08-111601-9991.png'],

['cpu','AMD','Ryzen 7 7800X3D 5.0GHz 8 núcleos AM5',2599,3099,4.9,940,'https://http2.mlstatic.com/D_NQ_NP_2X_633294-MLA99488407296_112025-F.webp'],

['cpu','AMD','Ryzen 9 7950X3D 5.7GHz 16 núcleos AM5',4690,5490,4.8,187,'https://m.media-amazon.com/images/I/51jNS8epPeL._AC_SX679_.jpg'],

['cpu','AMD','Ryzen 5 7600 5.1GHz 6 núcleos AM5',1199,1499,4.8,673,'https://http2.mlstatic.com/D_NQ_NP_2X_817906-MLB93081359848_092025-F-processador-amd-ryzen-5-7600-51ghz-6-nucleos-12-threads-am5.webp'],

['gpu','NVIDIA','GeForce RTX 4090 24GB GDDR6X',14990,17490,4.9,96, 'https://storage-asset.msi.com/global/picture/product/product_169338626785c2d1ccb8d85208db0e90a86afd8fd8.webp'],

['gpu','NVIDIA','GeForce RTX 4080 Super 16GB GDDR6X',7490,8790,4.8,141, 'https://images.kabum.com.br/produtos/fotos/542977/placa-de-video-rtx-4080-super-asus-nvidia-geforce-tuf-16g-gaming-16gb-gddr6x-dlss-ray-tracing-g-sync-90yv0ka1-m0na00_1718134871_gg.jpg'],

['gpu','NVIDIA','GeForce RTX 4070 Super 12GB GDDR6X',4590,5290,4.8,388,'https://http2.mlstatic.com/D_NQ_NP_2X_654789-CBT80757917924_112024-F.webp'],

['gpu','NVIDIA','GeForce RTX 4060 8GB GDDR6',1899,2299,4.6,802, 'https://images.kabum.com.br/produtos/fotos/sync_mirakl/476926/xlarge/Placa-De-V-deo-Msi-RTX-4060-Ventus-2x-Oc-Black-Nvidia-GeForce-8GB-GDDR6-912-V516-012_1783965215.jpg'],

['gpu','AMD','Radeon RX 7800 XT 16GB GDDR6',3690,4290,4.7,254, 'https://images.kabum.com.br/produtos/fotos/520501/placa-de-video-rx-7800-xt-asus-tuf-o16g-gaming-16gb-gddr6-argb-90yv0jj0-m0na00_1711461336_gg.jpg'],

['gpu','AMD','Radeon RX 7600 8GB GDDR6',1499,1799,4.5,336, 'https://http2.mlstatic.com/D_NQ_NP_2X_969431-MLA99929300109_112025-F-placa-de-video-asus-dual-radeon-rx-7600-oc-8gb-gddr6.webp'],

['ram','Corsair','Vengeance RGB 32GB (2x16GB) DDR5 6000MHz',1090,1399,4.8,455, 'https://images.kabum.com.br/produtos/fotos/988583/memoria-ram-corsair-vengeance-rgb-32gb-2x16gb-6000mhz-ddr5-cl38-intel-xmp-preto-cmh32gx5m2b6000c38-_1769173586_gg.jpg'],

['ram','Kingston','Fury Beast 16GB DDR5 5600MHz',479,629,4.7,712, 'https://images.kabum.com.br/produtos/fotos/285967/memoria-kingston-fury-beast-16gb-5600mhz-ddr5-cl40-preto-kf556c40bb-16_1639574788_gg.jpg'],

['ram','Corsair','Dominator Titanium 64GB DDR5 6600MHz',2990,3590,4.9,64, 'https://images.kabum.com.br/produtos/fotos/526404/memoria-corsair-dominator-titanium-64gb-2x32gb-6000mhz-ddr5-cl30-otimizado-intel-xmp-preto-cmp64gx5m2b6000c30_1711975063_gg.jpg'],

['ssd','Samsung','990 Pro 2TB NVMe PCIe 4.0',1390,1790,4.9,1020, 'https://images.kabum.com.br/produtos/fotos/sync_mirakl/442823/xlarge/SSD-Samsung-990-Pro-2TB-Nvme-M-2-2280-Leitura-at-7450mb-s-e-Grava-o-at-6900mb-s-_1790363617.jpg'],

['ssd','Kingston','NV2 1TB NVMe PCIe 4.0',369,489,4.6,1544, 'https://images.kabum.com.br/produtos/fotos/sync_mirakl/400812/xlarge/SSD-1TB-Kingston-Nv2-M-2-2280-PCIe-NVMe-Leitura-3500MB-s-Grava-o-2100MB-s-Snv2s-1000g_1790712840.jpg'],

['ssd','WD','Black SN850X 1TB NVMe PCIe 4.0',649,849,4.8,867, 'https://images.kabum.com.br/produtos/fotos/379756/ssd-wd-black-sn850x-gaming-storage-1tb-m-2-2280-pcie-gen4x4-nvme-leitura-7300-mb-s-e-gravacao-6300-mb-s-preto-wds100t2x0e_1666794636_gg.jpg'],

['per','Logitech','Mouse G Pro X Superlight 2 sem fio',799,999,4.9,530,'https://www.gigantec.com.br/media/catalog/product/cache/66c3fa0fb26d248d0ca40a64a387c3da/k/5/k552rgb-pro.jpg'],

['per','Razer','Teclado Huntsman V3 Pro TKL',1690,1990,4.7,143,'https://images.kabum.com.br/produtos/fotos/sync_mirakl/724815/xlarge/Teclado-Gamer-Razer-Huntsman-V3-Pro-Mini-Chroma-RGB-Switch-ptico-Anti-ghosting-Us-Rz0304980200_1740747641.jpg'],

['per','HyperX','Headset Cloud III sem fio',999,1249,4.7,398,'https://images.kabum.com.br/produtos/fotos/536014/headset-gamer-sem-fio-hyperx-cloud-iii-drive-53mm-wireless-multi-plataforma-preto-e-vermelho-77z46aa_1721388506_gg.jpg'],

['mon','LG','UltraGear 27" QHD 240Hz OLED',3990,4790,4.8,112, 'https://http2.mlstatic.com/D_NQ_NP_2X_678105-MLB104867425642_012026-F.webp'],

['mon','Samsung','Odyssey G5 27" QHD 165Hz',1590,1990,4.6,289,'https://http2.mlstatic.com/D_NQ_NP_2X_689364-MLB116305584575_082026-F-monitor-34--gamer-samsung-odyssey-g5-tela-curva-va-165hz-1ms.webp'],

['mon','AOC','Hero 24" Full HD 180Hz IPS',799,999,4.6,601,'https://http2.mlstatic.com/D_NQ_NP_2X_834036-CBT109950096126_042026-F.webp'],

["per", "Logitech", "Mouse G502 HERO RGB 25K DPI", 249, 349, 4.8, 2210, "https://images.kabum.com.br/produtos/fotos/98244/mouse-gamer-logitech-g502-hero-16k-rgb-lightsync-11-botoes-16000-dpi-910-005550_1626297206_gg.jpg"],
["per", "Razer", "Mouse DeathAdder V3 30K DPI ultraleve", 549, 699, 4.8, 318, "https://images.kabum.com.br/produtos/fotos/476953/mouse-gamer-razer-deathadder-v3-30000-dpi-ultra-leve-6-botoes-com-fio-8k-hz-preto-rz0104640100r3m_1785509873_gg.jpg"],
["per", "Redragon", "Mouse Cobra M711 RGB 12400 DPI", 99, 149, 4.6, 5120, "https://images.kabum.com.br/produtos/fotos/94555/mouse-gamer-redragon-cobra-chroma-rgb-10000dpi-7-botoes-preto-m711-v2_1742821619_gg.jpg"],
["per", "HyperX", "Mouse Pulsefire Haste 2 sem fio", 449, 599, 4.7, 264, "https://images.kabum.com.br/produtos/fotos/519395/mouse-gamer-hyperx-pulsefire-haste-2-rgb-3200dpi-6-botoes-wireless-preto-6n0b0aa_1711030049_gg.jpg"],
["per", "Logitech", "Mouse G305 Lightspeed sem fio", 199, 279, 4.8, 3890, "https://images.kabum.com.br/produtos/fotos/97092/mouse-gamer-sem-fio-logitech-g305-lightspeed-12000-dpi-6-botoes-preto-910-005281_1781726494_gg.jpg"],
["per", "Logitech", "Teclado G915 X Lightspeed sem fio", 1499, 1899, 4.8, 121, "https://images.kabum.com.br/produtos/fotos/652580/teclado-mecanico-gamer-sem-fio-logitech-g915-x-lightspeed-rgb-lightsync-usb-ou-bluetooth-switch-gl-brown-tactile-preto-920-012670_1731261713_gg.jpg"],
["per", "Redragon", "Teclado Kumara K552 RGB Switch Brown", 189, 259, 4.7, 6340, "https://images.kabum.com.br/produtos/fotos/93160/93160_1523969683_index_gg.jpg"],
["per", "HyperX", "Teclado Alloy Origins 65 Switch Red", 399, 549, 4.7, 412, "https://images.kabum.com.br/produtos/fotos/371598/teclado-hyperx-alloy-origins-65hkbo1t-rd-eua-n-4p5d6aa-aba_1659554472_gg.jpg"],
["per", "Corsair", "Teclado K70 PRO TKL Hall Effect", 1099, 1399, 4.8, 97, "https://images.kabum.com.br/produtos/fotos/722601/teclado-gamer-hall-effect-corsair-k70-pro-tkl-switches-magneticos-mgx-hyperdrive-usb-3-0-efeito-hall-preto-ch-911911g-na_1748528298_gg.jpg"],
["per", "Razer", "Teclado BlackWidow V3 TKL RGB", 649, 849, 4.6, 233, "https://images.kabum.com.br/produtos/fotos/735178/teclado-gamer-mecanico-razer-blackwidow-v3-tkl-switches-amarelo-rgb-rz03-03491800_1782762421_gg.jpg"],
["per", "Logitech", "Headset G733 sem fio 7.1 RGB", 749, 999, 4.7, 1180, "https://images.kabum.com.br/produtos/fotos/120487/headset-gamer-sem-fio-logitech-g733-rgb-lightsync-7-1-dolby-surround-com-blue-voice-preto-981-000863_1612874214_gg.jpg"],
["per", "Razer", "Headset BlackShark V2 X 7.1", 299, 399, 4.7, 2045, "https://images.kabum.com.br/produtos/fotos/128544/headset-gamer-razer-blackshark-v2-x-multi-platform-drivers-50mm-rz04-03240100-r3u1_1600956255_gg.jpg"],
["per", "Redragon", "Headset Zeus X RGB 7.1 USB", 249, 329, 4.6, 3172, "https://images.kabum.com.br/produtos/fotos/227818/headset-gamer-redragon-zeus-chroma-mk-ii-rgb-surround-7-1-usb-drivers-53mm-preto-vermelho-h510-rgb_1631555309_gg.jpg"],
["per", "Corsair", "Headset HS80 sem fio Dolby Atmos", 899, 1199, 4.6, 288, "https://images.kabum.com.br/produtos/fotos/216705/headset-gamer-sem-fio-corsair-hs80-premium-rgb-surround-dolby-atmos-wireless-drivers-50mm-preto-ca-9011235-na_1636559754_gg.jpg"],
["per", "Razer", "Mousepad Goliathus Chroma Extendido", 449, 599, 4.7, 356, "https://images.kabum.com.br/produtos/fotos/112968/mousepad-gamer-razer-goliathus-chroma-rgb-control-speed-extendido-920x294mm-mercury-branco-rz02-02500314_1785176099_gg.jpg"],
["per", "Logitech", "Mousepad G240 340x280mm", 79, 119, 4.8, 4410, "https://images.kabum.com.br/produtos/fotos/477540/mousepad-gamer-logitech-g-g240-pequeno-atrito-moderado-943-000783_1699886360_gg.jpg"],
["per", "Logitech", "Webcam C920s Full HD 1080p", 399, 549, 4.8, 2780, "https://images.kabum.com.br/produtos/fotos/103431/webcam-full-hd-logitech-c920s-com-microfone-embutido-protecao-de-privacidade-widescreen-1080p-compativel-logitech-capture-960-001257_1779373396_gg.jpg"],
["per", "HyperX", "Microfone QuadCast 2 USB", 799, 999, 4.8, 190, "https://images.kabum.com.br/produtos/fotos/638956/microfone-hyperx-quadcast-2-compativel-com-pc-mac-e-consoles-cardioide-led-vermelho-preto-872v1aa_1727358030_gg.jpg"],
["per", "Fifine", "Microfone Ampligame AM8 RGB USB-C", 299, 399, 4.7, 845, "https://images.kabum.com.br/produtos/fotos/592292/microfone-dinamico-gamer-fifine-ampligame-rgb-cardioide-usb-c-anti-ruido-para-streaming-preto-am8_1733503402_gg.jpg"],
["per", "ThunderX3", "Cadeira Gamer TGC12 reclinável", 899, 1299, 4.6, 1520, "https://images.kabum.com.br/produtos/fotos/92008/92008_5_1526389239_gg.jpg"],
["per", "Microsoft", "Controle Xbox Series sem fio", 399, 499, 4.9, 3650, "https://images.kabum.com.br/produtos/fotos/sync_mirakl/158630/xlarge/Controle-Sem-Fio-Xbox-Series-X-e-S-Microsoft-Carbon-Black-Bluetooth-Preto_1783965189.jpg"],
["per", "Sony", "Controle DualSense PS5", 449, 549, 4.9, 2930, "https://images.kabum.com.br/produtos/fotos/1032835/controle-sem-fio-sony-dualsense-playstation-5-bluetooth-midnight-black-cfi-zct2w_1780665845_gg.jpg"],
["per", "Redragon", "Caixa de som Anvil GS520 RGB", 149, 199, 4.6, 1270, "https://images.kabum.com.br/produtos/fotos/sync_mirakl/150886/xlarge/Caixa-de-Som-Gamer-Redragon-Anvil-RGB-Stereo-2-0-5W-USB-P2-LED-RGB-GS520_1777055325.jpg"],
["per", "SteelSeries", "Headset Arctis Nova Elite sem fio", 2999, 3599, 4.8, 42, "https://images.kabum.com.br/produtos/fotos/sync_mirakl/1052899/xlarge/Headset-Steelseries-Arctis-Nova-Elite-Hi-res-Wireless-96khz-Drivers-De-Fibra-De-Carbono-E-Anc-Ps5-xbox-PC-Obsidian_1782410018.webp"],

].map((a,i)=>({id:i,cat:a[0],brand:a[1],name:a[2],price:a[3],old:a[4],rate:a[5],n:a[6],img:a[7]||null,dc:1-a[3]/a[4]}));
const pix=p=>p.price*.85;
const CUPONS=          {
  ff10:.10,skrp10:.10,prumo10off:.10,prumo5off:.05

};
const S=          {
  cat:'all',q:'',sort:'rel',max:16000,brands:new Set(),fav:false

};
let cart=          {
}
,favs=new Set(),cupom=null;
try          {
  cart=JSON.parse(localStorage.getItem('pc-cart')||'{}');
  favs=new Set(JSON.parse(localStorage.getItem('pc-fav')||'[]'));
  cupom=JSON.parse(localStorage.getItem('pc-cupom')||'null');
  const t=localStorage.getItem('pc-theme');
  if(t)document.documentElement.setAttribute('data-theme',t);
} catch
(e)          {
}
const save=()=>          {
  try          {
    localStorage.setItem('pc-cart',JSON.stringify(cart));
    localStorage.setItem('pc-fav',JSON.stringify([...favs]));
    localStorage.setItem('pc-cupom',JSON.stringify(cupom))

  } catch
  (e)          {
  }
};
const stars=r=>'★'.repeat(Math.round(r))+'☆'.repeat(5-Math.round(r));
function tabs()          {
  $('#tabs').innerHTML=[['all','Todos'],...Object.entries(CATS)].map(([k,v])=>`<button data-cat="${k}" ${S.cat===k?'aria-current="true"':''}>${v}</button>`).join('')

}
function brands()          {
  const b=[...new Set(P.filter(p=>S.cat==='all'||p.cat===S.cat).map(p=>p.brand))].sort();
  $('#brands').innerHTML=b.map(x=>`<label><input type="checkbox" value="${x}" ${S.brands.has(x)?'checked':''}> ${x}</label>`).join('')

}
function list()          {
  const q=S.q.trim().toLowerCase();
  let l=P.filter(p=>(S.cat==='all'||p.cat===S.cat)&&p.price<=S.max&&(!S.brands.size||S.brands.has(p.brand))&&(!S.fav||favs.has(p.id))&&(!q||(p.name+' '+p.brand+' '+CATS[p.cat]).toLowerCase().includes(q)));
  const f=          {
    lo:(a,b)=>a.price-b.price,hi:(a,b)=>b.price-a.price,dc:(a,b)=>b.dc-a.dc,rt:(a,b)=>b.rate-a.rate||b.n-a.n

  }
  [S.sort];
  return f?l.sort(f):l;
}
function grid()          {
  const l=list();
  $('#ttl').textContent=S.cat==='all'?'Todos os produtos':CATS[S.cat];
  $('#res').textContent=l.length+(l.length===1?' produto':' produtos');
  $('#grid').innerHTML=l.length?l.map(p=>`<article class="card">
  <span class="off">-${Math.round(p.dc*100)}%</span>
  <button class="heart" data-fav="${p.id}" aria-pressed="${favs.has(p.id)}" aria-label="Favoritar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.700-8 11-8 11z"/></svg></button>
  <div class="pic" style="color:var(--brand)">${p.img?`<img src="${p.img}" alt="${p.name}" loading="lazy" style="width:100%;height:100%;object-fit:contain" onerror="this.parentElement.innerHTML='${art(p.cat).replace(/'/g,"\\'")}'">`:art(p.cat)}</div>
  <div class="brand">${p.brand}</div><h3>${p.name}</h3>
  <div class="stars" aria-label="Nota ${p.rate}">${stars(p.rate)} <small>(${p.n})</small></div>
  <div class="old">${R(p.old)}</div>
  <div class="pix">${R(pix(p))} <small>no PIX</small></div>
  <div class="inst">ou ${R(p.price)} em 12x de ${R(p.price/12)}</div>
  <button class="btn" data-add="${p.id}">Adicionar ao carrinho</button></article>`).join(''):'<div class="empty"><b>Nenhum produto encontrado.</b><br>Tente outra busca ou limpe os filtros.</div>';
}
function deal()          {
  const p=P[8];
  $('#deal').innerHTML=`<h2>Oferta do dia</h2><div class="timer" aria-label="Tempo restante"><b id="hh">00</b><b id="mm">00</b><b id="ss">00</b></div>
 <div class="pic">${art(p.cat)}</div><div class="brand">${p.brand}</div><div style="font-weight:600">${p.name}</div>
 <div class="old">${R(p.old)}</div><div class="pix">${R(pix(p))} <small>no PIX</small></div>
 <button class="btn" style="margin-top:12px" data-add="${p.id}">Aproveitar oferta</button>`;
}
function tick()          {
  const n=new Date(),e=new Date(n);
  e.setHours(24,0,0,0);
  let s=Math.floor((e-n)/1e3);
  const z=v=>String(v).padStart(2,'0');
  const h=$('#hh');
  if(!h)return;
  h.textContent=z(Math.floor(s/3600));
  $('#mm').textContent=z(Math.floor(s%3600/60));
  $('#ss').textContent=z(s%60)

}
function cartUI()          {
  const ids=Object.keys(cart),count=ids.reduce((a,k)=>a+cart[k],0),sub=ids.reduce((a,k)=>a+pix(P[k])*cart[k],0);
  const desc=cupom?sub*cupom.pct:0,tot=sub-desc;
  $('#cnt').textContent=count;
  $('#tot').textContent=R(tot);
  const left=500-tot;
  $('#ship').innerHTML=left>0?`Faltam <b>${R(left)}</b> para o frete grátis<i><b style="width:${tot/5}%"></b></i>`:`<b style="color:var(--ok)">Você ganhou frete grátis</b><i><b style="width:100%"></b></i>`;
  $('#items').innerHTML=ids.length?ids.map(k=>{const p=P[k];return `<div class="it"><div class="pic">${p.img?`<img src="${p.img}" alt="${p.name}" style="width:100%;height:100%;object-fit:contain" onerror="this.parentElement.innerHTML='${art(p.cat).replace(/'/g,"\\'")}'">`:art(p.cat)}</div><div style="flex:1"><p>${p.name}</p><b>${R(pix(p))}</b><br>
 <span class="qty"><button data-q="${k}" data-d="-1" aria-label="Diminuir">−</button><span>${cart[k]}</span><button data-q="${k}" data-d="1" aria-label="Aumentar">+</button></span><button class="rm" data-rm="${k}">Remover</button></div></div>`}).join(''):'<p style="color:var(--mute);padding:30px 0;text-align:center">Seu carrinho está vazio.<br>Adicione produtos para começar.</p>';
  $('#subrow').style.display=ids.length?'flex':'none';
  $('#sub').textContent=R(sub);
  $('#descrow').style.display=cupom?'flex':'none';
  if(cupom)$('#desc').textContent='- '+R(desc);
  $('#cupomMsg').textContent=cupom?`Cupom ${cupom.code.toUpperCase()} aplicado (${Math.round(cupom.pct*100)}% off)`:'';
  $('#cupomMsg').style.color='var(--ok)';
  save();
}
function aplicarCupom()          {
  const v=$('#cupomIn').value.trim().toLowerCase();
  if(!v)return;
  if(CUPONS[v])          {
    cupom=          {
      code:v,pct:CUPONS[v]

    };
    $('#cupomIn').value='';
    cartUI();
    toast('Cupom aplicado')

  }
  else          {
    $('#cupomMsg').textContent='Cupom inválido ou expirado';
    $('#cupomMsg').style.color='var(--brand)'

  }
}
let tt;
function toast(m)          {
  const t=$('#toast');
  t.textContent=m;
  t.classList.add('on');
  clearTimeout(tt);
  tt=setTimeout(()=>t.classList.remove('on'),2200)

}
function drawer(o)          {
  $('#drawer').classList.toggle('on',o);
  $('#ov').classList.toggle('on',o);
  $('#drawer').setAttribute('aria-hidden',!o);
  document.body.style.overflow=o?'hidden':''

}
function setCat(c)          {
  S.cat=c;
  S.brands.clear();
  tabs();
  brands();
  grid()

}
function reset()          {
  S.q='';
  S.max=16000;
  S.brands.clear();
  S.fav=false;
  $('#q').value='';
  $('#pr').value=16000;
  $('#pv').textContent=R(16000);
  $('#fav').checked=false;
  setCat('all')

}
document.addEventListener('click',e=>{

const t=e.target.closest('button');if(!t)return;

if(t.dataset.cat)setCat(t.dataset.cat);

else if(t.dataset.go){setCat(t.dataset.go);$('#shop').scrollIntoView({behavior:'smooth'})}

else if(t.dataset.add){const k=t.dataset.add;cart[k]=(cart[k]||0)+1;cartUI();toast('Adicionado ao carrinho')}

else if(t.dataset.fav){const k=+t.dataset.fav;favs.has(k)?favs.delete(k):favs.add(k);save();grid()}

else if(t.dataset.q){const k=t.dataset.q;cart[k]+=+t.dataset.d;if(cart[k]<1)delete cart[k];cartUI()}

else if(t.dataset.rm){delete cart[t.dataset.rm];cartUI()}

else if(t.id==='cartBtn')drawer(true);

else if(t.id==='cls')drawer(false);

else if(t.id==='home')reset();

else if(t.id==='clr')reset();

else if(t.id==='fb')$('#filters').classList.toggle('on');

else if(t.id==='chk'){if(!Object.keys(cart).length)toast('Adicione produtos antes de finalizar');else if(window.checkout)window.checkout(cart,cupom,()=>{cart={};cupom=null;cartUI();drawer(false)});else toast('Carregando, tente novamente')}

else if(t.id==='cupomBtn')aplicarCupom();

else if(t.id==='cupomRm'){cupom=null;cartUI()}

else if(t.id==='theme'){

const cur=document.documentElement.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');

const next=cur==='dark'?'light':'dark';

document.documentElement.setAttribute('data-theme',next);

try{localStorage.setItem('pc-theme',next)}catch(e){}

const label=next==='dark'?'Ativar modo claro':'Ativar modo escuro';

$('#theme').setAttribute('aria-pressed',next==='dark');

$('#theme').setAttribute('aria-label',label);

$('#theme').setAttribute('title',label);

}

});
$('#theme')?.setAttribute('aria-pressed',(localStorage.getItem('pc-theme')||'')==='dark');
$('#cupomIn')?.addEventListener('keydown',e=>{if(e.key==='Enter')aplicarCupom()});
$('#ov').onclick=()=>drawer(false);
$('#q').oninput=e=>          {
  S.q=e.target.value;
  grid()

};
$('#sort').onchange=e=>          {
  S.sort=e.target.value;
  grid()

};
$('#pr').oninput=e=>          {
  S.max=+e.target.value;
  $('#pv').textContent=R(S.max);
  grid()

};
$('#fav').onchange=e=>          {
  S.fav=e.target.checked;
  grid()

};
$('#brands').onchange=e=>          {
  e.target.checked?S.brands.add(e.target.value):S.brands.delete(e.target.value);
  grid()

};
addEventListener('keydown',e=>{

if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();$('#q').focus()}

if(e.key==='Escape')drawer(false);

});
$('#pv').textContent=R(16000);
tabs();
brands();
deal();
grid();
cartUI();
tick();
setInterval(tick,1000);
// Carrega o catálogo do banco de dados (mantém a lista acima como reserva)
window.loadCatalog=async(sb)=>{try{const {data,error}=await sb.from('products').select('id,category,brand,name,price,old_price,rating,reviews,image_url').order('id');if(error||!data||!data.length)return;P.length=0;data.forEach(r=>P[r.id]={id:r.id,cat:r.category,brand:r.brand,name:r.name,price:+r.price,old:+r.old_price,rate:+r.rating,n:r.reviews,img:r.image_url||null,dc:1-r.price/r.old_price});Object.keys(cart).forEach(k=>{if(!P[k])delete cart[k]});brands();deal();grid();cartUI()}catch(e){}};
