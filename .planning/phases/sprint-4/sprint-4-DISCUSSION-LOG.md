# Sprint 4 -- Discussion Log

**Date:** 2026-05-27
**Phase:** sprint-4 -- Dual-Clock / ʻIke Accumulation
**Mode:** default (interactive)

---

## Areas Discussed

### 1. Season Names

**Question presented:** How should Sprint 4 handle the season name gap in CONTENT.md?

**Options presented:**
- Plan 01: Add to CONTENT.md first (Hoʻoilo/Kauwela, correct diacriticals)
- English placeholders + DEVLOG flag
- Code placeholder + flag (P3 approach, no diacriticals)

**Selection:** Plan 01: Add to CONTENT.md first

**Follow-up:** What should CONTENT.md include -- terms only or full entries?
**Selection:** Terms only (sufficient for HUD; downstream content passes can expand)

**Decision locked:** Plan 01 is a CONTENT.md-only update adding Hoʻoilo (wet) and
Kauwela (dry) under Events > Seasonal variation, terms only with correct diacriticals.
All downstream code references CONTENT.md -- no Hawaiian strings generated in code.

---

### 2. Auto vs Manual Tech Unlock

**Question presented:** How should ike tech unlocks work in Sprint 5?

**Options presented:**
- Auto-unlock in processTick (ike threshold checks)
- Manual purchase via UI button
- Defer to Sprint 5 discuss

**Selection:** Auto-unlock in processTick -- user explicitly referenced Civ6 mechanics
as the model. Further detail provided: Carpentry = Eureka (build 3 hale), Masonry = ike
threshold. Not a simple single-resource threshold but a hybrid system.

**Follow-up:** What does Sprint 4 add to End Turn as a hook?
**Selection:** `updateSelector(this)` after `updateHUD()` (one line, Sprint 5 adds unlock logic)

**Decision locked:**
- Sprint 4 adds `updateSelector(this)` to End Turn handler (one-line hook)
- Sprint 5 implements Eureka check (3 hale = carpentry) and ike threshold (masonry, TBD)
- Both checks auto-push to state.techs[] -- no player action required to unlock

---

## Claude's Discretion

- ʻIke HUD label: `ʻIke:` with ʻokina (sourced from CONTENT.md; no user question needed -- CLAUDE.md rule is explicit)
- SEASON_LABEL placement: module-level constant (consistent with BUILDING_TINT and SINGLE_TIER_TYPES pattern)
- Month formula: `((state.turn - 1) % 12) + 1` (pre-increment adjustment vs P3 naive formula)

---

## Deferred Ideas

- Chapter/era system (Hawaiian monarchy progression) -- user noted long-term vision; post-capstone
- Masonry ike threshold value -- Sprint 5 discuss-phase decision
- Eureka trigger location (processTick vs placement handler) -- Sprint 5 discuss-phase decision
- Heiau asset gap -- already logged in CLAUDE.md and prior DEVLOG entries
