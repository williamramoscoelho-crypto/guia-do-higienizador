/**
 * Flags de ambiente sem dependências pesadas (Supabase, API, catálogo IA).
 * Usar na home e na nav para não puxar chunks grandes no primeiro paint.
 */

export function phpApiBase(): string {
  const raw = String(import.meta.env["VITE_API_URL"] ?? "/api").trim();
  if (!raw || raw === "0" || raw === "off" || raw === "false") return "";
  return raw.replace(/\/$/, "");
}

export function usesPhpApi(): boolean {
  if (String(import.meta.env["VITE_USE_SUPABASE"] ?? "").trim() === "1") return false;
  return phpApiBase() !== "";
}

export function hasSupabaseEnv(): boolean {
  const url = String(import.meta.env["VITE_SUPABASE_URL"] ?? "").trim();
  const key = String(import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ?? "").trim();
  return Boolean(url && key);
}

/** Login, comunidade e telas que dependem de backend de conta. */
export function isCommunityEnabled(): boolean {
  return usesPhpApi() || hasSupabaseEnv();
}

export function isIaEnabled(): boolean {
  if (String(import.meta.env["VITE_IA_API_URL"] ?? "").trim()) return true;
  return usesPhpApi() || hasSupabaseEnv();
}

export function iaConfigurada(): boolean {
  try {
    return isIaEnabled();
  } catch {
    return false;
  }
}
