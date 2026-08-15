/**
 * Qual backend a SPA usa: PHP (HostGator, padrão) ou Supabase (opt-in).
 *
 * Reexporta flags leves — sem importar `@supabase/supabase-js`.
 */
export {
  phpApiBase,
  usesPhpApi,
  hasSupabaseEnv,
  isCommunityEnabled,
  isIaEnabled,
} from "@/lib/flags";
