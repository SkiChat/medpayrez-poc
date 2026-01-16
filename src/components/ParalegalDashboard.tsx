import React, { useState, useEffect } from 'react';
import type { Settlement, Provider, AIRecommendation as AIRecType, Lien } from '../types';
import CaseDetails from './CaseDetails';
import ScenarioSliders from './ScenarioSliders';
import AIRecommendation from './AIRecommendation';

interface ParalegalDashboardProps {
    settlements: Settlement[];
    providers: Provider[];
    selectedCaseId: string | null;
    onCaseSelect: (id: string | null) => void;
}

const ParalegalDashboard: React.FC<ParalegalDashboardProps> = ({
    settlements,
    providers: _,
    selectedCaseId,
    onCaseSelect
}) => {
    const [caseLiens, setCaseLiens] = useState<Lien[]>([]);
    const [globalOutcomes, setGlobalOutcomes] = useState<Lien[]>([]);
    const [recommendation, setRecommendation] = useState<AIRecType | null>(null);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    const [settlementAmount, setSettlementAmount] = useState<number>(25000);
    const [riskTolerance, setRiskTolerance] = useState<'Low' | 'Moderate' | 'High'>('Moderate');
    const [providerStrategy, setProviderStrategy] = useState<'Cooperative' | 'Defensive' | 'Aggressive'>('Defensive');

    console.log('[Paralegal] --- RENDER ---');
    console.log('[Paralegal] Prop selectedCaseId:', JSON.stringify(selectedCaseId));

    // Robust search logic
    const selectedCase = settlements.find(s => {
        if (!selectedCaseId) return false;
        const s_id = String(s.settlement_id).trim();
        const p_id = String(selectedCaseId).trim();
        const isMatch = s_id === p_id;
        return isMatch;
    });

    console.log('[Paralegal] Case Found:', !!selectedCase);
    if (selectedCaseId && !selectedCase) {
        console.warn('[Paralegal] MISSING CASE. Available IDs:', settlements.map(s => s.settlement_id));
    }

    // Initial load of outcome data
    useEffect(() => {
        fetch('/historical_outcomes.json')
            .then(res => res.json())
            .then((data: Lien[]) => {
                setGlobalOutcomes(data);
            })
            .catch(err => console.error("Error loading outcomes:", err));
    }, []);

    // Effect to sync state when case changes
    useEffect(() => {
        if (selectedCaseId && globalOutcomes.length > 0) {
            const filtered = globalOutcomes.filter(l => l.settlement_id === selectedCaseId);
            setCaseLiens(filtered);
        } else {
            setCaseLiens([]);
        }

        if (selectedCase) {
            setSettlementAmount(selectedCase.settlement_amount);
        }

        // Reset recommendation when case changes
        setRecommendation(null);
    }, [selectedCaseId, globalOutcomes, selectedCase]);

    const handleCaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const rawValue = e.target.value;
        console.log('[Paralegal] handleCaseChange triggered with rawValue:', JSON.stringify(rawValue));

        // Explicitly handle empty string as null
        const id = rawValue && rawValue !== "" ? String(rawValue) : null;

        console.log('[Paralegal] calling onCaseSelect with parsed id:', JSON.stringify(id));
        onCaseSelect(id);
    };

    const generateStrategy = () => {
        if (!selectedCase) return;
        setIsGenerating(true);

        setTimeout(() => {
            const riskFactor = riskTolerance === 'High' ? 0.15 : riskTolerance === 'Moderate' ? 0.05 : 0;
            const strategyFactor = providerStrategy === 'Aggressive' ? -0.1 : providerStrategy === 'Defensive' ? -0.05 : 0;

            const openingPercent = Math.min(60, Math.floor((0.40 + riskFactor + strategyFactor) * 100));
            const openingAmount = Math.floor(selectedCase.total_lien_amount * (1 - openingPercent / 100));

            const mockRec: AIRecType = {
                provider_name: "Integrated Med Group",
                original_lien: selectedCase.total_lien_amount,
                opening_offer_percentage: openingPercent,
                opening_offer_amount: openingAmount,
                likely_acceptance_range: {
                    low_percent: openingPercent - 5,
                    high_percent: openingPercent + 5,
                    low_amount: Math.floor(openingAmount * 0.95),
                    high_amount: Math.floor(openingAmount * 1.05)
                },
                win_probability: riskTolerance === 'High' ? 0.65 : 0.88,
                statutory_basis: "CA Civil Code §3040 / Common Fund",
                provider_insights: {
                    historical_avg_reduction: 0.39,
                    acceptance_rate: 0.92,
                    response_time_days: 1.4
                },
                risk_flags: providerStrategy === 'Aggressive' ? ["Provider flagged for aggressive billing history", "Statutory violation risk"] : [],
                compliance_status: "COMPLIANT",
                confidence_score: 0.94,
                ai_reasoning: `Recommended ${openingPercent}% reduction to maximize net client recovery while staying within §3040 safe harbor zones. Strategy calibrated for ${riskTolerance} risk profile against a ${providerStrategy} provider profile.`
            };

            setRecommendation(mockRec);
            setIsGenerating(false);
        }, 1500);
    };

    return (
        <div className="space-y-10 py-6 animate-fade-in">
            {/* Selection Toolbar */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 w-full relative">
                    <select
                        value={selectedCaseId || ''}
                        onChange={handleCaseChange}
                        className="w-full h-16 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 font-black text-slate-800 appearance-none focus:bg-white focus:border-brand-blue outline-none transition-all cursor-pointer"
                    >
                        <option value="">Select an active settlement case...</option>
                        {settlements.map(s => (
                            <option key={s.settlement_id} value={s.settlement_id}>
                                {s.client_name} • Case #{s.case_number}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </div>
                </div>

                <button
                    onClick={generateStrategy}
                    disabled={!selectedCaseId || isGenerating}
                    className={`h-16 px-12 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center gap-3 whitespace-nowrap shadow-xl active:scale-95 ${!selectedCaseId || isGenerating
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200'
                        : 'bg-brand-blue text-white hover:bg-brand-dark hover:-translate-y-1 shadow-brand-blue/20 ring-4 ring-brand-blue/10'
                        }`}
                >
                    {isGenerating ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4" /><path d="m16.2 7.8 2.9-2.9" /><path d="M18 12h4" /><path d="m16.2 16.2 2.9 2.9" /><path d="M12 18v4" /><path d="m7.8 16.2-2.9 2.9" /><path d="M6 12H2" /><path d="m7.8 7.8-2.9-2.9" /></svg>
                    )}
                    Generate AI Strategy
                </button>
            </div>

            {selectedCase ? (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
                    <div className="xl:col-span-4 space-y-10">
                        <CaseDetails settlement={selectedCase} liens={caseLiens} />
                        <ScenarioSliders
                            settlementAmount={settlementAmount}
                            setSettlementAmount={setSettlementAmount}
                            riskTolerance={riskTolerance}
                            setRiskTolerance={setRiskTolerance}
                            providerStrategy={providerStrategy}
                            setProviderStrategy={setProviderStrategy}
                        />
                    </div>

                    <div className="xl:col-span-8">
                        {isGenerating ? (
                            <div className="bg-white rounded-[3rem] border border-slate-200 p-24 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 inset-x-0 h-1 bg-slate-100 overflow-hidden">
                                    <div className="h-full bg-brand-blue w-1/3 animate-[shimmer_2s_infinite]"></div>
                                </div>
                                <div className="w-20 h-20 bg-brand-blue/5 rounded-[2rem] flex items-center justify-center mb-8 animate-bounce">
                                    <svg className="w-10 h-10 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">AI Negotiator Active</h3>
                                <p className="text-slate-400 text-xs mt-3 uppercase tracking-[0.2em] font-black">Scanning 1,400+ Jurisdictional Precedents</p>
                            </div>
                        ) : (
                            <AIRecommendation
                                recommendation={recommendation}
                                historicalOutcomes={globalOutcomes}
                            />
                        )}
                    </div>
                </div>
            ) : (
                <div className="h-[60vh] flex flex-col items-center justify-center text-center p-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                    <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-inner group">
                        <svg className="w-12 h-12 text-slate-200 group-hover:text-brand-blue transition-colors duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8" strokeWidth="2" /><line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" strokeLinecap="round" /></svg>
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Directory Empty</h2>
                    <p className="text-slate-400 max-w-sm leading-relaxed font-bold uppercase tracking-widest text-[10px] italic">
                        Select an active case from the repository above to initialize the MedPayRez strategy engine.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ParalegalDashboard;
