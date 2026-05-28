---
phase: sprint-4
plan: sprint-4-01
type: execute
wave: 1
depends_on: []
files_modified:
  - CONTENT.md
autonomous: true
requirements:
  - SPRINT4-CONTENT-BASELINE
must_haves:
  truths:
    - CONTENT.md contains verified Hawaiian terms for both season names before any code references them
    - ʻIke entry exists in the Core Glossary with correct diacritical and game context description
    - Seasonal variation section names Hoʻoilo as wet season (months 11-12 and 1-4) and Kauwela as dry season (months 5-10)
  artifacts:
    - path: "CONTENT.md"
      provides: "Canonical season strings and ʻIke glossary entry"
      contains: "Hoʻoilo"
  key_links:
    - from: "CONTENT.md"
      to: "src/scenes/GameScene.js SEASON_LABEL"
      via: "Manual copy by executor per D-03"
      pattern: "Hoʻoilo"
---

<objective>
Add Hoʻoilo, Kauwela, and ʻIke to CONTENT.md before any code references these strings.

Purpose: D-01 requires CONTENT.md to be updated BEFORE code references season strings.
All Hawaiian strings in this sprint must be sourced from CONTENT.md -- not generated or guessed.
This plan establishes that canonical source.

Output: CONTENT.md updated with two season name entries under Events > Seasonal variation, and
an ʻIke row in Core Glossary.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/sprint-4/sprint-4-CONTEXT.md
@CONTENT.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add ʻIke to Core Glossary and season names under Events</name>
  <files>CONTENT.md</files>
  <read_first>
    - CONTENT.md -- read the full file first; locate the Core Glossary table (line ~22-36) and the Events section (line ~105-125); confirm whether an ʻIke row exists and whether a "Seasonal variation" subsection exists under Events before making any edit
    - .planning/phases/sprint-4/sprint-4-CONTEXT.md -- D-01 through D-04 confirm exactly what must be added and why
  </read_first>
  <action>
    Make two targeted edits to CONTENT.md. Do not change any other section.

    EDIT 1 -- Core Glossary table:
    Check if an ʻIke row already exists (search for "ʻIke" or "ike" in the table).
    If it does NOT exist, add the following row at the end of the Core Glossary table
    (before the closing --- separator line):

      | ʻIke | Knowledge / wisdom | ʻIke accumulation (game information / tech unlock resource) |

    The ʻokina character in ʻIke is U+02BB (modifier letter apostrophe), not a straight apostrophe.
    Copy the character from the existing ʻokina examples in the Hawaiian Language Standards section
    at the top of the file -- do not type a straight apostrophe.

    If the row already exists, leave it unchanged.

    EDIT 2 -- Events section, Seasonal variation:
    Locate the "### Planned Events (not yet built)" list. It currently contains the line:
      "- Seasonal variation (wet/dry season cycles)"

    Replace that entire line with these three lines:

      - Seasonal variation (wet/dry season cycles)
        - Hoʻoilo -- wet season, months 11-12 and 1-4 (six months)
        - Kauwela -- dry season, months 5-10 (six months)

    The ʻokina in Hoʻoilo is U+02BB. Copy from the file's existing diacritical examples.
    Do not add a full cultural description -- terms only, as per D-02.

    No other changes. Do not modify Buildings, Resources, Research Tree, UI Text, or any
    other section.
  </action>
  <verify>
    <automated>grep -c "ʻIke" /Users/scottywright-ahsam/Desktop/Archived/Pioneer\ Species/Projects/ahapuaa-v2/CONTENT.md && grep -c "Hoʻoilo" /Users/scottywright-ahsam/Desktop/Archived/Pioneer\ Species/Projects/ahapuaa-v2/CONTENT.md && grep -c "Kauwela" /Users/scottywright-ahsam/Desktop/Archived/Pioneer\ Species/Projects/ahapuaa-v2/CONTENT.md</automated>
  </verify>
  <done>
    - CONTENT.md Core Glossary table contains a row for ʻIke with the ʻokina character (U+02BB)
    - CONTENT.md Events section contains "Hoʻoilo" and "Kauwela" as sub-items under Seasonal variation
    - Hoʻoilo is labeled as wet season months 11-12 and 1-4; Kauwela as dry season months 5-10
    - No other section in CONTENT.md was modified
    - grep for "Hoʻoilo", "Kauwela", and "ʻIke" each return at least 1 match
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| CONTENT.md -> code | Static documentation only; no trust boundary crosses here |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-s4-01 | Tampering | CONTENT.md Hawaiian strings | accept | Documentation file with no code execution path; diacritical correctness verified by executor read |
</threat_model>

<verification>
After task completes, verify all three of the following return at least 1 match:
- grep "ʻIke" CONTENT.md
- grep "Hoʻoilo" CONTENT.md
- grep "Kauwela" CONTENT.md

The ʻokina character (U+02BB) must be visually present in Hoʻoilo (between Ho and oilo)
and in ʻIke (before I). A straight apostrophe (U+0027) would be wrong.
</verification>

<success_criteria>
- CONTENT.md is the single source of truth for Hoʻoilo, Kauwela, and ʻIke before any code is written
- All diacriticals use U+02BB ʻokina, not a straight apostrophe
- Seasonal variation section clearly maps months to seasons (11-12 and 1-4 = wet; 5-10 = dry)
- File committed to git; downstream plans (02, 03, 04) can reference these confirmed strings
</success_criteria>

<output>
After completion, create .planning/phases/sprint-4/sprint-4-01-SUMMARY.md
</output>
