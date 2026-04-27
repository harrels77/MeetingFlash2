---
description: Scan all CSS for hardcoded colors that won't adapt to light mode
---

Search the entire `src/` directory for hardcoded color values that break in light mode. Specifically:

1. Hardcoded dark backgrounds: `#060C18`, `#0D1426`, `#111D35`, `#162040`, `#1E2D4D`
2. Hardcoded white-tint backgrounds: `rgba(255,255,255,...)` (subtle hover/border tints)
3. Hardcoded white text: `#F8FAFC`, `rgba(248,250,252,...)`
4. Hardcoded dark nav backgrounds: `rgba(6,12,24,...)` or `rgba(6,6,8,...)`
5. Undefined CSS vars: `var(--paper)`, `var(--wire)`, `var(--wire2)`, `var(--ash)`, `var(--spark)`, `var(--void)`, `var(--font-mono)`, `var(--flame)`, `var(--glow)`

Use `grep -rnE` with the project's `src/` directory, exclude `globals.css` (which legitimately defines vars).

For each hit, report:
- File path : line number
- The hardcoded value
- What CSS var should replace it (use the mapping rules in `claude.md`)

Then ASK the user which files to fix before making changes — don't auto-fix.

Mapping reference:
- `#060C18` → `var(--bg)`
- `#0D1426` → `var(--bg2)`
- `#111D35` → `var(--surface)`
- `#162040` → `var(--surface2)`
- `#1E2D4D` → `var(--lift)`
- `rgba(6,12,24,X)` → `var(--nav-bg)`
- `#F8FAFC` → `var(--text)`
- `#94A3B8` → `var(--muted)`
- `#475569` → `var(--faint)`
- `rgba(248,250,252,X)` → `var(--text)` (X≥0.6) / `var(--muted)` (0.4-0.6) / `var(--faint)` (<0.4)
- `rgba(255,255,255,X)` → `var(--border)` (X<0.1) / `var(--border2)` (0.1-0.15) / `var(--border3)` (>0.15)
- `--paper` → `--text`
- `--wire` → `--border`
- `--wire2` → `--border2`
- `--ash` → `--muted`
- `--spark` → `--blue3`
- `--void` → `--bg`
- `--font-mono` → `--mono`

Lime/green/yellow/red accent rgbas (e.g. `rgba(200,240,60,X)`, `rgba(239,68,68,X)`) are intentionally fine on both themes — DON'T flag those.
