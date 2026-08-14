<?php
declare(strict_types=1);

const GH_KINDS = ['discussao', 'duvida', 'antes_depois', 'produto', 'tecido', 'automotivo', 'dica', 'atencao'];
const GH_ROLES = ['admin', 'moderator', 'member'];
const GH_ALVOS = ['post', 'comment', 'question', 'answer', 'profile'];
const GH_TABELA_ALVO = [
    'post' => 'posts',
    'comment' => 'comments',
    'question' => 'questions',
    'answer' => 'answers',
];

function gh_config(): array
{
    static $cfg = null;
    if ($cfg !== null) {
        return $cfg;
    }
    $file = dirname(__DIR__) . '/config.php';
    if (!is_file($file)) {
        return [];
    }
    $loaded = require $file;
    $cfg = is_array($loaded) ? $loaded : [];
    return $cfg;
}

function gh_configured(): bool
{
    $c = gh_config();
    return $c !== [] && !empty($c['db_name']) && !empty($c['db_user']);
}

function gh_uuid(): string
{
    $b = random_bytes(16);
    $b[6] = chr((ord($b[6]) & 0x0f) | 0x40);
    $b[8] = chr((ord($b[8]) & 0x3f) | 0x80);
    $h = bin2hex($b);
    return sprintf('%s-%s-%s-%s-%s', substr($h, 0, 8), substr($h, 8, 4), substr($h, 12, 4), substr($h, 16, 4), substr($h, 20, 12));
}

function gh_pdo(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }
    if (!gh_configured()) {
        gh_json(['error' => 'API ainda não configurada. Copie api/config.example.php para api/config.php e preencha o MySQL.'], 503);
    }
    $c = gh_config();
    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=%s',
        $c['db_host'] ?? 'localhost',
        $c['db_name'],
        $c['db_charset'] ?? 'utf8mb4'
    );
    try {
        $pdo = new PDO($dsn, (string) $c['db_user'], (string) ($c['db_pass'] ?? ''), [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (PDOException $e) {
        gh_json(['error' => 'Não foi possível conectar ao banco.'], 503);
    }
    return $pdo;
}

function gh_path(): string
{
    $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
    $uri = is_string($uri) ? rawurldecode($uri) : '/';
    if (preg_match('#/api(?:/index\.php)?(/.*)?$#', $uri, $m)) {
        $rest = $m[1] ?? '/';
        return '/' . trim($rest, '/');
    }
    $rest = $_GET['r'] ?? '';
    return '/' . trim((string) $rest, '/');
}

function gh_method(): string
{
    return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
}

function gh_json(mixed $payload, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    gh_cors_headers();
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function gh_body(): array
{
    $raw = file_get_contents('php://input') ?: '';
    if ($raw === '') {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function gh_query(string $key, ?string $default = null): ?string
{
    $v = $_GET[$key] ?? $default;
    if ($v === null || $v === '') {
        return $default;
    }
    return is_string($v) ? trim($v) : $default;
}

function gh_client_ip(): string
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    return preg_match('/^[0-9a-fA-F:.]+$/', $ip) ? $ip : '0.0.0.0';
}

function gh_origin(): string
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (is_string($origin) && $origin !== '') {
        return $origin;
    }
    $host = $_SERVER['HTTP_HOST'] ?? '';
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['SERVER_PORT'] ?? '') === '443');
    return ($https ? 'https://' : 'http://') . $host;
}

function gh_allowed_origin(): ?string
{
    $cfg = gh_config();
    $app = trim((string) ($cfg['app_origin'] ?? ''));
    $host = $_SERVER['HTTP_HOST'] ?? '';
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['SERVER_PORT'] ?? '') === '443');
    $self = ($https ? 'https://' : 'http://') . $host;
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin === '') {
        return $self;
    }
    if ($origin === $self) {
        return $origin;
    }
    if ($app !== '' && $origin === rtrim($app, '/')) {
        return $origin;
    }
    return null;
}

function gh_cors_headers(): void
{
    $allowed = gh_allowed_origin();
    if ($allowed) {
        header('Access-Control-Allow-Origin: ' . $allowed);
        header('Access-Control-Allow-Credentials: true');
    }
    header('Access-Control-Allow-Headers: Authorization, Content-Type');
    header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
    header('Vary: Origin');
}

function gh_cors_preflight(): never
{
    gh_cors_headers();
    http_response_code(204);
    exit;
}

function gh_guard_origin(): void
{
    $method = gh_method();
    if (in_array($method, ['GET', 'HEAD', 'OPTIONS'], true)) {
        return;
    }
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $referer = $_SERVER['HTTP_REFERER'] ?? '';
    if ($origin === '' && $referer === '') {
        return;
    }
    if (gh_allowed_origin() === null) {
        gh_json(['error' => 'Origem não permitida.'], 403);
    }
}

function gh_str(mixed $v, int $max): string
{
    if (!is_string($v)) {
        return '';
    }
    $v = trim($v);
    if (strlen($v) > $max) {
        $v = substr($v, 0, $max);
    }
    return $v;
}

function gh_json_col(mixed $v): string
{
    if (is_string($v)) {
        $decoded = json_decode($v, true);
        if (is_array($decoded)) {
            return json_encode(array_values($decoded), JSON_UNESCAPED_UNICODE);
        }
    }
    if (!is_array($v)) {
        return '[]';
    }
    $clean = [];
    foreach ($v as $item) {
        if (is_string($item) && $item !== '') {
            $clean[] = mb_substr($item, 0, 240);
        }
    }
    return json_encode(array_values($clean), JSON_UNESCAPED_UNICODE);
}

function gh_json_arr(mixed $v): array
{
    if (is_array($v)) {
        return $v;
    }
    if (!is_string($v) || $v === '') {
        return [];
    }
    $d = json_decode($v, true);
    return is_array($d) ? $d : [];
}

function gh_bool(mixed $v, bool $default = false): int
{
    if ($v === null) {
        return $default ? 1 : 0;
    }
    return $v ? 1 : 0;
}

function gh_iso(?string $dt): ?string
{
    if (!$dt) {
        return null;
    }
    $t = strtotime($dt);
    return $t ? gmdate('Y-m-d\TH:i:s\Z', $t) : $dt;
}

function gh_exec(string $sql, array $params = []): PDOStatement
{
    $st = gh_pdo()->prepare($sql);
    $st->execute($params);
    return $st;
}

function gh_one(string $sql, array $params = []): ?array
{
    $row = gh_exec($sql, $params)->fetch();
    return $row === false ? null : $row;
}

function gh_all(string $sql, array $params = []): array
{
    return gh_exec($sql, $params)->fetchAll();
}

function gh_points(string $userId, int $delta): void
{
    gh_exec(
        'INSERT INTO user_points (user_id, pontos) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE pontos = GREATEST(pontos + ?, 0), updated_at = NOW()',
        [$userId, max($delta, 0), $delta]
    );
}

function gh_notify(string $userId, ?string $actorId, string $tipo, string $titulo, ?string $corpo, ?string $link): void
{
    if ($actorId && $actorId === $userId) {
        return;
    }
    gh_exec(
        'INSERT INTO notifications (id, user_id, actor_id, tipo, titulo, corpo, link) VALUES (?,?,?,?,?,?,?)',
        [gh_uuid(), $userId, $actorId, $tipo, mb_substr($titulo, 0, 160), $corpo, $link]
    );
}

function gh_map_autor(?array $row): ?array
{
    if (!$row) {
        return null;
    }
    return [
        'id' => $row['id'],
        'handle' => $row['handle'] ?? null,
        'nome' => $row['nome'] ?? 'Membro',
        'nome_profissional' => $row['nome_profissional'] ?? null,
        'avatar_url' => $row['avatar_url'] ?? null,
        'cidade' => $row['cidade'] ?? null,
        'estado' => $row['estado'] ?? null,
        'mostrar_cidade' => (bool) ($row['mostrar_cidade'] ?? 1),
        'perfil_publico' => (bool) ($row['perfil_publico'] ?? 0),
    ];
}

function gh_map_post(array $row): array
{
    $autor = [
        'id' => $row['a_id'] ?? $row['author_id'],
        'handle' => $row['a_handle'] ?? null,
        'nome' => $row['a_nome'] ?? 'Membro',
        'nome_profissional' => $row['a_nome_profissional'] ?? null,
        'avatar_url' => $row['a_avatar_url'] ?? null,
        'cidade' => $row['a_cidade'] ?? null,
        'estado' => $row['a_estado'] ?? null,
        'mostrar_cidade' => (bool) ($row['a_mostrar_cidade'] ?? 1),
        'perfil_publico' => (bool) ($row['a_perfil_publico'] ?? 0),
    ];
    return [
        'id' => $row['id'],
        'kind' => $row['kind'],
        'titulo' => $row['titulo'],
        'corpo' => $row['corpo'],
        'imagens' => gh_json_arr($row['imagens'] ?? '[]'),
        'created_at' => gh_iso($row['created_at']) ?? $row['created_at'],
        'likes_count' => (int) $row['likes_count'],
        'comments_count' => (int) $row['comments_count'],
        'group_id' => $row['group_id'] ?? null,
        'author_id' => $row['author_id'],
        'author' => $autor,
    ];
}

const GH_POST_SELECT = 'p.id, p.kind, p.titulo, p.corpo, p.imagens, p.created_at, p.likes_count, p.comments_count, p.group_id, p.author_id,
    a.id AS a_id, a.handle AS a_handle, a.nome AS a_nome, a.nome_profissional AS a_nome_profissional,
    a.avatar_url AS a_avatar_url, a.cidade AS a_cidade, a.estado AS a_estado,
    a.mostrar_cidade AS a_mostrar_cidade, a.perfil_publico AS a_perfil_publico';

function gh_map_profile(array $row): array
{
    return [
        'id' => $row['id'],
        'handle' => $row['handle'],
        'nome' => $row['nome'],
        'nome_profissional' => $row['nome_profissional'],
        'empresa' => $row['empresa'] ?? null,
        'cidade' => $row['cidade'],
        'estado' => $row['estado'],
        'bio' => $row['bio'],
        'experiencia' => $row['experiencia'],
        'especialidades' => gh_json_arr($row['especialidades'] ?? '[]'),
        'servicos' => gh_json_arr($row['servicos'] ?? '[]'),
        'avatar_url' => $row['avatar_url'],
        'capa_url' => $row['capa_url'] ?? null,
        'instagram' => $row['instagram'],
        'site' => $row['site'],
        'whatsapp' => $row['whatsapp'] ?? null,
        'telefone' => $row['telefone'],
        'perfil_publico' => (bool) $row['perfil_publico'],
        'mostrar_cidade' => (bool) $row['mostrar_cidade'],
        'mostrar_telefone' => (bool) $row['mostrar_telefone'],
        'mostrar_whatsapp' => (bool) $row['mostrar_whatsapp'],
        'mostrar_instagram' => (bool) $row['mostrar_instagram'],
        'mostrar_site' => (bool) $row['mostrar_site'],
        'permitir_mensagens' => (bool) $row['permitir_mensagens'],
        'suspenso' => (bool) $row['suspenso'],
        'created_at' => gh_iso($row['created_at'] ?? null),
    ];
}

function gh_token_from_request(): ?string
{
    $cfg = gh_config();
    $cookie = $cfg['cookie_name'] ?? 'gh_session';
    if (!empty($_COOKIE[$cookie]) && is_string($_COOKIE[$cookie])) {
        return $_COOKIE[$cookie];
    }
    $hdr = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (is_string($hdr) && preg_match('/^Bearer\s+(\S+)/i', $hdr, $m)) {
        return $m[1];
    }
    return null;
}

function gh_hash_token(string $token): string
{
    return hash('sha256', $token);
}

function gh_set_session_cookie(string $rawToken, int $days): void
{
    $cfg = gh_config();
    $name = $cfg['cookie_name'] ?? 'gh_session';
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['SERVER_PORT'] ?? '') === '443');
    setcookie($name, $rawToken, [
        'expires' => time() + ($days * 86400),
        'path' => '/',
        'secure' => $secure,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

function gh_clear_session_cookie(): void
{
    $cfg = gh_config();
    $name = $cfg['cookie_name'] ?? 'gh_session';
    setcookie($name, '', [
        'expires' => time() - 3600,
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

/** @return array{id:string,email:string}|null */
function gh_user(): ?array
{
    static $cached = false;
    static $user = null;
    if ($cached) {
        return $user;
    }
    $cached = true;
    $token = gh_token_from_request();
    if (!$token) {
        return null;
    }
    $row = gh_one(
        'SELECT u.id, u.email FROM sessions s
         JOIN users u ON u.id = s.user_id
         WHERE s.token_hash = ? AND s.expires_at > NOW() LIMIT 1',
        [gh_hash_token($token)]
    );
    $user = $row ? ['id' => $row['id'], 'email' => $row['email']] : null;
    return $user;
}

function gh_require_user(): array
{
    $u = gh_user();
    if (!$u) {
        gh_json(['error' => 'Entre na sua conta.'], 401);
    }
    $perfil = gh_one('SELECT suspenso FROM profiles WHERE id = ?', [$u['id']]);
    if ($perfil && (int) $perfil['suspenso'] === 1) {
        gh_json(['error' => 'Conta suspensa.'], 403);
    }
    return $u;
}

function gh_roles(string $userId): array
{
    $rows = gh_all('SELECT role FROM user_roles WHERE user_id = ?', [$userId]);
    return array_map(static fn ($r) => $r['role'], $rows);
}

function gh_is_staff(?string $userId): bool
{
    if (!$userId) {
        return false;
    }
    $roles = gh_roles($userId);
    return in_array('admin', $roles, true) || in_array('moderator', $roles, true);
}

function gh_create_session(string $userId): string
{
    $raw = bin2hex(random_bytes(32));
    $days = (int) (gh_config()['session_days'] ?? 30);
    gh_exec(
        'INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?,?,?, DATE_ADD(NOW(), INTERVAL ? DAY))',
        [gh_uuid(), $userId, gh_hash_token($raw), $days]
    );
    gh_set_session_cookie($raw, $days);
    return $raw;
}

function gh_session_payload(?string $token = null): array
{
    $user = gh_user();
    if (!$user) {
        return ['user' => null, 'perfil' => null, 'papeis' => [], 'pontos' => 0, 'token' => null];
    }
    $perfil = gh_one(
        'SELECT id, handle, nome, nome_profissional, avatar_url, cidade, estado, perfil_publico, suspenso FROM profiles WHERE id = ?',
        [$user['id']]
    );
    $pts = gh_one('SELECT pontos FROM user_points WHERE user_id = ?', [$user['id']]);
    return [
        'user' => $user,
        'perfil' => $perfil ? [
            'id' => $perfil['id'],
            'handle' => $perfil['handle'],
            'nome' => $perfil['nome'],
            'nome_profissional' => $perfil['nome_profissional'],
            'avatar_url' => $perfil['avatar_url'],
            'cidade' => $perfil['cidade'],
            'estado' => $perfil['estado'],
            'perfil_publico' => (bool) $perfil['perfil_publico'],
            'suspenso' => (bool) $perfil['suspenso'],
        ] : null,
        'papeis' => gh_roles($user['id']),
        'pontos' => (int) ($pts['pontos'] ?? 0),
        'token' => $token,
    ];
}

function gh_provision_user(string $id, string $email, string $nome): void
{
    $base = strtolower(preg_replace('/[^a-z0-9]/', '', explode('@', $email)[0] ?? 'm') ?: 'm');
    $handle = substr($base, 0, 10) . substr(str_replace('-', '', $id), 0, 6);
    $handle = substr($handle, 0, 24);
    $display = $nome !== '' ? $nome : ($base !== '' ? $base : 'Novo membro');
    gh_exec(
        'INSERT INTO profiles (id, handle, nome, especialidades, servicos, notificacoes)
         VALUES (?,?,?,?,?,?)',
        [$id, $handle, mb_substr($display, 0, 80), '[]', '[]', '{"curtidas":true,"comentarios":true,"respostas":true,"seguidores":true,"selos":true,"avisos":true}']
    );
    gh_exec('INSERT INTO user_roles (id, user_id, role) VALUES (?,?,?)', [gh_uuid(), $id, 'member']);
    gh_exec('INSERT INTO user_points (user_id, pontos) VALUES (?, 0)', [$id]);
}
