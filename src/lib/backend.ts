/**
 * Qual backend a SPA usa: PHP (HostGator, padrão) ou Supabase (opt-in).
 *
 * VITE_API_URL padrão `/api` — mesmo origin no cPanel, sem CORS.
 * VITE_USE_SUPABASE=1 força o caminho antigo (Lovable / local).
 */
import { isSupabaseConfigured } from "@/integrations/supabase/client";

export function phpApiBase(): string {
  const raw = String(import.meta.env["VITE_API_URL"] ?? "/api").trim();
  if (!raw || raw === "0" || raw === "off" || raw === "false") return "";
  return raw.replace(/\/$/, "");
}

export function usesPhpApi(): boolean {
  if (String(import.meta.env["VITE_USE_SUPABASE"] ?? "").trim() === "1") return false;
  return phpApiBase() !== "";
}

/** Login, comunidade e telas que hoje dependiam do Supabase. */
export function isCommunityEnabled(): boolean {
  return usesPhpApi() || isSupabaseConfigured();
}

export function isIaEnabled(): boolean {
  if (String(import.meta.env["VITE_IA_API_URL"] ?? "").trim()) return true;
  return usesPhpApi() || isSupabaseConfigured();
}
