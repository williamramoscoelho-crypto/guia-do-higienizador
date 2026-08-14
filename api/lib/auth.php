<?php
declare(strict_types=1);

function gh_auth_signup(): void
{
    $b = gh_body();
    $email = strtolower(gh_str($b['email'] ?? '', 255));
    $senha = is_string($b['password'] ?? $b['senha'] ?? null) ? (string) ($b['password'] ?? $b['senha']) : '';
    $nome = gh_str($b['nome'] ?? '', 80);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        gh_json(['error' => 'Informe um e-mail válido.'], 400);
    }
    if (strlen($senha) < 8 || strlen($senha) > 72) {
        gh_json(['error' => 'A senha precisa ter ao menos 8 caracteres.'], 400);
    }
    $existe = gh_one('SELECT id FROM users WHERE email = ?', [$email]);
    if ($existe) {
        gh_json(['error' => 'Já existe uma conta com este e-mail.'], 409);
    }
    $id = gh_uuid();
    gh_exec('INSERT INTO users (id, email, password_hash) VALUES (?,?,?)', [
        $id,
        $email,
        password_hash($senha, PASSWORD_DEFAULT),
    ]);
    gh_provision_user($id, $email, $nome);
    $token = gh_create_session($id);
    gh_json(gh_session_payload($token), 201);
}

function gh_auth_login(): void
{
    $b = gh_body();
    $email = strtolower(gh_str($b['email'] ?? '', 255));
    $senha = is_string($b['password'] ?? $b['senha'] ?? null) ? (string) ($b['password'] ?? $b['senha']) : '';
    $row = gh_one('SELECT id, password_hash FROM users WHERE email = ?', [$email]);
    if (!$row || !password_verify($senha, $row['password_hash'])) {
        gh_json(['error' => 'E-mail ou senha incorretos.'], 401);
    }
    $token = gh_create_session($row['id']);
    gh_json(gh_session_payload($token));
}

function gh_auth_logout(): void
{
    $token = gh_token_from_request();
    if ($token) {
        gh_exec('DELETE FROM sessions WHERE token_hash = ?', [gh_hash_token($token)]);
    }
    gh_clear_session_cookie();
    gh_json(['ok' => true]);
}

function gh_auth_session(): void
{
    $token = gh_token_from_request();
    gh_json(gh_session_payload($token));
}

function gh_auth_forgot(): void
{
    $email = strtolower(gh_str(gh_body()['email'] ?? '', 255));
    $user = filter_var($email, FILTER_VALIDATE_EMAIL)
        ? gh_one('SELECT id, email FROM users WHERE email = ?', [$email])
        : null;
    if ($user) {
        $raw = bin2hex(random_bytes(24));
        gh_exec(
            'INSERT INTO password_resets (id, user_id, token_hash, expires_at) VALUES (?,?,?, DATE_ADD(NOW(), INTERVAL 2 HOUR))',
            [gh_uuid(), $user['id'], gh_hash_token($raw)]
        );
        $origin = rtrim((string) (gh_config()['app_origin'] ?? ''), '/') ?: gh_origin();
        $link = $origin . '/auth?modo=recuperar&token=' . urlencode($raw);
        $assunto = 'Redefinir senha — Guia do Higienizador';
        $corpo = "Olá,\n\nPara redefinir sua senha, abra este link (válido por 2 horas):\n$link\n\nSe você não pediu isso, ignore este e-mail.\n";
        $fromHost = $_SERVER['HTTP_HOST'] ?? 'localhost';
        @mail(
            $user['email'],
            $assunto,
            $corpo,
            'From: noreply@' . $fromHost . "\r\nContent-Type: text/plain; charset=utf-8"
        );
    }
    gh_json(['ok' => true, 'message' => 'Se o e-mail existir, enviamos um link de redefinição.']);
}

function gh_auth_reset(): void
{
    $b = gh_body();
    $token = gh_str($b['token'] ?? '', 128);
    $senha = is_string($b['password'] ?? $b['senha'] ?? null) ? (string) ($b['password'] ?? $b['senha']) : '';
    if ($token === '' || strlen($senha) < 8 || strlen($senha) > 72) {
        gh_json(['error' => 'Token ou senha inválidos.'], 400);
    }
    $row = gh_one(
        'SELECT id, user_id FROM password_resets WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW()',
        [gh_hash_token($token)]
    );
    if (!$row) {
        gh_json(['error' => 'Link expirado ou inválido. Peça um novo.'], 400);
    }
    gh_exec('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash($senha, PASSWORD_DEFAULT), $row['user_id']]);
    gh_exec('UPDATE password_resets SET used_at = NOW() WHERE id = ?', [$row['id']]);
    gh_exec('DELETE FROM sessions WHERE user_id = ?', [$row['user_id']]);
    $sess = gh_create_session($row['user_id']);
    gh_json(gh_session_payload($sess));
}

function gh_me_get(): void
{
    $u = gh_require_user();
    $perfil = gh_one('SELECT * FROM profiles WHERE id = ?', [$u['id']]);
    if (!$perfil) {
        gh_json(['error' => 'Perfil não encontrado.'], 404);
    }
    gh_json(gh_map_profile($perfil));
}

function gh_me_patch(): void
{
    $u = gh_require_user();
    $b = gh_body();
    $nome = gh_str($b['nome'] ?? '', 80);
    $handle = strtolower(gh_str($b['handle'] ?? '', 24));
    if (strlen($nome) < 2) {
        gh_json(['error' => 'Informe seu nome.'], 400);
    }
    if (!preg_match('/^[a-z0-9_.]{3,24}$/', $handle)) {
        gh_json(['error' => 'Use de 3 a 24 caracteres: letras, números, ponto ou _.'], 400);
    }
    $taken = gh_one('SELECT id FROM profiles WHERE handle = ? AND id <> ?', [$handle, $u['id']]);
    if ($taken) {
        gh_json(['error' => 'Este nome de usuário já está em uso.'], 409);
    }
    $esp = $b['especialidades'] ?? [];
    if (!is_array($esp)) {
        $esp = [];
    }
    $esp = array_slice(array_values(array_filter($esp, 'is_string')), 0, 8);
    gh_exec(
        'UPDATE profiles SET
            nome = ?, handle = ?, nome_profissional = ?, bio = ?, cidade = ?, estado = ?,
            telefone = ?, instagram = ?, site = ?, experiencia = ?, especialidades = ?,
            perfil_publico = ?, mostrar_cidade = ?, mostrar_telefone = ?, mostrar_whatsapp = ?,
            mostrar_instagram = ?, mostrar_site = ?, permitir_mensagens = ?
         WHERE id = ?',
        [
            $nome,
            $handle,
            gh_str($b['nome_profissional'] ?? '', 80) ?: null,
            gh_str($b['bio'] ?? '', 400) ?: null,
            gh_str($b['cidade'] ?? '', 60) ?: null,
            strtoupper(gh_str($b['estado'] ?? '', 2)) ?: null,
            gh_str($b['telefone'] ?? '', 20) ?: null,
            gh_str($b['instagram'] ?? '', 40) ?: null,
            gh_str($b['site'] ?? '', 120) ?: null,
            gh_str($b['experiencia'] ?? '', 40) ?: null,
            gh_json_col($esp),
            gh_bool($b['perfil_publico'] ?? false),
            gh_bool($b['mostrar_cidade'] ?? true, true),
            gh_bool($b['mostrar_telefone'] ?? false),
            gh_bool($b['mostrar_whatsapp'] ?? false),
            gh_bool($b['mostrar_instagram'] ?? true, true),
            gh_bool($b['mostrar_site'] ?? true, true),
            gh_bool($b['permitir_mensagens'] ?? true, true),
            $u['id'],
        ]
    );
    $perfil = gh_one('SELECT * FROM profiles WHERE id = ?', [$u['id']]);
    gh_json(gh_map_profile($perfil ?? ['id' => $u['id'], 'nome' => $nome, 'handle' => $handle]));
}
