CREATE TABLE public.products (
  id integer PRIMARY KEY,
  category text NOT NULL,
  brand text NOT NULL,
  name text NOT NULL,
  price numeric(10,2) NOT NULL,
  old_price numeric(10,2) NOT NULL,
  rating numeric(2,1) NOT NULL DEFAULT 5,
  reviews integer NOT NULL DEFAULT 0,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name) VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subtotal numeric(10,2) NOT NULL,
  discount numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL,
  coupon text,
  status text NOT NULL DEFAULT 'recebido',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id integer NOT NULL REFERENCES public.products(id),
  product_name text NOT NULL,
  quantity integer NOT NULL,
  unit_price numeric(10,2) NOT NULL
);
GRANT SELECT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.place_order(_items jsonb, _coupon text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _order uuid;
  _sub numeric := 0;
  _pct numeric := 0;
  _it record;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _items IS NULL OR jsonb_typeof(_items) <> 'object' OR _items = '{}'::jsonb THEN RAISE EXCEPTION 'Empty cart'; END IF;
  _pct := CASE lower(coalesce(_coupon,'')) WHEN 'ff10' THEN .10 WHEN 'skrp10' THEN .10 WHEN 'prumo10off' THEN .10 WHEN 'prumo5off' THEN .05 ELSE 0 END;
  INSERT INTO orders (user_id, subtotal, total, coupon) VALUES (_uid, 0, 0, CASE WHEN _pct > 0 THEN lower(_coupon) END) RETURNING id INTO _order;
  FOR _it IN SELECT p.id, p.name, round(p.price * .85, 2) AS unit, (e.value)::int AS qty
    FROM jsonb_each_text(_items) e JOIN products p ON p.id = e.key::int LOOP
    IF _it.qty < 1 OR _it.qty > 99 THEN RAISE EXCEPTION 'Invalid quantity'; END IF;
    INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES (_order, _it.id, _it.name, _it.qty, _it.unit);
    _sub := _sub + _it.unit * _it.qty;
  END LOOP;
  IF _sub = 0 THEN RAISE EXCEPTION 'Empty cart'; END IF;
  UPDATE orders SET subtotal = _sub, discount = round(_sub * _pct, 2), total = _sub - round(_sub * _pct, 2) WHERE id = _order;
  RETURN _order;
END $$;
REVOKE EXECUTE ON FUNCTION public.place_order(jsonb, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.place_order(jsonb, text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

INSERT INTO public.products (id, category, brand, name, price, old_price, rating, reviews, image_url) VALUES
(0,'cpu','Intel','Core i9-14900K 6.0GHz 24 núcleos LGA1700',3999,4799,4.8,412,'https://www.gigantec.com.br/media/catalog/product/cache/66c3fa0fb26d248d0ca40a64a387c3da/p/r/processador-core-i9-1490-bx8071514900-intel-01_1.jpg'),
(1,'cpu','Intel','Core i7-14700K 5.6GHz 20 núcleos LGA1700',2790,3290,4.7,308,'https://www.gigantec.com.br/media/catalog/product/cache/66c3fa0fb26d248d0ca40a64a387c3da/p/r/processador-intel-core-i7-14700k-14-geracao-33mb-cache-lga-1700-bx8071514700k-001_1.jpg'),
(2,'cpu','Intel','Core i5-14600K 5.3GHz 14 núcleos LGA1700',1799,2199,4.7,521,'https://www.daithuanpc.vn/thumbs/700x700x1/upload/product/annotation-2024-11-08-111601-9991.png'),
(3,'cpu','AMD','Ryzen 7 7800X3D 5.0GHz 8 núcleos AM5',2599,3099,4.9,940,'https://http2.mlstatic.com/D_NQ_NP_2X_633294-MLA99488407296_112025-F.webp'),
(4,'cpu','AMD','Ryzen 9 7950X3D 5.7GHz 16 núcleos AM5',4690,5490,4.8,187,'https://m.media-amazon.com/images/I/51jNS8epPeL._AC_SX679_.jpg'),
(5,'cpu','AMD','Ryzen 5 7600 5.1GHz 6 núcleos AM5',1199,1499,4.8,673,'https://http2.mlstatic.com/D_NQ_NP_2X_817906-MLB93081359848_092025-F-processador-amd-ryzen-5-7600-51ghz-6-nucleos-12-threads-am5.webp'),
(6,'gpu','NVIDIA','GeForce RTX 4090 24GB GDDR6X',14990,17490,4.9,96,'https://storage-asset.msi.com/global/picture/product/product_169338626785c2d1ccb8d85208db0e90a86afd8fd8.webp'),
(7,'gpu','NVIDIA','GeForce RTX 4080 Super 16GB GDDR6X',7490,8790,4.8,141,'https://images.kabum.com.br/produtos/fotos/542977/placa-de-video-rtx-4080-super-asus-nvidia-geforce-tuf-16g-gaming-16gb-gddr6x-dlss-ray-tracing-g-sync-90yv0ka1-m0na00_1718134871_gg.jpg'),
(8,'gpu','NVIDIA','GeForce RTX 4070 Super 12GB GDDR6X',4590,5290,4.8,388,'https://http2.mlstatic.com/D_NQ_NP_2X_654789-CBT80757917924_112024-F.webp'),
(9,'gpu','NVIDIA','GeForce RTX 4060 8GB GDDR6',1899,2299,4.6,802,'https://images.kabum.com.br/produtos/fotos/sync_mirakl/476926/xlarge/Placa-De-V-deo-Msi-RTX-4060-Ventus-2x-Oc-Black-Nvidia-GeForce-8GB-GDDR6-912-V516-012_1783965215.jpg'),
(10,'gpu','AMD','Radeon RX 7800 XT 16GB GDDR6',3690,4290,4.7,254,'https://images.kabum.com.br/produtos/fotos/520501/placa-de-video-rx-7800-xt-asus-tuf-o16g-gaming-16gb-gddr6-argb-90yv0jj0-m0na00_1711461336_gg.jpg'),
(11,'gpu','AMD','Radeon RX 7600 8GB GDDR6',1499,1799,4.5,336,'https://http2.mlstatic.com/D_NQ_NP_2X_969431-MLA99929300109_112025-F-placa-de-video-asus-dual-radeon-rx-7600-oc-8gb-gddr6.webp'),
(12,'ram','Corsair','Vengeance RGB 32GB (2x16GB) DDR5 6000MHz',1090,1399,4.8,455,'https://images.kabum.com.br/produtos/fotos/988583/memoria-ram-corsair-vengeance-rgb-32gb-2x16gb-6000mhz-ddr5-cl38-intel-xmp-preto-cmh32gx5m2b6000c38-_1769173586_gg.jpg'),
(13,'ram','Kingston','Fury Beast 16GB DDR5 5600MHz',479,629,4.7,712,'https://images.kabum.com.br/produtos/fotos/285967/memoria-kingston-fury-beast-16gb-5600mhz-ddr5-cl40-preto-kf556c40bb-16_1639574788_gg.jpg'),
(14,'ram','Corsair','Dominator Titanium 64GB DDR5 6600MHz',2990,3590,4.9,64,'https://images.kabum.com.br/produtos/fotos/526404/memoria-corsair-dominator-titanium-64gb-2x32gb-6000mhz-ddr5-cl30-otimizado-intel-xmp-preto-cmp64gx5m2b6000c30_1711975063_gg.jpg'),
(15,'ssd','Samsung','990 Pro 2TB NVMe PCIe 4.0',1390,1790,4.9,1020,'https://images.kabum.com.br/produtos/fotos/sync_mirakl/442823/xlarge/SSD-Samsung-990-Pro-2TB-Nvme-M-2-2280-Leitura-at-7450mb-s-e-Grava-o-at-6900mb-s-_1790363617.jpg'),
(16,'ssd','Kingston','NV2 1TB NVMe PCIe 4.0',369,489,4.6,1544,'https://images.kabum.com.br/produtos/fotos/sync_mirakl/400812/xlarge/SSD-1TB-Kingston-Nv2-M-2-2280-PCIe-NVMe-Leitura-3500MB-s-Grava-o-2100MB-s-Snv2s-1000g_1790712840.jpg'),
(17,'ssd','WD','Black SN850X 1TB NVMe PCIe 4.0',649,849,4.8,867,'https://images.kabum.com.br/produtos/fotos/379756/ssd-wd-black-sn850x-gaming-storage-1tb-m-2-2280-pcie-gen4x4-nvme-leitura-7300-mb-s-e-gravacao-6300-mb-s-preto-wds100t2x0e_1666794636_gg.jpg'),
(18,'per','Logitech','Mouse G Pro X Superlight 2 sem fio',799,999,4.9,530,'https://www.gigantec.com.br/media/catalog/product/cache/66c3fa0fb26d248d0ca40a64a387c3da/k/5/k552rgb-pro.jpg'),
(19,'per','Razer','Teclado Huntsman V3 Pro TKL',1690,1990,4.7,143,'https://images.kabum.com.br/produtos/fotos/sync_mirakl/724815/xlarge/Teclado-Gamer-Razer-Huntsman-V3-Pro-Mini-Chroma-RGB-Switch-ptico-Anti-ghosting-Us-Rz0304980200_1740747641.jpg'),
(20,'per','HyperX','Headset Cloud III sem fio',999,1249,4.7,398,'https://images.kabum.com.br/produtos/fotos/536014/headset-gamer-sem-fio-hyperx-cloud-iii-drive-53mm-wireless-multi-plataforma-preto-e-vermelho-77z46aa_1721388506_gg.jpg'),
(21,'mon','LG','UltraGear 27" QHD 240Hz OLED',3990,4790,4.8,112,'https://http2.mlstatic.com/D_NQ_NP_2X_678105-MLB104867425642_012026-F.webp'),
(22,'mon','Samsung','Odyssey G5 27" QHD 165Hz',1590,1990,4.6,289,'https://http2.mlstatic.com/D_NQ_NP_2X_689364-MLB116305584575_082026-F-monitor-34--gamer-samsung-odyssey-g5-tela-curva-va-165hz-1ms.webp'),
(23,'mon','AOC','Hero 24" Full HD 180Hz IPS',799,999,4.6,601,'https://http2.mlstatic.com/D_NQ_NP_2X_834036-CBT109950096126_042026-F.webp'),
(24,'per','Logitech','Mouse G502 HERO RGB 25K DPI',249,349,4.8,2210,'https://images.kabum.com.br/produtos/fotos/98244/mouse-gamer-logitech-g502-hero-16k-rgb-lightsync-11-botoes-16000-dpi-910-005550_1626297206_gg.jpg'),
(25,'per','Razer','Mouse DeathAdder V3 30K DPI ultraleve',549,699,4.8,318,'https://images.kabum.com.br/produtos/fotos/476953/mouse-gamer-razer-deathadder-v3-30000-dpi-ultra-leve-6-botoes-com-fio-8k-hz-preto-rz0104640100r3m_1785509873_gg.jpg'),
(26,'per','Redragon','Mouse Cobra M711 RGB 12400 DPI',99,149,4.6,5120,'https://images.kabum.com.br/produtos/fotos/94555/mouse-gamer-redragon-cobra-chroma-rgb-10000dpi-7-botoes-preto-m711-v2_1742821619_gg.jpg'),
(27,'per','HyperX','Mouse Pulsefire Haste 2 sem fio',449,599,4.7,264,'https://images.kabum.com.br/produtos/fotos/519395/mouse-gamer-hyperx-pulsefire-haste-2-rgb-3200dpi-6-botoes-wireless-preto-6n0b0aa_1711030049_gg.jpg'),
(28,'per','Logitech','Mouse G305 Lightspeed sem fio',199,279,4.8,3890,'https://images.kabum.com.br/produtos/fotos/97092/mouse-gamer-sem-fio-logitech-g305-lightspeed-12000-dpi-6-botoes-preto-910-005281_1781726494_gg.jpg'),
(29,'per','Logitech','Teclado G915 X Lightspeed sem fio',1499,1899,4.8,121,'https://images.kabum.com.br/produtos/fotos/652580/teclado-mecanico-gamer-sem-fio-logitech-g915-x-lightspeed-rgb-lightsync-usb-ou-bluetooth-switch-gl-brown-tactile-preto-920-012670_1731261713_gg.jpg'),
(30,'per','Redragon','Teclado Kumara K552 RGB Switch Brown',189,259,4.7,6340,'https://images.kabum.com.br/produtos/fotos/93160/93160_1523969683_index_gg.jpg'),
(31,'per','HyperX','Teclado Alloy Origins 65 Switch Red',399,549,4.7,412,'https://images.kabum.com.br/produtos/fotos/371598/teclado-hyperx-alloy-origins-65hkbo1t-rd-eua-n-4p5d6aa-aba_1659554472_gg.jpg'),
(32,'per','Corsair','Teclado K70 PRO TKL Hall Effect',1099,1399,4.8,97,'https://images.kabum.com.br/produtos/fotos/722601/teclado-gamer-hall-effect-corsair-k70-pro-tkl-switches-magneticos-mgx-hyperdrive-usb-3-0-efeito-hall-preto-ch-911911g-na_1748528298_gg.jpg'),
(33,'per','Razer','Teclado BlackWidow V3 TKL RGB',649,849,4.6,233,'https://images.kabum.com.br/produtos/fotos/735178/teclado-gamer-mecanico-razer-blackwidow-v3-tkl-switches-amarelo-rgb-rz03-03491800_1782762421_gg.jpg'),
(34,'per','Logitech','Headset G733 sem fio 7.1 RGB',749,999,4.7,1180,'https://images.kabum.com.br/produtos/fotos/120487/headset-gamer-sem-fio-logitech-g733-rgb-lightsync-7-1-dolby-surround-com-blue-voice-preto-981-000863_1612874214_gg.jpg'),
(35,'per','Razer','Headset BlackShark V2 X 7.1',299,399,4.7,2045,'https://images.kabum.com.br/produtos/fotos/128544/headset-gamer-razer-blackshark-v2-x-multi-platform-drivers-50mm-rz04-03240100-r3u1_1600956255_gg.jpg'),
(36,'per','Redragon','Headset Zeus X RGB 7.1 USB',249,329,4.6,3172,'https://images.kabum.com.br/produtos/fotos/227818/headset-gamer-redragon-zeus-chroma-mk-ii-rgb-surround-7-1-usb-drivers-53mm-preto-vermelho-h510-rgb_1631555309_gg.jpg'),
(37,'per','Corsair','Headset HS80 sem fio Dolby Atmos',899,1199,4.6,288,'https://images.kabum.com.br/produtos/fotos/216705/headset-gamer-sem-fio-corsair-hs80-premium-rgb-surround-dolby-atmos-wireless-drivers-50mm-preto-ca-9011235-na_1636559754_gg.jpg'),
(38,'per','Razer','Mousepad Goliathus Chroma Extendido',449,599,4.7,356,'https://images.kabum.com.br/produtos/fotos/112968/mousepad-gamer-razer-goliathus-chroma-rgb-control-speed-extendido-920x294mm-mercury-branco-rz02-02500314_1785176099_gg.jpg'),
(39,'per','Logitech','Mousepad G240 340x280mm',79,119,4.8,4410,'https://images.kabum.com.br/produtos/fotos/477540/mousepad-gamer-logitech-g-g240-pequeno-atrito-moderado-943-000783_1699886360_gg.jpg'),
(40,'per','Logitech','Webcam C920s Full HD 1080p',399,549,4.8,2780,'https://images.kabum.com.br/produtos/fotos/103431/webcam-full-hd-logitech-c920s-com-microfone-embutido-protecao-de-privacidade-widescreen-1080p-compativel-logitech-capture-960-001257_1779373396_gg.jpg'),
(41,'per','HyperX','Microfone QuadCast 2 USB',799,999,4.8,190,'https://images.kabum.com.br/produtos/fotos/638956/microfone-hyperx-quadcast-2-compativel-com-pc-mac-e-consoles-cardioide-led-vermelho-preto-872v1aa_1727358030_gg.jpg'),
(42,'per','Fifine','Microfone Ampligame AM8 RGB USB-C',299,399,4.7,845,'https://images.kabum.com.br/produtos/fotos/592292/microfone-dinamico-gamer-fifine-ampligame-rgb-cardioide-usb-c-anti-ruido-para-streaming-preto-am8_1733503402_gg.jpg'),
(43,'per','ThunderX3','Cadeira Gamer TGC12 reclinável',899,1299,4.6,1520,'https://images.kabum.com.br/produtos/fotos/92008/92008_5_1526389239_gg.jpg'),
(44,'per','Microsoft','Controle Xbox Series sem fio',399,499,4.9,3650,'https://images.kabum.com.br/produtos/fotos/sync_mirakl/158630/xlarge/Controle-Sem-Fio-Xbox-Series-X-e-S-Microsoft-Carbon-Black-Bluetooth-Preto_1783965189.jpg'),
(45,'per','Sony','Controle DualSense PS5',449,549,4.9,2930,'https://images.kabum.com.br/produtos/fotos/1032835/controle-sem-fio-sony-dualsense-playstation-5-bluetooth-midnight-black-cfi-zct2w_1780665845_gg.jpg'),
(46,'per','Redragon','Caixa de som Anvil GS520 RGB',149,199,4.6,1270,'https://images.kabum.com.br/produtos/fotos/sync_mirakl/150886/xlarge/Caixa-de-Som-Gamer-Redragon-Anvil-RGB-Stereo-2-0-5W-USB-P2-LED-RGB-GS520_1777055325.jpg'),
(47,'per','SteelSeries','Headset Arctis Nova Elite sem fio',2999,3599,4.8,42,'https://images.kabum.com.br/produtos/fotos/sync_mirakl/1052899/xlarge/Headset-Steelseries-Arctis-Nova-Elite-Hi-res-Wireless-96khz-Drivers-De-Fibra-De-Carbono-E-Anc-Ps5-xbox-PC-Obsidian_1782410018.webp');