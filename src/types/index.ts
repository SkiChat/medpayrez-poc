export interface Provider {
  id: string;
  name: string;
  specialty: string;
  practiceName: string;
  state: string;
}

export interface Attorney {
  id: string;
  firmName: string;
  attorneyName: string;
  caseVolumeTier: 'High' | 'Medium' | 'Low';
}

export type CaseStatus = 'Open' | 'Negotiation' | 'Settled' | 'Paid' | 'Active';
export type RiskTier = 'Low' | 'Medium' | 'High';
export type ContractType = 'MedPayRez' | 'Legacy LOP' | 'No Contract';
export type ContractStatus = 'Executed' | 'Pending Signature' | 'None';

export interface Case {
  id: string;
  patientAlias: string;
  ageBucket: string;
  injuryType: string;
  state: string;
  providerId: string;
  attorneyId: string;
  lienAmount: number;
  billedAmount: number;
  predictedRecoveryPercent: number;
  predictedRecoveryBaselinePercent: number;
  predictedTimeToSettlementDays: number;
  status: CaseStatus;
  riskTier: RiskTier;
  intakeDate: string;
  lastUpdatedDate: string;

  // PI Recovery Command Center extensions (all optional for backward compat)
  contractType?: ContractType;
  contractStatus?: ContractStatus;
  attorneyName?: string;
  lawFirm?: string;
  attorneyAcknowledged?: boolean;
  recoveryRisk?: 'Low' | 'Medium' | 'High';
  ageBucketDays?: number;
  // Case management attribution (optional, no migration required)
  assignedTo?: string;
  managementMode?: 'Staff' | 'AI-assisted';
}

export type WorkflowEventType =
  | 'IntakeCompleted'
  | 'ContractSigned'
  | 'RecordsRequested'
  | 'TreatmentDocumented'
  | 'InvoiceIssued'
  | 'FollowUpSent'
  | 'SettlementReached'
  | 'PaymentReceived'
  | 'Negotiation'
  | 'Alert'
  | 'DemandSent'
  | 'Intake'
  | 'NoticeGenerated'
  | 'FollowUpScheduled';

export interface CaseEvent {
  caseId: string;
  timestamp: string;
  type: WorkflowEventType;
  description: string;
}

export interface Insight {
  type: 'Rule' | 'AI';
  content: string;
  confidence?: number;
}

export interface AIInsight {
  nextBestActions: string[];
  documentationGaps: string[];
  paymentDelayRisk: 'Low' | 'Medium' | 'High';
  followUpRecommendation: string;
  confidence: number;
  model: string;
  generatedAt?: string;
}

export interface AppData {
  providers: Provider[];
  attorneys: Attorney[];
  cases: Case[];
  events: CaseEvent[];
}
