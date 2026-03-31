# Agent Learnings — FuelIQ (kobemartin/feuliq)

Distilled from sessions on this repo. Read this file at the start of any new task to avoid repeating past mistakes.

---

## 1. GitHub Pages & Deployment

### Issue: GitHub Pages 404 after merging PR
**Session:** Troubleshooting FuelIQ Deployment Issues  
**What happened:** After merging pull requests into `main`, the live GitHub Pages site at `https://kobemartin.github.io/feuliq/` returned a 404. The Pages deployment had not been configured or re-triggered after the merge.  
**Root cause:** GitHub Pages for this repo must be manually enabled/configured in repo Settings → Pages. It is NOT auto-deployed by default after a merge.  
**Fix:** Ensure GitHub Pages is set to deploy from the `main` branch (root `/` or `docs/` depending on config). After first-time setup, subsequent pushes to `main` auto-deploy.  
**Watch out for:** Merging to `main` does not guarantee Pages re-deploys — check Actions tab for a `pages-build-deployment` run.

---

## 2. PR Preview via `rossjrw/pr-preview-action`

### Issue: PR preview was broken / never built
**Session:** Troubleshooting GitHub Preview Failures & Optimizing GitHub Pull Request Previews  
**What happened:** The `pr-preview.yml` workflow using `rossjrw/pr-preview-action@v1` was added but previews never appeared. Several debugging attempts failed, eventually the action was removed entirely (commit `31653da`).  
**Root cause:** `rossjrw/pr-preview-action` deploys previews to the **same GitHub Pages branch (`gh-pages`)**. This conflicts with the main Pages deployment if the repo already uses `gh-pages`. The action also requires the Pages source to be set to the `gh-pages` branch — if it was set to `main`, the action silently fails.  
**Resolution:** The `pr-preview-action` was abandoned. The team pivoted toward Vercel for PR previews instead (commits `72e6b80`, `a235510`).  
**Lesson:** Do NOT use `rossjrw/pr-preview-action` for this repo unless GitHub Pages is dedicated to the `gh-pages` branch and the `gh-pages` branch exists. Vercel (or Netlify) is the better choice for PR previews on a static site that already uses GitHub Pages for prod.

---

## 3. Chart.js — Emoji in X-Axis Labels Causes Misalignment

### Issue: Chart x-axis label with emoji + text misaligns on the bar chart
**Session:** Refining FuelIQ UI Alignment  
**What happened:** The Annual Cost Breakdown bar chart had x-axis labels `'⛽ Gas'` and `'⚡ Electric'` as single strings. The emoji caused the label to render taller than expected, pushing the bar baseline up and misaligning the chart visually.  
**Fix (commit `b875974`):** Split the label into a two-element array so Chart.js renders them on separate lines:
```js
// BEFORE (broken):
labels: ['⛽ Gas', '⚡ Electric'],

// AFTER (fixed):
labels: [['⛽', 'Gas'], ['⚡', 'Electric']],
```
**Lesson:** In Chart.js, when an x-axis label contains an emoji AND text together as one string, rendering height is inconsistent. Use a nested array (array of arrays) to force multiline rendering — this gives consistent layout.

---

## 4. Merge Conflicts — Chevy Bolt Feature Branch

### Issue: PR #5 had a merge conflict on `app.js`
**Session:** Resolving Pull Request Merge Conflicts  
**What happened:** The `feature/add-chevy-bolt` branch was created from an older commit. By the time a PR was opened, `main` had been updated by PR #2 (emoji feature) which also touched the `EVPresets` object in `app.js`. Both branches modified the same section of code, causing a conflict.  
**Root cause:** Feature branches not rebased onto latest `main` before opening a PR.  
**Fix:** Always `git fetch origin && git rebase origin/main` (or `git merge origin/main`) on a feature branch before opening a pull request.  
**Lesson:** The `EVPresets` array in `app.js` is a high-conflict zone — multiple features (Chevy Bolt add, emoji formatting) touched it in the same session window. Coordinate or rebase early.

---

## 5. Branch Protection & Direct Pushes to `main`

### Issue: Agent was pushing directly to `main` before branch protection was configured
**Session:** Enforcing GitHub Branch Protection  
**What happened:** Early in the project, several commits (e.g., the initial release, early fixes) were pushed directly to `main`. The user later requested branch protection to require PRs. The agent configured this via the GitHub web UI.  
**Current state:** Branch protection is now active on `main`. All changes must go through a PR. The agent must **never** `git push origin main` directly.  
**Lesson:** Always create a feature branch and open a PR. Never push directly to `main`. Use `gh pr create` for opening PRs.

---

## 6. Screenshots in PRs — Established Workflow

### Issue: Early PRs had no visual evidence of changes
**What happened:** PRs #1 and #2 were opened without before/after screenshots. The user then established a workflow for this.  
**Current protocol (`.agents/workflows/pr_screenshots.md`):**
1. Capture UI screenshots on `main` (before) and on the feature branch (after) using the browser tools.
2. Save screenshots to `/assets/screenshots/` in the repo and commit them on the feature branch.
3. Reference them in the PR body using raw GitHub URLs:
   ```
   ![Before](https://github.com/kobemartin/feuliq/blob/<branch>/assets/screenshots/before.png?raw=true)
   ![After](https://github.com/kobemartin/feuliq/blob/<branch>/assets/screenshots/after.png?raw=true)
   ```
**Lesson:** Always follow the PR screenshots workflow for any UI-impacting change. The workflow file exists at `.agents/workflows/pr_screenshots.md`.

---

## 7. Efficiency Unit Dropdown — Hidden by Default

### Issue: Users didn't notice the efficiency unit toggle (MPG vs mi/kWh)
**Session:** FuelIQ Comparison Table Refinement  
**What happened:** The EV efficiency dropdown for switching units was styled to blend into the table. Users couldn't tell it was interactive.  
**Fix (commit `2c575f5`):** Styled the dropdown with a visible border, chevron icon, and hover state to make it obviously interactive.  
**Lesson:** Interactive controls inside table cells need explicit affordance styling — don't rely on browser-default `<select>` appearance, which is easy to miss in a dense UI.

---

## 8. `app.js` Structure — Key Areas

- **`EVPresets` object** — Defines all electric vehicle presets. High-conflict zone when adding new vehicles.
- **`GasPresets` object** — Defines gas vehicle presets.
- **`renderBreakdownChart()`** — The Annual Cost Breakdown chart. See issue #3 re: emoji label arrays.
- **`updateResults()`** — Central function re-calculating all displayed values. Changes to formula logic go here.
- **`calculateTCO()`** — Total Cost of Ownership calculations including tax credits, depreciation. 
- **Element IDs** — After the comparison table redesign (session `196e9076`), all element IDs changed. The old sidebar IDs (`#gas-panel`, `#ev-panel`) are gone. Current IDs use the comparison table pattern (`.comparison-row`, `#verdict-bar`).

---

## 9. Repo Layout (as of 2026-03-31)

```
feuliq/
├── index.html          # Main app shell, comparison table layout
├── style.css           # Full CSS — comparison-table grid, compact-header, verdict bar
├── app.js              # Logic — presets, calculations, Chart.js rendering
├── README.md           # Project overview
├── assets/
│   └── screenshots/    # Before/after PR screenshots
└── .agents/
    ├── memory/
    │   └── learnings.md  # This file
    └── workflows/
        └── pr_screenshots.md
```

**Deployed at:** `https://kobemartin.github.io/feuliq/`  
**Repository:** `https://github.com/kobemartin/feuliq`

---

## 10. General Workflow for This Repo

1. `git checkout -b <feature-branch>` from latest `main`
2. Make changes
3. Capture before/after screenshots (see #6 above)
4. `git add . && git commit -m "feat|fix|chore|docs: description"`
5. `git push origin <feature-branch>`
6. `gh pr create --title "..." --body "...![Before](...) ![After](...)"`
7. Never `git push origin main` — branch protection is active
