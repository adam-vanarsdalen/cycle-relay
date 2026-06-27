# Cycle Relay — Project Plan

---

## Architecture

### Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS only — no component libraries
- **AI**: Anthropic SDK (claude-sonnet-4-6) via server actions
- **Alt AI**: Ollama local REST API (HIPAA deployment path)
- **Deployment**: Vercel (cloud demo) + local (HIPAA production)
- **Font**: Inter via next/font/google

### Why These Choices
- App Router server actions keep ANTHROPIC_API_KEY server-side only — never exposed to client
- Tailwind-only keeps bundle lean and maintains full visual control for dark clinical theme
- Provider abstraction means swapping Claude → Ollama is a single env var change, not a refactor
- No database — session-only audit log (localStorage or React state) keeps PHI off servers entirely

---

## Page Structure

```
app/
  layout.tsx          — root layout: Inter font, #0B1628 bg, metadata
  page.tsx            — main application page (single-page app)
  actions.ts          — server action: generateCommunication()
```

---

## Component Tree

```
app/page.tsx
├── Header
│   ├── Wordmark + tagline
│   ├── DemoBadge ("Demo — Built for Coastal Fertility Specialists")
│   └── ProviderToggle (Claude pill | Ollama pill)
├── DemoPatientCards (horizontal row, 4 cards)
│   └── DemoPatientCard × 4
├── MainLayout (2-col desktop, 1-col mobile)
│   ├── CoordinatorForm (left column)
│   │   ├── StageSelector (grouped by phase)
│   │   ├── PatientNameInput
│   │   ├── FollicleCountInput
│   │   ├── E2LevelInput
│   │   ├── MedicationAdjustmentInput
│   │   ├── NextAppointmentInput
│   │   └── ClinicalNotesTextarea
│   │   ├── GenerateButton (loading state)
│   │   └── ClearFormButton
│   └── CommunicationOutput (right column)
│       ├── EmptyState (before first generation)
│       ├── PatientMessagePanel (with copy button)
│       ├── CoordinatorSummaryPanel
│       ├── ClinicalFlagsPanel (yellow, conditional)
│       └── OutputMeta (provider badge, timestamp, stage)
└── AuditLog (collapsed by default, bottom)
    ├── ToggleButton (with entry count badge)
    └── AuditEntry × n (max 20)
```

---

## Server Action

```typescript
// app/actions.ts
'use server'
generateCommunication(context: PatientContext): Promise<GeneratedCommunication | GenerationError>
```

- Validates required fields (stage, patientName minimum)
- Calls `getProvider()` → ClaudeProvider or OllamaProvider
- Provider calls AI with SYSTEM_PROMPT + `buildPrompt(stage, context)`
- Returns parsed JSON: `{ patientMessage, coordinatorSummary, clinicalFlags, stage, timestamp, provider }`

---

## Provider Abstraction Layer

```
lib/providers/
  types.ts       — IModelProvider interface
  claude.ts      — ClaudeProvider (Anthropic SDK, claude-sonnet-4-6)
  ollama.ts      — OllamaProvider (local REST API)
  index.ts       — getProvider() factory
```

### IModelProvider Interface
```typescript
interface IModelProvider {
  generateCommunication(
    stage: CycleStage,
    context: PatientContext,
    systemPrompt: string,
    userPrompt: string
  ): Promise<GeneratedCommunication>
}
```

### ClaudeProvider
- Uses `@anthropic-ai/sdk`
- Model: `claude-sonnet-4-6`
- max_tokens: 1500
- temperature: default (1.0) — AI writing benefits from slight creativity
- Strips markdown fences from response before JSON.parse
- Tags output with `provider: 'claude'`

### OllamaProvider
- POST to `${NEXT_PUBLIC_OLLAMA_BASE_URL}/api/generate` (default: http://localhost:11434)
- Model from `NEXT_PUBLIC_OLLAMA_MODEL` (default: llama3)
- Same JSON output contract as ClaudeProvider
- On connection error: throws "Ollama connection failed. Ensure Ollama is running locally. See README for setup."
- Tags output with `provider: 'ollama'`

### Factory
```typescript
// NEXT_PUBLIC_MODEL_PROVIDER = 'claude' | 'ollama'
// defaults to 'claude' if not set
export function getProvider(): IModelProvider
```

---

## TypeScript Types

```typescript
// lib/types.ts

enum CycleStage {
  DAY3_BASELINE = 'day3_baseline',
  STIM_EARLY = 'stim_early',           // Day 3-5
  STIM_MID = 'stim_mid',               // Day 6-8
  STIM_LATE = 'stim_late',             // Day 9+
  TRIGGER_NIGHT = 'trigger_night',
  RETRIEVAL_PRE = 'retrieval_pre',
  RETRIEVAL_POST = 'retrieval_post',
  FERTILIZATION_REPORT = 'fertilization_report',
  DAY3_EMBRYO = 'day3_embryo',
  BLASTOCYST_REPORT = 'blastocyst_report',
  TRANSFER_DAY = 'transfer_day',
  TWW_CHECKIN = 'tww_checkin',
  BETA_POSITIVE = 'beta_positive',
  BETA_NEGATIVE = 'beta_negative',
}

enum CycleStageGroup {
  MONITORING = 'Monitoring & Stimulation',
  RETRIEVAL = 'Egg Retrieval',
  POST_RETRIEVAL = 'Post-Retrieval',
  TRANSFER = 'Transfer',
  RESULTS = 'Results',
}

interface PatientContext {
  stage: CycleStage
  patientName: string
  follicleCount?: string        // e.g. "Left: 6 (14,15,16mm), Right: 5 (12,13,14mm)"
  e2Level?: string              // e.g. "1240 pg/mL"
  medicationAdjustment?: string // e.g. "Continue Gonal-F 225, add Ganirelix tonight"
  nextAppointment?: string      // e.g. "Tomorrow at 7:30am"
  clinicalNotes?: string        // coordinator's freeform context
}

interface DemoPatient {
  id: string
  name: string
  age: number
  stage: CycleStage
  description: string           // one-line card summary
  context: PatientContext
}

interface GeneratedCommunication {
  patientMessage: string
  coordinatorSummary: string
  clinicalFlags: string[]
  stage: CycleStage
  timestamp: string
  provider: ModelProvider
}

interface AuditEntry {
  id: string
  timestamp: string
  stage: CycleStage
  provider: ModelProvider
  policyTag: string             // always: "HIPAA: No PHI stored. AI-assisted draft only. Coordinator review required before sending."
}

type ModelProvider = 'claude' | 'ollama'
```

---

## Prompt Engineering Plan

### SYSTEM_PROMPT
```
You are a compassionate IVF coordinator communication assistant at a fertility clinic.
Your role is to generate patient-facing messages and coordinator summaries for each stage
of an IVF cycle, based on information provided by the care coordinator.

Rules:
- Output ONLY valid JSON with exactly three fields: patientMessage, coordinatorSummary, clinicalFlags
- patientMessage: warm, clear, stage-appropriate message the coordinator will review and send to the patient
- coordinatorSummary: concise clinical summary for the coordinator's documentation (2-4 sentences)
- clinicalFlags: array of strings; each flag is a specific concern requiring physician review (empty array if none)
- Never invent clinical data not provided by the coordinator
- Never include clinical opinions, diagnoses, or prognoses
- Never recommend medication changes not already indicated by the coordinator
- Always include: what is happening now, what to expect next, who to contact with questions
- Match the emotional register of the stage — trigger night is urgent and precise, beta negative requires grief-aware compassion
- Patient messages should feel human, warm, and specific — not templated
```

### Stage-Specific Prompt Guidelines

| Stage | Tone | Key Requirements | Flag Triggers |
|-------|------|-----------------|---------------|
| Day 3 Baseline | Matter-of-fact, encouraging | Start date, injection training reminder | AFC < 5 bilaterally; elevated FSH/E2 |
| Stim Early | Reassuring, informative | Growth is normal, next appt | No response; E2 not rising |
| Stim Mid | Engaged, monitoring | Follicle progress, OHSS watch | E2 > 3000; rapid rise; >20 follicles |
| Stim Late | Anticipatory, excited | Almost there, trigger may be tonight | Lead follicle > 22mm; coasting needed |
| Trigger Night | Urgent, crystal clear | EXACT time, medication, retrieval time | Any ambiguity in trigger instructions |
| Retrieval Pre | Calm, procedural | NPO reminder, arrival, what to expect | |
| Retrieval Post | Warm relief | Egg count, fertilization timeline | 0 eggs retrieved; very low count |
| Fertilization | Hopeful, normalizing | Fertilized count, attrition is normal | 0 fertilized; very low fertilization rate |
| Day 3 Embryo | Steady, normalizing | Count, heading to blast, attrition OK | All arrested; very low cell count |
| Blastocyst | Significant, careful | Blast count, grading, PGT-A if applicable | 0 blasts; all arrested |
| Transfer Day | Celebratory-careful | Post-transfer instructions, beta date | Multiple high-risk factors |
| TWW Check-in | Compassionate, grounding | Progesterone OK, beta countdown | Progesterone < 10 on P4 support |
| Beta Positive | Warm celebration | Continued meds, OB scan scheduling | Very low beta; needs repeat |
| Beta Negative | Grief-aware, human | Space for grief, physician consult scheduled | — always flag for physician follow-up |

---

## UI/UX Plan

### Three Zones

**Zone 1 — Input Panel (left, desktop)**
- Stage selector: grouped `<select>` by phase group
- PatientContext fields: patient name (required), follicle count, E2 level, medication adjustment, next appointment, clinical notes
- Fields below stage selector adjust labels contextually (e.g., "Egg Count" at retrieval, "Beta Level" at results)
- Demo patient quick-load: 4 clickable cards above the form
- Generate button: teal, disabled during loading, shows spinner
- Clear button: ghost style

**Zone 2 — Output Panel (right, desktop)**
- Empty state: clipboard icon, prompt to generate first message
- Generated view: three sections (patient message, coordinator summary, flags)
- Copy button on patient message (clipboard icon, confirms with checkmark)
- Yellow flags panel: only appears when clinicalFlags.length > 0
- Provider badge + timestamp + stage label in output footer

**Zone 3 — Audit Log (bottom, collapsed)**
- Toggle button with count badge
- Each entry: time | stage | provider | policy tag
- Max 20 entries, FIFO
- "Session only — clears on page refresh" note

### Header
- Left: "Cycle Relay" wordmark (teal) + tagline in gray
- Center/Right: Demo badge (amber/orange pill) + ProviderToggle
- ProviderToggle: two pills — Claude (active default, teal) | Ollama (gray with tooltip)
- Ollama tooltip: "Local deployment only. PHI never leaves your network."

### Ollama Mode Behavior (Live Demo)
- Switching to Ollama does NOT show an error
- Shows informational state: "Ollama is your HIPAA-safe local deployment option. On the live demo, generation requires a local instance. See README for setup instructions."
- Generate button disabled with explanation
- This is a feature, not a limitation — demonstrates the HIPAA architecture

---

## Demo Patient Profiles (Synthetic)

All names, ages, and clinical details are entirely fictional. No real patient data.

### Profile 1: Sarah M., 34 — Stimulation Day 7
- Description: "Mid-stim check · 12 follicles · Good response"
- Stage: STIM_MID
- Follicle count: "Left: 7 (9,11,12,13,14,15,16mm), Right: 5 (10,11,13,14,15mm)"
- E2: "1,180 pg/mL"
- Medication: "Continue Gonal-F 225 IU tonight, Ganirelix started 2 nights ago"
- Next appointment: "Tomorrow morning at 7:30am"
- Notes: "Responding well, within expected range for Day 7. No OHSS concerns."

### Profile 2: Jennifer K., 38 — Trigger Night
- Description: "Trigger confirmed · 10:30pm · Retrieval Thursday"
- Stage: TRIGGER_NIGHT
- Follicle count: "Left: 9 (17,18,18,19,19,20,21mm + 2 smaller), Right: 9 (16,17,18,18,19,20mm + 3 smaller) — 18 total"
- E2: "3,420 pg/mL"
- Medication: "Ovidrel 250mcg SQ at exactly 10:30 PM TONIGHT. Do NOT take Gonal-F or Menopur tonight."
- Next appointment: "Retrieval Thursday at 8:00am — arrive at 7:30am"
- Notes: "Physician confirmed trigger timing. Retrieval in 36 hours. NPO after midnight Wednesday."

### Profile 3: Amanda R., 31 — Blastocyst Report Day 5
- Description: "Day 5 blast report · 3 blastocysts · Transfer planning"
- Stage: BLASTOCYST_REPORT
- Follicle count: "15 eggs retrieved → 12 mature → 10 fertilized → 3 blastocysts on Day 5"
- E2: "N/A (post-retrieval)"
- Medication: "Continue estradiol 2mg TID and progesterone in oil 50mg IM daily"
- Next appointment: "Phone consult with Dr. tomorrow to discuss transfer timeline and PGT-A results"
- Notes: "3 blasts biopsied for PGT-A. Grades: 4AA, 3BB, 3AB. All sent to genetics. Results expected in 7-10 days."

### Profile 4: Michelle T., 36 — Beta Result Negative
- Description: "Beta negative · Compassionate messaging · Next steps with physician"
- Stage: BETA_NEGATIVE
- Follicle count: "3 eggs retrieved → 2 fertilized → 1 blastocyst transferred"
- E2: "Beta hCG: < 1 mIU/mL (negative)"
- Medication: "Discontinue progesterone and estradiol. Expect period in 3-7 days."
- Next appointment: "Dr. Schnorr follow-up consult scheduled for next week to review cycle and discuss next steps"
- Notes: "Single euploid blast transferred. This was Michelle's second IVF cycle. She has been incredibly resilient throughout."

---

## State Flow

```
User selects stage → form fields update labels
User fills context → PatientContext object built
User clicks Generate → server action called → GeneratedCommunication returned
Output panel renders → AuditEntry appended → count badge updates
User copies message → clipboard API → button confirms

Provider toggle → React state (selectedProvider)
  → If ollama on live demo → generate disabled, info panel shown
  → If claude → normal flow

Demo card click → PatientContext loaded into form → stage selector updates
```
