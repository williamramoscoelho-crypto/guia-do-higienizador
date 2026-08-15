<?php
declare(strict_types=1);

/**
 * Instalador / atualizador MySQL — Guia do Higienizador
 * URL: /api/instalar.php
 *
 * Segurança: exige install_key em config.php (ou na criação do config).
 * Não inventa dados; só aplica api/schema.sql (CREATE IF NOT EXISTS + INSERT IGNORE).
 */

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');

$configPath = __DIR__ . '/config.php';
$examplePath = __DIR__ . '/config.example.php';
$schemaPath = __DIR__ . '/schema.sql';
$hasConfig = is_file($configPath);

function gh_install_h(string $s): string
{
    return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function gh_install_load_config(): array
{
    global $configPath, $hasConfig;
    if (!$hasConfig) {
        return [];
    }
    $c = require $configPath;
    return is_array($c) ? $c : [];
}

function gh_install_write_config(array $data): string
{
    global $configPath;
    $export = var_export($data, true);
    $php = "<?php\ndeclare(strict_types=1);\n\n/** Gerado por instalar.php — não versionar. */\nreturn {$export};\n";
    if (file_put_contents($configPath, $php) === false) {
        return 'Não foi possível gravar api/config.php (permissão?).';
    }
    @chmod($configPath, 0600);
    return '';
}

function gh_install_pdo(array $c): PDO
{
    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=%s',
        $c['db_host'] ?? 'localhost',
        $c['db_name'],
        $c['db_charset'] ?? 'utf8mb4'
    );
    return new PDO($dsn, (string) $c['db_user'], (string) ($c['db_pass'] ?? ''), [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}

/** Divide schema.sql em statements executáveis (sem routines complexas). */
function gh_install_split_sql(string $sql): array
{
    $sql = preg_replace('/^\xEF\xBB\xBF/', '', $sql) ?? $sql;
    $lines = preg_split("/\r\n|\n|\r/", $sql) ?: [];
    $buf = '';
    $out = [];
    foreach ($lines as $line) {
        $trim = ltrim($line);
        if ($trim === '' || str_starts_with($trim, '--')) {
            continue;
        }
        $buf .= $line . "\n";
        if (str_ends_with(rtrim($line), ';')) {
            $stmt = trim($buf);
            $buf = '';
            if ($stmt !== '') {
                $out[] = $stmt;
            }
        }
    }
    $tail = trim($buf);
    if ($tail !== '') {
        $out[] = $tail;
    }
    return $out;
}

function gh_install_run_schema(PDO $pdo, string $schemaPath): array
{
    if (!is_file($schemaPath)) {
        return ['ok' => false, 'error' => 'schema.sql não encontrado em api/.', 'ran' => 0, 'tables' => []];
    }
    $raw = file_get_contents($schemaPath);
    if ($raw === false || $raw === '') {
        return ['ok' => false, 'error' => 'schema.sql vazio ou ilegível.', 'ran' => 0, 'tables' => []];
    }
    $stmts = gh_install_split_sql($raw);
    $ran = 0;
    try {
        foreach ($stmts as $stmt) {
            $pdo->exec($stmt);
            $ran++;
        }
    } catch (Throwable $e) {
        return [
            'ok' => false,
            'error' => 'Falha ao aplicar SQL: ' . $e->getMessage(),
            'ran' => $ran,
            'tables' => gh_install_list_tables($pdo),
        ];
    }
    return [
        'ok' => true,
        'error' => '',
        'ran' => $ran,
        'tables' => gh_install_list_tables($pdo),
    ];
}

function gh_install_list_tables(PDO $pdo): array
{
    try {
        $rows = $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_NUM);
        return array_map(static fn ($r) => (string) $r[0], $rows);
    } catch (Throwable $e) {
        return [];
    }
}

function gh_install_check_key(array $cfg, string $posted): bool
{
    $expected = (string) ($cfg['install_key'] ?? '');
    if ($expected === '' || $posted === '') {
        return false;
    }
    return hash_equals($expected, $posted);
}

/**
 * Se o config antigo não tem install_key, permite definir uma vez (grava no arquivo).
 */
function gh_install_set_key_if_missing(string $configPath, array &$cfg, string $newKey): string
{
    if (!empty($cfg['install_key'])) {
        return '';
    }
    if (strlen($newKey) < 8) {
        return 'Defina uma install_key com pelo menos 8 caracteres (seu config ainda não tem essa chave).';
    }
    $cfg['install_key'] = $newKey;
    $export = var_export($cfg, true);
    $php = "<?php\ndeclare(strict_types=1);\n\n/** Atualizado por instalar.php — não versionar. */\nreturn {$export};\n";
    if (file_put_contents($configPath, $php) === false) {
        return 'Não foi possível gravar install_key em config.php.';
    }
    @chmod($configPath, 0600);
    return '';
}

$cfg = gh_install_load_config();
$flash = '';
$flashOk = false;
$tables = [];
$resultMeta = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = (string) ($_POST['action'] ?? '');

    if ($action === 'criar_config_e_instalar') {
        $installKey = trim((string) ($_POST['install_key'] ?? ''));
        $dbName = trim((string) ($_POST['db_name'] ?? ''));
        $dbUser = trim((string) ($_POST['db_user'] ?? ''));
        $dbPass = (string) ($_POST['db_pass'] ?? '');
        $dbHost = trim((string) ($_POST['db_host'] ?? 'localhost')) ?: 'localhost';
        $origin = trim((string) ($_POST['app_origin'] ?? ''));
        if ($installKey === '' || strlen($installKey) < 8) {
            $flash = 'Defina uma senha de instalação com pelo menos 8 caracteres.';
        } elseif ($dbName === '' || $dbUser === '') {
            $flash = 'Informe nome do banco e usuário MySQL.';
        } elseif ($hasConfig) {
            $flash = 'config.php já existe. Use “Atualizar banco” com a install_key.';
        } else {
            $data = [
                'db_host' => $dbHost,
                'db_name' => $dbName,
                'db_user' => $dbUser,
                'db_pass' => $dbPass,
                'db_charset' => 'utf8mb4',
                'app_origin' => $origin !== '' ? $origin : 'https://guiadohigienizador.autolimpezapro.com.br',
                'cookie_name' => 'gh_session',
                'session_days' => 30,
                'install_key' => $installKey,
                'ia_provider' => 'auto',
                'gemini_api_key' => '',
                'gemini_model' => 'gemini-2.0-flash',
                'openai_api_key' => '',
                'openai_model' => 'gpt-4o',
                'ia_limit_per_hour' => 20,
            ];
            $err = gh_install_write_config($data);
            if ($err !== '') {
                $flash = $err;
            } else {
                $hasConfig = true;
                $cfg = $data;
                try {
                    $pdo = gh_install_pdo($data);
                    $resultMeta = gh_install_run_schema($pdo, $schemaPath);
                    $tables = $resultMeta['tables'];
                    if ($resultMeta['ok']) {
                        $flashOk = true;
                        $flash = 'Config criado e banco instalado/atualizado (' . $resultMeta['ran'] . ' comandos). Guarde a install_key.';
                    } else {
                        $flash = $resultMeta['error'];
                    }
                } catch (Throwable $e) {
                    $flash = 'Config gravado, mas falhou a conexão MySQL: ' . $e->getMessage();
                }
            }
        }
    } elseif ($action === 'atualizar_banco' || $action === 'instalar_banco') {
        $key = (string) ($_POST['install_key'] ?? '');
        if (!$hasConfig) {
            $flash = 'Ainda não há config.php. Use o formulário de primeira instalação.';
        } else {
            if (empty($cfg['install_key'])) {
                $setErr = gh_install_set_key_if_missing($configPath, $cfg, $key);
                if ($setErr !== '') {
                    $flash = $setErr;
                    goto render;
                }
                $flashOk = true;
                $flash = 'install_key gravada no config.php. Clique de novo em Instalar/Atualizar com a mesma senha.';
                goto render;
            }
            if (!gh_install_check_key($cfg, $key)) {
                $flash = 'Senha de instalação incorreta (install_key).';
            } else {
                try {
                    $pdo = gh_install_pdo($cfg);
                    $resultMeta = gh_install_run_schema($pdo, $schemaPath);
                    $tables = $resultMeta['tables'];
                    if ($resultMeta['ok']) {
                        $flashOk = true;
                        $label = $action === 'instalar_banco' ? 'Instalação' : 'Atualização';
                        $flash = $label . ' concluída: ' . $resultMeta['ran'] . ' comandos SQL. Tabelas: ' . count($tables) . '.';
                    } else {
                        $flash = $resultMeta['error'];
                    }
                } catch (Throwable $e) {
                    $flash = 'Falha de conexão MySQL: ' . $e->getMessage();
                }
            }
        }
    } elseif ($action === 'status') {
        $key = (string) ($_POST['install_key'] ?? '');
        if (!$hasConfig) {
            $flash = 'Ainda não há config.php.';
        } elseif (empty($cfg['install_key'])) {
            $setErr = gh_install_set_key_if_missing($configPath, $cfg, $key);
            $flash = $setErr !== '' ? $setErr : 'install_key gravada. Use Ver status de novo.';
            $flashOk = $setErr === '';
        } elseif (!gh_install_check_key($cfg, $key)) {
            $flash = 'Senha de instalação incorreta (install_key).';
        } else {
            try {
                $pdo = gh_install_pdo($cfg);
                $tables = gh_install_list_tables($pdo);
                $flashOk = true;
                $flash = 'Conexão OK. ' . count($tables) . ' tabelas no banco.';
            } catch (Throwable $e) {
                $flash = 'Falha de conexão MySQL: ' . $e->getMessage();
            }
        }
    } else {
        $flash = 'Ação desconhecida.';
    }
}

render:
$expectedTables = [
    'users', 'sessions', 'profiles', 'posts', 'groups', 'search_misses', 'ia_rate_limits', 'reports',
];
$keyHint = $hasConfig
    ? (!empty($cfg['install_key']) ? 'já definida no config.php' : 'ainda NÃO definida — digite uma nova (mín. 8) e clique Instalar')
    : 'ainda não definida';
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Instalar / atualizar banco — Guia do Higienizador</title>
  <style>
    :root { color-scheme: dark; --bg:#0A1620; --card:#12202c; --fg:#e8f1f7; --muted:#8aa0b2; --primary:#1EB8F5; --ok:#3dd68c; --bad:#f07178; --bd:#243544; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui, sans-serif; background: var(--bg); color: var(--fg); line-height: 1.45; }
    main { max-width: 36rem; margin: 0 auto; padding: 1.5rem 1rem 3rem; }
    h1 { font-size: 1.35rem; margin: 0 0 .35rem; }
    p, li { color: var(--muted); font-size: .95rem; }
    .card { background: var(--card); border: 1px solid var(--bd); border-radius: 1rem; padding: 1rem 1.1rem; margin-top: 1rem; }
    label { display: block; font-size: .8rem; font-weight: 600; margin: .75rem 0 .25rem; color: var(--fg); }
    input { width: 100%; min-height: 2.75rem; border-radius: .75rem; border: 1px solid var(--bd); background: var(--bg); color: var(--fg); padding: 0 .85rem; }
    .row { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: 1rem; }
    button { min-height: 2.75rem; border: 0; border-radius: 999px; padding: 0 1.1rem; font-weight: 700; cursor: pointer; background: var(--primary); color: #042033; }
    button.secondary { background: transparent; color: var(--fg); border: 1px solid var(--bd); }
    .flash { margin-top: 1rem; padding: .85rem 1rem; border-radius: .85rem; border: 1px solid var(--bd); }
    .flash.ok { border-color: color-mix(in srgb, var(--ok) 50%, var(--bd)); color: var(--ok); }
    .flash.bad { border-color: color-mix(in srgb, var(--bad) 50%, var(--bd)); color: var(--bad); }
    code { font-size: .85em; color: var(--primary); }
    ul.tables { columns: 2; gap: 1rem; margin: .5rem 0 0; padding-left: 1.1rem; }
    .warn { font-size: .85rem; color: #e6c07b; }
  </style>
</head>
<body>
  <main>
    <h1>Banco MySQL — 1 clique</h1>
    <p>Guia do Higienizador. Aplica <code>api/schema.sql</code> com segurança (<code>IF NOT EXISTS</code> / <code>INSERT IGNORE</code>). Não apaga dados existentes.</p>

    <?php if ($flash !== ''): ?>
      <div class="flash <?= $flashOk ? 'ok' : 'bad' ?>" role="status"><?= gh_install_h($flash) ?></div>
    <?php endif; ?>

    <?php if (!$hasConfig): ?>
      <div class="card">
        <p><strong>Primeira instalação</strong> — o MySQL já precisa existir no cPanel (banco + usuário com privilégios). Este formulário grava <code>config.php</code> e cria as tabelas.</p>
        <form method="post" autocomplete="off">
          <input type="hidden" name="action" value="criar_config_e_instalar" />
          <label for="db_host">Host MySQL</label>
          <input id="db_host" name="db_host" value="localhost" required />
          <label for="db_name">Nome do banco</label>
          <input id="db_name" name="db_name" placeholder="will3269_GUIA" required />
          <label for="db_user">Usuário</label>
          <input id="db_user" name="db_user" placeholder="will3269_..." required />
          <label for="db_pass">Senha MySQL</label>
          <input id="db_pass" name="db_pass" type="password" />
          <label for="app_origin">URL do site</label>
          <input id="app_origin" name="app_origin" value="https://guiadohigienizador.autolimpezapro.com.br" />
          <label for="install_key">Senha do instalador (guarde)</label>
          <input id="install_key" name="install_key" type="password" minlength="8" required placeholder="mín. 8 caracteres" />
          <p class="warn">Depois de instalar, use a mesma senha em “Atualizar banco”. Não compartilhe esta página.</p>
          <div class="row">
            <button type="submit">Instalar em 1 clique</button>
          </div>
        </form>
      </div>
    <?php else: ?>
      <div class="card">
        <p><strong>config.php</strong> encontrado. Senha do instalador: <?= gh_install_h($keyHint) ?>.</p>
        <form method="post" autocomplete="off">
          <label for="install_key">Senha do instalador (<code>install_key</code>)</label>
          <input id="install_key" name="install_key" type="password" required />
          <div class="row">
            <button type="submit" name="action" value="instalar_banco">Instalar banco</button>
            <button type="submit" name="action" value="atualizar_banco" class="secondary">Atualizar banco</button>
            <button type="submit" name="action" value="status" class="secondary">Ver status</button>
          </div>
        </form>
        <p style="margin-top:1rem;font-size:.85rem">Os dois botões aplicam o mesmo <code>schema.sql</code> atual. Seguro em banco já populado.</p>
      </div>
    <?php endif; ?>

    <?php if ($tables): ?>
      <div class="card">
        <p><strong>Tabelas (<?= count($tables) ?>)</strong></p>
        <ul class="tables">
          <?php foreach ($tables as $t): ?>
            <li><?= gh_install_h($t) ?></li>
          <?php endforeach; ?>
        </ul>
        <?php
          $missing = array_values(array_filter($expectedTables, static fn ($t) => !in_array($t, $tables, true)));
        ?>
        <?php if ($missing): ?>
          <p class="warn">Faltando: <?= gh_install_h(implode(', ', $missing)) ?></p>
        <?php elseif ($flashOk): ?>
          <p style="color:var(--ok)">Principais tabelas OK (inclui <code>search_misses</code> se o schema estiver atual).</p>
        <?php endif; ?>
      </div>
    <?php endif; ?>

    <div class="card">
      <p><strong>Depois</strong></p>
      <ul>
        <li>Teste <a href="health" style="color:var(--primary)">/api/health</a> → <code>db: true</code></li>
        <li>Opcional: apague ou renomeie <code>instalar.php</code> após usar</li>
        <li>IA: preencha chaves em <code>config.php</code></li>
      </ul>
      <?php if (!$hasConfig && is_file($examplePath)): ?>
        <p>Também pode copiar <code>config.example.php</code> → <code>config.php</code> manualmente e voltar aqui.</p>
      <?php endif; ?>
    </div>
  </main>
</body>
</html>
