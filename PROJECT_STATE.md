# Cycle Relay — Project State

## Current Phase
Phase 9 — COMPLETE

## Environment
- Node: v22.22.0
- npm: 11.17.0
- git: 2.39.5
- Platform: macOS Darwin 24.5.0

## Completed Steps

### Phase 0 ✅ — Environment Setup
- [x] PROJECT_STATE.md created
- [x] Node, npm, git confirmed available

### Phase 1 ✅ — Research
- [x] Cycle Clarity: product, technology, workflow gap documented
- [x] Coastal Fertility Specialists: practice overview, Dr. Schnorr bio
- [x] IVF coordinator workflow: all 14 stages documented with emotional context
- [x] Competitive landscape: gap analysis documented
- [x] Saved to: docs/research.md

### Phase 2 ✅ — Project Planning
- [x] Architecture decisions documented
- [x] Provider abstraction layer designed
- [x] Prompt engineering plan for all 14 stages
- [x] UI/UX plan documented
- [x] Demo patient profiles designed
- [x] Saved to: docs/plan.md

### Phase 3 ✅ — Skills
- [x] .claude/skills/ivf-domain.md
- [x] .claude/skills/cycle-relay-context.md

### Phase 4 ✅ — Build (Next.js 16, App Router)
- [x] @anthropic-ai/sdk and lucide-react installed
- [x] .env.local and .env.example created
- [x] lib/types.ts — CycleStage, PatientContext, GeneratedCommunication, AuditEntry, DemoPatient
- [x] lib/providers/ — IModelProvider, ClaudeProvider, OllamaProvider, getProvider()
- [x] lib/prompts.ts — SYSTEM_PROMPT + buildPrompt() for all 14 stages
- [x] app/actions.ts — generateCommunication() server action
- [x] lib/demo-patients.ts — 4 synthetic demo profiles
- [x] components/ProviderToggle.tsx
- [x] components/DemoPatientCard.tsx
- [x] components/CoordinatorForm.tsx
- [x] components/CommunicationOutput.tsx
- [x] components/AuditLog.tsx
- [x] app/page.tsx — full application page
- [x] app/layout.tsx — Inter font, dark bg, metadata

### Phase 5 ✅ — QA
- [x] npm run build — zero errors
- [x] npm run lint — zero errors
- [x] All 14 stages have stage-specific prompt instructions
- [x] 4 demo cards with full PatientContext pre-populated
- [x] Audit log with 20-entry FIFO cap
- [x] Clinical flags panel (conditional on clinicalFlags.length > 0)
- [x] Copy to clipboard on patient message
- [x] Ollama informational state in live demo
- [x] Responsive grid (1-col mobile, 2-col desktop)
- [x] .env.local gitignored
- [x] No API key in any committed file
- [x] JSON parsing with markdown fence stripping + error boundaries

### Phase 6 ✅ — README
- [x] Complete README with all required sections
- [x] Ollama setup instructions included
- [x] Synthetic data note included
- [x] Author links included

### Phase 7 ✅ — GitHub
- [x] Public repo: github.com/adam-vanarsdalen/cycle-relay
- [x] All code pushed to main (clean orphan history)
- [x] Repo description matches one-sentence project description
- [x] GitHub token removed from .mcp.json before push

### Phase 8 ✅ — Vercel Config
- [x] vercel.json created and pushed to main

## Decisions Made
- Stack: Next.js 16 App Router + TypeScript + Tailwind + @anthropic-ai/sdk
- Default provider: Claude (claude-sonnet-4-6)
- HIPAA path: Ollama local deployment (config toggle, not refactor)
- Theme: Dark clinical (#0B1628 bg, #06B6D4 accent)
- Commit history: clean orphan commit (avoided leaking OAuth token in git history)
- .mcp.json committed with GITHUB_TOKEN placeholder (token removed for public repo)

## Manual Steps Remaining
1. **Add ANTHROPIC_API_KEY to Vercel dashboard** after connecting the repo
   - Vercel → Project → Settings → Environment Variables
   - Key: `ANTHROPIC_API_KEY`
   - Value: your Anthropic API key
2. **Trigger first Vercel deployment** by connecting GitHub repo at vercel.com/new
3. **Add live Vercel URL to README.md** once deployed

## Security Notes
- .env.local is gitignored — ANTHROPIC_API_KEY never committed
- All Claude API calls via Next.js server actions — key never reaches client
- Ollama mode: PHI stays on local network entirely
- GitHub OAuth token removed from .mcp.json before push (replace "" with your token locally)

## Links
- GitHub: https://github.com/adam-vanarsdalen/cycle-relay
- Vercel: TBD after deployment
