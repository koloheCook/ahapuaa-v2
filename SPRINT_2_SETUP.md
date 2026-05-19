# Ahupuaa v2 -- Sprint 2 Setup
# Run this prompt in a new Claude Code chat before pasting the Sprint 2 spec.
# This session does no game development. It only verifies state and initializes git/GitHub.

---

## Opening Protocol

1. Read `CLAUDE.md` (entire file).
2. Read `DEVLOG.md` (last entry -- 2026-05-19 Planning Session).
3. State in one sentence what sprint was last completed and what the next session goal is.
4. Then work through the checklist below in order.

---

## Step 1 -- Verify project state

Run these commands. Report each result. Stop if any fails.

```bash
# Confirm Phaser version
node -e "console.log(require('./node_modules/phaser/package.json').version)"

# Confirm build passes
npm run build

# Confirm dev server starts (Ctrl+C after confirming "ready in X ms")
npm run dev
```

Expected results:
- Phaser version: 4.1.0
- Build: completes with no errors, dist/ output
- Dev server: "ready in Xms" on port 5173 or next available

If any of these fail, diagnose before proceeding. Do not proceed to Step 2 until all three pass.

---

## Step 2 -- Confirm Sprint 1 files are intact

Run the following grep checks. Each must return empty output (no Phaser imports in game logic).

```bash
grep -r "from 'phaser'" src/game/
```

Expected: empty (no output).

Confirm these files exist:
- `src/game/HexGrid.js`
- `src/game/gameState.js`
- `src/game/constants.js`
- `src/game/hydrology.js`
- `src/game/worldGen.js`
- `src/scenes/PreloadScene.js`
- `src/scenes/GameScene.js`
- `public/maps/ahupuaa.json`

Confirm `public/maps/ahupuaa.json` has staggerindex "odd":
```bash
node -e "const m = require('./public/maps/ahupuaa.json'); console.log('staggerindex:', m.staggerindex)"
```

Expected: "odd"

Report pass/fail for each check. If any file is missing, stop and flag -- do not recreate it.

---

## Step 3 -- Initialize git and push to a new GitHub repo

### Repo strategy

ahapuaa-v2 is a new independent repo (NOT a branch of koloheCook/ahapuaa).
Rationale: different engine, separate sprint history, separate Vercel deployment.

When ahapuaa-v2 is ready to go live, the existing Vercel ahapuaa project will be
redirected to this repo (Vercel project settings > Git repository > change source).
The Phaser 3 repo (koloheCook/ahapuaa) stays intact as the Phaser 3 baseline artifact.

### Initialize

This folder has no git repository. Initialize one now.

```bash
# Confirm you are in the ahapuaa-v2 directory, not ahapuaa-game
pwd
```

Expected output ends with `/ahapuaa-v2`. If it ends with `/ahapuaa-game`, stop.

```bash
git init
git add .gitignore package.json package-lock.json vite.config.js index.html main.js
git add src/ public/ scripts/
git add CLAUDE.md DEVLOG.md PHASER_4_AUDIT.md SPRINT_1_PROMPT.md SPRINT_2_SETUP.md phaser3_sprint1_spec.md
git status
```

Review `git status` output. Confirm `node_modules/` and `dist/` are NOT staged.
If they appear, stop and check .gitignore before committing.

If .gitignore does not exist, create it:

```
node_modules/
dist/
.DS_Store
*.local
```

Then create the first commit:

```bash
git commit -m "Sprint 1 complete: Phaser 4.1.0 hex tilemap, all terrain types rendering"
```

Create the new repo and push:

```bash
gh repo create ahapuaa-v2 --public --description "Ahupuaa: The Living Land -- Phaser 4 rebuild" --source=. --remote=origin --push
```

If gh CLI is not authenticated, run `gh auth login` first.

After push, report the GitHub URL.

### Vercel redirect (do NOT do this now -- note for later)

When ahapuaa-v2 is ready to replace the live Phaser 3 build:
1. Go to vercel.com > ahapuaa project > Settings > Git
2. Disconnect the current repo (koloheCook/ahapuaa)
3. Connect koloheCook/ahapuaa-v2
4. Redeploy
The Phaser 3 repo and its deploy history remain unaffected.

---

## Step 4 -- Confirm DEVLOG observation logging convention is in place

Read `DEVLOG.md` last entry. Confirm the following section exists under "DEVLOG observation logging convention":

```
### Observed delta: [short description]
Expected: ...
Actual: ...
Classification: spec-gap | engine-behavior | bug | expected
Fix applied: ...
P3 parity: same-as-P3 | different-from-P3 | unknown
```

If it is present: confirm with "DEVLOG convention confirmed."
If it is missing: log a note that it should be added -- do not add it yourself.

---

## Step 5 -- Pre-Sprint 2 inventory

Report the current state of each item Sprint 2 will need:

| Item | Status |
|---|---|
| `src/game/buildings.js` | exists / missing |
| `src/game/hydrology.js` | exists / missing |
| `src/scenes/GameScene.js` | Sprint 1 state (no camera, no input, no HUD) |
| `index.html` | minimal Phaser host (no HUD markup yet) |
| SPRINT_2_PROMPT.md | exists / missing (expected: missing -- will be written separately) |

---

## Step 6 -- Session close

This setup session made no game code changes. Update DEVLOG.md with:

```
## [today's date] -- Sprint 2 Setup Session

- git initialized, first commit created
- GitHub repo created at [URL]
- All Sprint 1 files confirmed intact
- npm build and dev server both pass
- Pre-Sprint 2 inventory logged (see Step 5 output)
- Ready for Sprint 2 spec (SPRINT_2_PROMPT.md -- pending P3 Sprint 2 extraction)
```

Do not start Sprint 2 until SPRINT_2_PROMPT.md is present in this folder.
When it arrives, open a new chat and paste it as the opening message.
