import { ItemLink, Section } from "@/components/app/ui";

export function ConhecimentoVivo({ tema }: { tema: string }) {
  return (
    <Section titulo={`O que os profissionais consultam sobre ${tema}`}>
      <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
        Perguntas ao vivo da comunidade ainda não estão abertas. Enquanto isso, use a experiência de campo e o código da
        comunidade — a etiqueta e a ficha do fabricante continuam valendo mais do que qualquer post.
      </p>
      <ul className="grid gap-2">
        <li>
          <ItemLink
            to="/aprender"
            emoji="📚"
            titulo="Experiência de campo"
            descricao="Casos reais, erros comuns e conversa com o cliente"
          />
        </li>
        <li>
          <ItemLink
            to="/comunidade"
            emoji="👥"
            titulo="Código da comunidade"
            descricao="Regras para quando o feed e as perguntas forem liberados"
          />
        </li>
      </ul>
    </Section>
  );
}
