CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL DEFAULT '',
  nome_profissional text NOT NULL DEFAULT '',
  empresa text NOT NULL DEFAULT '',
  cidade text NOT NULL DEFAULT '',
  estado text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  especialidades text[] NOT NULL DEFAULT '{}',
  servicos text[] NOT NULL DEFAULT '{}',
  instagram text NOT NULL DEFAULT '',
  site text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  avatar_url text NOT NULL DEFAULT '',
  perfil_publico boolean NOT NULL DEFAULT false,
  mostrar_cidade boolean NOT NULL DEFAULT true,
  mostrar_whatsapp boolean NOT NULL DEFAULT false,
  mostrar_instagram boolean NOT NULL DEFAULT true,
  mostrar_site boolean NOT NULL DEFAULT true,
  permitir_mensagens boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuario le o proprio perfil"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Usuario cria o proprio perfil"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuario atualiza o proprio perfil"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuario apaga o proprio perfil"
  ON public.profiles FOR DELETE TO authenticated
  USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'nome', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE VIEW public.perfis_publicos AS
SELECT
  p.id,
  NULLIF(p.nome_profissional, '') AS nome_profissional,
  p.nome,
  p.empresa,
  CASE WHEN p.mostrar_cidade THEN p.cidade ELSE '' END AS cidade,
  CASE WHEN p.mostrar_cidade THEN p.estado ELSE '' END AS estado,
  p.bio,
  p.especialidades,
  p.servicos,
  CASE WHEN p.mostrar_instagram THEN p.instagram ELSE '' END AS instagram,
  CASE WHEN p.mostrar_site THEN p.site ELSE '' END AS site,
  CASE WHEN p.mostrar_whatsapp THEN p.whatsapp ELSE '' END AS whatsapp,
  p.avatar_url,
  p.permitir_mensagens,
  p.created_at
FROM public.profiles p
WHERE p.perfil_publico = true;

GRANT SELECT ON public.perfis_publicos TO anon, authenticated;
GRANT ALL ON public.perfis_publicos TO service_role;