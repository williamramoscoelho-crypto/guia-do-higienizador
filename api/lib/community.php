<?php
declare(strict_types=1);

function gh_posts_list(): void
{
    $kind = gh_query('kind');
    $groupId = gh_query('group_id');
    $autorId = gh_query('author_id');
    $ordem = gh_query('ordem') === 'populares' ? 'populares' : 'recentes';
    $limite = (int) (gh_query('limite') ?? '30');
    $limite = max(1, min(60, $limite));

    $sql = 'SELECT ' . GH_POST_SELECT . ' FROM posts p
            JOIN profiles a ON a.id = p.author_id
            WHERE p.deleted_at IS NULL AND p.oculto = 0';
    $params = [];
    if ($kind) {
        $sql .= ' AND p.kind = ?';
        $params[] = $kind;
    }
    if ($groupId) {
        $sql .= ' AND p.group_id = ?';
        $params[] = $groupId;
    }
    if ($autorId) {
        $sql .= ' AND p.author_id = ?';
        $params[] = $autorId;
    }
    $sql .= $ordem === 'populares'
        ? ' ORDER BY p.likes_count DESC, p.created_at DESC'
        : ' ORDER BY p.created_at DESC';
    $sql .= ' LIMIT ' . $limite;
    $rows = gh_all($sql, $params);
    gh_json(array_map('gh_map_post', $rows));
}

function gh_posts_get(string $id): void
{
    $row = gh_one(
        'SELECT ' . GH_POST_SELECT . ', p.deleted_at, p.oculto FROM posts p JOIN profiles a ON a.id = p.author_id WHERE p.id = ? LIMIT 1',
        [$id]
    );
    if (!$row || $row['deleted_at']) {
        gh_json(['error' => 'Publicação não encontrada.'], 404);
    }
    $me = gh_user();
    $own = $me && ($me['id'] === $row['author_id'] || gh_is_staff($me['id']));
    if ((int) $row['oculto'] === 1 && !$own) {
        gh_json(['error' => 'Publicação não encontrada.'], 404);
    }
    gh_json(gh_map_post($row));
}

function gh_posts_create(): void
{
    $u = gh_require_user();
    $b = gh_body();
    $kind = gh_str($b['kind'] ?? 'discussao', 32);
    if (!in_array($kind, GH_KINDS, true)) {
        $kind = 'discussao';
    }
    $corpo = gh_str($b['corpo'] ?? '', 4000);
    if (strlen($corpo) < 10) {
        gh_json(['error' => 'Escreva ao menos 10 caracteres.'], 400);
    }
    $id = gh_uuid();
    $groupId = gh_str($b['group_id'] ?? '', 36) ?: null;
    gh_exec(
        'INSERT INTO posts (id, author_id, group_id, kind, titulo, corpo, imagens, tags) VALUES (?,?,?,?,?,?,?,?)',
        [
            $id,
            $u['id'],
            $groupId,
            $kind,
            gh_str($b['titulo'] ?? '', 120) ?: null,
            $corpo,
            gh_json_col($b['imagens'] ?? []),
            gh_json_col($b['tags'] ?? []),
        ]
    );
    gh_points($u['id'], 5);
    gh_json(['id' => $id], 201);
}

function gh_post_like(string $id, bool $on): void
{
    $u = gh_require_user();
    $post = gh_one('SELECT id, author_id FROM posts WHERE id = ? AND deleted_at IS NULL', [$id]);
    if (!$post) {
        gh_json(['error' => 'Publicação não encontrada.'], 404);
    }
    if ($on) {
        $ins = gh_exec('INSERT IGNORE INTO post_likes (post_id, user_id) VALUES (?,?)', [$id, $u['id']]);
        if ($ins->rowCount() > 0) {
            gh_exec('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?', [$id]);
            if ($post['author_id'] !== $u['id']) {
                gh_points($post['author_id'], 1);
            }
        }
    } else {
        $st = gh_exec('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?', [$id, $u['id']]);
        if ($st->rowCount() > 0) {
            gh_exec('UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = ?', [$id]);
            if ($post['author_id'] !== $u['id']) {
                gh_points($post['author_id'], -1);
            }
        }
    }
    gh_json(['ok' => true]);
}

function gh_post_save(string $id, bool $on): void
{
    $u = gh_require_user();
    if ($on) {
        gh_exec('INSERT IGNORE INTO post_saves (post_id, user_id) VALUES (?,?)', [$id, $u['id']]);
    } else {
        gh_exec('DELETE FROM post_saves WHERE post_id = ? AND user_id = ?', [$id, $u['id']]);
    }
    gh_json(['ok' => true]);
}

function gh_interactions(): void
{
    $u = gh_require_user();
    $raw = gh_query('post_ids') ?? '';
    $ids = array_values(array_filter(array_map('trim', explode(',', $raw))));
    if ($ids === []) {
        gh_json(['curtidos' => [], 'salvos' => []]);
    }
    $ph = implode(',', array_fill(0, count($ids), '?'));
    $curtidos = gh_all("SELECT post_id FROM post_likes WHERE user_id = ? AND post_id IN ($ph)", array_merge([$u['id']], $ids));
    $salvos = gh_all("SELECT post_id FROM post_saves WHERE user_id = ? AND post_id IN ($ph)", array_merge([$u['id']], $ids));
    gh_json([
        'curtidos' => array_column($curtidos, 'post_id'),
        'salvos' => array_column($salvos, 'post_id'),
    ]);
}

function gh_saves_list(): void
{
    $u = gh_require_user();
    $rows = gh_all(
        'SELECT ' . GH_POST_SELECT . ' FROM post_saves s
         JOIN posts p ON p.id = s.post_id
         JOIN profiles a ON a.id = p.author_id
         WHERE s.user_id = ? AND p.deleted_at IS NULL
         ORDER BY s.created_at DESC LIMIT 20',
        [$u['id']]
    );
    gh_json(array_map('gh_map_post', $rows));
}

function gh_comments_list(string $postId): void
{
    $rows = gh_all(
        'SELECT c.id, c.corpo, c.created_at,
                a.id AS a_id, a.handle AS a_handle, a.nome AS a_nome, a.nome_profissional AS a_nome_profissional,
                a.avatar_url AS a_avatar_url, a.cidade AS a_cidade, a.estado AS a_estado,
                a.mostrar_cidade AS a_mostrar_cidade, a.perfil_publico AS a_perfil_publico
         FROM comments c
         JOIN profiles a ON a.id = c.author_id
         WHERE c.post_id = ? AND c.deleted_at IS NULL AND c.oculto = 0
         ORDER BY c.created_at ASC',
        [$postId]
    );
    $out = [];
    foreach ($rows as $r) {
        $out[] = [
            'id' => $r['id'],
            'corpo' => $r['corpo'],
            'created_at' => gh_iso($r['created_at']),
            'author' => gh_map_autor([
                'id' => $r['a_id'],
                'handle' => $r['a_handle'],
                'nome' => $r['a_nome'],
                'nome_profissional' => $r['a_nome_profissional'],
                'avatar_url' => $r['a_avatar_url'],
                'cidade' => $r['a_cidade'],
                'estado' => $r['a_estado'],
                'mostrar_cidade' => $r['a_mostrar_cidade'],
                'perfil_publico' => $r['a_perfil_publico'],
            ]),
        ];
    }
    gh_json($out);
}

function gh_comments_create(string $postId): void
{
    $u = gh_require_user();
    $corpo = gh_str(gh_body()['corpo'] ?? '', 2000);
    if (strlen($corpo) < 2) {
        gh_json(['error' => 'Escreva um comentário.'], 400);
    }
    $post = gh_one('SELECT id, author_id FROM posts WHERE id = ? AND deleted_at IS NULL', [$postId]);
    if (!$post) {
        gh_json(['error' => 'Publicação não encontrada.'], 404);
    }
    $id = gh_uuid();
    gh_exec('INSERT INTO comments (id, post_id, author_id, corpo) VALUES (?,?,?,?)', [$id, $postId, $u['id'], $corpo]);
    gh_exec('UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?', [$postId]);
    gh_points($u['id'], 2);
    gh_notify($post['author_id'], $u['id'], 'comentario', 'Novo comentário na sua publicação', $corpo, '/comunidade/post/' . $postId);
    gh_json(['id' => $id], 201);
}

function gh_questions_list(): void
{
    $cat = gh_query('categoria');
    $abertas = gh_query('abertas') === '1';
    $sql = 'SELECT q.id, q.titulo, q.corpo, q.categoria, q.resolvida, q.answers_count, q.created_at, q.author_id,
                   a.id AS a_id, a.handle AS a_handle, a.nome AS a_nome, a.nome_profissional AS a_nome_profissional,
                   a.avatar_url AS a_avatar_url, a.cidade AS a_cidade, a.estado AS a_estado,
                   a.mostrar_cidade AS a_mostrar_cidade, a.perfil_publico AS a_perfil_publico
            FROM questions q JOIN profiles a ON a.id = q.author_id
            WHERE q.oculto = 0';
    $params = [];
    if ($cat) {
        $sql .= ' AND q.categoria = ?';
        $params[] = $cat;
    }
    if ($abertas) {
        $sql .= ' AND q.resolvida = 0';
    }
    $sql .= ' ORDER BY q.created_at DESC LIMIT 40';
    $rows = gh_all($sql, $params);
    gh_json(array_map('gh_map_question', $rows));
}

function gh_map_question(array $r): array
{
    return [
        'id' => $r['id'],
        'titulo' => $r['titulo'],
        'corpo' => $r['corpo'],
        'categoria' => $r['categoria'],
        'resolvida' => (bool) $r['resolvida'],
        'answers_count' => (int) $r['answers_count'],
        'created_at' => gh_iso($r['created_at']),
        'author_id' => $r['author_id'],
        'author' => gh_map_autor([
            'id' => $r['a_id'],
            'handle' => $r['a_handle'],
            'nome' => $r['a_nome'],
            'nome_profissional' => $r['a_nome_profissional'],
            'avatar_url' => $r['a_avatar_url'],
            'cidade' => $r['a_cidade'],
            'estado' => $r['a_estado'],
            'mostrar_cidade' => $r['a_mostrar_cidade'],
            'perfil_publico' => $r['a_perfil_publico'],
        ]),
    ];
}

function gh_questions_get(string $id): void
{
    $row = gh_one(
        'SELECT q.id, q.titulo, q.corpo, q.categoria, q.resolvida, q.answers_count, q.created_at, q.author_id, q.oculto,
                a.id AS a_id, a.handle AS a_handle, a.nome AS a_nome, a.nome_profissional AS a_nome_profissional,
                a.avatar_url AS a_avatar_url, a.cidade AS a_cidade, a.estado AS a_estado,
                a.mostrar_cidade AS a_mostrar_cidade, a.perfil_publico AS a_perfil_publico
         FROM questions q JOIN profiles a ON a.id = q.author_id WHERE q.id = ?',
        [$id]
    );
    if (!$row || ((int) $row['oculto'] === 1 && !(gh_user() && (gh_user()['id'] === $row['author_id'] || gh_is_staff(gh_user()['id']))))) {
        gh_json(['error' => 'Pergunta não encontrada.'], 404);
    }
    gh_json(gh_map_question($row));
}

function gh_questions_create(): void
{
    $u = gh_require_user();
    $b = gh_body();
    $titulo = gh_str($b['titulo'] ?? '', 140);
    if (strlen($titulo) < 10) {
        gh_json(['error' => 'Escreva um título com ao menos 10 caracteres.'], 400);
    }
    $id = gh_uuid();
    gh_exec(
        'INSERT INTO questions (id, author_id, titulo, corpo, categoria, tags, imagens) VALUES (?,?,?,?,?,?,?)',
        [
            $id,
            $u['id'],
            $titulo,
            gh_str($b['corpo'] ?? '', 3000) ?: null,
            gh_str($b['categoria'] ?? 'Tecidos', 40) ?: 'Tecidos',
            gh_json_col($b['tags'] ?? []),
            gh_json_col($b['imagens'] ?? []),
        ]
    );
    gh_json(['id' => $id], 201);
}

function gh_answers_list(string $questionId): void
{
    $rows = gh_all(
        'SELECT r.id, r.corpo, r.melhor, r.likes_count, r.created_at,
                a.id AS a_id, a.handle AS a_handle, a.nome AS a_nome, a.nome_profissional AS a_nome_profissional,
                a.avatar_url AS a_avatar_url, a.cidade AS a_cidade, a.estado AS a_estado,
                a.mostrar_cidade AS a_mostrar_cidade, a.perfil_publico AS a_perfil_publico
         FROM answers r JOIN profiles a ON a.id = r.author_id
         WHERE r.question_id = ? AND r.oculto = 0
         ORDER BY r.melhor DESC, r.created_at ASC',
        [$questionId]
    );
    $out = [];
    foreach ($rows as $r) {
        $out[] = [
            'id' => $r['id'],
            'corpo' => $r['corpo'],
            'melhor' => (bool) $r['melhor'],
            'likes_count' => (int) $r['likes_count'],
            'created_at' => gh_iso($r['created_at']),
            'author' => gh_map_autor([
                'id' => $r['a_id'],
                'handle' => $r['a_handle'],
                'nome' => $r['a_nome'],
                'nome_profissional' => $r['a_nome_profissional'],
                'avatar_url' => $r['a_avatar_url'],
                'cidade' => $r['a_cidade'],
                'estado' => $r['a_estado'],
                'mostrar_cidade' => $r['a_mostrar_cidade'],
                'perfil_publico' => $r['a_perfil_publico'],
            ]),
        ];
    }
    gh_json($out);
}

function gh_answers_create(string $questionId): void
{
    $u = gh_require_user();
    $corpo = gh_str(gh_body()['corpo'] ?? '', 3000);
    if (strlen($corpo) < 10) {
        gh_json(['error' => 'Escreva ao menos 10 caracteres.'], 400);
    }
    $q = gh_one('SELECT id, author_id FROM questions WHERE id = ? AND oculto = 0', [$questionId]);
    if (!$q) {
        gh_json(['error' => 'Pergunta não encontrada.'], 404);
    }
    $id = gh_uuid();
    gh_exec('INSERT INTO answers (id, question_id, author_id, corpo) VALUES (?,?,?,?)', [$id, $questionId, $u['id'], $corpo]);
    gh_exec('UPDATE questions SET answers_count = answers_count + 1 WHERE id = ?', [$questionId]);
    gh_points($u['id'], 4);
    gh_notify($q['author_id'], $u['id'], 'resposta', 'Nova resposta na sua pergunta', $corpo, '/perguntas/' . $questionId);
    gh_json(['id' => $id], 201);
}

function gh_answer_best(string $answerId): void
{
    $u = gh_require_user();
    $ans = gh_one(
        'SELECT r.id, r.question_id, q.author_id FROM answers r JOIN questions q ON q.id = r.question_id WHERE r.id = ?',
        [$answerId]
    );
    if (!$ans) {
        gh_json(['error' => 'Resposta não encontrada.'], 404);
    }
    if ($ans['author_id'] !== $u['id'] && !gh_is_staff($u['id'])) {
        gh_json(['error' => 'Somente o autor da pergunta ou a moderação.'], 403);
    }
    gh_exec('UPDATE answers SET melhor = 0 WHERE question_id = ?', [$ans['question_id']]);
    gh_exec('UPDATE answers SET melhor = 1 WHERE id = ?', [$answerId]);
    gh_exec('UPDATE questions SET resolvida = 1 WHERE id = ?', [$ans['question_id']]);
    gh_json(['ok' => true]);
}

function gh_groups_list(): void
{
    gh_json(gh_all('SELECT * FROM groups ORDER BY nome'));
}

function gh_groups_get(string $slug): void
{
    $g = gh_one('SELECT * FROM groups WHERE slug = ?', [$slug]);
    if (!$g) {
        gh_json(['error' => 'Grupo não encontrado.'], 404);
    }
    $membro = false;
    $u = gh_user();
    if ($u) {
        $m = gh_one('SELECT id FROM group_members WHERE user_id = ? AND group_id = ?', [$u['id'], $g['id']]);
        $membro = (bool) $m;
    }
    $g['membro'] = $membro;
    gh_json($g);
}

function gh_groups_join(string $id, bool $on): void
{
    $u = gh_require_user();
    $g = gh_one('SELECT id FROM groups WHERE id = ?', [$id]);
    if (!$g) {
        gh_json(['error' => 'Grupo não encontrado.'], 404);
    }
    if ($on) {
        gh_exec('INSERT IGNORE INTO group_members (id, group_id, user_id) VALUES (?,?,?)', [gh_uuid(), $id, $u['id']]);
    } else {
        gh_exec('DELETE FROM group_members WHERE group_id = ? AND user_id = ?', [$id, $u['id']]);
    }
    gh_json(['ok' => true]);
}

function gh_profiles_list(): void
{
    $uf = gh_query('uf');
    $esp = gh_query('especialidade');
    $sql = 'SELECT id, handle, nome, nome_profissional, avatar_url, cidade, estado, mostrar_cidade, bio, especialidades
            FROM profiles WHERE perfil_publico = 1 AND suspenso = 0 AND handle IS NOT NULL';
    $params = [];
    if ($uf) {
        $sql .= ' AND estado = ?';
        $params[] = strtoupper($uf);
    }
    $sql .= ' ORDER BY created_at DESC LIMIT 60';
    $rows = gh_all($sql, $params);
    $out = [];
    foreach ($rows as $r) {
        $lista = gh_json_arr($r['especialidades']);
        if ($esp && !in_array($esp, $lista, true)) {
            continue;
        }
        $r['especialidades'] = $lista;
        $r['mostrar_cidade'] = (bool) $r['mostrar_cidade'];
        $out[] = $r;
    }
    gh_json($out);
}

function gh_profiles_handle(string $handle): void
{
    $p = gh_one('SELECT * FROM profiles WHERE handle = ?', [$handle]);
    if (!$p) {
        gh_json(['error' => 'Perfil não encontrado.'], 404);
    }
    $mapped = gh_map_profile($p);
    $pts = gh_one('SELECT pontos FROM user_points WHERE user_id = ?', [$p['id']]);
    $mapped['pontos'] = (int) ($pts['pontos'] ?? 0);
    $seguindo = false;
    $u = gh_user();
    if ($u && $u['id'] !== $p['id']) {
        $seguindo = (bool) gh_one(
            'SELECT follower_id FROM follows WHERE follower_id = ? AND following_id = ?',
            [$u['id'], $p['id']]
        );
    }
    $mapped['seguindo'] = $seguindo;
    gh_json($mapped);
}

function gh_follow(string $id, bool $on): void
{
    $u = gh_require_user();
    if ($u['id'] === $id) {
        gh_json(['error' => 'Você não pode seguir a si mesmo.'], 400);
    }
    $alvo = gh_one('SELECT id, nome, handle FROM profiles WHERE id = ?', [$id]);
    if (!$alvo) {
        gh_json(['error' => 'Perfil não encontrado.'], 404);
    }
    if ($on) {
        gh_exec('INSERT IGNORE INTO follows (follower_id, following_id) VALUES (?,?)', [$u['id'], $id]);
        gh_notify($id, $u['id'], 'seguidor', 'Novo seguidor', 'Alguém começou a seguir você.', '/p/' . ($alvo['handle'] ?? ''));
    } else {
        gh_exec('DELETE FROM follows WHERE follower_id = ? AND following_id = ?', [$u['id'], $id]);
    }
    gh_json(['ok' => true]);
}

function gh_notifications_list(): void
{
    $u = gh_require_user();
    $rows = gh_all(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
        [$u['id']]
    );
    foreach ($rows as &$r) {
        $r['lida'] = (bool) $r['lida'];
        $r['created_at'] = gh_iso($r['created_at']);
    }
    unset($r);
    gh_json($rows);
}

function gh_notifications_unread(): void
{
    $u = gh_require_user();
    $row = gh_one('SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND lida = 0', [$u['id']]);
    gh_json(['count' => (int) ($row['c'] ?? 0)]);
}

function gh_notifications_read(): void
{
    $u = gh_require_user();
    gh_exec('UPDATE notifications SET lida = 1 WHERE user_id = ? AND lida = 0', [$u['id']]);
    gh_json(['ok' => true]);
}

function gh_reports_create(): void
{
    $u = gh_require_user();
    $b = gh_body();
    $tipo = gh_str($b['alvo_tipo'] ?? '', 20);
    $alvo = gh_str($b['alvo_id'] ?? '', 36);
    $motivo = gh_str($b['motivo'] ?? '', 80);
    if (!in_array($tipo, GH_ALVOS, true) || $alvo === '' || $motivo === '') {
        gh_json(['error' => 'Denúncia inválida.'], 400);
    }
    gh_exec(
        'INSERT INTO reports (id, reporter_id, alvo_tipo, alvo_id, motivo, detalhe) VALUES (?,?,?,?,?,?)',
        [gh_uuid(), $u['id'], $tipo, $alvo, $motivo, gh_str($b['detalhe'] ?? '', 500) ?: null]
    );
    gh_json(['ok' => true], 201);
}

function gh_reports_list(): void
{
    $u = gh_require_user();
    if (!gh_is_staff($u['id'])) {
        gh_json(['error' => 'Área restrita.'], 403);
    }
    $rows = gh_all('SELECT * FROM reports ORDER BY created_at DESC LIMIT 80');
    foreach ($rows as &$r) {
        $r['created_at'] = gh_iso($r['created_at']);
    }
    unset($r);
    gh_json($rows);
}

function gh_reports_status(string $id): void
{
    $u = gh_require_user();
    if (!gh_is_staff($u['id'])) {
        gh_json(['error' => 'Área restrita.'], 403);
    }
    $status = gh_str(gh_body()['status'] ?? '', 20);
    if (!in_array($status, ['resolvida', 'descartada', 'em_analise', 'aberta'], true)) {
        gh_json(['error' => 'Status inválido.'], 400);
    }
    gh_exec('UPDATE reports SET status = ? WHERE id = ?', [$status, $id]);
    gh_json(['ok' => true]);
}

function gh_moderation_hide(): void
{
    $u = gh_require_user();
    if (!gh_is_staff($u['id'])) {
        gh_json(['error' => 'Área restrita.'], 403);
    }
    $b = gh_body();
    $tipo = gh_str($b['alvo_tipo'] ?? '', 20);
    $alvo = gh_str($b['alvo_id'] ?? '', 36);
    $reportId = gh_str($b['report_id'] ?? '', 36);
    $tabela = GH_TABELA_ALVO[$tipo] ?? null;
    if (!$tabela || $alvo === '') {
        gh_json(['error' => 'Alvo inválido.'], 400);
    }
    gh_exec("UPDATE `$tabela` SET oculto = 1 WHERE id = ?", [$alvo]);
    if ($reportId) {
        gh_exec('UPDATE reports SET status = ? WHERE id = ?', ['resolvida', $reportId]);
    }
    gh_json(['ok' => true]);
}

function gh_points_get(string $userId): void
{
    $row = gh_one('SELECT pontos FROM user_points WHERE user_id = ?', [$userId]);
    gh_json(['pontos' => (int) ($row['pontos'] ?? 0)]);
}
