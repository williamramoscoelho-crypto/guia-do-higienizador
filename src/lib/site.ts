/** Origem pública do Guia do Higienizador (subdomínio próprio, produto independente). */
export const SITE_HOST = "guiadohigienizador.autolimpezapro.com.br";
export const SITE_ORIGIN = `https://${SITE_HOST}`;

export function siteUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/") return `${SITE_ORIGIN}/`;
  return `${SITE_ORIGIN}${normalized}`;
}
