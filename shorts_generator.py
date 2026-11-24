#!/usr/bin/env python3
"""Generate 1080x1920 (9:16) dark modern marketing reels/shorts cards and captions.

Reads builds, parts, and FPS multiplier catalogs directly from the site's database
files (`parts.json`, `index.html`, `generate-seo-pages.js`), selects 15 diverse
PC builds spanning all budgets and use-cases, renders crisp 1080x1920 PNG posters
into `marketing_assets/reels/`, and writes ready-to-copy social media captions
and hashtags to `marketing_assets/reels/captions.txt`.
"""

from __future__ import annotations

import html
import json
import os
import re
import shutil
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from PIL import Image

ROOT_DIR = Path(__file__).resolve().parent
PARTS_PATH = ROOT_DIR / "parts.json"
INDEX_PATH = ROOT_DIR / "index.html"
GENERATOR_JS_PATH = ROOT_DIR / "generate-seo-pages.js"
OUTPUT_DIR = ROOT_DIR / "marketing_assets" / "reels"
CAPTIONS_PATH = OUTPUT_DIR / "captions.txt"

WIDTH = 1080
HEIGHT = 1920
SITE_DOMAIN = "pcbuilder-ar.pages.dev"

# Curated 15 diverse builds ordered from ultra-budget to 4K elite
SELECTED_SLUGS: list[str] = [
    "ultra-budget-apu-gaming-pc",
    "budget-gaming-pc-build",
    "budget-gaming-pc-gtx-1660-super",
    "gta-v-ea-fc-26-gaming-pc",
    "1080p-high-fps-gaming-pc",
    "rtx-3060-12gb-budget-creator-pc",
    "best-value-1080p-rtx-4060-build",
    "am5-budget-gaming-pc-7500f-arc-b580",
    "streaming-and-gaming-pc-rtx-5060",
    "competitive-esports-valorant-cs2-pc",
    "1440p-gaming-pc-rx-7800-xt",
    "1440p-2k-gaming-pc-rtx-5070",
    "4k-gaming-pc-rx-9070-xt",
    "4k-video-editing-workstation-pc",
    "4k-ultra-gaming-pc-9800x3d-rtx-5080",
]

BROWSER_CANDIDATES = [
    Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"),
    Path(r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"),
    Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe"),
    Path(r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"),
]


@dataclass(frozen=True)
class ThemePalette:
    name: str
    accent: str
    accent_light: str
    accent_glow: str
    accent_bg: str
    accent_border: str
    secondary: str
    bar_gradient: str


THEMES: dict[str, ThemePalette] = {
    "budget": ThemePalette(
        name="budget",
        accent="#10b981",
        accent_light="#34d399",
        accent_glow="rgba(16, 185, 129, 0.28)",
        accent_bg="rgba(16, 185, 129, 0.14)",
        accent_border="rgba(52, 211, 153, 0.40)",
        secondary="#06b6d4",
        bar_gradient="linear-gradient(90deg, #059669 0%, #10b981 55%, #34d399 100%)",
    ),
    "1080p": ThemePalette(
        name="1080p",
        accent="#06b6d4",
        accent_light="#22d3ee",
        accent_glow="rgba(6, 182, 212, 0.28)",
        accent_bg="rgba(6, 182, 212, 0.14)",
        accent_border="rgba(34, 211, 238, 0.40)",
        secondary="#3b82f6",
        bar_gradient="linear-gradient(90deg, #0284c7 0%, #06b6d4 55%, #38bdf8 100%)",
    ),
    "2k": ThemePalette(
        name="2k",
        accent="#8b5cf6",
        accent_light="#a78bfa",
        accent_glow="rgba(139, 92, 246, 0.30)",
        accent_bg="rgba(139, 92, 246, 0.15)",
        accent_border="rgba(167, 139, 250, 0.42)",
        secondary="#ec4899",
        bar_gradient="linear-gradient(90deg, #7c3aed 0%, #8b5cf6 55%, #c084fc 100%)",
    ),
    "4k": ThemePalette(
        name="4k",
        accent="#f59e0b",
        accent_light="#fbbf24",
        accent_glow="rgba(245, 158, 11, 0.28)",
        accent_bg="rgba(245, 158, 11, 0.14)",
        accent_border="rgba(251, 191, 36, 0.42)",
        secondary="#f97316",
        bar_gradient="linear-gradient(90deg, #d97706 0%, #f59e0b 55%, #fcd34d 100%)",
    ),
}


def js_round(value: float) -> int:
    """Match JavaScript Math.round() for non-negative numbers."""
    return int(value + 0.5)


def extract_site_data() -> tuple[dict[str, Any], list[dict[str, Any]], list[dict[str, Any]], dict[str, float]]:
    """Load parts.json, gamesCatalog + currency rates from index.html, and BUILDS_CONFIG."""
    parts_db = json.loads(PARTS_PATH.read_text(encoding="utf-8"))
    index_html = INDEX_PATH.read_text(encoding="utf-8")
    gen_js = GENERATOR_JS_PATH.read_text(encoding="utf-8")

    # Currency rates from index.html <option value="SAR" data-rate="3.75" ...>
    rates: dict[str, float] = {"USD": 1.0, "SAR": 3.75, "DZD": 245.0}
    for code, rate in re.findall(
        r'<option\s+value="([A-Z]+)"\s+data-rate="([0-9.]+)"', index_html
    ):
        rates[code] = float(rate)

    games_match = re.search(r"const\s+gamesCatalog\s*=\s*(\[[\s\S]*?\]);", index_html)
    builds_match = re.search(r"const\s+BUILDS_CONFIG\s*=\s*(\[[\s\S]*?\n\]);", gen_js)
    if not games_match or not builds_match:
        raise RuntimeError("Failed to locate gamesCatalog or BUILDS_CONFIG in site files.")

    node_bin = shutil.which("node")
    if node_bin:
        js_eval = (
            "const fs = require('fs');"
            "const idx = fs.readFileSync(process.argv[1], 'utf8');"
            "const gen = fs.readFileSync(process.argv[2], 'utf8');"
            "const gm = idx.match(/const\\s+gamesCatalog\\s*=\\s*(\\[[\\s\\S]*?\\]);/);"
            "const bm = gen.match(/const\\s+BUILDS_CONFIG\\s*=\\s*(\\[[\\s\\S]*?\\n\\]);/);"
            "const games = Function('return ' + gm[1])();"
            "const builds = Function('return ' + bm[1])();"
            "process.stdout.write(JSON.stringify({ games, builds }));"
        )
        proc = subprocess.run(
            [node_bin, "-e", js_eval, str(INDEX_PATH), str(GENERATOR_JS_PATH)],
            capture_output=True,
            text=True,
            encoding="utf-8",
            check=True,
        )
        parsed = json.loads(proc.stdout)
        return parts_db, parsed["games"], parsed["builds"], rates

    # Pure-Python fallback if Node.js is unavailable
    games = _parse_js_array_literal(games_match.group(1))
    builds = _parse_js_array_literal(builds_match.group(1))
    return parts_db, games, builds, rates


def _parse_js_array_literal(raw: str) -> list[dict[str, Any]]:
    """Minimal fallback parser for JS object/array literals if Node is absent."""
    # Quote unquoted keys safely outside strings
    tokens: list[str] = []
    i = 0
    n = len(raw)
    while i < n:
        ch = raw[i]
        if ch in ("'", '"'):
            quote = ch
            j = i + 1
            buf = ['"']
            while j < n:
                c = raw[j]
                if c == "\\" and j + 1 < n:
                    nxt = raw[j + 1]
                    if nxt == "'":
                        buf.append("'")
                    elif nxt == '"':
                        buf.append('\\"')
                    else:
                        buf.append("\\" + nxt)
                    j += 2
                    continue
                if c == quote:
                    break
                if c == '"' and quote == "'":
                    buf.append('\\"')
                else:
                    buf.append(c)
                j += 1
            buf.append('"')
            tokens.append("".join(buf))
            i = j + 1
        else:
            tokens.append(ch)
            i += 1
    normalized = "".join(tokens)
    normalized = re.sub(r"([{\[,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:", r'\1"\2":', normalized)
    normalized = re.sub(r",\s*([}\]])", r"\1", normalized)
    return json.loads(normalized)


def index_parts(parts_db: dict[str, Any]) -> dict[str, dict[str, dict[str, Any]]]:
    """Map category -> part_id -> part dict."""
    return {
        cat: {item["id"]: item for item in items}
        for cat, items in parts_db.items()
        if isinstance(items, list)
    }


def pick_15_builds(all_builds: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Select 15 diverse builds matching SELECTED_SLUGS (with fallback)."""
    by_slug = {b["slug"]: b for b in all_builds}
    chosen: list[dict[str, Any]] = []
    seen: set[str] = set()
    for slug in SELECTED_SLUGS:
        if slug in by_slug and slug not in seen:
            chosen.append(by_slug[slug])
            seen.add(slug)
    for b in all_builds:
        if len(chosen) >= 15:
            break
        if b["slug"] not in seen:
            chosen.append(b)
            seen.add(b["slug"])
    return chosen[:15]


def resolve_build(
    cfg: dict[str, Any],
    parts_by_cat: dict[str, dict[str, dict[str, Any]]],
    games_by_id: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    """Resolve part objects, total price, gamingIndex, and 3-game FPS estimates."""
    p = cfg["parts"]
    cpu = parts_by_cat["cpus"][p["cpu"]]
    cooler = parts_by_cat["coolers"][p["cooler"]]
    mb = parts_by_cat["motherboards"][p["mb"]]
    ram = parts_by_cat["rams"][p["ram"]]
    gpu = parts_by_cat["gpus"][p["gpu"]]
    storage = parts_by_cat["storages"][p["storage"]]
    psu = parts_by_cat["psus"][p["psu"]]

    total_usd = (
        cpu["price_usd"]
        + cooler["price_usd"]
        + mb["price_usd"]
        + ram["price_usd"]
        + gpu["price_usd"]
        + storage["price_usd"]
        + psu["price_usd"]
    )
    effective_gpu_score = cpu["igpu_score"] if gpu["id"] == "none" else gpu["score"]
    gaming_index = (effective_gpu_score * 0.8) + (cpu["score"] * 0.2)

    games_3: list[dict[str, Any]] = []
    for gid in cfg.get("featuredGames", [])[:3]:
        g = games_by_id.get(gid)
        if not g:
            continue
        fps = js_round(gaming_index * g["fpsMultiplier"])
        underperforming = gaming_index < g["minScore"]
        games_3.append(
            {
                "id": g["id"],
                "name": g["name"],
                "fps": fps,
                "underperforming": underperforming,
            }
        )

    return {
        "cfg": cfg,
        "cpu": cpu,
        "cooler": cooler,
        "mb": mb,
        "ram": ram,
        "gpu": gpu,
        "storage": storage,
        "psu": psu,
        "total_usd": total_usd,
        "gaming_index": gaming_index,
        "games_3": games_3,
    }


def select_theme(build: dict[str, Any]) -> ThemePalette:
    """Assign a cohesive accent palette based on build price and target resolution."""
    usd = build["total_usd"]
    res = build["cfg"].get("targetRes", "")
    if usd >= 1500 or "4K" in res:
        return THEMES["4k"]
    if usd >= 900 or "1440p" in res:
        return THEMES["2k"]
    if usd >= 500:
        return THEMES["1080p"]
    return THEMES["budget"]


def short_part_name(name: str) -> str:
    """Clean parenthetical suffixes when overly long while preserving model clarity."""
    return re.sub(r"\s*\((?:AM5|LGA1851|AM5 Zen 5|AM5 Gaming King)\)\s*", " ", name).strip()


def short_storage_label(storage: dict[str, Any]) -> str:
    """Compact single-line label for storage strip."""
    name = storage["name"]
    m_combo = re.match(r"(\d+GB)\s+NVMe.*\+\s*(\d+TB)\s+HDD", name)
    if m_combo:
        return f"{m_combo.group(1)} SSD + {m_combo.group(2)} HDD"
    m_nvme = re.match(r"(\d+(?:GB|TB))\s+.*(?:NVMe|Gen4|Gen3)", name)
    if m_nvme or storage.get("type") == "NVMe":
        cap = m_nvme.group(1) if m_nvme else name.split()[0]
        return f"{cap} NVMe Gen4"
    return name.split("(")[0].strip()


def short_ram_label(ram: dict[str, Any]) -> str:
    return f"{ram['capacity_gb']}GB {ram['type']}"


def short_psu_label(psu: dict[str, Any]) -> str:
    tier = "80+ Gold" if "Gold" in psu["name"] else "80+ Bronze"
    return f"{psu['wattage']}W {tier}"


def fps_badge_meta(fps: int, underperforming: bool) -> tuple[str, str, str]:
    """Return (status_label, text_color, bar_fill_css) matching site thresholds."""
    if underperforming or fps < 45:
        return "إعدادات متوسطة / خفيفة", "#fb7185", "linear-gradient(90deg, #e11d48, #fb7185)"
    if fps >= 120:
        return "⚡ فائق السلاسة", "#34d399", "linear-gradient(90deg, #059669, #34d399)"
    if fps >= 60:
        return "✅ سلس ومستقر", "#38bdf8", "linear-gradient(90deg, #0284c7, #38bdf8)"
    return "🎮 أداء مقبول", "#fbbf24", "linear-gradient(90deg, #d97706, #fbbf24)"


def concise_headline(cfg: dict[str, Any]) -> str:
    """Create a punchy 1-2 line Arabic headline for the 9:16 card."""
    title = cfg["title"]
    # Strip trailing year/subtitle after colon if very long so it stays crisp
    head = title.split(":")[0].strip()
    head = re.sub(r"\s*2026\s*", " ", head).strip()
    return head


def build_html_card(build: dict[str, Any], index_num: int, rates: dict[str, float]) -> str:
    """Render a 1080x1920 modern dark HTML poster for a single PC build."""
    cfg = build["cfg"]
    cpu = build["cpu"]
    gpu = build["gpu"]
    ram = build["ram"]
    storage = build["storage"]
    psu = build["psu"]
    total_usd = build["total_usd"]
    theme = select_theme(build)

    sar_price = js_round(total_usd * rates.get("SAR", 3.75))
    dzd_price = js_round(total_usd * rates.get("DZD", 245.0))

    headline = html.escape(concise_headline(cfg))
    category = html.escape(cfg["category"])
    target_res = html.escape(cfg["targetRes"])
    cpu_name = html.escape(short_part_name(cpu["name"]))
    cpu_meta = html.escape(f"{cpu['socket']}  •  {cpu['tdp']}W TDP")

    if gpu["id"] == "none":
        gpu_name = "Radeon Vega 7 (iGPU مدمج)"
        gpu_meta = "مدمج داخل المعالج • بدون كارت منفصل"
        gpu_dir = "rtl"
    else:
        gpu_name = html.escape(gpu["name"])
        gpu_meta = html.escape(f"استهلاك {gpu['tdp']}W  •  تقييم الأداء {gpu['score']}/100")
        gpu_dir = "ltr"

    ram_pill = html.escape(short_ram_label(ram))
    storage_pill = html.escape(short_storage_label(storage))
    psu_pill = html.escape(short_psu_label(psu))

    game_rows_html = []
    for g in build["games_3"]:
        g_name = html.escape(g["name"])
        fps = g["fps"]
        status_label, fps_color, bar_css = fps_badge_meta(fps, g["underperforming"])
        pct = max(16, min(100, int((fps / 220) * 100)))
        game_rows_html.append(
            f"""
            <div class="game-card">
              <div class="game-top">
                <div class="game-info">
                  <div class="game-name" dir="ltr">{g_name}</div>
                  <div class="game-status" style="color: {fps_color};">{html.escape(status_label)}</div>
                </div>
                <div class="game-fps" dir="ltr" style="color: {fps_color};">
                  <span class="fps-num">{fps}</span>
                  <span class="fps-unit">FPS</span>
                </div>
              </div>
              <div class="bar-track">
                <div class="bar-fill" style="width: {pct}%; background: {bar_css};"></div>
              </div>
            </div>
            """
        )

    return f"""<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;800;900&display=swap');

  * {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }}

  html, body {{
    width: {WIDTH}px;
    height: {HEIGHT}px;
    overflow: hidden;
    background: #040711;
    color: #f8fafc;
    font-family: 'Cairo', 'Segoe UI', 'Tahoma', 'Arial', sans-serif;
    -webkit-font-smoothing: antialiased;
  }}

  .canvas {{
    position: relative;
    width: {WIDTH}px;
    height: {HEIGHT}px;
    padding: 82px 62px 76px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background:
      radial-gradient(circle at 86% 12%, {theme.accent_glow} 0%, transparent 44%),
      radial-gradient(circle at 12% 84%, rgba(59, 130, 246, 0.16) 0%, transparent 46%),
      linear-gradient(165deg, #070b18 0%, #040711 55%, #090e1f 100%);
  }}

  .grid-overlay {{
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(148, 163, 184, 0.045) 1px, transparent 1px),
      linear-gradient(90deg, rgba(148, 163, 184, 0.045) 1px, transparent 1px);
    background-size: 46px 46px;
    mask-image: radial-gradient(circle at 50% 45%, black 35%, transparent 92%);
    pointer-events: none;
  }}

  .top-bar {{
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }}

  .pill {{
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 12px 24px;
    border-radius: 999px;
    font-size: 25px;
    font-weight: 800;
    letter-spacing: 0.2px;
  }}

  .pill-cat {{
    background: {theme.accent_bg};
    border: 2px solid {theme.accent_border};
    color: {theme.accent_light};
  }}

  .pill-res {{
    background: rgba(15, 23, 42, 0.85);
    border: 2px solid rgba(148, 163, 184, 0.25);
    color: #e2e8f0;
    font-family: 'Segoe UI', sans-serif;
  }}

  .title-block {{
    position: relative;
    z-index: 2;
    margin-top: 18px;
  }}

  .build-num {{
    font-size: 23px;
    font-weight: 800;
    color: #94a3b8;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
  }}

  .build-num-dot {{
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: {theme.accent};
    box-shadow: 0 0 14px {theme.accent};
  }}

  h1.headline {{
    font-size: 50px;
    font-weight: 900;
    line-height: 1.24;
    color: #ffffff;
    text-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  }}

  /* Budget Card */
  .budget-card {{
    position: relative;
    z-index: 2;
    margin-top: 22px;
    padding: 28px 36px;
    border-radius: 32px;
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.72) 100%);
    border: 2px solid {theme.accent_border};
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55), 0 0 42px {theme.accent_glow};
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }}

  .budget-label-wrap {{
    display: flex;
    flex-direction: column;
    gap: 6px;
  }}

  .budget-kicker {{
    font-size: 24px;
    font-weight: 800;
    color: {theme.accent_light};
  }}

  .budget-sub {{
    font-size: 23px;
    font-weight: 700;
    color: #cbd5e1;
  }}

  .budget-usd {{
    font-family: 'Segoe UI', sans-serif;
    font-size: 86px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: -2px;
    color: #ffffff;
    text-shadow: 0 0 28px {theme.accent_glow};
  }}

  /* Hardware Section */
  .hw-stack {{
    position: relative;
    z-index: 2;
    margin-top: 22px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }}

  .hw-card {{
    padding: 26px 30px;
    border-radius: 28px;
    background: rgba(15, 23, 42, 0.84);
    border: 1.5px solid rgba(148, 163, 184, 0.18);
    box-shadow: 0 16px 38px rgba(0, 0, 0, 0.42);
    display: flex;
    align-items: center;
    gap: 24px;
  }}

  .hw-icon {{
    width: 82px;
    height: 82px;
    flex-shrink: 0;
    border-radius: 22px;
    background: {theme.accent_bg};
    border: 1.5px solid {theme.accent_border};
    display: flex;
    align-items: center;
    justify-content: center;
  }}

  .hw-body {{
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }}

  .hw-role {{
    font-size: 23px;
    font-weight: 800;
    color: {theme.accent_light};
  }}

  .hw-name {{
    font-family: 'Segoe UI', 'Cairo', sans-serif;
    font-size: 36px;
    font-weight: 900;
    line-height: 1.22;
    color: #ffffff;
    text-align: right;
  }}

  .hw-meta {{
    font-size: 22px;
    font-weight: 700;
    color: #94a3b8;
  }}

  .specs-strip {{
    position: relative;
    z-index: 2;
    margin-top: 16px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }}

  .spec-chip {{
    padding: 14px 16px;
    border-radius: 18px;
    background: rgba(15, 23, 42, 0.72);
    border: 1.5px solid rgba(148, 163, 184, 0.14);
    text-align: center;
  }}

  .spec-chip-label {{
    font-size: 19px;
    font-weight: 700;
    color: #94a3b8;
    margin-bottom: 4px;
  }}

  .spec-chip-val {{
    font-family: 'Segoe UI', sans-serif;
    font-size: 23px;
    font-weight: 800;
    color: #f1f5f9;
  }}

  /* Games FPS Section */
  .fps-section {{
    position: relative;
    z-index: 2;
    margin-top: 24px;
    padding: 28px 30px;
    border-radius: 32px;
    background: rgba(11, 17, 32, 0.90);
    border: 1.5px solid rgba(148, 163, 184, 0.18);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.48);
  }}

  .fps-header {{
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }}

  .fps-title {{
    font-size: 30px;
    font-weight: 900;
    color: #ffffff;
  }}

  .fps-sub-pill {{
    padding: 8px 18px;
    border-radius: 999px;
    background: rgba(30, 41, 59, 0.95);
    border: 1px solid rgba(148, 163, 184, 0.25);
    font-size: 21px;
    font-weight: 800;
    color: #cbd5e1;
  }}

  .games-list {{
    display: flex;
    flex-direction: column;
    gap: 16px;
  }}

  .game-card {{
    padding: 20px 24px;
    border-radius: 22px;
    background: rgba(15, 23, 42, 0.92);
    border: 1.5px solid rgba(148, 163, 184, 0.14);
  }}

  .game-top {{
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }}

  .game-info {{
    display: flex;
    flex-direction: column;
    gap: 4px;
  }}

  .game-name {{
    font-family: 'Segoe UI', sans-serif;
    font-size: 32px;
    font-weight: 800;
    color: #f8fafc;
    text-align: right;
  }}

  .game-status {{
    font-size: 22px;
    font-weight: 800;
  }}

  .game-fps {{
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-family: 'Segoe UI', sans-serif;
  }}

  .fps-num {{
    font-size: 56px;
    font-weight: 900;
    line-height: 1;
  }}

  .fps-unit {{
    font-size: 24px;
    font-weight: 800;
    opacity: 0.88;
  }}

  .bar-track {{
    width: 100%;
    height: 14px;
    border-radius: 999px;
    background: rgba(30, 41, 59, 0.95);
    overflow: hidden;
  }}

  .bar-fill {{
    height: 100%;
    border-radius: 999px;
  }}

  /* Footer Brand */
  .footer {{
    position: relative;
    z-index: 2;
    margin-top: 24px;
    padding: 22px 30px;
    border-radius: 26px;
    background: rgba(15, 23, 42, 0.92);
    border: 2px solid rgba(16, 185, 129, 0.38);
    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }}

  .brand-left {{
    display: flex;
    align-items: center;
    gap: 18px;
  }}

  .logo-box {{
    width: 68px;
    height: 68px;
    border-radius: 18px;
    background: #10b981;
    color: #0f172a;
    font-family: 'Segoe UI', sans-serif;
    font-size: 34px;
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 24px rgba(16, 185, 129, 0.45);
    flex-shrink: 0;
  }}

  .brand-texts {{
    display: flex;
    flex-direction: column;
    gap: 2px;
  }}

  .brand-domain {{
    font-family: 'Segoe UI', sans-serif;
    font-size: 33px;
    font-weight: 900;
    color: #ffffff;
    letter-spacing: 0.3px;
  }}

  .brand-tagline {{
    font-size: 21px;
    font-weight: 700;
    color: #34d399;
  }}

  .cta-badge {{
    padding: 12px 22px;
    border-radius: 16px;
    background: rgba(16, 185, 129, 0.16);
    border: 1.5px solid rgba(52, 211, 153, 0.45);
    color: #a7f3d0;
    font-size: 22px;
    font-weight: 800;
    white-space: nowrap;
  }}
</style>
</head>
<body>
  <div class="canvas">
    <div class="grid-overlay"></div>

    <div>
      <div class="top-bar">
        <div class="pill pill-cat">{category}</div>
        <div class="pill pill-res" dir="ltr">{target_res}</div>
      </div>

      <div class="title-block">
        <div class="build-num">
          <span class="build-num-dot"></span>
          <span>تجميعة #{index_num:02d} • مواصفات 2026 المتوافقة</span>
        </div>
        <h1 class="headline">{headline}</h1>
      </div>

      <div class="budget-card">
        <div class="budget-label-wrap">
          <div class="budget-kicker">💰 الميزانية التقديرية</div>
          <div class="budget-sub">≈ {sar_price:,} ر.س &nbsp;•&nbsp; {dzd_price:,} د.ج</div>
        </div>
        <div class="budget-usd" dir="ltr">${total_usd:,}</div>
      </div>

      <div class="hw-stack">
        <div class="hw-card">
          <div class="hw-icon">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="{theme.accent_light}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="6" y="6" width="12" height="12" rx="2"/>
              <rect x="9" y="9" width="6" height="6"/>
              <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>
            </svg>
          </div>
          <div class="hw-body">
            <div class="hw-role">المعالج (CPU)</div>
            <div class="hw-name" dir="ltr">{cpu_name}</div>
            <div class="hw-meta">{cpu_meta}</div>
          </div>
        </div>

        <div class="hw-card">
          <div class="hw-icon">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="{theme.accent_light}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2"/>
              <circle cx="9" cy="12" r="3"/>
              <circle cx="16.5" cy="12" r="2"/>
              <path d="M6 18v2M10 18v2"/>
            </svg>
          </div>
          <div class="hw-body">
            <div class="hw-role">كرت الشاشة (GPU)</div>
            <div class="hw-name" dir="{gpu_dir}">{gpu_name}</div>
            <div class="hw-meta">{gpu_meta}</div>
          </div>
        </div>
      </div>

      <div class="specs-strip">
        <div class="spec-chip">
          <div class="spec-chip-label">الرام</div>
          <div class="spec-chip-val" dir="ltr">{ram_pill}</div>
        </div>
        <div class="spec-chip">
          <div class="spec-chip-label">التخزين</div>
          <div class="spec-chip-val" dir="ltr">{storage_pill}</div>
        </div>
        <div class="spec-chip">
          <div class="spec-chip-label">الباور</div>
          <div class="spec-chip-val" dir="ltr">{psu_pill}</div>
        </div>
      </div>

      <div class="fps-section">
        <div class="fps-header">
          <div class="fps-title">🎮 عدد الفريمات في 3 ألعاب</div>
          <div class="fps-sub-pill">تقدير الأداء • 1080p</div>
        </div>
        <div class="games-list">
          {''.join(game_rows_html)}
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="brand-left">
        <div class="logo-box">PC</div>
        <div class="brand-texts">
          <div class="brand-domain" dir="ltr">{SITE_DOMAIN}</div>
          <div class="brand-tagline">مُجمّع الحواسيب الذكي • فحص التوافق مجاناً</div>
        </div>
      </div>
      <div class="cta-badge">جرّبها الآن ↗</div>
    </div>
  </div>
</body>
</html>
"""


def find_headless_browser() -> Path:
    """Locate Microsoft Edge or Google Chrome executable."""
    for candidate in BROWSER_CANDIDATES:
        if candidate.exists():
            return candidate
    for exe in ("msedge", "chrome", "google-chrome"):
        found = shutil.which(exe)
        if found:
            return Path(found)
    raise FileNotFoundError(
        "Could not find Microsoft Edge or Google Chrome for headless rendering."
    )


def render_html_to_png(
    browser_exe: Path,
    html_path: Path,
    png_path: Path,
    user_data_dir: Path,
) -> None:
    """Render an HTML file to an exact 1080x1920 PNG screenshot."""
    file_url = html_path.resolve().as_uri()
    cmd = [
        str(browser_exe),
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--force-device-scale-factor=1",
        f"--user-data-dir={user_data_dir}",
        f"--window-size={WIDTH},{HEIGHT}",
        "--hide-scrollbars",
        "--virtual-time-budget=2500",
        f"--screenshot={png_path}",
        file_url,
    ]
    subprocess.run(cmd, capture_output=True, text=True, check=True)
    if not png_path.exists():
        raise RuntimeError(f"Browser did not create screenshot: {png_path}")

    with Image.open(png_path) as img:
        if img.size != (WIDTH, HEIGHT):
            resized = img.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)
            resized.save(png_path, format="PNG")


def build_caption_block(
    build: dict[str, Any], index_num: int, filename: str, rates: dict[str, float]
) -> str:
    """Create a ready-to-copy Arabic description & hashtags block for a reel."""
    cfg = build["cfg"]
    cpu = short_part_name(build["cpu"]["name"])
    gpu = (
        "كارت مدمج Radeon Vega 7 (بدون كارت منفصل)"
        if build["gpu"]["id"] == "none"
        else build["gpu"]["name"]
    )
    ram = short_ram_label(build["ram"])
    storage = short_storage_label(build["storage"])
    usd = build["total_usd"]
    sar = js_round(usd * rates.get("SAR", 3.75))
    dzd = js_round(usd * rates.get("DZD", 245.0))

    fps_lines = "\n".join(
        f"• {g['name']}: ~{g['fps']} FPS" for g in build["games_3"]
    )

    cpu_tag = "#" + re.sub(r"[^A-Za-z0-9]", "", cpu.split("(")[0])[:24]
    gpu_tag = (
        "#Vega7"
        if build["gpu"]["id"] == "none"
        else "#" + re.sub(r"[^A-Za-z0-9]", "", gpu.replace("NVIDIA GeForce ", "").replace("AMD Radeon ", ""))[:24]
    )

    hashtags = (
        f"#تجميع_بيسي #كمبيوتر #قيمنق #ألعاب #تجميعة_بيسي #هاردوير "
        f"#تجميعات_بيسي #الجزائر #السعودية #PCBuilder #GamingPC #PCSetup "
        f"{cpu_tag} {gpu_tag}"
    )

    return (
        f"============================================================\n"
        f"[{index_num:02d}] {filename} | {cfg['category']}\n"
        f"============================================================\n"
        f"🔥 {concise_headline(cfg)} (~${usd:,})!\n\n"
        f"💰 الميزانية التقديرية: ${usd:,} (≈ {sar:,} ر.س | {dzd:,} د.ج)\n"
        f"🧠 المعالج: {cpu}\n"
        f"🎮 كرت الشاشة: {gpu}\n"
        f"⚡ الرام والتخزين: {ram} + {storage}\n\n"
        f"📊 الأداء المتوقع (FPS):\n"
        f"{fps_lines}\n\n"
        f"🔗 عدّل التجميعة وافحص التوافق والأسعار مجاناً:\n"
        f"https://{SITE_DOMAIN}/builds/{cfg['slug']}.html\n"
        f"🌐 الموقع الرئيسي: https://{SITE_DOMAIN}\n\n"
        f"{hashtags}\n"
    )


def main() -> None:
    parts_db, games_catalog, all_builds, rates = extract_site_data()
    parts_by_cat = index_parts(parts_db)
    games_by_id = {g["id"]: g for g in games_catalog}

    selected_configs = pick_15_builds(all_builds)
    resolved_builds = [
        resolve_build(cfg, parts_by_cat, games_by_id) for cfg in selected_configs
    ]

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    browser_exe = find_headless_browser()

    caption_blocks: list[str] = [
        f"جاهز للنسخ — 15 وصف وهاشتاغات لفيديوهات/صور Reels & Shorts ({SITE_DOMAIN})\n"
    ]

    with tempfile.TemporaryDirectory(prefix="pcbuilder_reels_") as tmp_dir:
        tmp_path = Path(tmp_dir)
        user_data_dir = tmp_path / "browser_profile"
        user_data_dir.mkdir(parents=True, exist_ok=True)

        for idx, build in enumerate(resolved_builds, start=1):
            slug = build["cfg"]["slug"]
            filename = f"{idx:02d}_{slug}.png"
            png_path = OUTPUT_DIR / filename
            html_path = tmp_path / f"{idx:02d}_{slug}.html"

            html_content = build_html_card(build, idx, rates)
            html_path.write_text(html_content, encoding="utf-8")

            render_html_to_png(browser_exe, html_path, png_path, user_data_dir)
            caption_blocks.append(build_caption_block(build, idx, filename, rates))
            print(f"[{idx:02d}/15] Generated {png_path.relative_to(ROOT_DIR)} (${build['total_usd']:,})")

    CAPTIONS_PATH.write_text("\n".join(caption_blocks), encoding="utf-8")
    print(f"\nDone! Saved 15 reels images to {OUTPUT_DIR} and captions to {CAPTIONS_PATH}")


if __name__ == "__main__":
    main()
