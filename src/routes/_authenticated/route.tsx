import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { apiSessao } from "@/lib/api";
import { isCommunityEnabled, usesPhpApi } from "@/lib/backend";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (!isCommunityEnabled()) throw redirect({ to: "/" });
    if (usesPhpApi()) {
      const s = await apiSessao().catch(() => null);
      if (!s?.user) throw redirect({ to: "/auth", search: { modo: "entrar" } });
      return { user: s.user };
    }
    if (!isSupabaseConfigured()) throw redirect({ to: "/" });
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth", search: { modo: "entrar" } });
    return { user: data.user };
  },
  component: () => <Outlet />,
});
