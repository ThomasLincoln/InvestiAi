---
name: feedback-dont-create-entire-project
description: User prefers incremental implementation — create minimal structure first, then ask before continuing
metadata:
  type: feedback
---

Don't create the entire project at once. Create only the minimum needed to run, then show a step-by-step guide and wait for the user to proceed.

**Why:** User interrupted when the assistant started creating too many files at once (auth, supabase client, etc.) before the user had validated the structure.

**How to apply:** For new projects, create the folder structure + config files + a SETUP.md, then stop and let the user decide what to implement next.
