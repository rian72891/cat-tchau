ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS installments integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS shipping_method text,
  ADD COLUMN IF NOT EXISTS shipping_cost numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping_address jsonb;

CREATE OR REPLACE FUNCTION public.place_order_checkout(
  _items jsonb, _coupon text, _payment text, _installments integer, _shipping text, _address jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _uid uuid := auth.uid();
  _order uuid;
  _sub numeric := 0;
  _pct numeric := 0;
  _factor numeric;
  _disc numeric;
  _ship numeric;
  _inst int := coalesce(_installments, 1);
  _it record;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _items IS NULL OR jsonb_typeof(_items) <> 'object' OR _items = '{}'::jsonb THEN RAISE EXCEPTION 'Empty cart'; END IF;
  IF _payment NOT IN ('pix','cartao','boleto') THEN RAISE EXCEPTION 'Invalid payment'; END IF;
  IF _shipping NOT IN ('economico','expresso') THEN RAISE EXCEPTION 'Invalid shipping'; END IF;
  IF _payment <> 'cartao' THEN _inst := 1; END IF;
  IF _inst < 1 OR _inst > 12 THEN RAISE EXCEPTION 'Invalid installments'; END IF;
  IF _address IS NULL OR jsonb_typeof(_address) <> 'object'
     OR coalesce(_address->>'cep','') !~ '^\d{8}$'
     OR length(trim(coalesce(_address->>'nome',''))) NOT BETWEEN 2 AND 100
     OR length(trim(coalesce(_address->>'rua',''))) NOT BETWEEN 2 AND 150
     OR length(trim(coalesce(_address->>'numero',''))) NOT BETWEEN 1 AND 20
     OR length(trim(coalesce(_address->>'bairro',''))) NOT BETWEEN 2 AND 100
     OR length(trim(coalesce(_address->>'cidade',''))) NOT BETWEEN 2 AND 100
     OR coalesce(_address->>'uf','') !~ '^[A-Z]{2}$'
     OR length(coalesce(_address->>'complemento','')) > 100
  THEN RAISE EXCEPTION 'Invalid address'; END IF;

  _factor := CASE WHEN _payment = 'pix' THEN .85 ELSE 1 END;
  _pct := CASE lower(coalesce(_coupon,'')) WHEN 'ff10' THEN .10 WHEN 'skrp10' THEN .10 WHEN 'prumo10off' THEN .10 WHEN 'prumo5off' THEN .05 ELSE 0 END;

  INSERT INTO orders (user_id, subtotal, total, coupon, status, payment_method, installments, shipping_method, shipping_address)
  VALUES (_uid, 0, 0, CASE WHEN _pct > 0 THEN lower(_coupon) END, 'Aguardando pagamento', _payment, _inst, _shipping,
    jsonb_build_object('nome', trim(_address->>'nome'), 'cep', _address->>'cep', 'rua', trim(_address->>'rua'),
      'numero', trim(_address->>'numero'), 'complemento', trim(coalesce(_address->>'complemento','')),
      'bairro', trim(_address->>'bairro'), 'cidade', trim(_address->>'cidade'), 'uf', _address->>'uf'))
  RETURNING id INTO _order;

  FOR _it IN SELECT p.id, p.name, round(p.price * _factor, 2) AS unit, (e.value)::int AS qty
    FROM jsonb_each_text(_items) e JOIN products p ON p.id = e.key::int LOOP
    IF _it.qty < 1 OR _it.qty > 99 THEN RAISE EXCEPTION 'Invalid quantity'; END IF;
    INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES (_order, _it.id, _it.name, _it.qty, _it.unit);
    _sub := _sub + _it.unit * _it.qty;
  END LOOP;
  IF _sub = 0 THEN RAISE EXCEPTION 'Empty cart'; END IF;

  _disc := round(_sub * _pct, 2);
  _ship := CASE WHEN _shipping = 'expresso' THEN 49.90 WHEN _sub - _disc >= 500 THEN 0 ELSE 29.90 END;
  UPDATE orders SET subtotal = _sub, discount = _disc, shipping_cost = _ship, total = _sub - _disc + _ship WHERE id = _order;
  RETURN _order;
END $$;

REVOKE ALL ON FUNCTION public.place_order_checkout(jsonb, text, text, integer, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.place_order_checkout(jsonb, text, text, integer, text, jsonb) TO authenticated;