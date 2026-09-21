#!/usr/bin/env python3
"""Render premium Bob combo cross-connect ring (SVG + PNG)."""
from __future__ import annotations

import math
from pathlib import Path

import cairo

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "diagrams"
W, H = 2400, 1600
CX, CY = W // 2, H // 2 + 80
RING_R = 430

COMBOS = [
    {
        "id": "COMBO-1",
        "title": "TOKEN & CONTEXT DIET",
        "tools": "rtk + context-mode + Graft",
        "bullets": ["AST cruxes", "90% CLI token strip", "zero file re-reads"],
        "color": (0.13, 0.83, 0.93),
        "angle": -90,
    },
    {
        "id": "COMBO-2",
        "title": "RECALL & KNOWLEDGE BASE",
        "tools": "Mnemosyne + WeKnora + compact",
        "bullets": ["persistent decisions graph", "RAG memory", "auto compact"],
        "color": (0.23, 0.51, 0.96),
        "angle": -30,
    },
    {
        "id": "COMBO-3",
        "title": "DENSE SPEC & SIGNALING",
        "tools": "i-have-adhd + caveman + RM",
        "bullets": ["non-negotiable invariants", "front-loaded answers", "0 fluff"],
        "color": (0.92, 0.70, 0.03),
        "angle": 30,
    },
    {
        "id": "COMBO-4",
        "title": "MULTI-STAGE CODE AUDIT",
        "tools": "open-code-review + ponytail + Bugbot",
        "bullets": ["line-level static review", "YAGNI cuts", "anti-regression gate"],
        "color": (0.93, 0.28, 0.60),
        "angle": 90,
    },
    {
        "id": "COMBO-5",
        "title": "WORKTREE & LOOP CONTROL",
        "tools": "worktrunk + Logic-Loop + supervisor",
        "bullets": ["isolated git worktrees", "loop breaking", "2-retry rework"],
        "color": (0.66, 0.33, 0.97),
        "angle": 150,
    },
    {
        "id": "COMBO-6",
        "title": "POLYGLOT PLATFORM ENGINE",
        "tools": "addyosmani + Compose + Orca + Artemis",
        "bullets": ["decoupled web", "Kotlin Material3", "Linux desktop + Android UI"],
        "color": (0.13, 0.77, 0.37),
        "angle": 210,
    },
]

HUB_LINES = [
    "Real-time Blast Radius Propagation",
    "Invariant Regression Blocking",
    "Isolated Worktree State Sync",
]

CROSS_PAIRS = [(0, 3), (1, 4), (2, 5)]


def combo_center(angle_deg: float) -> tuple[float, float]:
    rad = math.radians(angle_deg)
    return CX + RING_R * math.cos(rad), CY + RING_R * math.sin(rad)


def set_color(ctx: cairo.Context, rgb: tuple[float, float, float], alpha: float = 1.0) -> None:
    ctx.set_source_rgba(rgb[0], rgb[1], rgb[2], alpha)


def rounded_rect(
    ctx: cairo.Context,
    x: float,
    y: float,
    w: float,
    h: float,
    r: float,
) -> None:
    ctx.new_sub_path()
    ctx.arc(x + w - r, y + r, r, -math.pi / 2, 0)
    ctx.arc(x + w - r, y + h - r, r, 0, math.pi / 2)
    ctx.arc(x + r, y + h - r, r, math.pi / 2, math.pi)
    ctx.arc(x + r, y + r, r, math.pi, 3 * math.pi / 2)
    ctx.close_path()


def draw_background(ctx: cairo.Context) -> None:
    grad = cairo.RadialGradient(CX, CY, 120, CX, CY, max(W, H))
    grad.add_color_stop_rgb(0, 0.07, 0.11, 0.20)
    grad.add_color_stop_rgb(0.55, 0.04, 0.07, 0.13)
    grad.add_color_stop_rgb(1, 0.02, 0.04, 0.08)
    ctx.set_source(grad)
    ctx.paint()

    set_color(ctx, (0.10, 0.16, 0.24), 0.35)
    ctx.set_line_width(1)
    for x in range(0, W, 48):
        ctx.move_to(x, 0)
        ctx.line_to(x, H)
        ctx.stroke()
    for y in range(0, H, 48):
        ctx.move_to(0, y)
        ctx.line_to(W, y)
        ctx.stroke()

    for radius, alpha in ((RING_R + 70, 0.10), (RING_R, 0.16), (RING_R - 90, 0.08)):
        set_color(ctx, (0.22, 0.74, 0.97), alpha)
        ctx.set_line_width(1.4)
        ctx.arc(CX, CY, radius, 0, 2 * math.pi)
        ctx.stroke()


def draw_curved_wire(
    ctx: cairo.Context,
    p1: tuple[float, float],
    p2: tuple[float, float],
    color: tuple[float, float, float],
    width: float,
    alpha: float,
    through_center: bool = False,
) -> None:
    x1, y1 = p1
    x2, y2 = p2
    if through_center:
        ctrl = (CX, CY)
    else:
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2
        dx, dy = mx - CX, my - CY
        dist = math.hypot(dx, dy) or 1
        ctrl = (mx + dx / dist * 60, my + dy / dist * 60)

    set_color(ctx, color, alpha * 0.25)
    ctx.set_line_width(width + 6)
    ctx.move_to(x1, y1)
    ctx.curve_to(ctrl[0], ctrl[1], ctrl[0], ctrl[1], x2, y2)
    ctx.stroke()

    set_color(ctx, color, alpha)
    ctx.set_line_width(width)
    ctx.move_to(x1, y1)
    ctx.curve_to(ctrl[0], ctrl[1], ctrl[0], ctrl[1], x2, y2)
    ctx.stroke()


def draw_combo_card(
    ctx: cairo.Context,
    combo: dict,
    cx: float,
    cy: float,
) -> None:
    card_w, card_h = 360, 168
    x, y = cx - card_w / 2, cy - card_h / 2
    color = combo["color"]

    ctx.save()
    set_color(ctx, color, 0.12)
    rounded_rect(ctx, x - 6, y - 6, card_w + 12, card_h + 12, 22)
    ctx.fill()

    set_color(ctx, (0.05, 0.08, 0.14), 0.92)
    rounded_rect(ctx, x, y, card_w, card_h, 18)
    ctx.fill_preserve()
    set_color(ctx, color, 0.95)
    ctx.set_line_width(2.2)
    ctx.stroke()

    ctx.select_font_face("Sans", cairo.FONT_SLANT_NORMAL, cairo.FONT_WEIGHT_BOLD)
    ctx.set_font_size(18)
    set_color(ctx, color, 1)
    ctx.move_to(x + 18, y + 30)
    ctx.show_text(combo["id"])

    ctx.set_font_size(15)
    set_color(ctx, (0.90, 0.94, 0.98), 1)
    ctx.move_to(x + 18, y + 56)
    ctx.show_text(combo["title"])

    ctx.select_font_face("Monospace", cairo.FONT_SLANT_NORMAL, cairo.FONT_WEIGHT_NORMAL)
    ctx.set_font_size(12)
    set_color(ctx, (0.55, 0.75, 0.95), 1)
    ctx.move_to(x + 18, y + 82)
    ctx.show_text(combo["tools"])

    ctx.select_font_face("Sans", cairo.FONT_SLANT_NORMAL, cairo.FONT_WEIGHT_NORMAL)
    ctx.set_font_size(11.5)
    set_color(ctx, (0.72, 0.79, 0.88), 1)
    line_y = y + 108
    for bullet in combo["bullets"]:
        ctx.move_to(x + 22, line_y)
        ctx.show_text(f"• {bullet}")
        line_y += 18
    ctx.restore()


def draw_hub(ctx: cairo.Context) -> None:
    w, h = 360, 150
    x, y = CX - w / 2, CY - h / 2

    set_color(ctx, (0.25, 0.78, 0.98), 0.10)
    rounded_rect(ctx, x - 8, y - 8, w + 16, h + 16, 24)
    ctx.fill()

    grad = cairo.LinearGradient(x, y, x + w, y + h)
    grad.add_color_stop_rgba(0, 0.08, 0.14, 0.24, 0.98)
    grad.add_color_stop_rgba(1, 0.05, 0.10, 0.18, 0.98)
    ctx.set_source(grad)
    rounded_rect(ctx, x, y, w, h, 20)
    ctx.fill_preserve()
    set_color(ctx, (0.25, 0.78, 0.98), 0.9)
    ctx.set_line_width(2.5)
    ctx.stroke()

    ctx.select_font_face("Sans", cairo.FONT_SLANT_NORMAL, cairo.FONT_WEIGHT_BOLD)
    ctx.set_font_size(20)
    set_color(ctx, (0.78, 0.93, 1.0), 1)
    ctx.move_to(x + 24, y + 38)
    ctx.show_text("INTERNAL SYNAPTIC HUB")

    ctx.set_font_size(13)
    set_color(ctx, (0.70, 0.80, 0.92), 1)
    line_y = y + 68
    for line in HUB_LINES:
        ctx.move_to(x + 28, line_y)
        ctx.show_text(f"• {line}")
        line_y += 24


def draw_title(ctx: cairo.Context) -> None:
    ctx.select_font_face("Sans", cairo.FONT_SLANT_NORMAL, cairo.FONT_WEIGHT_BOLD)
    ctx.set_font_size(34)
    set_color(ctx, (0.93, 0.96, 1.0), 1)
    title = "CIRCULAR CROSS-CONNECT RING & INTERNAL SYNAPTIC INTERLINKS"
    extents = ctx.text_extents(title)
    ctx.move_to(CX - extents.width / 2, 72)
    ctx.show_text(title)

    ctx.set_font_size(17)
    set_color(ctx, (0.55, 0.68, 0.82), 1)
    subtitle = (
        "Circular Ring Network of the 6 Combos with Internal Anti-Regression "
        "& Worktree Isolation Cross-Chassis Wires"
    )
    extents = ctx.text_extents(subtitle)
    ctx.move_to(CX - extents.width / 2, 108)
    ctx.show_text(subtitle)


def render(surface: cairo.Surface) -> None:
    ctx = cairo.Context(surface)
    ctx.set_antialias(cairo.ANTIALIAS_BEST)

    draw_background(ctx)
    draw_title(ctx)

    centers = [combo_center(c["angle"]) for c in COMBOS]

    for i in range(len(centers)):
        nxt = (i + 1) % len(centers)
        draw_curved_wire(ctx, centers[i], centers[nxt], (0.22, 0.74, 0.97), 2.2, 0.55)

    for a, b in CROSS_PAIRS:
        draw_curved_wire(
            ctx,
            centers[a],
            centers[b],
            COMBOS[a]["color"],
            3.4,
            0.75,
            through_center=True,
        )

    for i, center in enumerate(centers):
        draw_curved_wire(ctx, center, (CX, CY), COMBOS[i]["color"], 2.0, 0.45)

    draw_hub(ctx)

    for combo, center in zip(COMBOS, centers):
        draw_combo_card(ctx, combo, center[0], center[1])


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    png_path = OUT_DIR / "02_circular_ring_crossconnect.png"
    svg_path = OUT_DIR / "02_circular_ring_crossconnect.svg"

    png_surface = cairo.ImageSurface(cairo.FORMAT_ARGB32, W, H)
    render(png_surface)
    png_surface.write_to_png(str(png_path))

    svg_surface = cairo.SVGSurface(str(svg_path), W, H)
    render(svg_surface)
    svg_surface.finish()

    print(f"Wrote {png_path}")
    print(f"Wrote {svg_path}")


if __name__ == "__main__":
    main()
