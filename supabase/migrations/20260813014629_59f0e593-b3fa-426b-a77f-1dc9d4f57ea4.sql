-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin','moderator','member');
CREATE TYPE public.post_kind AS ENUM ('discussao','duvida','antes_depois','produto','tecido','automotivo','dica','atencao');
CREATE TYPE public.report_status AS ENUM ('aberta','em_analise','resolvida','descartada');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  handle TEXT UNIQUE,
  nome TEXT NOT NULL DEFAULT 'Novo membro',
  nome_profissional TEXT,
  empresa TEXT,
  cidade TEXT,
  estado TEXT,
  bio TEXT,
  experiencia TEXT,
  especialidades TEXT[] NOT NULL DEFAULT '{}',
  servicos TEXT[] NOT NULL DEFAULT '{}',
  avatar_url TEXT,
  capa_url TEXT,
  instagram TEXT,
  site TEXT,
  whatsapp TEXT,
  telefone TEXT,
  perfil_publico BOOLEAN NOT NULL DEFAULT false,
  mostrar_cidade BOOLEAN NOT NULL DEFAULT true,
  mostrar_telefone BOOLEAN NOT NULL DEFAULT false,
  mostrar_whatsapp BOOLEAN NOT NULL DEFAULT false,
  mostrar_instagram BOOLEAN NOT NULL DEFAULT true,
  mostrar_site BOOLEAN NOT NULL DEFAULT true,
  permitir_mensagens BOOLEAN NOT NULL DEFAULT true,
  notificacoes JSONB NOT NULL DEFAULT '{"curtidas":true,"comentarios":true,"respostas":true,"seguidores":true,"selos":true,"avisos":true}'::jsonb,
  suspenso BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','moderator'));
$$;

CREATE POLICY "perfis publicos visiveis" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "dono edita perfil" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "dono cria perfil" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "staff edita perfis" ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "ver proprios papeis" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));

-- ============ GRUPOS ============
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  descricao TEXT,
  emoji TEXT NOT NULL DEFAULT '💬',
  tipo TEXT NOT NULL DEFAULT 'tema' CHECK (tipo IN ('tema','estado')),
  uf TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.groups TO anon, authenticated;
GRANT ALL ON public.groups TO service_role;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "grupos publicos" ON public.groups FOR SELECT USING (true);

CREATE TABLE public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);
CREATE INDEX ON public.group_members(group_id);
CREATE INDEX ON public.group_members(user_id);
GRANT SELECT, INSERT, DELETE ON public.group_members TO authenticated;
GRANT SELECT ON public.group_members TO anon;
GRANT ALL ON public.group_members TO service_role;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "membros visiveis" ON public.group_members FOR SELECT USING (true);
CREATE POLICY "entrar em grupo" ON public.group_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "sair do grupo" ON public.group_members FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));

-- ============ POSTS ============
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  kind public.post_kind NOT NULL DEFAULT 'discussao',
  titulo TEXT,
  corpo TEXT NOT NULL,
  imagens TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  oculto BOOLEAN NOT NULL DEFAULT false,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.posts(created_at DESC);
CREATE INDEX ON public.posts(author_id);
CREATE INDEX ON public.posts(group_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT SELECT ON public.posts TO anon;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts visiveis" ON public.posts FOR SELECT
  USING ((deleted_at IS NULL AND oculto = false) OR author_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "criar post" ON public.posts FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "editar proprio post" ON public.posts FOR UPDATE TO authenticated
  USING (author_id = auth.uid() OR public.is_staff(auth.uid()))
  WITH CHECK (author_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "apagar proprio post" ON public.posts FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE TABLE public.post_likes (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.post_likes TO authenticated;
GRANT SELECT ON public.post_likes TO anon;
GRANT ALL ON public.post_likes TO service_role;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "curtidas visiveis" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "curtir" ON public.post_likes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "descurtir" ON public.post_likes FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.post_saves (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.post_saves TO authenticated;
GRANT ALL ON public.post_saves TO service_role;
ALTER TABLE public.post_saves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meus salvos" ON public.post_saves FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "salvar" ON public.post_saves FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "remover salvo" ON public.post_saves FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============ COMENTARIOS ============
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  corpo TEXT NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  oculto BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.comments(post_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments TO authenticated;
GRANT SELECT ON public.comments TO anon;
GRANT ALL ON public.comments TO service_role;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comentarios visiveis" ON public.comments FOR SELECT
  USING ((deleted_at IS NULL AND oculto = false) OR author_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "comentar" ON public.comments FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "editar comentario" ON public.comments FOR UPDATE TO authenticated
  USING (author_id = auth.uid() OR public.is_staff(auth.uid()))
  WITH CHECK (author_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "apagar comentario" ON public.comments FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE TABLE public.comment_likes (
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY (comment_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.comment_likes TO authenticated;
GRANT SELECT ON public.comment_likes TO anon;
GRANT ALL ON public.comment_likes TO service_role;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "curtidas com visiveis" ON public.comment_likes FOR SELECT USING (true);
CREATE POLICY "curtir comentario" ON public.comment_likes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "descurtir comentario" ON public.comment_likes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============ PERGUNTAS ============
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  corpo TEXT,
  categoria TEXT NOT NULL DEFAULT 'tecidos',
  tags TEXT[] NOT NULL DEFAULT '{}',
  imagens TEXT[] NOT NULL DEFAULT '{}',
  resolvida BOOLEAN NOT NULL DEFAULT false,
  answers_count INTEGER NOT NULL DEFAULT 0,
  oculto BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.questions(created_at DESC);
CREATE INDEX ON public.questions(categoria);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.questions TO authenticated;
GRANT SELECT ON public.questions TO anon;
GRANT ALL ON public.questions TO service_role;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "perguntas visiveis" ON public.questions FOR SELECT
  USING (oculto = false OR author_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "perguntar" ON public.questions FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "editar pergunta" ON public.questions FOR UPDATE TO authenticated
  USING (author_id = auth.uid() OR public.is_staff(auth.uid()))
  WITH CHECK (author_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "apagar pergunta" ON public.questions FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE TABLE public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  corpo TEXT NOT NULL,
  melhor BOOLEAN NOT NULL DEFAULT false,
  likes_count INTEGER NOT NULL DEFAULT 0,
  oculto BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.answers(question_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.answers TO authenticated;
GRANT SELECT ON public.answers TO anon;
GRANT ALL ON public.answers TO service_role;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "respostas visiveis" ON public.answers FOR SELECT
  USING (oculto = false OR author_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "responder" ON public.answers FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "editar resposta" ON public.answers FOR UPDATE TO authenticated
  USING (
    author_id = auth.uid()
    OR public.is_staff(auth.uid())
    OR EXISTS (SELECT 1 FROM public.questions q WHERE q.id = question_id AND q.author_id = auth.uid())
  )
  WITH CHECK (
    author_id = auth.uid()
    OR public.is_staff(auth.uid())
    OR EXISTS (SELECT 1 FROM public.questions q WHERE q.id = question_id AND q.author_id = auth.uid())
  );
CREATE POLICY "apagar resposta" ON public.answers FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE TABLE public.answer_likes (
  answer_id UUID NOT NULL REFERENCES public.answers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY (answer_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.answer_likes TO authenticated;
GRANT SELECT ON public.answer_likes TO anon;
GRANT ALL ON public.answer_likes TO service_role;
ALTER TABLE public.answer_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "curtidas resp visiveis" ON public.answer_likes FOR SELECT USING (true);
CREATE POLICY "curtir resposta" ON public.answer_likes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "descurtir resposta" ON public.answer_likes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============ SEGUIR ============
CREATE TABLE public.follows (
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);
GRANT SELECT, INSERT, DELETE ON public.follows TO authenticated;
GRANT SELECT ON public.follows TO anon;
GRANT ALL ON public.follows TO service_role;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seguidores visiveis" ON public.follows FOR SELECT USING (true);
CREATE POLICY "seguir" ON public.follows FOR INSERT TO authenticated WITH CHECK (follower_id = auth.uid());
CREATE POLICY "deixar de seguir" ON public.follows FOR DELETE TO authenticated USING (follower_id = auth.uid());

-- ============ FAVORITOS ============
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_tipo TEXT NOT NULL,
  item_ref TEXT NOT NULL,
  item_titulo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_tipo, item_ref)
);
GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meus favoritos" ON public.favorites FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "favoritar" ON public.favorites FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "desfavoritar" ON public.favorites FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============ NOTIFICACOES ============
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  corpo TEXT,
  link TEXT,
  lida BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.notifications(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "minhas notificacoes" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "criar notificacao" ON public.notifications FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "marcar lida" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "apagar notificacao" ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============ SELOS E PONTOS ============
CREATE TABLE public.badges (
  slug TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🏅',
  descricao TEXT
);
GRANT SELECT ON public.badges TO anon, authenticated;
GRANT ALL ON public.badges TO service_role;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "selos publicos" ON public.badges FOR SELECT USING (true);

CREATE TABLE public.user_badges (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_slug TEXT NOT NULL REFERENCES public.badges(slug) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, badge_slug)
);
GRANT SELECT ON public.user_badges TO anon, authenticated;
GRANT ALL ON public.user_badges TO service_role;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "selos de usuario visiveis" ON public.user_badges FOR SELECT USING (true);

CREATE TABLE public.user_points (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pontos INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.user_points TO anon, authenticated;
GRANT ALL ON public.user_points TO service_role;
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pontos visiveis" ON public.user_points FOR SELECT USING (true);

-- ============ DENUNCIAS ============
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alvo_tipo TEXT NOT NULL,
  alvo_id UUID NOT NULL,
  motivo TEXT NOT NULL,
  detalhe TEXT,
  status public.report_status NOT NULL DEFAULT 'aberta',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "denuncias staff" ON public.reports FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) OR reporter_id = auth.uid());
CREATE POLICY "denunciar" ON public.reports FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());
CREATE POLICY "resolver denuncia" ON public.reports FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ============ TRIGGERS ============
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_posts_updated BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, handle)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
    'm' || substr(replace(NEW.id::text,'-',''), 1, 10)
  ) ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member') ON CONFLICT DO NOTHING;
  INSERT INTO public.user_points (user_id, pontos) VALUES (NEW.id, 0) ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.add_points(_user_id UUID, _delta INTEGER) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_points (user_id, pontos, updated_at)
  VALUES (_user_id, GREATEST(_delta, 0), now())
  ON CONFLICT (user_id) DO UPDATE SET pontos = GREATEST(public.user_points.pontos + _delta, 0), updated_at = now();
END; $$;

CREATE OR REPLACE FUNCTION public.on_post_change() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN PERFORM public.add_points(NEW.author_id, 5); RETURN NEW; END IF;
  PERFORM public.add_points(OLD.author_id, -5); RETURN OLD;
END; $$;
CREATE TRIGGER trg_post_points AFTER INSERT OR DELETE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.on_post_change();

CREATE OR REPLACE FUNCTION public.on_comment_change() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    PERFORM public.add_points(NEW.author_id, 2);
    RETURN NEW;
  END IF;
  UPDATE public.posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
  PERFORM public.add_points(OLD.author_id, -2);
  RETURN OLD;
END; $$;
CREATE TRIGGER trg_comment_counts AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.on_comment_change();

CREATE OR REPLACE FUNCTION public.on_post_like_change() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _author UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id RETURNING author_id INTO _author;
    IF _author IS NOT NULL AND _author <> NEW.user_id THEN PERFORM public.add_points(_author, 1); END IF;
    RETURN NEW;
  END IF;
  UPDATE public.posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id RETURNING author_id INTO _author;
  IF _author IS NOT NULL AND _author <> OLD.user_id THEN PERFORM public.add_points(_author, -1); END IF;
  RETURN OLD;
END; $$;
CREATE TRIGGER trg_post_like_counts AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.on_post_like_change();

CREATE OR REPLACE FUNCTION public.on_answer_change() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.questions SET answers_count = answers_count + 1 WHERE id = NEW.question_id;
    PERFORM public.add_points(NEW.author_id, 4);
    RETURN NEW;
  END IF;
  UPDATE public.questions SET answers_count = GREATEST(answers_count - 1, 0) WHERE id = OLD.question_id;
  PERFORM public.add_points(OLD.author_id, -4);
  RETURN OLD;
END; $$;
CREATE TRIGGER trg_answer_counts AFTER INSERT OR DELETE ON public.answers
  FOR EACH ROW EXECUTE FUNCTION public.on_answer_change();

CREATE OR REPLACE FUNCTION public.on_answer_like_change() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.answers SET likes_count = likes_count + 1 WHERE id = NEW.answer_id;
    RETURN NEW;
  END IF;
  UPDATE public.answers SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.answer_id;
  RETURN OLD;
END; $$;
CREATE TRIGGER trg_answer_like_counts AFTER INSERT OR DELETE ON public.answer_likes
  FOR EACH ROW EXECUTE FUNCTION public.on_answer_like_change();

CREATE OR REPLACE FUNCTION public.on_comment_like_change() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
    RETURN NEW;
  END IF;
  UPDATE public.comments SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.comment_id;
  RETURN OLD;
END; $$;
CREATE TRIGGER trg_comment_like_counts AFTER INSERT OR DELETE ON public.comment_likes
  FOR EACH ROW EXECUTE FUNCTION public.on_comment_like_change();

-- ============ SEEDS ============
INSERT INTO public.badges (slug, nome, emoji, descricao) VALUES
  ('membro-ativo','Membro Ativo','🏅','Participa com frequência da comunidade.'),
  ('contribuidor','Contribuidor','💡','Compartilha conteúdo útil com outros profissionais.'),
  ('especialista-comunidade','Especialista da Comunidade','🧠','Reconhecido pelas contribuições técnicas na comunidade.'),
  ('mentor','Mentor','🤝','Ajuda iniciantes de forma recorrente.'),
  ('aluno','Aluno','📚','Está percorrendo os conteúdos de aprendizado.'),
  ('destaque-mes','Destaque do Mês','🏆','Maior contribuição do mês na comunidade.'),
  ('participante-ativo','Participante Ativo','⚡','Presença constante nos grupos e discussões.');

INSERT INTO public.groups (slug, nome, emoji, descricao, tipo) VALUES
  ('higienizacao-estofados','Higienização de Estofados','🛋️','Processos, técnicas e casos de higienização de estofados.','tema'),
  ('estetica-automotiva','Estética Automotiva','🚗','Lavagem técnica, detalhamento, polimento e proteção.','tema'),
  ('tecidos-fibras','Tecidos e Fibras','🧵','Identificação, comportamento e cuidados com tecidos.','tema'),
  ('produtos-quimica','Produtos e Química','🧪','Produtos, diluições e compatibilidade química.','tema'),
  ('manchas','Manchas','🟤','Origem, tratamento e limitações na remoção de manchas.','tema'),
  ('impermeabilizacao','Impermeabilização','💦','Produtos, aplicação e expectativas reais.','tema'),
  ('equipamentos','Equipamentos','🧰','Extratoras, aspiradores, politrizes e manutenção.','tema'),
  ('precificacao','Precificação','💰','Custos, margem e formação de preço.','tema'),
  ('marketing','Marketing','📈','Divulgação, redes sociais e captação de clientes.','tema'),
  ('atendimento','Atendimento','🤝','Relacionamento com o cliente e pós-serviço.','tema'),
  ('empreendedorismo','Empreendedorismo','🏢','Gestão, formalização e crescimento do negócio.','tema');

INSERT INTO public.groups (slug, nome, emoji, descricao, tipo, uf) VALUES
  ('higienizadores-mg','Higienizadores de Minas Gerais','📍','Profissionais atuando em Minas Gerais.','estado','MG'),
  ('higienizadores-sp','Higienizadores de São Paulo','📍','Profissionais atuando em São Paulo.','estado','SP'),
  ('higienizadores-rj','Higienizadores do Rio de Janeiro','📍','Profissionais atuando no Rio de Janeiro.','estado','RJ'),
  ('higienizadores-pr','Higienizadores do Paraná','📍','Profissionais atuando no Paraná.','estado','PR'),
  ('higienizadores-rs','Higienizadores do Rio Grande do Sul','📍','Profissionais atuando no Rio Grande do Sul.','estado','RS'),
  ('higienizadores-ba','Higienizadores da Bahia','📍','Profissionais atuando na Bahia.','estado','BA');