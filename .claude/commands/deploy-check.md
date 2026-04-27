---
description: Pre-deploy validation — type-check, git status, recent commits, push readiness
---

Run a complete pre-deploy validation of the current state. In one block, in parallel where possible:

1. `npx tsc --noEmit` — must show zero errors
2. `git status` — show what's modified, staged, untracked
3. `git log --oneline origin/main..HEAD` — list commits ready to push
4. `git diff --stat origin/main..HEAD` — summarize what files changed
5. Confirm there are no `console.log` or `console.error` accidentally left in `src/` from debugging

After running, give a one-paragraph readiness summary:
- ✅ Ready to push (X commits, Y files changed, types clean)
- OR ⚠ Issues to fix first (list them)

Don't push automatically. The user pushes manually.
