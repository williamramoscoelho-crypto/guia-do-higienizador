import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { apiSessao } from "@/lib/api";
import { isCommunityEnabled, usesPhpApi } from "@/lib/backend";
import { hasSupabaseEnv } from "@/lib/flags";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (!isCommunityEnabled()) throw redirect({ to: "/" });
    if (usesPhpApi()) {
      const s = await apiSessao().catch(() => null);
      if (!s?.user) throw redirect({ to: "/auth", search: { modo: "entrar" } });
      return { user: s.user };
    }
    if (!hasSupabaseEnv()) throw redirect({ to: "/" });
    const { supabase } = await import("@/integrations/supabase/client");
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth", search: { modo: "entrar" } });
    return { user: data.user };
  },
  component: () => <Outlet />,
});
