import type { Case } from '../types';

export interface GeneratedInsight {
    type: 'Risk' | 'Opportunity' | 'Alert';
    message: string;
}

export const generateRuleBasedInsights = (c: Case): GeneratedInsight[] => {
    const insights: GeneratedInsight[] = [];

    // Rule 1: High Risk & Low Recovery
    if (c.riskTier === 'High' && c.predictedRecoveryPercent < 50) {
        insights.push({
            type: 'Risk',
            message: 'High variance risk detected. Predicted recovery is significantly below baseline. Consider earlier outreach.'
        });
    }

    // Rule 2: Long Tail
    if (c.predictedTimeToSettlementDays > 240) {
        insights.push({
            type: 'Alert',
            message: 'Long-tail case projected (>240 days). Monitor documentation and attorney responsiveness closely.'
        });
    }

    // Rule 3: Negotiation Status
    if (c.status === 'Negotiation') {
        insights.push({
            type: 'Opportunity',
            message: 'Case in negotiation. Focus on lien validation and negotiate reductions only if strict requirements are met.'
        });
    }

    // Rule 4: Gap between Pred vs Baseline
    if ((c.predictedRecoveryBaselinePercent - c.predictedRecoveryPercent) > 15) {
        insights.push({
            type: 'Risk',
            message: `Performance Gap: Case is tracking ${c.predictedRecoveryBaselinePercent - c.predictedRecoveryPercent}% below baseline for this injury type.`
        });
    }

    return insights;
};
