import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";

import { Avatar } from "@/components/app/community";
import { supabase } from "@/integrations/supabase/client";
import { apiMe, apiSalvarPerfil } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { usesPhpApi } from "@/lib/backend";
import { ESPECIALIDADES, UFS } from "@/lib/community";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Editar perfil — Guia do Higienizador" },
      { name: "description", content: "Atualize seus dados profissionais e escolha o que fica visível no seu perfil público." },
      { property: "og:title", content: "Editar perfil — Guia do Higienizador" },
      { property: "og:description", content: "Controle total sobre o que você mostra na comunidade." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditarPerfil,
});

/** Validação alinhada às colunas do banco e a limites seguros de exibição. */
const perfilSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome.").max(80),
  handle: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_.]{3,24}$/, "Use de 3 a 24 caracteres: letras, números, ponto ou _."),
  nome_profissional: z.string().trim().max(80).optional(),
  bio: z.string().trim().max(400, "Máximo de 400 caracteres.").optional(),
  cidade: z.string().trim().max(60).optional(),
  estado: z.string().trim().max(2).optional(),
  telefone: z.string().trim().max(20).optional(),
  instagram: z.string().trim().max(40).optional(),
  site: z.string().trim().max(120).optional(),
  experiencia: z.string().trim().max(40).optional(),
});

const EXPERIENCIAS = ["Começando agora", "Menos de 1 ano", "1 a 3 anos", "3 a 5 anos", "Mais de 5 anos"] as const;

function EditarPerfil() {
  const { user, perfil: perfilResumo, recarregarPerfil, sair } = useAuth();

  /** Linha completa do perfil: o contexto guarda apenas os campos usados no cabeçalho. */
  const perfilCompleto = useQuery({
    queryKey: ["perfil-completo", user?.id],
    queryFn: async () => {
      if (usesPhpApi()) return apiMe();
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: Boolean(user),
  });
  const perfil = perfilCompleto.data;
  const [campos, setCampos] = useState({
    nome: "",
    handle: "",
    nome_profissional: "",
    bio: "",
    cidade: "",
    estado: "",
    telefone: "",
    instagram: "",
    site: "",
    experiencia: "",
  });
  const [especialidades, setEspecialidades] = useState<string[]>([]);
  const [privacidade, setPrivacidade] = useState({
    perfil_publico: true,
    mostrar_cidade: true,
    mostrar_telefone: false,
    mostrar_whatsapp: false,
    mostrar_instagram: true,
    mostrar_site: true,
    permitir_mensagens: true,
  });
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!perfil) return;
    setCampos({
      nome: perfil.nome ?? "",
      handle: perfil.handle ?? "",
      nome_profissional: perfil.nome_profissional ?? "",
      bio: perfil.bio ?? "",
      cidade: perfil.cidade ?? "",
      estado: perfil.estado ?? "",
      telefone: perfil.telefone ?? "",
      instagram: perfil.instagram ?? "",
      site: perfil.site ?? "",
      experiencia: perfil.experiencia ?? "",
    });
    setEspecialidades(perfil.especialidades ?? []);
    setPrivacidade({
      perfil_publico: perfil.perfil_publico,
      mostrar_cidade: perfil.mostrar_cidade,
      mostrar_telefone: perfil.mostrar_telefone,
      mostrar_whatsapp: perfil.mostrar_whatsapp,
      mostrar_instagram: perfil.mostrar_instagram,
      mostrar_site: perfil.mostrar_site,
      permitir_mensagens: perfil.permitir_mensagens,
    });
  }, [perfil]);

  function definir(campo: keyof typeof campos, valor: string) {
    setCampos((c) => ({ ...c, [campo]: valor }));
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setAviso(null);

    const parsed = perfilSchema.safeParse(campos);
    if (!parsed.success) return setErro(parsed.error.issues[0]?.message ?? "Revise os campos.");

    setSalvando(true);
    try {
      if (usesPhpApi()) {
        await apiSalvarPerfil({
          nome: parsed.data.nome,
          handle: parsed.data.handle,
          nome_profissional: parsed.data.nome_profissional || null,
          bio: parsed.data.bio || null,
          cidade: parsed.data.cidade || null,
          estado: parsed.data.estado || null,
          telefone: parsed.data.telefone || null,
          instagram: parsed.data.instagram || null,
          site: parsed.data.site || null,
          experiencia: parsed.data.experiencia || null,
          especialidades,
          ...privacidade,
        });
      } else {
        const { error } = await supabase
          .from("profiles")
          .update({
            nome: parsed.data.nome,
            handle: parsed.data.handle,
            nome_profissional: parsed.data.nome_profissional || null,
            bio: parsed.data.bio || null,
            cidade: parsed.data.cidade || null,
            estado: parsed.data.estado || null,
            telefone: parsed.data.telefone || null,
            instagram: parsed.data.instagram || null,
            site: parsed.data.site || null,
            experiencia: parsed.data.experiencia || null,
            especialidades,
            ...privacidade,
          })
          .eq("id", user!.id);
        if (error) {
          throw error;
        }
      }
    } catch (error) {
      setSalvando(false);
      const msg = error instanceof Error ? error.message : "";
      return setErro(/duplicate|unique|já está em uso/i.test(msg) ? "Este nome de usuário já está em uso." : "Não foi possível salvar agora.");
    }
    setSalvando(false);
    setAviso("Perfil atualizado.");
    await Promise.all([recarregarPerfil(), perfilCompleto.refetch()]);
  }

  return (
    <div className="pb-8">
      <header className="flex items-center gap-3 pt-6">
        <Avatar nome={campos.nome || "Você"} url={perfilResumo?.avatar_url} />
        <div>
          <h1 className="text-xl font-bold leading-tight">Editar perfil</h1>
          <p className="text-xs text-muted-foreground">Você decide o que fica público.</p>
        </div>
      </header>

      <form onSubmit={salvar} className="mt-6 grid gap-4">
        <Texto id="nome" label="Nome" value={campos.nome} onChange={(v) => definir("nome", v)} max={80} />
        <Texto
          id="handle"
          label="Nome de usuário (@)"
          value={campos.handle}
          onChange={(v) => definir("handle", v)}
          max={24}
          dica="Aparece no endereço do seu perfil público."
        />
        <Texto
          id="nome_profissional"
          label="Nome profissional / empresa"
          value={campos.nome_profissional}
          onChange={(v) => definir("nome_profissional", v)}
          max={80}
        />

        <div>
          <label htmlFor="bio" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Bio
          </label>
          <textarea
            id="bio"
            value={campos.bio}
            maxLength={400}
            onChange={(e) => definir("bio", e.target.value)}
            className="min-h-28 w-full rounded-xl border border-border bg-card p-3 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Texto id="cidade" label="Cidade" value={campos.cidade} onChange={(v) => definir("cidade", v)} max={60} />
          <div>
            <label htmlFor="estado" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Estado
            </label>
            <select
              id="estado"
              value={campos.estado}
              onChange={(e) => definir("estado", e.target.value)}
              className="min-h-12 w-full rounded-xl border border-border bg-card px-3 text-sm"
            >
              <option value="">—</option>
              {UFS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="experiencia" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Tempo de experiência
          </label>
          <select
            id="experiencia"
            value={campos.experiencia}
            onChange={(e) => definir("experiencia", e.target.value)}
            className="min-h-12 w-full rounded-xl border border-border bg-card px-3 text-sm"
          >
            <option value="">—</option>
            {EXPERIENCIAS.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Especialidades</legend>
          <div className="flex flex-wrap gap-2">
            {ESPECIALIDADES.map((e) => {
              const ativo = especialidades.includes(e);
              return (
                <button
                  key={e}
                  type="button"
                  aria-pressed={ativo}
                  onClick={() =>
                    setEspecialidades((atual) => (ativo ? atual.filter((x) => x !== e) : [...atual, e].slice(0, 8)))
                  }
                  className={`min-h-10 rounded-full border px-3 text-xs font-semibold ${
                    ativo ? "border-primary bg-primary/15 text-primary" : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  {e}
                </button>
              );
            })}
          </div>
        </fieldset>

        <Texto id="telefone" label="Telefone / WhatsApp" value={campos.telefone} onChange={(v) => definir("telefone", v)} max={20} />
        <Texto id="instagram" label="Instagram" value={campos.instagram} onChange={(v) => definir("instagram", v)} max={40} />
        <Texto id="site" label="Site" value={campos.site} onChange={(v) => definir("site", v)} max={120} />

        <fieldset className="rounded-2xl border border-border bg-card p-4">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Privacidade</legend>
          <div className="grid gap-1">
            <Switch label="Perfil público" chave="perfil_publico" estado={privacidade} setEstado={setPrivacidade} />
            <Switch label="Mostrar cidade" chave="mostrar_cidade" estado={privacidade} setEstado={setPrivacidade} />
            <Switch label="Mostrar telefone" chave="mostrar_telefone" estado={privacidade} setEstado={setPrivacidade} />
            <Switch label="Mostrar WhatsApp" chave="mostrar_whatsapp" estado={privacidade} setEstado={setPrivacidade} />
            <Switch label="Mostrar Instagram" chave="mostrar_instagram" estado={privacidade} setEstado={setPrivacidade} />
            <Switch label="Mostrar site" chave="mostrar_site" estado={privacidade} setEstado={setPrivacidade} />
            <Switch label="Permitir mensagens" chave="permitir_mensagens" estado={privacidade} setEstado={setPrivacidade} />
          </div>
        </fieldset>

        {erro ? (
          <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {erro}
          </p>
        ) : null}
        {aviso ? (
          <p role="status" className="rounded-xl border border-success/40 bg-success/10 p-3 text-sm text-success">
            {aviso}
          </p>
        ) : null}

        <button type="submit" disabled={salvando} className="btn-primary w-full justify-center disabled:opacity-60">
          {salvando ? "Salvando…" : "Salvar alterações"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => void sair()}
        className="mt-4 min-h-12 w-full rounded-xl border border-border text-sm font-semibold text-muted-foreground"
      >
        Sair da conta
      </button>
    </div>
  );
}

function Texto({
  id,
  label,
  value,
  onChange,
  max,
  dica,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  max: number;
  dica?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        value={value}
        maxLength={max}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-12 w-full rounded-xl border border-border bg-card px-3 text-sm"
      />
      {dica ? <p className="mt-1 text-[11px] text-muted-foreground">{dica}</p> : null}
    </div>
  );
}

function Switch<T extends Record<string, boolean>>({
  label,
  chave,
  estado,
  setEstado,
}: {
  label: string;
  chave: keyof T & string;
  estado: T;
  setEstado: (fn: (e: T) => T) => void;
}) {
  return (
    <label className="flex min-h-12 items-center justify-between gap-3 text-sm">
      {label}
      <input
        type="checkbox"
        checked={estado[chave]}
        onChange={() => setEstado((e) => ({ ...e, [chave]: !e[chave] }))}
        className="size-5 accent-[hsl(var(--primary))]"
      />
    </label>
  );
}
