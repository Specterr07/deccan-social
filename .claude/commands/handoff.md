---
description: Write the session handoff and commit it
---
End-of-session handoff. Do all of this now, even if the task is unfinished.

1. Update `docs/TASKS.md`: tick finished acceptance boxes, set statuses, add findings to Notes, add new tasks for anything discovered.
2. Update `docs/STATUS.md`:
   - Rewrite "Now" (phase, current task + branch, last thing done, exact next action, blockers, production URL).
   - Add a session-log entry at the top of the log: date, agent, 3–6 bullets of what changed and why.
3. If a decision was made that a future reader would need, add an ADR to `docs/DECISIONS.md`.
4. If `.env` needs changed, update `.env.example`.
5. Commit everything (`wip(t-0N): …` if mid-task, else `docs: handoff`), then show me the "Now" section.

$ARGUMENTS
