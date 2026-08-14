"""
Scraper editorial da linha Easytech de higienização de estofados / tapetes / carpetes.

Só lê páginas públicas. Não inventa pH, diluição, composição ou ANVISA.
Produtos novos: acrescente um item em PRODUTOS (slug, busca, urls).
Uso: python scrape_easytech_estofados.py
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
from urllib.parse import quote, urljoin, urlparse

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
        "slug": "easytech-pluri",
        "nome": "PLURI",
        "busca": ["Pluri", "APC PLURI", "Multilimpador PLURI"],
        "urls": [
            "https://www.easytechshield.com.br/loja/pluri/",
            "https://www.quickclean.com.br/multilimpador-concentrado-pluri-5l-easytech",
            "https://www.lojadoprofissional.com.br/pluri",
            "https://www.carxparts.com.br/multilimpador-limpeza-pesada-pluri-5l-easytech",
            "https://www.polibox.com.br/produto/pluri-multilimpador-alcalino-limpeza-pesada-easytech-5-litros-diluicao-ate-1-50/27637",
        ],
        "linha": "APC alcalino concentrado — estofados, colchões, tecidos",
    },
    {
        "slug": "easytech-plurisensitive",
        "nome": "PLURI SENSITIVE",
        "busca": ["Pluri Sensitive", "PLURI SENSITIVE"],
        "urls": ["https://www.easytechshield.com.br/loja/plurisensitive/"],
        "linha": "APC baixa odor — tecidos / ambientes fechados",
    },
    {
        "slug": "easytech-float",
        "nome": "FLOAT",
        "busca": ["Float APC", "Float Easytech", "FLOAT APC Flotador"],
        "urls": [
            "https://www.easytechshield.com.br/loja/float/",
            "https://www.lojadoprofissional.com.br/float-easytech",
        ],
        "linha": "APC flotador concentrado — extratoras / estofados",
    },
    {
        "slug": "easytech-zbac",
        "nome": "ZBAC",
        "busca": ["ZBac", "ZBAC", "Zbac Easytech"],
        "urls": [
            "https://www.easytechshield.com.br/loja/zbac/",
            "https://www.quickclean.com.br/bactericida-com-poder-finalizador-concentrado-zbac-5l-easytech",
        ],
        "linha": "Limpador ácido bactericida — estofados, tapetes, odores orgânicos",
    },
    {
        "slug": "easytech-oxy4d",
        "nome": "OXY-4D",
        "busca": ["Oxy-4D", "Oxy 4D", "Oxy4D", "Oxy2", "OXY2"],
        "urls": [
            "https://www.easytechshield.com.br/loja/oxy4d/",
            "https://www.carxparts.com.br/uso-interno/tira-mancha-concentrado-easytech-oxy-4d-5lt",
        ],
        "linha": "Tira-manchas concentrado com peróxido — estofados e tapetes",
    },
    {
        "slug": "easytech-tapetex",
        "nome": "TAPETEX",
        "busca": ["Tapetex"],
        "urls": [
            "https://www.easytechshield.com.br/loja/tapetex/",
            "https://www.quickclean.com.br/limpeza-de-estofados/quimicos/limpador-para-tapetes-e-carpetes-tapetex-5l-easytech",
            "https://www.polibox.com.br/limpadores-especiais/tapetex-limpador-para-tapetes-e-carpetes-easytech-5-litros-diluicao-ate-1150",
        ],
        "linha": "Detergente concentrado para tapetes e carpetes",
    },
    {
        "slug": "easytech-multiinteriores",
        "nome": "MULTI INTERIORES",
        "busca": ["Multi Interiores", "MULTI INTERIORES"],
        "urls": [
            "https://www.easytechshield.com.br/loja/multiinteriores/",
            "https://www.lojadoprofissional.com.br/multi-interiores-easytech",
        ],
        "linha": "APC baixa espumação — tecidos, couro e vinil",
    },
    {
        "slug": "easytech-proimper",
        "nome": "PRO IMPER",
        "busca": ["Pro Imper", "PRO IMPER"],
        "urls": ["https://www.easytechshield.com.br/loja/proimper/"],
        "linha": "Impermeabilizante de tecidos base água",
    },
    {
        "slug": "easytech-prepara",
        "nome": "PREPARA",
        "busca": ["Prepara Easytech", "PREPARA"],
        "urls": [
            "https://www.easytechshield.com.br/loja/prepara/",
            "https://www.lojadoprofissional.com.br/prepara-easytech",
        ],
        "linha": "Neutralizador de tensoativos — pré-impermeabilização",
    },
    {
        "slug": "easytech-plurifast",
        "nome": "PLURI FAST",
        "busca": ["Pluri Fast", "PLURI FAST"],
        "urls": [
            "https://www.easytechshield.com.br/loja/plurifast/",
            "https://www.polibox.com.br/limpadores-especiais/pluri-fast-limpador-pronto-uso-easytech-500ml",
        ],
        "linha": "APC Pluri pronto uso — colchão, sofás e tecidos",
    },
    {
        "slug": "easytech-oxyfast",
        "nome": "OXY FAST",
        "busca": ["Oxy Fast", "OXY FAST"],
        "urls": ["https://www.easytechshield.com.br/loja/oxyfast/"],
        "linha": "Tira-manchas pronto uso — oxigênio ativo em tecidos",
    },
    {
        "slug": "easytech-quickinteriores",
        "nome": "QUICK INTERIORES",
        "busca": ["Quick Interiores"],
        "urls": ["https://www.easytechshield.com.br/loja/quickinteriores/"],
        "linha": "Limpeza e proteção de interior (manutenção)",
    },
    {
        "slug": "easytech-proimperpremium",
        "nome": "PRO IMPER PREMIUM",
        "busca": ["Pro Imper Premium"],
        "urls": ["https://www.easytechshield.com.br/loja/proimperpremium/"],
        "linha": "Impermeabilizante de tecidos base água (premium)",
    },
    {
        "slug": "easytech-ecotextil",
        "nome": "ECOTEXTIL",
        "busca": ["Ecotextil"],
        "urls": ["https://www.easytechshield.com.br/loja/ecotextil/"],
        "linha": "Impermeabilizante para tecidos — nanotecnologia",
    },
]

BUSCA_SITES = [
    ("oficial", "https://www.easytechshield.com.br/?s={q}"),
    ("quickclean", "https://www.quickclean.com.br/busca?controller=search&s={q}"),
    ("lojadoprofissional", "https://www.lojadoprofissional.com.br/busca?busca={q}"),
    ("carxparts", "https://www.carxparts.com.br/busca?controller=search&s={q}"),
    ("polibox", "https://www.polibox.com.br/busca?q={q}"),
]

JUNK = re.compile(
    r"Revenda Easytech|Fabricando produtos|Seja um Revendedor|Utilizamos cookies|"
    r"Cadastre-se|política de privacidade|Na Easy a química|Peso \d|Dimensões \d",
    re.I,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("easytech")
BLOQUEIOS: list[dict] = []


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
            if res.status_code in {401, 403}:
                BLOQUEIOS.append({"url": url, "status": res.status_code, "motivo": "bloqueado"})
                res.raise_for_status()
            if res.status_code in {400, 404, 405, 410}:
                res.raise_for_status()
            res.raise_for_status()
            return res
        except requests.RequestException as exc:
            last = exc
            wait = 2 * (i + 1)
            log.warning("Falha %s (%s) — retry em %ss", url, exc, wait)
            time.sleep(wait)
    BLOQUEIOS.append({"url": url, "status": "fail", "motivo": str(last)})
    raise RuntimeError(f"Não foi possível obter {url}: {last}")


def visivel(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "noscript", "svg"]):
        tag.decompose()
    for c in soup.find_all(string=lambda t: isinstance(t, Comment)):
        c.extract()
    text = soup.get_text("\n", strip=True)
    text = re.sub(r"-->", " ", text)
    return re.sub(r"\n{3,}", "\n\n", text)


def after_h1(html: str) -> str:
    i = re.search(r"<h1[\s\S]*?</h1>", html, re.I)
    return html[i.start() :] if i else html


def corte_institucional(text: str) -> str:
    i = re.search(
        r"Fabricando produtos|Na Easy a química|Revenda Easytech|Seja um Revendedor|"
        r"Entrar\s+Nome de usuário|Utilizamos cookies|Peso\s+\d",
        text,
        re.I,
    )
    return text[: i.start()] if i and i.start() > 180 else text


def tidy(s: str, max_len: int = 0) -> str:
    t = re.sub(r"\s+", " ", str(s or "")).strip()
    t = re.split(r"Revenda Easytech|Fabricando produtos|Seja um Revendedor|Peso \d", t, maxsplit=1, flags=re.I)[0].strip()
    if JUNK.search(t) and len(t) < 90:
        return ""
    if max_len and len(t) > max_len:
        cut = t[:max_len]
        last = max(cut.rfind(". "), cut.rfind("; "))
        t = (cut[: last + 1] if last > 80 else cut.rstrip() + "…").strip()
    return t


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
    chunk = re.sub(r"\s+", " ", rest[:cut]).strip(" •|:-")
    return "" if JUNK.search(chunk) and len(chunk) < 80 else chunk


def pdfs(html: str, base: str) -> list[dict[str, str]]:
    soup = BeautifulSoup(html, "html.parser")
    out: list[dict[str, str]] = []
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
    for m in re.findall(r"https?://[^\"'<\s]+\.pdf(?:\?[^\"'<\s]*)?", html, re.I):
        if m not in seen:
            seen.add(m)
            out.append({"label": Path(urlparse(m).path).name, "url": m})
    return out


def recency_score(url: str, label: str = "") -> int:
    blob = f"{url} {label}".lower()
    score = 0
    years = [int(y) for y in re.findall(r"20(?:1[5-9]|2[0-9])", blob)]
    if years:
        score += max(years) * 10000
    v = re.search(r"(?:^|[_\-.\s])v(\d+)", blob)
    if v:
        score += int(v.group(1)) * 100
    rev = re.search(r"rev[._\-]?(\d+)", blob)
    if rev:
        score += int(rev.group(1))
    return score


def pick_newest(docs: list[dict[str, str]]) -> str:
    if not docs:
        return ""
    ranked = sorted(docs, key=lambda d: recency_score(d["url"], d.get("label", "")), reverse=True)
    return ranked[0]["url"]


def classificar_pdfs(docs: list[dict[str, str]]) -> dict:
    fds, sds, ficha, extras = [], [], [], []
    for d in docs:
        blob = f"{d['url']} {d['label']}".lower()
        if "fds" in blob or "fispq" in blob:
            fds.append(d)
        elif re.search(r"\bsds\b", blob) and "fds" not in blob:
            sds.append(d)
        elif "ficha" in blob and "tecn" in blob:
            ficha.append(d)
        else:
            extras.append(d)
    return {
        "fdsPdf": pick_newest(fds),
        "sdsPdf": pick_newest(sds),
        "fichaPdf": pick_newest(ficha),
        "documentos": extras,
        "pdfsEncontrados": docs,
    }


def ph_de(blob: str) -> str:
    m = (
        re.search(r"\bpH\s*[–\-:]?\s*(\d+[.,]\d+\s*[–\-]\s*\d+[.,]\d+)", blob, re.I)
        or re.search(r"\bpH\s*[–\-:]?\s*(\d+[.,]\d+)", blob, re.I)
        or re.search(r"\bpH\s*[–\-:]?\s*(\d{1,2})(?!\s*:)", blob, re.I)
        or re.search(r"\b(pH levemente alcalino)[^.]*\.?", blob, re.I)
    )
    if not m:
        return ""
    t = tidy(m.group(1), 80)
    t = re.split(r"Modo de Usar|Observação|DILUI|Caracter", t, flags=re.I)[0].strip()
    return re.sub(r"^pH\s*[–\-:]?\s*", "", t, flags=re.I)


def diluicao_de(text: str) -> str:
    bloco = (
        between(text, "Diluição Indicada", ["Modo de Usar", "Como utilizar", "Aplicação", "Carcterísticas", "Características"])
        or between(text, "Diluições recomendadas", ["Modo de Usar", "Como utilizar", "PRODUTO NOTIFICADO"])
        or between(text, "Diluição recomendada", ["Modo de Usar", "Como utilizar"])
    )
    if bloco and re.search(r"1:\d+|puro|50ml", bloco, re.I):
        return tidy(bloco, 520)
    linhas = []
    for m in re.finditer(
        r"(Incrustada|Pesada|Média Intensidade|Leve|Limpeza muito pesada|Limpeza pesada|"
        r"Limpeza de média Intensidade|Limpeza leve|Manchas de alta intensidade|"
        r"Manchas de média intensidade|Manchas de baixa intensidade|Limpeza de manutenção|"
        r"Higienização pesada|Higienização leve)\s*[:–-]?\s*(Diluir em até\s*1:\d+|1:\d+|puro|50ml[^.]+)",
        text,
        re.I,
    ):
        linhas.append(tidy(f"{m.group(1)}: {m.group(2)}"))
    return tidy(" • ".join(linhas), 520)


def modo_de(text: str) -> str:
    bloco = between(text, "Modo de Usar", ["Observação", "Disponível em", "Peso", "Aplicação"]) or between(
        text, "Como utilizar", ["Observação", "Disponível em", "Peso"]
    )
    return tidy(bloco, 900)


def aplicacao_de(text: str) -> str:
    return tidy(between(text, "Aplicação", ["Carcterísticas", "Características", "Diluições", "Diluição", "Como utilizar"]), 420)


def anvisa_de(text: str) -> str:
    n = re.search(r"ANVISA[:\s]*(\d{10,})", text, re.I)
    if n:
        return f"Notificado na ANVISA {n.group(1)} (texto da página)."
    if re.search(r"PRODUTO NOTIFICADO NA ANVISA", text, re.I):
        return "PRODUTO NOTIFICADO NA ANVISA (texto da página)."
    return ""


def composicao_de(text: str) -> str:
    frases = []
    for m in re.finditer(r"[^.]*composi[cç][aã]o[^.]*\.", text, re.I):
        f = tidy(m.group(0), 280)
        if f and len(f) > 30 and not JUNK.search(f):
            frases.append(f)
    return tidy(" ".join(frases[:2]), 420)


def nao_recomendado_de(text: str) -> str:
    partes = []
    for pat in (r"Jamais deve ser aplicado[^.]*\.", r"n[aã]o esque[cç]a de utilizar EPI[^.]*\.", r"Qualquer contato vai retirar[^.]*\."):
        m = re.search(pat, text, re.I)
        if m:
            partes.append(tidy(m.group(0), 220))
    return tidy(" ".join(partes), 420)


def embalagens_de(text: str) -> str:
    hits: list[str] = []
    disp = re.search(r"Dispon[ií]vel em embalagen[^.]*\.", text, re.I) or re.search(r"em embalagens de [^.]{4,60}\.", text, re.I)
    if disp:
        hits.append(tidy(disp.group(0).rstrip(".")))
    for m in re.finditer(r"\b(\d+(?:,\d+)?\s*(?:ml|ML|L|litros?))\b", text, re.I):
        u = re.sub(r"\s+", "", m.group(1).replace("litros", "L").replace("litro", "L"))
        u = re.sub(r"ML", "ml", u, flags=re.I)
        if re.search(r"1400|5500|kg", u, re.I):
            continue
        if re.fullmatch(r"(5L|1,5L|1\.5L|500ml|1,2L|1200ml|1500ml)", u, re.I) and u not in hits:
            hits.append(u)
    return ", ".join(hits[:6])


def resumo_de(html: str, text: str, nome: str) -> str:
    corpo = corte_institucional(text)
    m = re.search(rf"(?:{re.escape(nome)}|Multilimpador|APC|Tira manchas|detergente|impermeabilizante|neutralizador)[^\.\n]{{0,40}}(?:é um|é uma|é o)[^\.\n]{{40,400}}\.", corpo, re.I)
    if m and not JUNK.search(m.group(0)):
        return tidy(m.group(0), 620)
    for p in corpo.split("\n"):
        t = tidy(p)
        if len(t) > 80 and not JUNK.search(t) and not re.search(r"Diluição|SKU:|Categoria:", t, re.I):
            return tidy(t, 620)
    meta = re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)', html, re.I)
    if meta and not JUNK.search(meta.group(1)):
        return tidy(meta.group(1), 620)
    return ""


def ficha_tecnica_de(text: str) -> str:
    carac = between(text, "Carcterísticas", ["Diluições", "Diluição", "Como utilizar"]) or between(
        text, "Características", ["Diluições", "Diluição", "Como utilizar"]
    )
    partes = [tidy(carac, 520), diluicao_de(text), aplicacao_de(text), anvisa_de(text)]
    return tidy(" ".join(p for p in partes if p), 1600)


def parse_pagina(meta: dict, html: str, url: str) -> dict:
    text = corte_institucional(visivel(after_h1(html)))
    soup = BeautifulSoup(html, "html.parser")
    h1 = soup.find("h1")
    nome = h1.get_text(" ", strip=True) if h1 else meta["nome"]
    pdf_map = classificar_pdfs(pdfs(html, url))
    return {
        "slug": meta["slug"],
        "marca": "easytech",
        "nome": nome,
        "url": url,
        "fonteHtml": url,
        "oficial": "easytechshield.com.br" in url,
        "linha": meta["linha"],
        "resumo": resumo_de(html, text, meta["nome"]),
        "diluicao": diluicao_de(text),
        "ph": ph_de(text),
        "usoRecomendado": aplicacao_de(text),
        "naoRecomendado": nao_recomendado_de(text),
        "informacoesAdicionais": tidy((m.group(0) if (m := re.search(r"Observa[cç][aã]o:[^.]*\.[^.]*\.", text, re.I)) else ""), 420),
        "composicao": composicao_de(text),
        "modoDeUsar": modo_de(text),
        "embalagens": embalagens_de(text),
        "anvisa": anvisa_de(text),
        "fichaTecnica": ficha_tecnica_de(text),
        **pdf_map,
        "coletadoEm": date.today().isoformat(),
    }


def merge_campos(base: dict, extra: dict) -> dict:
    out = dict(base)
    for k in (
        "resumo",
        "diluicao",
        "ph",
        "usoRecomendado",
        "naoRecomendado",
        "composicao",
        "modoDeUsar",
        "embalagens",
        "anvisa",
        "fichaTecnica",
        "fdsPdf",
        "sdsPdf",
        "fichaPdf",
    ):
        if not out.get(k) and extra.get(k):
            out[k] = extra[k]
    if extra.get("oficial"):
        for k in ("nome", "url", "resumo", "diluicao", "ph", "modoDeUsar", "fichaTecnica"):
            if extra.get(k):
                out[k] = extra[k]
    docs = list(out.get("pdfsEncontrados") or []) + list(extra.get("pdfsEncontrados") or [])
    seen: set[str] = set()
    uniq = []
    for d in docs:
        if d["url"] in seen:
            continue
        seen.add(d["url"])
        uniq.append(d)
    cls = classificar_pdfs(uniq)
    out.update({k: cls[k] for k in ("fdsPdf", "sdsPdf", "fichaPdf", "documentos", "pdfsEncontrados")})
    fontes = list(dict.fromkeys([*(out.get("fontes") or []), extra.get("fonteHtml")]))
    out["fontes"] = [f for f in fontes if f]
    return out


def get_product_data(meta: dict) -> dict:
    urls = list(meta["urls"])
    q = quote(f"Easytech {meta['busca'][0]}")
    for sid, tmpl in BUSCA_SITES:
        url = tmpl.replace("{q}", q)
        try:
            html = get(url).text
            soup = BeautifulSoup(html, "html.parser")
            nome_re = re.compile("|".join(re.escape(t) for t in meta["busca"]), re.I)
            for a in soup.find_all("a", href=True):
                href = urljoin(url, a["href"])
                blob = f"{href} {a.get_text(' ', strip=True)}"
                if nome_re.search(blob) and re.search(r"loja|produto|easytech|pluri|float|zbac|oxy|tapetex", href, re.I):
                    urls.append(href)
        except Exception:
            log.warning("Busca falhou %s %s", sid, meta["slug"])
        sleep_polite()
    seen: set[str] = set()
    uniq_urls = []
    for u in urls:
        if u not in seen:
            seen.add(u)
            uniq_urls.append(u)
    acc = {
        "slug": meta["slug"],
        "marca": "easytech",
        "nome": meta["nome"],
        "url": meta["urls"][0],
        "linha": meta["linha"],
        "resumo": "",
        "diluicao": "",
        "ph": "",
        "usoRecomendado": "",
        "naoRecomendado": "",
        "composicao": "",
        "modoDeUsar": "",
        "embalagens": "",
        "anvisa": "",
        "fichaTecnica": "",
        "fdsPdf": "",
        "sdsPdf": "",
        "fichaPdf": "",
        "documentos": [],
        "pdfsEncontrados": [],
        "fontes": [],
        "coletadoEm": date.today().isoformat(),
        "fonteHtml": meta["urls"][0],
    }
    for url in uniq_urls:
        try:
            log.info("  GET %s", url)
            parsed = parse_pagina(meta, get(url).text, url)
            acc = merge_campos(acc, parsed)
        except Exception as exc:
            log.warning("  skip %s (%s)", url, exc)
        sleep_polite()
    acc.pop("pdfsEncontrados", None)
    acc.pop("oficial", None)
    return acc


def nome_arquivo_pdf(produto: str, label: str, url: str) -> str:
    base = re.sub(r"[^A-Za-z0-9]+", "_", produto).strip("_")
    blob = f"{label} {url}".lower()
    kind = "PDF"
    if "fds" in blob or "fispq" in blob:
        kind = "FISPQ"
    elif "sds" in blob:
        kind = "SDS"
    elif "ficha" in blob and "tecn" in blob:
        kind = "Ficha"
    return f"{base}_{kind}.pdf"


def download_fispq(url: str, dest: Path) -> bool:
    if dest.exists() and dest.stat().st_size > 1000:
        log.info("PDF já existe: %s", dest.name)
        return False
    try:
        res = get(url)
        dest.write_bytes(res.content)
        log.info("Baixado %s (%s bytes)", dest.name, dest.stat().st_size)
        return dest.stat().st_size > 800
    except Exception as exc:
        log.error("Falha ao baixar %s: %s", url, exc)
        return False


def save_data(produtos: list[dict]) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "easytech_estofados.json").write_text(json.dumps(produtos, ensure_ascii=False, indent=2), encoding="utf-8")
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
        "composicao",
        "modoDeUsar",
        "anvisa",
        "fichaTecnica",
        "fdsPdf",
        "sdsPdf",
        "fichaPdf",
        "coletadoEm",
    ]
    with (OUT / "easytech_estofados.csv").open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=campos, extrasaction="ignore", delimiter=";")
        w.writeheader()
        w.writerows(produtos)
    try:
        import pandas as pd

        df = pd.DataFrame([{k: p.get(k, "") for k in campos} for p in produtos])
        df.to_excel(OUT / "easytech_estofados.xlsx", index=False)
    except Exception as exc:
        log.warning("Excel não gerado (%s). Instale pandas e openpyxl.", exc)


def main() -> None:
    FISPQ_DIR.mkdir(parents=True, exist_ok=True)
    coletados = []
    pdfs_baixados = 0
    for i, meta in enumerate(PRODUTOS):
        log.info("[%s/%s] %s", i + 1, len(PRODUTOS), meta["nome"])
        item = get_product_data(meta)
        coletados.append(item)
        lista = []
        if item.get("fdsPdf"):
            lista.append((item["nome"], "FISPQ", item["fdsPdf"]))
        if item.get("sdsPdf"):
            lista.append((item["nome"], "SDS", item["sdsPdf"]))
        if item.get("fichaPdf"):
            lista.append((item["nome"], "Ficha", item["fichaPdf"]))
        for d in item.get("documentos") or []:
            lista.append((item["nome"], d.get("label") or "PDF", d["url"]))
        for nome, label, url in lista:
            dest = FISPQ_DIR / nome_arquivo_pdf(nome, label, url)
            if download_fispq(url, dest):
                pdfs_baixados += 1
                sleep_polite()
    save_data(coletados)
    fispq_n = sum(1 for p in coletados if p.get("fdsPdf"))
    log.info("=== Resumo Easytech estofados ===")
    log.info("%s produtos", len(coletados))
    log.info("%s FISPQs/FDS com URL pública", fispq_n)
    log.info("%s PDFs baixados nesta execução", pdfs_baixados)


if __name__ == "__main__":
    main()
