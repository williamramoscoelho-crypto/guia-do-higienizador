"""
Scraper editorial da linha Vonixx de higienização de estofados (Sistema VSC).

Só lê páginas públicas. Não inventa pH, diluição ou composição.
Uso: python scrape_vonixx_estofados.py
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
        "slug": "vonixx-extractus",
        "nome_esperado": "EXTRACTUS",
        "url": "https://www.vonixx.com.br/produto/extractus/",
        "linha": "Sistema VSC — passo 1 (sintéticos / extratora)",
    },
    {
        "slug": "vonixx-extractus-sensitive",
        "nome_esperado": "EXTRACTUS SENSITIVE",
        "url": "https://www.vonixx.com.br/produto/extractus-sensitive/",
        "linha": "Sistema VSC — tecidos delicados / fibras naturais",
    },
    {
        "slug": "vonixx-bactran",
        "nome_esperado": "BACTRAN",
        "url": "https://www.vonixx.com.br/produto/bactran/",
        "linha": "Sistema VSC — bactericida / peróxido",
    },
    {
        "slug": "vonixx-sanitizante-finalizador",
        "nome_esperado": "SANITIZANTE FINALIZADOR",
        "url": "https://www.vonixx.com.br/produto/sanitizante-finalizador/",
        "linha": "Sistema VSC — finalização / pulverização",
    },
    {
        "slug": "vonixx-sintra-pro",
        "nome_esperado": "SINTRA PRO",
        "url": "https://www.vonixx.com.br/produto/sintra-pro/",
        "linha": "Interior / flotador (painéis, couro, carpete, estofado)",
    },
    {
        "slug": "vonixx-sintra-fast",
        "nome_esperado": "SINTRA FAST",
        "url": "https://www.vonixx.com.br/produto/sintra-fast/",
        "linha": "Interior pronto uso",
    },
    {
        "slug": "vonixx-vertex",
        "nome_esperado": "VERTEX",
        "url": "https://www.vonixx.com.br/produto/vertex/",
        "linha": "Limpador de estofados automotivos e residenciais",
    },
]

NAV_JUNK = re.compile(
    r"CERAS E SELANTES|Selecione um Produto|Carregando\.\.\.|SAC/RELACIONAMENTO|"
    r"Receba novidades|TODOS OS DIREITOS|Politica de Privacidade|FALE COM A GENTE|"
    r"COMPARE|AVALIAÇÕES DO PRODUTO|VER TODOS OS PRODUTOS|Formulário de Avaliação|"
    r"Horário de atendimento|EVC INDUSTRIAL|Copyright 20",
    re.I,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("vonixx")


def sleep_polite() -> None:
    time.sleep(random.uniform(1.6, 3.0))


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


def visivel(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "noscript", "svg"]):
        tag.decompose()
    for c in soup.find_all(string=lambda t: isinstance(t, Comment)):
        c.extract()
    text = soup.get_text("\n", strip=True)
    text = re.sub(r"-->", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text


def after_h1(html: str) -> str:
    i = re.search(r"<h1[\s\S]*?</h1>", html, re.I)
    return html[i.start() :] if i else html


def between(text: str, start: str, ends: list[str]) -> str:
    low = text.lower()
    i = low.find(start.lower())
    if i < 0:
        return ""
    rest = text[i + len(start) :]
    cut = len(rest)
    for e in ends:
        j = rest.lower().find(e.lower())
        if 0 <= j < cut:
            cut = j
    chunk = rest[:cut].strip()
    chunk = re.sub(r"\s+", " ", chunk)
    return "" if NAV_JUNK.search(chunk) and len(chunk) < 80 else chunk.strip(" •|-")


def tamanhos(text: str) -> str:
    found = re.findall(r"\b(\d+(?:,\d+)?(?:ml|ML|l|L))\b", text)
    ordem = []
    for t in found:
        n = t.upper().replace("ML", "ml").replace("L", "L") if t[-1] in "lL" else t
        if n not in ordem and not re.search(r"0800|99632", n):
            ordem.append(t.upper().replace("ML", "ml"))
    # filtra ruído de telefone / cnpj
    limpos = []
    for t in ordem:
        if re.fullmatch(r"\d{2,}ml", t, re.I) or re.fullmatch(r"\d(?:,\d)?L", t, re.I):
            if t not in {"11", "520"}:
                limpos.append(t)
    # preferir os que aparecem junto de VERSÕES (ignora 50ml de comparadores)
    bloco = between(text, "VERSÕES DISPONÍVEIS", ["Ficha Técnica", "COMPARE", "FAQ"])
    if bloco:
        vs = re.findall(r"\b(\d+(?:,\d+)?(?:ml|ML|L))\b", bloco, re.I)
        if vs:
            uniq = []
            for v in vs:
                u = v.upper().replace("ML", "ml")
                if u not in uniq and u != "50ml":
                    uniq.append(u)
            return ", ".join(uniq)
    return ", ".join(x for x in dict.fromkeys(limpos[:8]) if x != "50ml")


def passos(text: str) -> str:
    # Sequência numerada 1. ... 2. ... após "APLICAÇÃO" ou lista 1\ntexto
    bloco = between(
        text,
        "APRENDA A FORMA CORRETA DE APLICAÇÃO DESSE PRODUTO",
        ["VERSÕES DISPONÍVEIS", "FICHA TÉCNICA", "COMPARE"],
    )
    if not bloco:
        bloco = between(text, "MODO DE USAR", ["VERSÕES DISPONÍVEIS", "FICHA TÉCNICA", "FDS"])
    if not bloco:
        return ""
    # "1 Diluir ... 2 Pulverizar"
    parts = re.split(r"(?:(?<=\D)|^)\s*(\d{1,2})\s+(?=[A-ZÁÉÍÓÚÀÃÕ])", bloco)
    if len(parts) >= 3:
        steps = []
        # parts[0] preamble, then n, text, n, text...
        i = 1
        while i + 1 < len(parts):
            n, body = parts[i], parts[i + 1].strip(" .;")
            body = re.sub(r"\s+", " ", body)
            if len(body) > 12:
                steps.append(f"{n}. {body}")
            i += 2
        if steps:
            return " ".join(steps)
    return re.sub(r"\s+", " ", bloco)[:900]


def faq(text: str) -> list[dict[str, str]]:
    bloco = between(text, "FAQ", ["AVALIAÇÕES DO PRODUTO", "VER TODOS OS PRODUTOS", "Formulário"])
    if not bloco:
        bloco = between(text, "PERGUNTAS FREQUENTES", ["AVALIAÇÕES DO PRODUTO", "VER TODOS OS PRODUTOS"])
    if not bloco:
        return []
    itens = []
    # "* PERGUNTA * resposta"
    chunks = re.split(r"\s*\*\s*", bloco)
    chunks = [c.strip() for c in chunks if c.strip() and not NAV_JUNK.search(c)]
    i = 0
    while i + 1 < len(chunks):
        p, r = chunks[i], chunks[i + 1]
        if "?" in p or p.isupper() or p.startswith("QUAL") or p.startswith("PRODUTO") or p.startswith("INDICADO"):
            itens.append({"p": re.sub(r"\s+", " ", p), "r": re.sub(r"\s+", " ", r)})
            i += 2
        else:
            i += 1
    return itens[:12]


def pdfs(html: str, base: str) -> list[dict[str, str]]:
    soup = BeautifulSoup(html, "html.parser")
    out = []
    seen = set()
    for a in soup.find_all("a", href=True):
        href = urljoin(base, a["href"])
        if not href.lower().endswith(".pdf"):
            continue
        if href in seen:
            continue
        seen.add(href)
        label = re.sub(r"\s+", " ", a.get_text(" ", strip=True) or Path(urlparse(href).path).name)
        out.append({"label": label or "PDF", "url": href})
    return out


def classificar_pdfs(docs: list[dict[str, str]]) -> dict[str, str | list]:
    fds = sds = ficha = ""
    extras = []
    for d in docs:
        u, lab = d["url"].lower(), d["label"].lower()
        if "fds" in u or "fds" in lab or "fispq" in u or "fispq" in lab:
            if not fds:
                fds = d["url"]
            else:
                extras.append(d)
        elif "sds" in u or lab.strip() in {"sds"}:
            if not sds:
                sds = d["url"]
            else:
                extras.append(d)
        elif "ficha" in lab and "tecn" in lab:
            if not ficha:
                ficha = d["url"]
            else:
                extras.append(d)
        else:
            extras.append(d)
    return {"fdsPdf": fds, "sdsPdf": sds, "fichaPdf": ficha, "documentos": extras}


def descricao(html: str, text: str, nome: str) -> str:
    m = re.search(rf"{re.escape(nome)}\s+(?:é|e)\s+.{{80,1100}}", text, re.I)
    if m:
        body = re.split(r"LIMPEZA DE ESTOFADOS|PASSO \d|GALERIA|VERSÕES DISPONÍVEIS|COMPRE AGORA", m.group(0), flags=re.I)[0]
        body = re.sub(r"\s+", " ", body).strip()
        if not NAV_JUNK.search(body):
            return body[:900]
    meta = re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)', html, re.I) or re.search(
        r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']description["\']', html, re.I
    )
    if meta and not NAV_JUNK.search(meta.group(1)):
        return re.sub(r"\s+", " ", meta.group(1)).strip()[:620]
    return ""


def bloco_ficha(text: str) -> str:
    ends = ["FDS", "SDS", "CHECKLIST", "COMPARE", "PERGUNTAS FREQUENTES", "FAQ", "AVALIAÇÕES"]
    best = ""
    low = text.lower()
    start = 0
    while True:
        i = low.find("ficha técnica", start)
        if i < 0:
            break
        chunk = between(text[i:], text[i : i + 13], ends)
        if re.search(r"pH|DILUI|1:\d+|NÃO RECOMENDADO|USO RECOMENDADO", chunk, re.I) and len(chunk) >= len(best):
            best = chunk
        start = i + 13
    return re.sub(r"\s+", " ", best).strip()[:1600]


def diluicao_de(blob: str) -> str:
    partes = []
    for pat in (
        r"Sujeira[^.]*1:\d{1,3}(?:[^.]*1:\d{1,3}){0,4}[^.]*\.?",
        r"Limpeza de laterais de portas[^.]*1:\d+[^.]*\.",
        r"dilui[cç][aã]o 1:2[^.]{0,90}\.",
        r"[Úú]nica padr[aã]o:\s*1:\d+[^.]*\.?",
        r"Em extratoras com dilui[cç][aã]o de at[eé] 1:\d+[^.]{0,80}\.",
    ):
        m = re.search(pat, blob, re.I)
        if m:
            partes.append(re.sub(r"\s+", " ", m.group(0)).strip())
    if re.search(r"spot test", blob, re.I) and not any(re.search(r"spot test", p, re.I) for p in partes):
        partes.append("Spot test recomendado pelo fabricante.")
    return " ".join(partes)[:520]


def ph_de(blob: str) -> str:
    m = (
        re.search(r"pH\s*(B[áa]sico(?:, conforme r[óo]tulo)?\.?)", blob, re.I)
        or re.search(r"pH\s*(Neutro\.?)", blob, re.I)
        or re.search(r"pH\s*(Ácido\.?)", blob, re.I)
        or re.search(r"pH\s*(alcalino[^.]{0,90})", blob, re.I)
        or re.search(r"produto [ée] (alcalino)[^.]*", blob, re.I)
    )
    if not m:
        return ""
    t = re.sub(r"\s+", " ", m.group(1)).strip()
    t = re.split(r"OBSERVAÇÃO|DILUI", t, flags=re.I)[0].strip()
    if re.match(r"alcalino", t, re.I) and re.search(r"vidros", blob, re.I):
        return "Alcalino. Não recomendamos realizar a aplicação em vidros automotivos (Vonixx)."
    return re.sub(r"^pH\s*", "", t, flags=re.I)


def parse_produto(meta: dict, html: str) -> dict:
    text = visivel(after_h1(html))
    soup = BeautifulSoup(html, "html.parser")
    h1 = soup.find("h1")
    nome = h1.get_text(" ", strip=True) if h1 else meta["nome_esperado"]
    ficha = bloco_ficha(text)
    src = f"{ficha} {text}"
    uso = between(src, "USO RECOMENDADO", ["INFORMAÇÕES ADICIONAIS", "NÃO RECOMENDADO", "FDS", "SDS", "PRECAUÇÕES"])
    info = between(src, "INFORMAÇÕES ADICIONAIS", ["FDS", "SDS", "CHECKLIST", "COMPARE"])
    nao = between(src, "NÃO RECOMENDADO", ["INFORMAÇÕES ADICIONAIS", "FDS", "SDS"])
    if not nao and info:
        nao = info if re.search(r"não utilizar|não recomend|evitar", info, re.I) else ""

    docs = pdfs(html, meta["url"])
    pdf_map = classificar_pdfs(docs)

    return {
        "slug": meta["slug"],
        "marca": "vonixx",
        "nome": nome,
        "url": meta["url"],
        "linha": meta["linha"],
        "resumo": descricao(html, text, nome),
        "diluicao": diluicao_de(src),
        "ph": ph_de(src),
        "usoRecomendado": uso,
        "naoRecomendado": nao or info,
        "informacoesAdicionais": info,
        "composicao": "",
        "modoDeUsar": passos(text),
        "embalagens": tamanhos(text),
        "fichaTecnica": ficha,
        "faq": faq(text),
        "fichaPdf": pdf_map["fichaPdf"],
        "fdsPdf": pdf_map["fdsPdf"],
        "sdsPdf": pdf_map["sdsPdf"],
        "documentos": pdf_map["documentos"],
        "coletadoEm": date.today().isoformat(),
        "fonteHtml": meta["url"],
    }


def nome_arquivo_pdf(produto: str, label: str, url: str) -> str:
    path = Path(urlparse(url).path).name
    base = re.sub(r"[^A-Za-z0-9]+", "_", produto).strip("_")
    kind = "PDF"
    u = f"{label} {path}".lower()
    if "fds" in u or "fispq" in u:
        kind = "FISPQ"
    elif "sds" in u:
        kind = "SDS"
    elif "checklist" in u or "cheklist" in u:
        kind = "Checklist"
    elif "certificado" in u or "anvisa" in u:
        kind = "Certificado"
    return f"{base}_{kind}.pdf"


def baixar_pdf(url: str, dest: Path) -> bool:
    if dest.exists() and dest.stat().st_size > 1000:
        log.info("PDF já existe: %s", dest.name)
        return True
    try:
        res = get(url)
        if "pdf" not in res.headers.get("content-type", "").lower() and not url.lower().endswith(".pdf"):
            log.warning("Não parece PDF: %s (%s)", url, res.headers.get("content-type"))
        dest.write_bytes(res.content)
        log.info("Baixado %s (%s bytes)", dest.name, dest.stat().st_size)
        return True
    except Exception as exc:
        log.error("Falha ao baixar %s: %s", url, exc)
        return False


def salvar(produtos: list[dict]) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    json_path = OUT / "vonixx_estofados.json"
    csv_path = OUT / "vonixx_estofados.csv"
    xlsx_path = OUT / "vonixx_estofados.xlsx"

    json_path.write_text(json.dumps(produtos, ensure_ascii=False, indent=2), encoding="utf-8")
    log.info("JSON: %s", json_path)

    campos = [
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
        "fdsPdf",
        "sdsPdf",
        "fichaPdf",
        "coletadoEm",
    ]
    with csv_path.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=campos, extrasaction="ignore")
        w.writeheader()
        w.writerows(produtos)
    log.info("CSV: %s", csv_path)

    try:
        import pandas as pd

        df = pd.DataFrame([{k: p.get(k, "") for k in campos} for p in produtos])
        df.to_excel(xlsx_path, index=False)
        log.info("XLSX: %s", xlsx_path)
    except Exception as exc:
        log.warning("Excel não gerado (%s). Instale pandas e openpyxl.", exc)


def main() -> None:
    FISPQ_DIR.mkdir(parents=True, exist_ok=True)
    coletados = []
    for i, meta in enumerate(PRODUTOS):
        log.info("[%s/%s] %s", i + 1, len(PRODUTOS), meta["url"])
        html = get(meta["url"]).text
        item = parse_produto(meta, html)
        if not item["resumo"]:
            log.warning("Descrição vazia em %s", meta["slug"])
        if not item["fdsPdf"]:
            log.warning("FISPQ não encontrada na página de %s", meta["slug"])
        coletados.append(item)
        urls_pdf = []
        if item["fdsPdf"]:
            urls_pdf.append((item["nome"], "FISPQ", item["fdsPdf"]))
        if item["sdsPdf"]:
            urls_pdf.append((item["nome"], "SDS", item["sdsPdf"]))
        if item["fichaPdf"]:
            urls_pdf.append((item["nome"], "Ficha", item["fichaPdf"]))
        for d in item.get("documentos") or []:
            urls_pdf.append((item["nome"], d.get("label") or "PDF", d["url"]))
        for nome, label, url in urls_pdf:
            dest = FISPQ_DIR / nome_arquivo_pdf(nome, label, url)
            baixar_pdf(url, dest)
            sleep_polite()
        if i < len(PRODUTOS) - 1:
            sleep_polite()

    salvar(coletados)
    log.info("Concluído: %s produtos", len(coletados))


if __name__ == "__main__":
    main()
