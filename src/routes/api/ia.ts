import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { SYSTEM_PROMPT, modos, type ModoIA } from "@/lib/ia-prompt";

/**
 * Endpoint de streaming do Higienizador IA.
 *
 * Recebe o histórico da conversa e devolve texto puro em stream (text/plain),
 * consumido por `src/routes/ia.tsx`. A chave da IA nunca sai do servidor.
 *
 * Expansões futuras: upload de imagem (adicionar partes `input_image` ao
 * último turno), persistência em banco por usuário, e tool calling para
 * consultar `src/data` diretamente.
 */

const bodySchema = z.object({
  modo: z.enum(["chat", "tecido", "mancha", "protocolo", "calculo", "comecar"]).default("chat"),
  mensagens: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(6000),
      }),
    )
    .min(1)
    .max(40),
});

export const Route = createFileRoute("/api/ia")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return new Response("Assistente indisponível: chave de IA não configurada.", { status: 500 });
        }

        let parsed;
        try {
          parsed = bodySchema.parse(await request.json());
        } catch {
          return new Response("Requisição inválida.", { status: 400 });
        }

        const extra = modos[parsed.modo as ModoIA].instrucao;
        const instructions = extra ? `${SYSTEM_PROMPT}\n\n${extra}` : SYSTEM_PROMPT;

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": apiKey,
            "X-Lovable-AIG-SDK": "fetch",
          },
          signal: request.signal,
          body: JSON.stringify({
            model: "openai/gpt-5.6-sol",
            stream: true,
            store: false,
            instructions,
            input: parsed.mensagens.map((m) => ({
              role: m.role,
              content: [{ type: m.role === "user" ? "input_text" : "output_text", text: m.content }],
            })),
          }),
        });

        if (!upstream.ok || !upstream.body) {
          const detalhe = await upstream.text().catch(() => "");
          if (upstream.status === 429) {
            return new Response("Muitas solicitações agora. Aguarde alguns segundos e tente de novo.", { status: 429 });
          }
          if (upstream.status === 402) {
            return new Response("Os créditos de IA do projeto acabaram. Recarregue para continuar usando o assistente.", {
              status: 402,
            });
          }
          console.error("Falha na IA:", upstream.status, detalhe.slice(0, 500));
          return new Response("O assistente falhou ao responder. Tente novamente.", { status: 502 });
        }

        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = "";

        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            const reader = upstream.body!.getReader();
            try {
              for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const linhas = buffer.split("\n");
                buffer = linhas.pop() ?? "";
                for (const linha of linhas) {
                  if (!linha.startsWith("data:")) continue;
                  const payload = linha.slice(5).trim();
                  if (!payload || payload === "[DONE]") continue;
                  try {
                    const evento = JSON.parse(payload) as { type?: string; delta?: string };
                    if (evento.type === "response.output_text.delta" && evento.delta) {
                      controller.enqueue(encoder.encode(evento.delta));
                    }
                  } catch {
                    // evento parcial ou não-JSON: ignora
                  }
                }
              }
            } catch (error) {
              if ((error as Error)?.name !== "AbortError") console.error("Stream da IA interrompido:", error);
            } finally {
              controller.close();
              reader.releaseLock();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-store",
            "X-Accel-Buffering": "no",
          },
        });
      },
    },
  },
});
