# CONTENT.md — Ahupua'a: The Living Land

> Single source of truth for all player-facing text, Hawaiian terminology, and cultural content.
> All new UI copy must be added here first, then referenced in index.html.
> Last updated: April 2026

---

## Hawaiian Language Standards

### Diacritical Marks
- **'Okina** (`'`): Glottal stop. Use the Unicode modifier letter apostrophe (U+02BB), NOT a straight apostrophe (') or backtick.
- **Kahakō** (macron): Lengthens vowel sound. ā ē ī ō ū (lowercase) Ā Ē Ī Ō Ū (uppercase)

### If You're Unsure
Do not guess. Flag the term with `[VERIFY]` and leave a note. Better to have a placeholder than a wrong diacritic.

---

## Core Glossary

| Hawaiian | English | Context in game |
|---------|---------|----------------|
| Ahupua'a | Traditional land division (mountain to sea) | Game title, core concept |
| Mauka | Toward the mountain / inland | Map orientation |
| Makai | Toward the sea | Map orientation |
| Ali'i | Chief / nobility | Future: Hoa Kaua integration |
| Ali'i Nui | High chief | Future: Hoa Kaua |
| Maka'āinana | Commoners / people of the land | Population |
| Kānaka | People / humans | Sidebar tab label |
| 'Āina | Land | Cultural concept |
| Mālama | To care for / stewardship | Core educational theme |
| Aloha 'Āina | Love of the land | Cultural framing |
| Kapu | Sacred prohibition / taboo | Future event system |
| Mana | Spiritual power | Morale system (future) |

---

## Buildings

### Hale (House)
- **Full name:** Hale (hah-leh)
- **Translation:** House / dwelling
- **Description:** The basic dwelling unit of an ahupua'a. Each hale supports a 'ohana (family) and increases your settlement's population capacity.
- **Cultural note:** Traditional hale were built from lauhala (pandanus leaves), pili grass, and 'ōhi'a wood. Different hale served different purposes — hale noa (common house), hale mua (men's eating house), hale 'aina (eating house for women).

### Lo'i Kalo (Taro Paddy)
- **Full name:** Lo'i Kalo (loh-ee kah-loh)
- **Translation:** Wetland taro field
- **Description:** Flooded terraced fields for growing kalo (taro). The staple crop of ancient Hawai'i and the foundation of Hawaiian spirituality — kalo is considered the elder sibling of the Hawaiian people.
- **Cultural note:** Kalo requires the auwai (irrigation ditch) to bring fresh water from the stream. The lo'i also supports fish, shrimp, and other life. Requires: Auwai tech.
- **Produces:** Kalo

### Loko I'a (Fishpond)
- **Full name:** Loko I'a (loh-koh ee-ah)
- **Translation:** Fishpond
- **Description:** Ancient Hawaiian fishponds are among the most sophisticated aquaculture systems ever developed. Built along the shoreline, they use stone walls and sluice gates (mākāhā) to trap and raise fish.
- **Cultural note:** Hawai'i once had over 360 loko i'a. They were a sign of chiefly wealth and provided fish year-round regardless of ocean conditions.
- **Produces:** Fish
- **Terrain:** Shore only

### Heiau (Temple)
- **Full name:** Heiau (heh-ee-ah-oo)
- **Translation:** Sacred platform / temple
- **Description:** The spiritual center of the ahupua'a. Heiau were stone platforms where rituals, offerings, and ceremonies took place. Their presence strengthens the community's morale and mana.
- **Cultural note:** Different heiau served different purposes — luakini heiau for warfare, ko'a heiau for fishing, ho'oulu 'ai heiau for agriculture. The type of heiau a chief built signaled their priorities.
- **Produces:** Morale bonus

### Auwai (Irrigation Ditch)
- **Full name:** Auwai (ah-oo-wai)
- **Translation:** Irrigation channel / ditch
- **Description:** The auwai carries fresh water from upland streams to the lo'i kalo fields below. Ancient Hawaiians engineered extensive irrigation networks that transformed dry land into productive farmland.
- **Cultural note:** The auwai represents the connection between mauka (mountain) and makai (sea) — the core principle of the ahupua'a system. Water flows from the mountain, through the fields, and back to the sea.
- **Unlocks:** Lo'i Kalo placement
- **Tech required:** Auwai (first research)

---

## Resources

| Resource | Hawaiian | Description |
|---------|---------|-------------|
| Food | 'Ai | General food supply; produced by Lo'i Kalo and Loko I'a |
| Water | Wai | Fresh water; managed by Auwai system |
| Wood | Lā'au | Timber for building; harvested from forest tiles |
| Stone | Pōhaku | Building material; from mountain-adjacent tiles |
| Fish | I'a | Protein source; from Loko I'a and ocean proximity |
| Kalo | Kalo | Taro; staple crop from Lo'i Kalo; also cultural currency |

---

## Research Tree

| Tech ID | Hawaiian Name | English | Unlocks |
|---------|--------------|---------|---------|
| `auwai` | Auwai | Irrigation | Lo'i Kalo placement |
| `loi_farming` | Lo'i Kalo | Taro farming | Increased kalo production |
| `advanced_farming` | Mahi'ai | Advanced farming | [TBD] |
| `loko_ia_basics` | Loko I'a | Fishpond basics | Loko I'a placement |
| `aquaculture` | Lawai'a | Aquaculture | Increased fish yield |
| `(6th tech)` | [VERIFY] | [TBD] | [TBD] |

---

## Events

### Active Event Types (day 25+)

*To be documented from index.html source. Placeholder entries below.*

| Event ID | Name | Trigger | Effect | Message text |
|----------|------|---------|--------|-------------|
| `rain` | Nā Ua (The Rains) | Random | +Water | "The rains have come. Your streams run full." |
| `drought` | Hau (Drought) | Random | -Water | "The land thirsts. Your auwai runs low." |
| `[others]` | [VERIFY from source] | — | — | — |

### Planned Events (not yet built)
- Seasonal variation (wet/dry season cycles)
- Neighboring settlement contact
- Chief visit (morale event)
- Kapu violation (morale penalty)
- Storm damage (building damage)
- Abundant harvest (resource bonus)

---

## UI Text

### Sidebar Tabs
- **Build** — Build structures
- **'Ike** — Knowledge / game information
- **Kānaka** — People / population

### Win Condition Message
> "Your ahupua'a thrives. The 'āina is cared for, the kānaka are fed, and your settlement stands strong from mauka to makai."

### Loss Condition Message (if implemented)
> "The 'āina could not sustain your people. Your ahupua'a has fallen silent."

### Opening / Intro Text (to be built)
> "Welcome to your ahupua'a — the living land that flows from mountain to sea. You are its steward. What you build, tend, and protect will determine whether your people thrive."

---

## Cultural Education Layer (v0 P1 — cards / tooltips)

When a player taps a building or card, they should see:

1. **Hawaiian name** (large, with pronunciation guide)
2. **English translation** (smaller)
3. **One sentence of cultural context** (from the descriptions above)
4. **Historical fact** (optional, one sentence)

This layer is display-only in v0. It does not affect gameplay.

---

## Sources & Verification

Cultural content in this file is informed by:
- Ka Wai Ola (OHA publication): https://kawaiola.news
- Theorycraftist Games research (for Hoa Kaua cross-reference)
- [Add additional sources as you research]

Any term marked `[VERIFY]` needs confirmation from a fluent Hawaiian speaker or authoritative Hawaiian language resource (e.g., Wehewehe.org Hawaiian dictionary) before being shown to players.

---

*This file is the content contract. If it's not here, it shouldn't be in the game.*
