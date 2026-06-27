import { CycleStage } from './types'
import type { DemoPatient } from './types'

export const DEMO_PATIENTS: DemoPatient[] = [
  {
    id: 'sarah-m',
    name: 'Sarah M.',
    age: 34,
    stage: CycleStage.STIM_MID,
    description: 'Mid-stim · Day 7 · 12 follicles · Good response',
    context: {
      stage: CycleStage.STIM_MID,
      patientName: 'Sarah',
      follicleCount:
        'Left: 7 (9, 11, 12, 13, 14, 15, 16mm), Right: 5 (10, 11, 13, 14, 15mm) — 12 total',
      e2Level: '1,180 pg/mL',
      medicationAdjustment:
        'Continue Gonal-F 225 IU tonight, Ganirelix started 2 nights ago — continue same dose',
      nextAppointment: 'Tomorrow morning at 7:30am',
      clinicalNotes:
        'Responding well, within expected range for Day 7. No OHSS concerns. E2 trajectory is appropriate.',
    },
  },
  {
    id: 'jennifer-k',
    name: 'Jennifer K.',
    age: 38,
    stage: CycleStage.TRIGGER_NIGHT,
    description: 'Trigger confirmed · 10:30pm tonight · Retrieval Thursday 8am',
    context: {
      stage: CycleStage.TRIGGER_NIGHT,
      patientName: 'Jennifer',
      follicleCount:
        'Left: 9 (17, 18, 18, 19, 19, 20, 21mm + 2 smaller), Right: 9 (16, 17, 18, 18, 19, 20mm + 3 smaller) — 18 total mature-range',
      e2Level: '3,420 pg/mL',
      medicationAdjustment:
        'Ovidrel 250mcg SQ at EXACTLY 10:30 PM tonight. Do NOT take Gonal-F or Menopur tonight. No other medications.',
      nextAppointment: 'Retrieval Thursday at 8:00am — arrive by 7:30am',
      clinicalNotes:
        'Physician confirmed trigger timing. Retrieval in 36 hours. NPO after midnight Wednesday. Partner sample needed by 7:45am Thursday.',
    },
  },
  {
    id: 'amanda-r',
    name: 'Amanda R.',
    age: 31,
    stage: CycleStage.BLASTOCYST_REPORT,
    description: 'Day 5 blast report · 3 blastocysts · Transfer planning',
    context: {
      stage: CycleStage.BLASTOCYST_REPORT,
      patientName: 'Amanda',
      follicleCount:
        '15 eggs retrieved → 12 mature → 10 fertilized → 3 blastocysts reached Day 5',
      e2Level: 'Post-retrieval (not applicable)',
      medicationAdjustment:
        'Continue estradiol 2mg three times daily and progesterone in oil 50mg IM daily',
      nextAppointment:
        'Phone consult with Dr. Schnorr tomorrow to discuss transfer timeline and PGT-A results',
      clinicalNotes:
        'All 3 blasts biopsied for PGT-A. Grades: 4AA, 3BB, 3AB. Sent to genetics lab. Results expected in 7–10 business days. Excellent outcome for her age and starting count.',
    },
  },
  {
    id: 'michelle-t',
    name: 'Michelle T.',
    age: 36,
    stage: CycleStage.BETA_NEGATIVE,
    description: 'Beta negative · Compassionate messaging · Physician follow-up scheduled',
    context: {
      stage: CycleStage.BETA_NEGATIVE,
      patientName: 'Michelle',
      follicleCount:
        '3 eggs retrieved → 2 fertilized → 1 blastocyst transferred (PGT-A euploid, Grade 3BB)',
      e2Level: 'Beta hCG: < 1 mIU/mL (negative)',
      medicationAdjustment:
        'Discontinue progesterone in oil and estradiol patches immediately. Expect period in 3–7 days.',
      nextAppointment:
        'Dr. Schnorr follow-up consult scheduled for next week to review cycle and discuss next steps',
      clinicalNotes:
        'This was Michelle\'s second IVF cycle. She has been incredibly resilient throughout. Single PGT-A normal blast was transferred. Team should be especially compassionate — this is a very difficult result for her.',
    },
  },
]
