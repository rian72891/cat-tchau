ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS default_address jsonb,
  ADD COLUMN IF NOT EXISTS last_login_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

INSERT INTO public.profiles (id, full_name)
SELECT u.id, u.raw_user_meta_data->>'full_name' FROM auth.users u
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.user_favorites (
  user_id uuid NOT NULL,
  product_id integer NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);
GRANT SELECT, INSERT, DELETE ON public.user_favorites TO authenticated;
GRANT ALL ON public.user_favorites TO service_role;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own favorites" ON public.user_favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users add own favorites" ON public.user_favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users remove own favorites" ON public.user_favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.user_carts (
  user_id uuid PRIMARY KEY,
  items jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.user_carts TO authenticated;
GRANT ALL ON public.user_carts TO service_role;
ALTER TABLE public.user_carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own cart" ON public.user_carts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own cart" ON public.user_carts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own cart" ON public.user_carts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.touch_login()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO profiles (id, last_login_at) VALUES (auth.uid(), now())
  ON CONFLICT (id) DO UPDATE SET last_login_at = now();
$$;
REVOKE ALL ON FUNCTION public.touch_login() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.touch_login() TO authenticated;