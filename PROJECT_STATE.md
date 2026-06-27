# Cycle Relay — Project State

## Current Phase
Phase 0 — Complete. Starting Phase 1 (Research).

## Environment
- Node: v22.22.0
- npm: 11.17.0
- git: 2.39.5
- Platform: macOS Darwin 24.5.0

## Completed Steps

### Phase 0 ✅
- [x] PROJECT_STATE.md created
- [x] Node, npm, git confirmed available
- [x] Working directory: /Users/ajv/Desktop/cycle-relay
- [x] .mcp.json confirmed present with all 8 MCP servers

## Decisions Made
- Stack: Next.js 14 App Router + TypeScript + Tailwind + Anthropic SDK
- Default provider: Claude (claude-sonnet-4-6)
- HIPAA path: Ollama local deployment (config toggle, not refactor)
- Theme: Dark clinical (#0B1628 bg, #06B6D4 accent)
- Deployment: Vercel (cloud demo), Ollama (production HIPAA)

## Pending Items
- [ ] Phase 1: Research → docs/research.md
- [ ] Phase 2: Plan → docs/plan.md
- [ ] Phase 3: Skills → .claude/skills/
- [ ] Phase 4: Build all 10 steps
- [ ] Phase 5: QA (build, lint, manual checks)
- [ ] Phase 6: README.md
- [ ] Phase 7: GitHub repo (cycle-relay, public)
- [ ] Phase 8: vercel.json
- [ ] **MANUAL STEP**: Add ANTHROPIC_API_KEY to Vercel dashboard after repo connect

## Security Notes
- .env.local must never be committed
- ANTHROPIC_API_KEY lives in .env.local (local) and Vercel env vars (prod)
- All Claude API calls via Next.js server actions — key never reaches client
- Ollama mode: PHI stays on local network entirely

## GitHub
- Repo: cycle-relay (public)
- Owner: adam-vanarsdalen (to be confirmed)

## Vercel
- URL: TBD after deployment
- Manual step required: add ANTHROPIC_API_KEY in Vercel dashboard
