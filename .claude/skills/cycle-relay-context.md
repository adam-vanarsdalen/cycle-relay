# Cycle Relay — Project Context

## What It Is
Cycle Relay is a Next.js 14 web application that generates AI-assisted patient communications for IVF coordinators at fertility clinics. It is a portfolio demo built specifically for Coastal Fertility Specialists in Mount Pleasant, SC.

## The Problem It Solves
Cycle Clarity (AI follicle measurement tool by Dr. John Schnorr) automates the monitoring ultrasound and delivers a standardized folliculogram to the physician and an automated report to the patient. After that, the physician reviews and makes a dosing decision — and then the coordinator manually communicates that decision to each patient. This post-Cycle-Clarity communication gap is what Cycle Relay closes.

## Where It Fits
```
Cycle Clarity → follicle data to physician + auto-report to patient
Physician reviews → makes dosing decision
[Coordinator must now manually communicate that decision + emotional context to patient]
Cycle Relay → coordinator inputs clinical summary → AI generates stage-aware patient message → coordinator reviews and sends
```

## Target Audience
- **Demo target**: Coastal Fertility Specialists, Dr. John Schnorr (Mount Pleasant, SC)
- **Primary users**: IVF Coordinators
- **Evaluators**: Principal Patient Growth Manager, clinic operations leadership

## Tech Stack
- Next.js 14 App Router
- TypeScript (strict)
- Tailwind CSS (no component libraries)
- Anthropic SDK → claude-sonnet-4-6 (cloud default)
- Ollama REST API (HIPAA local deployment path)

## Provider Abstraction Layer
```
lib/providers/
  types.ts    → IModelProvider interface
  claude.ts   → ClaudeProvider (Anthropic SDK)
  ollama.ts   → OllamaProvider (local REST)
  index.ts    → getProvider() factory (reads NEXT_PUBLIC_MODEL_PROVIDER)
```

Switching from Claude to Ollama = one env var change. No refactor required.

## Component Naming Conventions
- `CoordinatorForm` — input panel
- `CommunicationOutput` — output panel
- `AuditLog` — session log
- `DemoPatientCard` — clickable profile card
- `ProviderToggle` — Claude/Ollama pill switch

## HIPAA Production Deployment Path
The Ollama mode is the path for clinics that cannot send PHI to third-party APIs. With Ollama:
- No patient data leaves the clinic network
- Claude API key not required
- Coordinator still reviews all output before sending
- Documented in README under "Local/HIPAA Deployment"

## Visual Identity
- Background: #0B1628 (deep navy)
- Surface cards: #0F1E35
- Primary text: #F8FAFC
- Secondary text: #94A3B8
- Accent: #06B6D4 (teal — interactive elements only)
- Borders: rgba(255,255,255,0.08)
- Hover borders: rgba(6,182,212,0.4)

## Demo Data
Four synthetic (fictional) patient profiles:
1. Sarah M., 34 — Stim Day 7, mid-cycle, 12 follicles
2. Jennifer K., 38 — Trigger Night, 18 follicles, 10:30pm trigger
3. Amanda R., 31 — Blastocyst Report Day 5, 3 blasts
4. Michelle T., 36 — Beta Negative, grief-aware messaging needed

## Deployment
- Cloud demo: Vercel
- ANTHROPIC_API_KEY must be added manually in Vercel dashboard after repo connect
- GitHub repo: cycle-relay (public)
- Author: Adam VanArsdalen
