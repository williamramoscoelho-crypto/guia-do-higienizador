"""
Scraper editorial da linha Protelim de higienização de estofados / carpetes / interior.

Só lê páginas públicas. Não inventa pH, diluição, composição ou ANVISA.
Uso: python scrape_protelim_estofados.py

Funções: get_product_data(), download_fispq(), save_data()
"""

from __future__ import annotations

import csv
import json
import logging
import random
import re
import time
from datetime import date
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup, Comment

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "out"
FISPQ_DIR = ROOT / "fispqs"
UA = (
    "GuiaDoHigienizador/1.0 "
    "(+https://github.com/williamramoscoelho-crypto/guia-do-higienizador; "
    "consulta editorial de fichas públicas)"
)
SESSION = requests.Session()
SESSION.headers.update(
    {
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
    }
)

PRODUTOS = [
    {
        "slug": "protelim-prot-carp-20-limpa-tapetes-e-carpetes",
        "nome": "CARP 20",
        "url": "https://protelim.com.br/produto/prot-carp-20-limpa-tapetes-e-carpetes/",
        "linha": "SHP — limpa tapetes e carpetes",
        "arquivo": "Prot_Carp_20",
    },
    {
        "slug": "protelim-multi-ecco-apc-limpador-apc-multiuso",
        "nome": "MULTI ECCO APC",
        "url": "https://protelim.com.br/produto/multi-ecco-apc-limpador-apc-multiuso/",
        "linha": "SHP — APC concentrado (estofados, carpetes, interiores)",
        "arquivo": "Multi_Ecco_APC",
    },
    {
        "slug": "protelim-bac-peroxy-limpador-de-uso-geral-de-alta-performance",
        "nome": "BAC PEROXY",
        "url": "https://protelim.com.br/produto/bac-peroxy-limpador-de-uso-geral-de-alta-performance/",
        "linha": "SHP — limpador de uso geral / tecidos",
        "arquivo": "Bac_Peroxy",
    },
    {
        "slug": "protelim-apc-limpador-de-alta-performance",
        "nome": "APC",
        "url": "https://protelim.com.br/produto/apc-limpador-de-alta-performance/",
        "linha": "SHP — APC interiores pronto uso",
        "arquivo": "APC_Pronto_Uso",
    },
    {
        "slug": "protelim-prot-water-protetor-de-tecido",
        "nome": "PROT WATER",
        "url": "https://protelim.com.br/produto/prot-water-protetor-de-tecido/",
        "linha": "SHP — protetor de tecido (solvente)",
        "arquivo": "Prot_Water",
    },
    {
        "slug": "protelim-water-guard",
        "nome": "WATER GUARD",
        "url": "https://protelim.com.br/produto/water-guard/",
        "linha": "SHP — protetor de tecido (base água)",
        "arquivo": "Water_Guard",
    },
    {
        "slug": "protelim-lava-a-seco-automotivo-prot-dry",
        "nome": "PROT DRY",
        "url": "https://protelim.com.br/produto/lava-a-seco-automotivo-prot-dry/",
        "linha": "Lavagem a seco (SKU pedido)",
        "arquivo": "Prot_Dry",
    },
    {
        "slug": "protelim-prot-dry-pronto-uso-lavagem-a-seco-automotiva",
        "nome": "PROT DRY PRONTO USO",
        "url": "https://protelim.com.br/produto/prot-dry-pronto-uso-lavagem-a-seco-automotiva/",
        "linha": "Lavagem a seco pronto uso",
        "arquivo": "Prot_Dry_Pronto_Uso",
    },
    {
        "slug": "protelim-leather-cleaner-limpa-couro",
        "nome": "Leather Cleaner",
        "url": "https://protelim.com.br/produto/leather-cleaner-limpa-couro/",
        "linha": "Couro / interior",
        "arquivo": "Leather_Cleaner",
    },
    {
        "slug": "protelim-prot-couro-revitalizador-de-couro",
        "nome": "LEATHER",
        "url": "https://protelim.com.br/produto/prot-couro-revitalizador-de-couro/",
        "linha": "Couro / interior",
        "arquivo": "Leather",
    },
    {
        "slug": "protelim-detergente-multiuso-prot-mult",
        "nome": "PROT MULT",
        "url": "https://protelim.com.br/produto/detergente-multiuso-prot-mult/",
        "linha": "Multiuso (slug já existente no Guia)",
        "arquivo": "Prot_Mult",
    },
    {
        "slug": "protelim-bactericida-prot-ecco-ds-air-neutro",
        "nome": "BACTERICIDA ECCO DS AIR NEUTRO",
        "url": "https://protelim.com.br/produto/bactericida-prot-ecco-ds-air-neutro/",
        "linha": "Interior — bactericida",
        "arquivo": "Ecco_DS_Air_Neutro",
    },
]

DISCOVER_CATEGORIES = [
    {
        "url": "https://protelim.com.br/categoria-produto/segmento-automotivo/categorias/shp-sistema-higienizacao-protelim/",
        "linha": "SHP — Sistema Higienização Protelim",
    },
    {
        "url": "https://protelim.com.br/categoria-produto/segmento-automotivo/acabamento/tecidos/",
        "linha": "Acabamento — tecidos",
    },
    {
        "url": "https://protelim.com.br/categoria-produto/higiene-geral-automotivo/tecidos-higiene-geral-automotivo/",
        "linha": "Higiene geral — tecidos",
    },
    {
        "url": "https://protelim.com.br/categoria-produto/segmento-automotivo/acabamento/couro/",
        "linha": "Acabamento — couro",
    },
    {
        "url": "https://protelim.com.br/categoria-produto/higiene-geral-automotivo/couro-higiene-geral-automotivo/",
        "linha": "Higiene geral — couro",
    },
    {
        "url": "https://protelim.com.br/categoria-produto/segmento-automotivo/categorias/lavagem-a-seco/",
        "linha": "Lavagem a seco",
    },
    {
        "url": "https://protelim.com.br/categoria-produto/segmento-automotivo/acabamento/bactericidas/",
        "linha": "Interior — bactericidas",
    },
    {
        "url": "https://protelim.com.br/categoria-produto/higiene-geral-automotivo/desinfetante/",
        "linha": "Higiene geral — desinfetante",
    },
]

CAMPOS = [
    "slug",
    "nome",
    "url",
    "linha",
    "resumo",
    "embalagens",
    "diluicao",
    "ph",
    "usoRecomendado",
    "naoRecomendado",
    "informacoesAdicionais",
    "modoDeUsar",
    "fichaTecnica",
    "anvisa",
    "composicao",
    "fdsPdf",
    "sdsPdf",
    "fichaPdf",
    "coletadoEm",
]

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("protelim")


def sleep_polite() -> None:
    time.sleep(random.uniform(1.5, 3.0))


def get(url: str, retries: int = 4) -> requests.Response:
    last = None
    for i in range(retries):
        try:
            res = SESSION.get(url, timeout=40)
            if res.status_code in {429, 500, 502, 503, 504}:
                wait = 2 * (i + 1)
                log.warning("HTTP %s em %s — retry em %ss", res.status_code, url, wait)
                time.sleep(wait)
                last = res
                continue
            res.raise_for_status()
            return res
        except requests.RequestException as exc:
            last = exc
            wait = 2 * (i + 1)
            log.warning("Falha %s (%s) — retry em %ss", url, exc, wait)
            time.sleep(wait)
    raise RuntimeError(f"Não foi possível obter {url}: {last}")


def tidy(s: str, max_len: int = 0) -> str:
    t = re.sub(r"\s+", " ", str(s or "")).strip()
    t = re.split(r"Quero Comprar|Produtos relacionados|Você também pode gostar|Voltar para os produtos", t, maxsplit=1)[0].strip()
    if max_len and len(t) > max_len:
        cut = t[:max_len]
        last = max(cut.rfind(". "), cut.rfind("; "))
        t = (cut[: last + 1] if last > 80 else cut.rstrip() + "…").strip()
    return t


def visivel(node) -> str:
    if node is None:
        return ""
    for tag in node.find_all(["script", "style", "noscript", "svg"]):
        tag.decompose()
    for c in node.find_all(string=lambda t: isinstance(t, Comment)):
        c.extract()
    return node.get_text("\n", strip=True)


def html_after_h3(soup: BeautifulSoup, title: str) -> str:
    heading = None
    for h in soup.find_all("h3"):
        if title.lower() in h.get_text(" ", strip=True).lower():
            heading = h
            break
    if not heading:
        return ""
    cur = heading
    for _ in range(12):
        cur = cur.find_parent()
        if cur is None:
            break
        nxt = cur.find_next_sibling()
        while nxt:
            if nxt.find("h3"):
                return ""
            editor = nxt.select_one(".elementor-widget-text-editor .elementor-widget-container")
            if editor:
                return str(editor)
            nxt = nxt.find_next_sibling()
    return ""


def fds_score(url: str) -> int:
    u = (url or "").lower()
    years = [int(x) for x in re.findall(r"20[1-3]\d", u)]
    year = max(years) if years else 0
    rev_m = re.search(r"rev[_-]?(\d+)", u)
    ver_m = re.search(r"(?:^|[/_-])v(\d+)", u)
    rev = int(rev_m.group(1)) if rev_m else 0
    ver = int(ver_m.group(1)) if ver_m else 0
    return year * 1_000_000 + ver * 1_000 + rev


def pdfs(soup: BeautifulSoup, base: str) -> list[dict[str, str]]:
    out = []
    seen: set[str] = set()
    for a in soup.find_all("a", href=True):
        href = urljoin(base, a["href"])
        if ".pdf" not in href.lower():
            continue
        if href in seen:
            continue
        seen.add(href)
        label = re.sub(r"\s+", " ", a.get_text(" ", strip=True) or Path(urlparse(href).path).name)
        out.append({"label": label or "PDF", "url": href})
    return out


def pick_newest(docs: list[dict[str, str]], pred) -> str:
    hits = [d for d in docs if pred(f"{d['label']} {d['url']}".lower())]
    if not hits:
        return ""
    hits.sort(key=lambda d: fds_score(d["url"]), reverse=True)
    return hits[0]["url"]


def classificar_pdfs(docs: list[dict[str, str]]) -> dict:
    fds = pick_newest(docs, lambda b: ("fds" in b or "fispq" in b) and "manual" not in b)
    sds = pick_newest(docs, lambda b: "sds" in b.split() or "/sds" in b or "_sds" in b)
    if sds == fds:
        sds = ""
    ficha = pick_newest(docs, lambda b: "ficha" in b and "tecn" in b)
    extras = [d for d in docs if d["url"] not in {fds, sds, ficha}]
    return {"fdsPdf": fds, "sdsPdf": sds, "fichaPdf": ficha, "documentos": extras}


def embalagens_de(text: str) -> str:
    compact = re.sub(r"\s+", " ", text or "")
    m = re.search(r"EMBALAGE(?:NS|M)\W{0,3}:\s*([\d.,\sLmlleE]+(?:\s+e\s+[\d.,\sLmlleE]+)*)", compact, re.I)
    if not m:
        return ""
    return tidy(m.group(1), 80)


def ph_de(text: str) -> str:
    compact = re.sub(r"\s+", " ", text)
    stripped = re.sub(r"neutralizador de pH", " ", compact, flags=re.I)
    if re.search(r"neutralizador de pH", compact, re.I) and not re.search(
        r"\bpH\s*(neutro|equilibrado|ácido|alcalino|\d)", stripped, re.I
    ):
        return ""
    m = re.search(r"(?<!neutralizador de )(?:\b(?:pH|PH)\s*[:\-–]?\s*)(\d+(?:[.,]\d+)?(?:\s*[–\-]\s*\d+(?:[.,]\d+)?)?)", compact)
    if m:
        start = max(0, m.start() - 24)
        around = compact[start : m.end() + 12]
        if re.search(r"neutralizador", around, re.I):
            return ""
        if re.search(r"\d+\s*[–-]\s*(Limpa|Odorizante|Alvejante|Desinfect|Tira |Ação |Bloqueador)", around, re.I):
            return ""
        return tidy(m.group(1), 40)
    q = re.search(r"\b(?:pH|PH)\s+(neutro|equilibrado|ácido|alcalino|básico)\b", compact, re.I)
    return tidy(q.group(1).lower(), 40) if q else ""


def diluicao_de(modo: str, desc: str) -> str:
    blob = f"{modo}\n{desc}"
    hits: list[str] = []

    def add(s: str) -> None:
        t = tidy(s, 280)
        if not t or re.match(r"^n[aã]o ", t, re.I) or t in hits:
            return
        hits.append(t)

    for pat in (
        r"Limpeza [^\n.]{0,50}1\s*:\s*\d+[^\n.]{0,140}",
        r"Limpeza [^\n.]{0,40}1\s+litro de produto para[^\n.]{0,90}",
        r"1\s+litro de produto para[^\n.]{0,80}",
        r"dilua[^\n.]{0,40}1\s+para\s+\d+\s+partes[^\n.]{0,40}",
        r"1\s+para\s+\d+\s+partes de [áa]gua",
        r"Usar puro ou na dilui[cç][aã]o[^\n.]{0,90}",
    ):
        for m in re.finditer(pat, blob, re.I):
            add(m.group(0))
    if re.search(r"pronto(?:\s+para)?\s+uso|pronto uso", blob, re.I):
        add("Produto pronto para uso.")
    return tidy(" ".join(hits), 520)


def anvisa_de(text: str) -> str:
    m = (
        re.search(r"ANVISA[:\s]*n[ºo°.]?\s*[\d./-]+", text, re.I)
        or re.search(r"Registro ANVISA[^\n.]{0,90}", text, re.I)
        or re.search(r"n[ºo°.]?\s*ANVISA[^\n.]{0,60}", text, re.I)
    )
    return tidy(m.group(0), 120) if m else ""


def composicao_de(text: str) -> str:
    m = re.search(r"Composi[cç][aã]o\s*[:\-–]\s*([^\n]{8,400})", text, re.I) or re.search(
        r"Ingredientes\s*[:\-–]\s*([^\n]{8,400})", text, re.I
    )
    return tidy(m.group(1), 420) if m else ""


def resumo_de(text: str) -> str:
    compact = re.sub(r"\s+", " ", text or "").strip()
    compact = re.sub(r"\s*EMBALAGE(?:NS|M)\W{0,3}:.*$", "", compact, flags=re.I).strip()
    compact = re.sub(r"\s*BENEF[IÍ]CIOS\W{0,3}:.*$", "", compact, flags=re.I).strip()
    compact = re.sub(r"\s*É um produto 9 em 1:.*$", "", compact, flags=re.I).strip()
    return tidy(compact, 900)


def importante_de(text: str, modo: str) -> str:
    blob = f"{text}\n{modo}"
    m = re.search(r"IMPORTANTE:?\s*([\s\S]{12,900}?)(?=\nIndica|\nBaixar FDS|\nVoltar para|\nProdutos relacionados|$)", blob, re.I)
    if m:
        return tidy(m.group(1), 520)
    n = re.findall(r"(?:n[aã]o (?:pode|aplicar|diluir|utilizar)[^\n.]{8,240}\.?)", blob, re.I)
    return tidy(" ".join(n), 520) if n else ""


def maybe_playwright(url: str) -> str:
    try:
        from playwright.sync_api import sync_playwright
    except Exception as exc:
        log.warning("HTML vazio e Playwright indisponível: %s", exc)
        return ""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(user_agent=UA, locale="pt-BR")
        page.goto(url, wait_until="domcontentloaded", timeout=45000)
        page.wait_for_timeout(1500)
        html = page.content()
        browser.close()
        log.info("Playwright usou fallback %s", url)
        return html


def parse_produto(meta: dict, html: str) -> dict:
    soup = BeautifulSoup(html, "html.parser")
    product = soup.select_one('[data-elementor-type="product"]') or soup
    h1 = product.find("h1")
    nome = h1.get_text(" ", strip=True) if h1 else meta["nome"]
    content = product.select_one(".woocommerce-product-content .elementor-widget-container")
    desc_text = visivel(content)
    modo_html = html_after_h3(product, "Modo de Usar")
    ind_html = html_after_h3(product, "Indicação") or html_after_h3(product, "Indicacao")
    modo_soup = BeautifulSoup(modo_html, "html.parser") if modo_html else None
    ind_soup = BeautifulSoup(ind_html, "html.parser") if ind_html else None
    modo = tidy(visivel(modo_soup), 1200) if modo_soup else ""
    uso = tidy(visivel(ind_soup), 520) if ind_soup else ""
    if not uso:
        m_uso = re.search(r"((?:[Éé] indicado|Indicado|Pode ser usado|Eficiente na)[^.]*\.)", desc_text, re.I)
        uso = tidy(m_uso.group(1), 420) if m_uso else ""
    body_text = visivel(product)
    nao = importante_de(body_text, modo)
    ph = ph_de(f"{desc_text}\n{modo}\n{uso}")
    diluicao = diluicao_de(modo, desc_text)
    embalagens = embalagens_de(desc_text)
    anvisa = anvisa_de(f"{desc_text}\n{modo}\n{uso}\n{nao}")
    composicao = composicao_de(desc_text)
    pdf_map = classificar_pdfs(pdfs(product, meta["url"]))
    resumo = resumo_de(desc_text)
    partes = [
        tidy(desc_text, 1600),
        f"EMBALAGENS: {embalagens}" if embalagens else "",
        f"pH: {ph}" if ph else "",
        f"Diluição: {diluicao}" if diluicao else "",
        f"Modo de usar: {modo}" if modo else "",
        f"Indicação: {uso}" if uso else "",
        f"Notas: {nao}" if nao else "",
        f"ANVISA: {anvisa}" if anvisa else "",
    ]
    return {
        "slug": meta["slug"],
        "marca": "protelim",
        "nome": nome,
        "url": meta["url"],
        "linha": meta["linha"],
        "resumo": resumo,
        "diluicao": diluicao,
        "ph": ph,
        "usoRecomendado": uso,
        "naoRecomendado": nao,
        "informacoesAdicionais": nao,
        "composicao": composicao,
        "modoDeUsar": modo,
        "embalagens": embalagens,
        "anvisa": anvisa,
        "fichaTecnica": tidy(" ".join(p for p in partes if p), 2400),
        "faq": [],
        **pdf_map,
        "coletadoEm": date.today().isoformat(),
        "fonteHtml": meta["url"],
        "arquivo": meta.get("arquivo") or "",
    }


def get_product_data(meta: dict) -> dict:
    log.info("GET %s", meta["url"])
    html = get(meta["url"]).text
    soup = BeautifulSoup(html, "html.parser")
    h1 = soup.find("h1")
    content = soup.select_one(".woocommerce-product-content .elementor-widget-container")
    desc = content.get_text(" ", strip=True) if content else ""
    if not h1 or len(desc) < 40:
        log.warning("HTML de produto vazio/curto — tentando Playwright %s", meta["slug"])
        alt = maybe_playwright(meta["url"])
        if alt:
            html = alt
    return parse_produto(meta, html)


def nome_arquivo_pdf(meta: dict, label: str, url: str) -> str:
    base = re.sub(r"[^A-Za-z0-9]+", "_", meta.get("arquivo") or meta.get("nome") or "Protelim").strip("_")
    blob = f"{label} {url}".lower()
    kind = "PDF"
    if "fds" in blob or "fispq" in blob:
        kind = "FDS"
    elif re.search(r"\bsds\b", blob):
        kind = "SDS"
    elif "manual" in blob:
        kind = "Manual"
    elif "ficha" in blob and "tecn" in blob:
        kind = "Ficha"
    elif "anvisa" in blob or "certificado" in blob:
        kind = "Certificado"
    return f"{base}_{kind}.pdf"


def download_fispq(url: str, dest: Path) -> dict:
    if dest.exists() and dest.stat().st_size > 1000:
        log.info("PDF já existe: %s", dest.name)
        return {"downloaded": False, "skipped": True}
    res = get(url)
    if len(res.content) > 15_000_000:
        log.warning("PDF grande demais, URL mantida sem salvar: %s (%s bytes)", dest.name, len(res.content))
        return {"downloaded": False, "skipped": False, "tooLarge": True, "bytes": len(res.content)}
    dest.write_bytes(res.content)
    log.info("Baixado %s (%s bytes)", dest.name, dest.stat().st_size)
    return {"downloaded": True, "skipped": False, "bytes": dest.stat().st_size}


def save_data(produtos: list[dict]) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    json_path = OUT / "protelim_estofados.json"
    csv_path = OUT / "protelim_estofados.csv"
    xlsx_path = OUT / "protelim_estofados.xlsx"
    json_path.write_text(json.dumps(produtos, ensure_ascii=False, indent=2), encoding="utf-8")
    log.info("JSON: %s", json_path)
    with csv_path.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=CAMPOS, extrasaction="ignore", delimiter=";")
        w.writeheader()
        w.writerows(produtos)
    log.info("CSV: %s", csv_path)
    try:
        import pandas as pd

        df = pd.DataFrame([{k: p.get(k, "") for k in CAMPOS} for p in produtos])
        df.to_excel(xlsx_path, index=False)
        log.info("XLSX: %s", xlsx_path)
    except Exception as exc:
        log.warning("Excel não gerado (%s). Instale pandas e openpyxl.", exc)


def slug_from_url(url: str) -> str:
    m = re.search(r"/produto/([a-z0-9-]+)/?", url, re.I)
    return f"protelim-{m.group(1)}" if m else ""


def arquivo_from_slug(slug: str) -> str:
    return "_".join(w[:1].upper() + w[1:] for w in slug.replace("protelim-", "").split("-") if w)


def discover_produtos(seed: list[dict]) -> list[dict]:
    seen = {p["url"].rstrip("/") + "/" for p in seed}
    extra = []
    for cat in DISCOVER_CATEGORIES:
        log.info("Categoria %s", cat["url"])
        try:
            html = get(cat["url"]).text
            for m in re.finditer(r"https://protelim\.com\.br/produto/([a-z0-9-]+)/", html, re.I):
                if re.search(r"lancamento", m.group(1), re.I):
                    continue
                url = f"https://protelim.com.br/produto/{m.group(1)}/"
                if url in seen:
                    continue
                seen.add(url)
                slug = slug_from_url(url)
                extra.append(
                    {
                        "slug": slug,
                        "nome": m.group(1),
                        "url": url,
                        "linha": cat["linha"],
                        "arquivo": arquivo_from_slug(slug),
                        "descoberto": True,
                    }
                )
        except Exception as exc:
            log.warning("Categoria bloqueada/falhou %s: %s", cat["url"], exc)
        sleep_polite()
    if extra:
        log.info("Descobertos: %s", ", ".join(p["slug"] for p in extra))
    return seed + extra


def main() -> None:
    FISPQ_DIR.mkdir(parents=True, exist_ok=True)
    lista = discover_produtos(PRODUTOS)
    coletados = []
    fds_baixados = 0
    fds_pulados = 0
    bloqueados: list[str] = []
    for i, meta in enumerate(lista):
        log.info("[%s/%s] %s", i + 1, len(lista), meta["url"])
        try:
            item = get_product_data(meta)
            if not item["resumo"]:
                log.warning("Descrição vazia em %s", meta["slug"])
            if not item["fdsPdf"]:
                log.warning("FDS não encontrada na página de %s", meta["slug"])
            coletados.append(item)
            urls_pdf = []
            if item["fdsPdf"]:
                urls_pdf.append(("FDS", item["fdsPdf"]))
            if item["sdsPdf"]:
                urls_pdf.append(("SDS", item["sdsPdf"]))
            if item["fichaPdf"]:
                urls_pdf.append(("Ficha", item["fichaPdf"]))
            for d in item.get("documentos") or []:
                urls_pdf.append((d.get("label") or "PDF", d["url"]))
            for label, url in urls_pdf:
                dest = FISPQ_DIR / nome_arquivo_pdf(meta, label, url)
                try:
                    r = download_fispq(url, dest)
                    if r["downloaded"] and re.search(r"fds|fispq", f"{label} {url}", re.I):
                        fds_baixados += 1
                    if r["downloaded"]:
                        sleep_polite()
                    if r["skipped"]:
                        fds_pulados += 1
                except Exception as exc:
                    log.warning("PDF falhou %s: %s", url, exc)
                    bloqueados.append(url)
        except Exception as exc:
            log.error("Produto %s: %s", meta["slug"], exc)
            bloqueados.append(meta["url"])
        if i < len(lista) - 1:
            sleep_polite()

    save_data(coletados)
    log.info("Concluído: %s produtos, %s FDS baixados (%s PDFs já existiam)", len(coletados), fds_baixados, fds_pulados)
    for p in coletados:
        log.info(
            "- %s | pH: %s | diluição: %s | tamanhos: %s | FDS: %s",
            p["nome"],
            p["ph"] or "(não publicado)",
            (p["diluicao"] or "(não publicada)")[:90],
            p["embalagens"] or "(não publicados)",
            "sim" if p["fdsPdf"] else "não",
        )
    if bloqueados:
        log.warning("Fontes bloqueadas/falhas:")
        for u in bloqueados:
            log.warning("  %s", u)


if __name__ == "__main__":
    main()
