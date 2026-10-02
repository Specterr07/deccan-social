# deccan-social

Turns Deccan Produce's monthly marketing calendar into ready-to-post, on-brand Instagram and LinkedIn posts with captions, sent to the social media person for approval.

- Product and scope: [docs/PRD.md](docs/PRD.md)
- How it's built: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Where work stands: [docs/STATUS.md](docs/STATUS.md)
- Brand rules: [docs/BRAND.md](docs/BRAND.md) · assets in [brand/](brand/)

## First-time setup on a Mac

```bash
cd ~/Projects/deccan-social        # wherever you unzipped it
git init && git add -A && git commit -m "chore: project foundation (docs, brand, SDLC)"
# .env.local already exists — fill it, then: cd scripts && npm install && npm run check-env
claude                             # start Claude Code, then type /start
```

Needs: Node 22+, pnpm (`npm i -g pnpm`), Docker Desktop (for deploy), Fly CLI (`brew install flyctl`).

Online references (owner's copies):
- Brand kit: https://claude.ai/artifact/37MQ2N2hKM9QhDwx3EQiVt
- Architecture doc: https://claude.ai/code/artifact/4a64459b-6376-4be0-94b3-a8ad666700b6

The files in this repo are the source of truth; the online copies are for reading and sharing.
