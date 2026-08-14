import { Link } from "@tanstack/react-router";

import { Aviso } from "@/components/app/ui";

export const TEXTO_HOSPEDAGEM_ESTATICA =
  "Comunidade e IA não estão neste hospedagem estática.";

/** Aviso quando o guia roda só com HTML/JS (HostGator), sem login nem chat. */
export function AvisoHospedagemEstatica() {
  return (
    <Aviso titulo="Hospedagem estática">
      <p>{TEXTO_HOSPEDAGEM_ESTATICA}</p>
      <p className="mt-2">
        O guia, as fichas, a diluição, a precificação, o checklist e os favoritos continuam neste aparelho.
      </p>
      <div className="mt-3 grid gap-2">
        <Link to="/guia" className="text-sm font-semibold underline">
          Abrir o guia
        </Link>
        <Link to="/identificar" className="text-sm font-semibold underline">
          Identificar tecido
        </Link>
        <Link to="/ferramentas/diluicao" className="text-sm font-semibold underline">
          Calculadora de diluição
        </Link>
        <Link to="/checklist" className="text-sm font-semibold underline">
          Checklist
        </Link>
      </div>
    </Aviso>
  );
}
