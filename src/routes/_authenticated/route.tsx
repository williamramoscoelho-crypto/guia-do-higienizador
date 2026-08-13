import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (!isSupabaseConfigured()) throw redirect({ to: "/auth", search: { modo: "entrar" } });
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth", search: { modo: "entrar" } });
    return { user: data.user };
  },
  component: () => <Outlet />,
});
