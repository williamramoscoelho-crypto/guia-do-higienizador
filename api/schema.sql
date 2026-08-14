-- Guia do Higienizador — MySQL 5.7+ / MariaDB 10.3+ (HostGator)
-- Importe no phpMyAdmin. Não contém senhas.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) NOT NULL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_sessions_token (token_hash),
  KEY idx_sessions_user (user_id),
  KEY idx_sessions_expires (expires_at),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_resets (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_resets_token (token_hash),
  KEY idx_resets_user (user_id),
  CONSTRAINT fk_resets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS profiles (
  id CHAR(36) NOT NULL PRIMARY KEY,
  handle VARCHAR(24) NULL,
  nome VARCHAR(80) NOT NULL DEFAULT 'Novo membro',
  nome_profissional VARCHAR(80) NULL,
  empresa VARCHAR(80) NULL,
  cidade VARCHAR(60) NULL,
  estado VARCHAR(2) NULL,
  bio VARCHAR(400) NULL,
  experiencia VARCHAR(40) NULL,
  especialidades TEXT NOT NULL,
  servicos TEXT NOT NULL,
  avatar_url TEXT NULL,
  capa_url TEXT NULL,
  instagram VARCHAR(40) NULL,
  site VARCHAR(120) NULL,
  whatsapp VARCHAR(20) NULL,
  telefone VARCHAR(20) NULL,
  perfil_publico TINYINT(1) NOT NULL DEFAULT 0,
  mostrar_cidade TINYINT(1) NOT NULL DEFAULT 1,
  mostrar_telefone TINYINT(1) NOT NULL DEFAULT 0,
  mostrar_whatsapp TINYINT(1) NOT NULL DEFAULT 0,
  mostrar_instagram TINYINT(1) NOT NULL DEFAULT 1,
  mostrar_site TINYINT(1) NOT NULL DEFAULT 1,
  permitir_mensagens TINYINT(1) NOT NULL DEFAULT 1,
  notificacoes TEXT NOT NULL,
  suspenso TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_profiles_handle (handle),
  KEY idx_profiles_publico (perfil_publico, suspenso),
  KEY idx_profiles_estado (estado),
  CONSTRAINT fk_profiles_user FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_roles (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  role VARCHAR(20) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_role (user_id, role),
  CONSTRAINT fk_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS groups (
  id CHAR(36) NOT NULL PRIMARY KEY,
  slug VARCHAR(80) NOT NULL,
  nome VARCHAR(120) NOT NULL,
  descricao TEXT NULL,
  emoji VARCHAR(16) NOT NULL DEFAULT '💬',
  tipo VARCHAR(16) NOT NULL DEFAULT 'tema',
  uf VARCHAR(2) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_groups_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS group_members (
  id CHAR(36) NOT NULL PRIMARY KEY,
  group_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_group_member (group_id, user_id),
  KEY idx_gm_user (user_id),
  CONSTRAINT fk_gm_group FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  CONSTRAINT fk_gm_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS posts (
  id CHAR(36) NOT NULL PRIMARY KEY,
  author_id CHAR(36) NOT NULL,
  group_id CHAR(36) NULL,
  kind VARCHAR(32) NOT NULL DEFAULT 'discussao',
  titulo VARCHAR(120) NULL,
  corpo TEXT NOT NULL,
  imagens TEXT NOT NULL,
  tags TEXT NOT NULL,
  oculto TINYINT(1) NOT NULL DEFAULT 0,
  likes_count INT NOT NULL DEFAULT 0,
  comments_count INT NOT NULL DEFAULT 0,
  deleted_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_posts_created (created_at),
  KEY idx_posts_author (author_id),
  KEY idx_posts_group (group_id),
  KEY idx_posts_kind (kind),
  CONSTRAINT fk_posts_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_posts_group FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS post_likes (
  post_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id, user_id),
  KEY idx_pl_user (user_id),
  CONSTRAINT fk_pl_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_pl_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS post_saves (
  post_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id, user_id),
  KEY idx_ps_user (user_id),
  CONSTRAINT fk_ps_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_ps_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comments (
  id CHAR(36) NOT NULL PRIMARY KEY,
  post_id CHAR(36) NOT NULL,
  author_id CHAR(36) NOT NULL,
  parent_id CHAR(36) NULL,
  corpo TEXT NOT NULL,
  likes_count INT NOT NULL DEFAULT 0,
  oculto TINYINT(1) NOT NULL DEFAULT 0,
  deleted_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_comments_post (post_id),
  CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS questions (
  id CHAR(36) NOT NULL PRIMARY KEY,
  author_id CHAR(36) NOT NULL,
  titulo VARCHAR(140) NOT NULL,
  corpo TEXT NULL,
  categoria VARCHAR(40) NOT NULL DEFAULT 'Tecidos',
  tags TEXT NOT NULL,
  imagens TEXT NOT NULL,
  resolvida TINYINT(1) NOT NULL DEFAULT 0,
  answers_count INT NOT NULL DEFAULT 0,
  oculto TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_questions_created (created_at),
  KEY idx_questions_cat (categoria),
  CONSTRAINT fk_questions_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS answers (
  id CHAR(36) NOT NULL PRIMARY KEY,
  question_id CHAR(36) NOT NULL,
  author_id CHAR(36) NOT NULL,
  corpo TEXT NOT NULL,
  melhor TINYINT(1) NOT NULL DEFAULT 0,
  likes_count INT NOT NULL DEFAULT 0,
  oculto TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_answers_q (question_id),
  CONSTRAINT fk_answers_q FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  CONSTRAINT fk_answers_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS follows (
  follower_id CHAR(36) NOT NULL,
  following_id CHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, following_id),
  KEY idx_follows_following (following_id),
  CONSTRAINT fk_follows_follower FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_follows_following FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS favorites (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  item_tipo VARCHAR(40) NOT NULL,
  item_ref VARCHAR(120) NOT NULL,
  item_titulo VARCHAR(160) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_fav (user_id, item_tipo, item_ref),
  CONSTRAINT fk_fav_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  actor_id CHAR(36) NULL,
  tipo VARCHAR(40) NOT NULL,
  titulo VARCHAR(160) NOT NULL,
  corpo TEXT NULL,
  link VARCHAR(255) NULL,
  lida TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_notif_user (user_id, created_at),
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notif_actor FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS badges (
  slug VARCHAR(40) NOT NULL PRIMARY KEY,
  nome VARCHAR(80) NOT NULL,
  emoji VARCHAR(16) NOT NULL DEFAULT '🏅',
  descricao TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_badges (
  user_id CHAR(36) NOT NULL,
  badge_slug VARCHAR(40) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, badge_slug),
  CONSTRAINT fk_ub_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_ub_badge FOREIGN KEY (badge_slug) REFERENCES badges(slug) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_points (
  user_id CHAR(36) NOT NULL PRIMARY KEY,
  pontos INT NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_points_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reports (
  id CHAR(36) NOT NULL PRIMARY KEY,
  reporter_id CHAR(36) NOT NULL,
  alvo_tipo VARCHAR(20) NOT NULL,
  alvo_id CHAR(36) NOT NULL,
  motivo VARCHAR(80) NOT NULL,
  detalhe TEXT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'aberta',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_reports_status (status, created_at),
  CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ia_rate_limits (
  ip VARCHAR(45) NOT NULL,
  janela DATETIME NOT NULL,
  hits INT NOT NULL DEFAULT 0,
  PRIMARY KEY (ip, janela)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

INSERT IGNORE INTO badges (slug, nome, emoji, descricao) VALUES
  ('membro-ativo','Membro Ativo','🏅','Participa com frequência da comunidade.'),
  ('contribuidor','Contribuidor','💡','Compartilha conteúdo útil com outros profissionais.'),
  ('especialista-comunidade','Especialista da Comunidade','🧠','Reconhecido pelas contribuições técnicas na comunidade.'),
  ('mentor','Mentor','🤝','Ajuda iniciantes de forma recorrente.'),
  ('aluno','Aluno','📚','Está percorrendo os conteúdos de aprendizado.'),
  ('destaque-mes','Destaque do Mês','🏆','Maior contribuição do mês na comunidade.'),
  ('participante-ativo','Participante Ativo','⚡','Presença constante nos grupos e discussões.');

INSERT IGNORE INTO groups (id, slug, nome, emoji, descricao, tipo, uf) VALUES
  ('a1b2c3d4-e5f6-4711-8a01-000000000001','higienizacao-estofados','Higienização de Estofados','🛋️','Processos, técnicas e casos de higienização de estofados.','tema',NULL),
  ('a1b2c3d4-e5f6-4711-8a01-000000000002','estetica-automotiva','Estética Automotiva','🚗','Lavagem técnica, detalhamento, polimento e proteção.','tema',NULL),
  ('a1b2c3d4-e5f6-4711-8a01-000000000003','tecidos-fibras','Tecidos e Fibras','🧵','Identificação, comportamento e cuidados com tecidos.','tema',NULL),
  ('a1b2c3d4-e5f6-4711-8a01-000000000004','produtos-quimica','Produtos e Química','🧪','Produtos, diluições e compatibilidade química.','tema',NULL),
  ('a1b2c3d4-e5f6-4711-8a01-000000000005','manchas','Manchas','🟤','Origem, tratamento e limitações na remoção de manchas.','tema',NULL),
  ('a1b2c3d4-e5f6-4711-8a01-000000000006','impermeabilizacao','Impermeabilização','💦','Produtos, aplicação e expectativas reais.','tema',NULL),
  ('a1b2c3d4-e5f6-4711-8a01-000000000007','equipamentos','Equipamentos','🧰','Extratoras, aspiradores, politrizes e manutenção.','tema',NULL),
  ('a1b2c3d4-e5f6-4711-8a01-000000000008','precificacao','Precificação','💰','Custos, margem e formação de preço.','tema',NULL),
  ('a1b2c3d4-e5f6-4711-8a01-000000000009','marketing','Marketing','📈','Divulgação, redes sociais e captação de clientes.','tema',NULL),
  ('a1b2c3d4-e5f6-4711-8a01-000000000010','atendimento','Atendimento','🤝','Relacionamento com o cliente e pós-serviço.','tema',NULL),
  ('a1b2c3d4-e5f6-4711-8a01-000000000011','empreendedorismo','Empreendedorismo','🏢','Gestão, formalização e crescimento do negócio.','tema',NULL),
  ('a1b2c3d4-e5f6-4711-8a01-000000000012','higienizadores-mg','Higienizadores de Minas Gerais','📍','Profissionais atuando em Minas Gerais.','estado','MG'),
  ('a1b2c3d4-e5f6-4711-8a01-000000000013','higienizadores-sp','Higienizadores de São Paulo','📍','Profissionais atuando em São Paulo.','estado','SP'),
  ('a1b2c3d4-e5f6-4711-8a01-000000000014','higienizadores-rj','Higienizadores do Rio de Janeiro','📍','Profissionais atuando no Rio de Janeiro.','estado','RJ'),
  ('a1b2c3d4-e5f6-4711-8a01-000000000015','higienizadores-pr','Higienizadores do Paraná','📍','Profissionais atuando no Paraná.','estado','PR'),
  ('a1b2c3d4-e5f6-4711-8a01-000000000016','higienizadores-rs','Higienizadores do Rio Grande do Sul','📍','Profissionais atuando no Rio Grande do Sul.','estado','RS'),
  ('a1b2c3d4-e5f6-4711-8a01-000000000017','higienizadores-ba','Higienizadores da Bahia','📍','Profissionais atuando na Bahia.','estado','BA');
