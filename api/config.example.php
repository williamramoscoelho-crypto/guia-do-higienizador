<?php
declare(strict_types=1);

/**
 * Copie para config.php (gitignored) e preencha.
 * HostGator: host costuma ser localhost.
 * Chaves flat — bootstrap.php lê db_host, db_name, db_user, db_pass.
 *
 * IA: preencha gemini_api_key e/ou openai_api_key (nunca no frontend).
 * ia_provider: auto | gemini | openai  (auto = Gemini se houver chave, senão OpenAI)
 */
return [
    'db_host' => 'localhost',
    'db_name' => 'will3269_SEU_BANCO',
    'db_user' => 'will3269_SEU_USUARIO',
    'db_pass' => '',
    'db_charset' => 'utf8mb4',

    /** Senha da página /api/instalar.php (mín. 8 caracteres). Troque. */
    'install_key' => 'troque-esta-senha-agora',

    'app_origin' => 'https://guiadohigienizador.autolimpezapro.com.br',
    'cookie_name' => 'gh_session',
    'session_days' => 30,

    'ia_provider' => 'auto',
    'gemini_api_key' => '',
    'gemini_model' => 'gemini-2.0-flash',
    'openai_api_key' => '',
    'openai_model' => 'gpt-4o',
    'ia_limit_per_hour' => 20,
];
