<?php
declare(strict_types=1);

/**
 * Front controller da API do Guia do Higienizador.
 * SPA + API no mesmo origin: /api/...
 */

require __DIR__ . '/lib/bootstrap.php';
require __DIR__ . '/lib/auth.php';
require __DIR__ . '/lib/community.php';
require __DIR__ . '/lib/ia.php';

$method = gh_method();
$path = gh_path();
if ($path === '') {
    $path = '/';
}

if ($method === 'OPTIONS') {
    gh_cors_preflight();
}

gh_guard_origin();

if ($path === '/health' && $method === 'GET') {
    $cfg = gh_configured();
    $ia = $cfg && gh_ia_configured();
    $provider = $cfg ? gh_ia_provider() : '';
    $db = false;
    if ($cfg) {
        try {
            gh_pdo()->query('SELECT 1');
            $db = true;
        } catch (Throwable $e) {
            $db = false;
        }
    }
    gh_json([
        'ok' => $cfg && $db,
        'service' => 'guia-do-higienizador',
        'db' => $db,
        'ia' => $ia,
        'ia_provider' => $provider !== '' ? $provider : null,
        'hint' => $cfg ? null : 'Copie config.example.php para config.php e importe schema.sql.',
    ], $cfg && $db ? 200 : 503);
}

try {
    if ($path === '/auth/signup' && $method === 'POST') {
        gh_auth_signup();
    }
    if ($path === '/auth/login' && $method === 'POST') {
        gh_auth_login();
    }
    if ($path === '/auth/logout' && $method === 'POST') {
        gh_auth_logout();
    }
    if ($path === '/auth/session' && $method === 'GET') {
        gh_auth_session();
    }
    if ($path === '/auth/forgot' && $method === 'POST') {
        gh_auth_forgot();
    }
    if ($path === '/auth/reset' && $method === 'POST') {
        gh_auth_reset();
    }

    if ($path === '/me' && $method === 'GET') {
        gh_me_get();
    }
    if ($path === '/me' && $method === 'PATCH') {
        gh_me_patch();
    }

    if ($path === '/posts' && $method === 'GET') {
        gh_posts_list();
    }
    if ($path === '/posts' && $method === 'POST') {
        gh_posts_create();
    }
    if (preg_match('#^/posts/([0-9a-f-]{36})$#i', $path, $m) && $method === 'GET') {
        gh_posts_get($m[1]);
    }
    if (preg_match('#^/posts/([0-9a-f-]{36})/like$#i', $path, $m) && $method === 'POST') {
        gh_post_like($m[1], true);
    }
    if (preg_match('#^/posts/([0-9a-f-]{36})/like$#i', $path, $m) && $method === 'DELETE') {
        gh_post_like($m[1], false);
    }
    if (preg_match('#^/posts/([0-9a-f-]{36})/save$#i', $path, $m) && $method === 'POST') {
        gh_post_save($m[1], true);
    }
    if (preg_match('#^/posts/([0-9a-f-]{36})/save$#i', $path, $m) && $method === 'DELETE') {
        gh_post_save($m[1], false);
    }
    if (preg_match('#^/posts/([0-9a-f-]{36})/comments$#i', $path, $m) && $method === 'GET') {
        gh_comments_list($m[1]);
    }
    if (preg_match('#^/posts/([0-9a-f-]{36})/comments$#i', $path, $m) && $method === 'POST') {
        gh_comments_create($m[1]);
    }

    if ($path === '/interactions' && $method === 'GET') {
        gh_interactions();
    }
    if ($path === '/saves' && $method === 'GET') {
        gh_saves_list();
    }

    if ($path === '/questions' && $method === 'GET') {
        gh_questions_list();
    }
    if ($path === '/questions' && $method === 'POST') {
        gh_questions_create();
    }
    if (preg_match('#^/questions/([0-9a-f-]{36})$#i', $path, $m) && $method === 'GET') {
        gh_questions_get($m[1]);
    }
    if (preg_match('#^/questions/([0-9a-f-]{36})/answers$#i', $path, $m) && $method === 'GET') {
        gh_answers_list($m[1]);
    }
    if (preg_match('#^/questions/([0-9a-f-]{36})/answers$#i', $path, $m) && $method === 'POST') {
        gh_answers_create($m[1]);
    }
    if (preg_match('#^/answers/([0-9a-f-]{36})/best$#i', $path, $m) && $method === 'POST') {
        gh_answer_best($m[1]);
    }

    if ($path === '/groups' && $method === 'GET') {
        gh_groups_list();
    }
    if (preg_match('#^/groups/([a-z0-9-]+)$#', $path, $m) && $method === 'GET') {
        gh_groups_get($m[1]);
    }
    if (preg_match('#^/groups/([0-9a-f-]{36})/join$#i', $path, $m) && $method === 'POST') {
        gh_groups_join($m[1], true);
    }
    if (preg_match('#^/groups/([0-9a-f-]{36})/join$#i', $path, $m) && $method === 'DELETE') {
        gh_groups_join($m[1], false);
    }

    if ($path === '/profiles' && $method === 'GET') {
        gh_profiles_list();
    }
    if (preg_match('#^/profiles/handle/([a-z0-9_.]{3,24})$#', $path, $m) && $method === 'GET') {
        gh_profiles_handle($m[1]);
    }
    if (preg_match('#^/profiles/([0-9a-f-]{36})/follow$#i', $path, $m) && $method === 'POST') {
        gh_follow($m[1], true);
    }
    if (preg_match('#^/profiles/([0-9a-f-]{36})/follow$#i', $path, $m) && $method === 'DELETE') {
        gh_follow($m[1], false);
    }
    if (preg_match('#^/points/([0-9a-f-]{36})$#i', $path, $m) && $method === 'GET') {
        gh_points_get($m[1]);
    }

    if ($path === '/notifications' && $method === 'GET') {
        gh_notifications_list();
    }
    if ($path === '/notifications/unread' && $method === 'GET') {
        gh_notifications_unread();
    }
    if ($path === '/notifications/read' && $method === 'POST') {
        gh_notifications_read();
    }

    if ($path === '/reports' && $method === 'GET') {
        gh_reports_list();
    }
    if ($path === '/reports' && $method === 'POST') {
        gh_reports_create();
    }
    if (preg_match('#^/reports/([0-9a-f-]{36})$#i', $path, $m) && $method === 'PATCH') {
        gh_reports_status($m[1]);
    }
    if ($path === '/moderation/hide' && $method === 'POST') {
        gh_moderation_hide();
    }

    if ($path === '/ia' && $method === 'POST') {
        gh_ia();
    }
} catch (PDOException $e) {
    gh_json(['error' => 'Falha no banco de dados.'], 500);
} catch (Throwable $e) {
    gh_json(['error' => 'Erro interno da API.'], 500);
}

gh_json(['error' => 'Não encontrado.'], 404);
