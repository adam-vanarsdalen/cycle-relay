export enum CycleStage {
  DAY3_BASELINE = 'day3_baseline',
  STIM_EARLY = 'stim_early',
  STIM_MID = 'stim_mid',
  STIM_LATE = 'stim_late',
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

export enum CycleStageGroup {
  MONITORING = 'Monitoring & Stimulation',
  RETRIEVAL = 'Egg Retrieval',
  POST_RETRIEVAL = 'Post-Retrieval',
  TRANSFER = 'Transfer',
  RESULTS = 'Results',
}

export const STAGE_LABELS: Record<CycleStage, string> = {
  [CycleStage.DAY3_BASELINE]: 'Day 3 Baseline',
  [CycleStage.STIM_EARLY]: 'Stimulation Day 3–5 (Early)',
  [CycleStage.STIM_MID]: 'Stimulation Day 6–8 (Mid)',
  [CycleStage.STIM_LATE]: 'Stimulation Day 9+ (Late)',
  [CycleStage.TRIGGER_NIGHT]: 'Trigger Night',
  [CycleStage.RETRIEVAL_PRE]: 'Retrieval Day — Pre-Procedure',
  [CycleStage.RETRIEVAL_POST]: 'Retrieval Day — Post-Procedure',
  [CycleStage.FERTILIZATION_REPORT]: 'Fertilization Report (Day 1)',
  [CycleStage.DAY3_EMBRYO]: 'Day 3 Embryo Update',
  [CycleStage.BLASTOCYST_REPORT]: 'Blastocyst Report (Day 5/6)',
  [CycleStage.TRANSFER_DAY]: 'Transfer Day',
  [CycleStage.TWW_CHECKIN]: 'Two-Week Wait Day 7 Check-in',
  [CycleStage.BETA_POSITIVE]: 'Beta Result — Positive',
  [CycleStage.BETA_NEGATIVE]: 'Beta Result — Negative',
}

export const STAGE_GROUPS: Record<CycleStageGroup, CycleStage[]> = {
  [CycleStageGroup.MONITORING]: [
    CycleStage.DAY3_BASELINE,
    CycleStage.STIM_EARLY,
    CycleStage.STIM_MID,
    CycleStage.STIM_LATE,
    CycleStage.TRIGGER_NIGHT,
  ],
  [CycleStageGroup.RETRIEVAL]: [
    CycleStage.RETRIEVAL_PRE,
    CycleStage.RETRIEVAL_POST,
  ],
  [CycleStageGroup.POST_RETRIEVAL]: [
    CycleStage.FERTILIZATION_REPORT,
    CycleStage.DAY3_EMBRYO,
    CycleStage.BLASTOCYST_REPORT,
  ],
  [CycleStageGroup.TRANSFER]: [
    CycleStage.TRANSFER_DAY,
    CycleStage.TWW_CHECKIN,
  ],
  [CycleStageGroup.RESULTS]: [
    CycleStage.BETA_POSITIVE,
    CycleStage.BETA_NEGATIVE,
  ],
}

export interface PatientContext {
  stage: CycleStage
  patientName: string
  follicleCount?: string
  e2Level?: string
  medicationAdjustment?: string
  nextAppointment?: string
  clinicalNotes?: string
}

export interface DemoPatient {
  id: string
  name: string
  age: number
  stage: CycleStage
  description: string
  context: PatientContext
}

export interface GeneratedCommunication {
  patientMessage: string
  coordinatorSummary: string
  clinicalFlags: string[]
  stage: CycleStage
  timestamp: string
  provider: ModelProvider
}

export interface AuditEntry {
  id: string
  timestamp: string
  stage: CycleStage
  provider: ModelProvider
  policyTag: string
}

export type ModelProvider = 'claude' | 'ollama'
