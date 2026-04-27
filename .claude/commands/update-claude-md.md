---
description: Force a CLAUDE.md update with everything learned in the current session
---

Review what we did in this session and update `claude.md` to reflect:

1. **New features added** — append to the `## Features Completed ✅` list
2. **New mistakes / lessons learned** — append to the `### Mistakes to NOT repeat` section. Be specific: state what was tried, why it failed, and what to do instead.
3. **Architecture decisions** — if we made a non-obvious choice (e.g. "fire-and-forget signOut", "useAuth() everywhere except /app"), document it in the relevant section.
4. **Removed / deprecated stuff** — if a file or pattern is no longer used, note it.
5. **Tooling / infra changes** — new env vars, new external services (UptimeRobot, Resend domain, etc.).

Style:
- Plain language, non-coder friendly
- Lead with WHY, not just WHAT
- Use ❌ / ✅ markers in the mistakes list
- Bullet points, not prose

Do NOT rewrite the whole file — only edit the relevant sections. Show a summary of what was added at the end.

If there's nothing meaningful to record (e.g. trivial fixes only), say so and don't touch the file.
