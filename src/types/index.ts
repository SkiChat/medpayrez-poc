export interface Provider {
    provider_name: string;
    provider_type: string;
    npi: string;
    avg_reduction: number;
    response_time: number;
    acceptance_rate: number;
}

export type SettlementStatus = 'In Resolution' | 'Negotiation' | 'Resolved' | 'Pending Offers';

export interface Settlement {
    settlement_id: string;
    case_number: string;
    client_name: string;
    injury_type: string;
    settlement_amount: number;
    settlement_offer_date: string;
    days_in_settlement: number;
    status: SettlementStatus | string;
    total_liens: number;
    total_lien_amount: number;
    negotiated_lien_amount: number;
    attorney_assigned: string;
    paralegal_assigned: string;
    opposing_party: string;
    jurisdiction?: string;
}

export type LienStatus = 'Resolved' | 'Pending' | 'Counter-Offer';

export interface Lien {
    lien_id: string;
    settlement_id: string;
    provider_name: string;
    service_type: string;
    charged_amount: number;
    original_lien_amount: number;
    ai_recommended_amount: number;
    reduction_statute: string;
    provider_response: string;
    negotiated_amount: number;
    status: LienStatus | string;
}

export interface AcceptanceRange {
    low_percent: number;
    high_percent: number;
    low_amount: number;
    high_amount: number;
}

export interface ProviderInsights {
    historical_avg_reduction: number;
    acceptance_rate: number;
    response_time_days: number;
}

export interface AIRecommendation {
    provider_name: string;
    original_lien: number;
    opening_offer_percentage: number;
    opening_offer_amount: number;
    likely_acceptance_range: AcceptanceRange;
    win_probability: number;
    statutory_basis: string;
    provider_insights: ProviderInsights;
    risk_flags: string[];
    compliance_status: 'COMPLIANT' | 'WARNING' | 'FAIL' | string;
    confidence_score: number;
    ai_reasoning: string;
}

export interface MultiProviderOptimization {
    total_original_liens: number;
    optimized_payout: number;
    total_reduction: number;
    reduction_percentage: number;
    client_recovery_impact: string;
}

export interface StrategyResponse {
    settlement_id: string;
    timestamp: string;
    generation_time_ms: number;
    recommendations: AIRecommendation[];
    multi_provider_optimization: MultiProviderOptimization;
}
