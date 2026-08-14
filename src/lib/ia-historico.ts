/**
 * Histórico de conversas do Higienizador IA em localStorage.
 * Futuro: trocar por tabela no backend quando as contas de usuário existirem
 * (mesma interface: listar, salvar, apagar).
 */
import { useCallback, useEffect, useState } from "react";

import type { ModoIA } from "@/lib/ia-prompt";

export type MensagemIA = { role: "user" | "assistant"; content: string };

export type ConversaIA = {
  id: string;
  titulo: string;
  modo: ModoIA;
  atualizadaEm: number;
  mensagens: MensagemIA[];
};

const CHAVE = "gh:ia:conversas";
const LIMITE = 30;

function ler(): ConversaIA[] {
  if (typeof window === "undefined") return [];
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    const dados = bruto ? (JSON.parse(bruto) as ConversaIA[]) : [];
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

export function useConversas() {
  const [conversas, setConversas] = useState<ConversaIA[]>([]);

  useEffect(() => {
    setConversas(ler());
  }, []);

  const salvar = useCallback((conversa: ConversaIA) => {
    setConversas(() => {
      const atuais = ler().filter((c) => c.id !== conversa.id);
      const proximas = [conversa, ...atuais].slice(0, LIMITE);
      try {
        window.localStorage.setItem(CHAVE, JSON.stringify(proximas));
      } catch {
        // cota cheia ou modo privado: segue sem persistir
      }
      return proximas;
    });
  }, []);

  const apagar = useCallback((id: string) => {
    setConversas(() => {
      const proximas = ler().filter((c) => c.id !== id);
      try {
        window.localStorage.setItem(CHAVE, JSON.stringify(proximas));
      } catch {
        /* ignora */
      }
      return proximas;
    });
  }, []);

  return { conversas, salvar, apagar };
}

export function tituloDaConversa(mensagens: MensagemIA[]) {
  const primeira = mensagens.find((m) => m.role === "user")?.content ?? "Nova conversa";
  return primeira.length > 48 ? `${primeira.slice(0, 48)}…` : primeira;
}
