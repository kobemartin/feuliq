---
name: FuelIQ Repo Context & Learnings
description: Essential context, gotchas, and learnings for working on the FuelIQ repo (kobemartin/feuliq). Read this before any task involving index.html, style.css, app.js, GitHub workflows, or pull requests in this project.
---

# FuelIQ Agent Learnings (kobemartin/feuliq)

Distilled from past sessions. Read this before any task on this repo.

---

## 1. GitHub Pages 404 After Merging

Merging to `main` does NOT auto-trigger GitHub Pages. Pages must be manually enabled in repo **Settings → Pages** (set source to `main`, root `/`). After first-time setup, subsequent pushes to `main` auto-deploy. Always check the Actions tab for a `pages-build-deployment` run after a merge.

---

## 2. PR Preview — `rossjrw/pr-preview-action` Does NOT Work Here

The `pr-preview-action@v1` was tried and removed (it conflicts with the existing Pages setup). **Do not use it.** Vercel is the preferred approach for PR previews on this repo.

---

## 3. Chart.js — Emoji in X-Axis Labels Causes Misalignment

When a Chart.js label mixes emoji + text in a single string, the rendering height is inconsistent. Fix: use a **nested array** so Chart.js renders them on separate lines.

```js
// ❌ BROKEN — causes bar alignment issues:
labels: ['⛽ Gas', '⚡ Electric'],

// ✅ FIXED — consistent rendering:
labels: [['⛽', 'Gas'], ['⚡', 'Electric']],
```

---

## 4. `EVPresets` in `app.js` Is a High-Conflict Zone

Multiple features (emoji formatting, Chevy Bolt add) touched the same `EVPresets` object in the same session window. **Always `git rebase origin/main`** on a feature branch before opening a PR to avoid conflicts here.

---

## 5. Branch Protection Is Active — Never Push to `main`

`main` requires a PR. Never run `git push origin main`. Always:
1. `git checkout -b <branch>` from latest `main`
2. Push the branch
3. Open PR via `gh pr create`

**Note:** `gh` CLI currently has a config permissions issue (`operation not permitted` on `~/.config/gh/config.yml`). Use the GitHub web UI to open PRs if `gh pr create` fails.

---

## 6. PR Screenshots Are Required for UI Changes

Workflow file: `.agents/workflows/pr_screenshots.md`

1. Capture before (on `main`) and after (on feature branch) screenshots using browser tools
2. Save to `/assets/screenshots/` and commit on the feature branch
3. Reference in PR body:
   ```
   ![Before](https://github.com/kobemartin/feuliq/blob/<branch>/assets/screenshots/before.png?raw=true)
   ![After](https://github.com/kobemartin/feuliq/blob/<branch>/assets/screenshots/after.png?raw=true)
   ```

---

## 7. Efficiency Unit Dropdown Needs Explicit Affordance

The EV efficiency unit `<select>` inside the comparison table is easy to miss. It must have visible border, chevron, and hover styling — don't rely on browser-default `<select>` appearance.

---

## 8. `app.js` Key Structure

| Function | Purpose | Risk Level |
|---|---|---|
| `EVPresets` | EV vehicle preset data | 🔴 High conflict |
| `GasPresets` | Gas vehicle preset data | 🟡 Medium |
| `renderBreakdownChart()` | Annual Cost bar chart | 🟡 Emoji label fix needed |
| `updateResults()` | Central calc, updates all displayed values | 🟡 Medium |
| `calculateTCO()` | TCO with tax credits & depreciation | 🟢 Low |

---

## 9. Repo Layout (post-comparison-table redesign)

```
feuliq/
├── index.html          # Comparison table layout (NOT the old sidebar/panel split)
├── style.css           # comparison-table grid, compact-header, verdict bar
├── app.js              # Presets, calculations, Chart.js rendering
├── README.md
├── assets/screenshots/ # PR before/after screenshots
└── .agents/
    ├── skills/feuliq_context/SKILL.md   # This file
    └── workflows/pr_screenshots.md
```

**Live site:** https://kobemartin.github.io/feuliq/  
**Repo:** https://github.com/kobemartin/feuliq

> [!IMPORTANT]
> The old `index.html` had a sidebar+hero layout. It was fully rewritten to a 3-column comparison table. Old CSS class names like `.dashboard-sidebar`, `.dashboard-main`, `.cost-bar` no longer exist.

---

## 10. Standard PR Workflow for This Repo

```bash
git checkout main && git pull origin main
git checkout -b <type>/<description>   # e.g. feat/add-nissan-leaf
# ... make changes ...
# Capture before/after screenshots → /assets/screenshots/
git add . && git commit -m "<type>: <description>"
git push origin <branch>
# Open PR on GitHub (gh CLI may be broken — use web UI if needed)
```

---

## 11. Parallel Execution with Git Worktrees

> [!IMPORTANT]
> If multiple agents are working on this repo **simultaneously**, they MUST use separate workspaces to avoid file/branch clashing.

**Recommended Approach: Git Worktrees**
Instead of cloning the repo multiple times, use a worktree to check out a new branch in a separate folder:
```bash
# From the main repo directory:
git worktree add ../feuliq-worker-1 feature/my-new-task
```
**Benefits:** 
- Prevents two agents from overwriting the same `app.js` or `index.html`.
- Avoids "branch flip-flopping" where one agent's checkout ruins another's session.
- Shares the same `.git` history/objects (saving disk space).

**Cleanup:** When done and the branch is merged, remove the worktree:
```bash
git worktree remove ../feuliq-worker-1
```
