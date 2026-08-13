<?php
declare(strict_types=1);

/**
 * Fallback para hospedagem Apache/cPanel sem Node.
 * Serve HTML pré-renderizado; se a URL não existir, entrega o shell SPA.
 */
$root = realpath(__DIR__);
if ($root === false) {
    http_response_code(500);
    exit('Configuração inválida.');
}

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$path = is_string($path) ? rawurldecode($path) : '/';
$rel = ltrim($path, '/');

if (str_contains($rel, '..') || str_contains($rel, "\0")) {
    http_response_code(400);
    exit('Requisição inválida.');
}

$candidates = [];
if ($rel === '') {
    $candidates[] = $root . DIRECTORY_SEPARATOR . 'index.html';
} else {
    $normalized = str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $rel);
    $candidates[] = $root . DIRECTORY_SEPARATOR . $normalized;
    $candidates[] = $root . DIRECTORY_SEPARATOR . $normalized . DIRECTORY_SEPARATOR . 'index.html';
    $candidates[] = $root . DIRECTORY_SEPARATOR . rtrim($normalized, DIRECTORY_SEPARATOR) . '.html';
}

foreach ($candidates as $candidate) {
    $real = realpath($candidate);
    if ($real === false || !is_file($real) || !str_starts_with($real, $root)) {
        continue;
    }
    if (preg_match('/\.(php|phtml|phar)$/i', $real)) {
        continue;
    }
    $ext = strtolower(pathinfo($real, PATHINFO_EXTENSION));
    $types = [
        'html' => 'text/html; charset=utf-8',
        'css' => 'text/css; charset=utf-8',
        'js' => 'application/javascript; charset=utf-8',
        'json' => 'application/json; charset=utf-8',
        'svg' => 'image/svg+xml',
        'webmanifest' => 'application/manifest+json',
        'txt' => 'text/plain; charset=utf-8',
        'xml' => 'application/xml; charset=utf-8',
        'woff2' => 'font/woff2',
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'webp' => 'image/webp',
        'ico' => 'image/x-icon',
    ];
    header('Content-Type: ' . ($types[$ext] ?? 'application/octet-stream'));
    readfile($real);
    exit;
}

$shell = $root . DIRECTORY_SEPARATOR . '_shell.html';
$home = $root . DIRECTORY_SEPARATOR . 'index.html';
$file = is_file($home) ? $home : $shell;

if (!is_file($file)) {
    http_response_code(500);
    exit('Pacote incompleto: index.html não encontrado.');
}

header('Content-Type: text/html; charset=utf-8');
readfile($file);
