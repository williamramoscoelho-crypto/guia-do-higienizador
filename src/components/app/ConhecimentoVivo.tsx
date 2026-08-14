import { ItemLink, Section } from "@/components/app/ui";
import { isCommunityEnabled } from "@/lib/backend";

export function ConhecimentoVivo({ tema }: { tema: string }) {
  const temComunidade = isCommunityEnabled();

  return (
    <Section titulo={`O que os profissionais consultam sobre ${tema}`}>
      <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
        Veja o código de conduta e a experiência de campo. A etiqueta e a ficha do fabricante continuam valendo mais do
        que qualquer dica avulsa.
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
        {temComunidade ? (
          <li>
            <ItemLink
              to="/perguntas"
              emoji="❓"
              titulo="Pergunte à comunidade"
              descricao="Dúvidas técnicas de quem atende no dia a dia"
            />
          </li>
        ) : null}
        <li>
          <ItemLink
            to="/codigo-da-comunidade"
            emoji="📜"
            titulo="Código da comunidade"
            descricao="Regras de respeito, segurança e privacidade"
          />
        </li>
      </ul>
    </Section>
  );
}
