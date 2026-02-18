import React, { useState, useEffect } from 'react';
import type { Settlement, Provider, AIRecommendation as AIRecType, Lien } from '../types';
import CaseDetails from './CaseDetails';
import AIRecommendation from './AIRecommendation';

interface AttorneyDashboardProps {
    settlements: Settlement[];
    providers: Provider[];
    selectedCaseId: string | null;
    onCaseSelect: (id: string | null) => void;
}

const AttorneyDashboard: React.FC<AttorneyDashboardProps> = ({
    settlements,
    providers: _,
    selectedCaseId,
    onCaseSelect
}) => {
    const [globalOutcomes, setGlobalOutcomes] = useState<Lien[]>([]);
    const [caseLiens, setCaseLiens] = useState<Lien[]>([]);
    const [recommendation, setRecommendation] = useState<AIRecType | null>(null);

    const selectedCase = settlements.find(s => s.settlement_id === selectedCaseId);

    useEffect(() => {
        fetch('/historical_outcomes.json')
            .then(res => res.json())
            .then((data: Lien[]) => {
                setGlobalOutcomes(data);
            })
            .catch(err => console.error("Error loading outcomes:", err));
    }, []);

    useEffect(() => {
        const id = selectedCaseId;
        if (id && globalOutcomes.length > 0) {
            const currentSettlement = settlements.find(s => s.settlement_id === id);
            if (currentSettlement) {
                const filtered = globalOutcomes.filter(l => l.settlement_id === id);
                setCaseLiens(filtered);

                const mockRec: AIRecType = {
                    provider_name: filtered[0]?.provider_name || "Regional Health Net",
                    original_lien: currentSettlement.total_lien_amount,
                    opening_offer_percentage: 42,
                    opening_offer_amount: Math.floor(currentSettlement.total_lien_amount * 0.58),
                    likely_acceptance_range: {
                        low_percent: 38,
                        high_percent: 45,
                        low_amount: Math.floor(currentSettlement.total_lien_amount * 0.55),
                        high_amount: Math.floor(currentSettlement.total_lien_amount * 0.62)
                    },
                    win_probability: 0.91,
                    statutory_basis: "CA BC §3040 • Proportionality",
                    provider_insights: {
                        historical_avg_reduction: 0.41,
                        acceptance_rate: 0.94,
                        response_time_days: 1.2
                    },
                    risk_flags: [],
                    compliance_status: "COMPLIANT",
                    confidence_score: 0.98,
                    ai_reasoning: "ATTORNEY REVIEW: Recommended aggressive posture justified by high gross settlement and provider's 2024 response patterns in this zip code."
                };
                setRecommendation(mockRec);
            }
        }
    }, [selectedCaseId, globalOutcomes, settlements]);

    const handleCaseSelect = (id: string) => {
        onCaseSelect(id);
    };

    return (
        <div className="space-y-12 py-6 animate-fade-in">
            {/* Portfolio Vision Card */}
            <div className="bg-brand-dark rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-blue/20 rounded-full blur-[120px] -mr-64 -mt-64 group-hover:scale-110 transition-transform duration-1000"></div>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse"></span>
                            <h2 className="text-xs font-black text-blue-200 uppercase tracking-[0.3em]">Executive Overview</h2>
                        </div>
                        <h3 className="text-5xl font-black mb-6 tracking-tighter leading-none italic">Portfolio Analytics</h3>
                        <p className="text-blue-100/60 font-medium max-w-md leading-relaxed">
                            Your current firm-wide reduction yield is <span className="text-white font-black underline decoration-brand-blue decoration-4 underline-offset-4 tracking-tight">42.8%</span>. This is 6% above the regional average for personal injury settlements.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-6 lg:justify-end">
                        <VisionStat label="Est. Savings" value="$412.5k" trend="+14.2%" />
                        <VisionStat label="Resolution Vel." value="12.4d" trend="-15%" />
                    </div>
                </div>

                {/* Visual Progress Track */}
                <div className="mt-12">
                    <div className="flex justify-between items-end mb-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resolution Progress</p>
                        <span className="text-xs font-black text-brand-blue">78% Closed</span>
                    </div>
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <div className="h-full bg-gradient-to-r from-brand-blue to-blue-400 rounded-full w-[78%] shadow-[0_0_15px_rgba(46,134,171,0.5)]"></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Left Side: Queue */}
                <div className="lg:col-span-4 lg:sticky lg:top-24">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <div>
                                <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-[10px]">Case Pipeline</h3>
                                <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Awaiting Final Review</p>
                            </div>
                            <span className="bg-brand-blue/10 text-brand-blue text-[10px] font-black px-2.5 py-1 rounded-lg">
                                {settlements.length} ACTIVE
                            </span>
                        </div>
                        <div className="divide-y divide-slate-50 max-h-[800px] overflow-y-auto custom-scrollbar">
                            {settlements.map(s => (
                                <button
                                    key={s.settlement_id}
                                    onClick={() => handleCaseSelect(s.settlement_id)}
                                    className={`w-full text-left p-8 transition-all hover:bg-slate-50 relative group ${selectedCaseId === s.settlement_id ? 'bg-blue-50/30' : ''
                                        }`}
                                >
                                    {selectedCaseId === s.settlement_id && (
                                        <div className="absolute left-0 top-6 bottom-6 w-1 rounded-r-full bg-brand-blue shadow-[4px_0_10px_rgba(46,134,171,0.3)]"></div>
                                    )}
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">#{s.case_number}</span>
                                        <div className="flex gap-1.5">
                                            <span className="text-[8px] font-black bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded tracking-tighter uppercase">{s.jurisdiction || 'CA'}</span>
                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded tracking-tighter uppercase ${s.status === 'Resolved' ? 'bg-green-50 text-green-600' : 'bg-brand-blue/10 text-brand-blue'
                                                }`}>
                                                {s.status}
                                            </span>
                                        </div>
                                    </div>
                                    <h4 className="font-black text-slate-900 group-hover:text-brand-blue transition-colors text-lg tracking-tight leading-tight uppercase underline-offset-4 group-hover:underline">{s.client_name}</h4>
                                    <div className="flex justify-between mt-4 items-center">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Lien: <span className="text-slate-900 font-black">${s.total_lien_amount.toLocaleString()}</span></p>
                                        <p className="text-[10px] font-black text-brand-blue uppercase bg-white border border-blue-100 px-2 py-1 rounded-lg shadow-sm">${s.settlement_amount.toLocaleString()}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Details & Override */}
                <div className="lg:col-span-8 space-y-12">
                    {selectedCase ? (
                        <div className="space-y-12 animate-slide-up">
                            <CaseDetails settlement={selectedCase} liens={caseLiens} />

                            <div className="relative pt-10 border-t-2 border-dashed border-slate-100">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-6">
                                    <div className="bg-amber-100 text-amber-600 px-4 py-1.5 rounded-full flex items-center gap-2 border border-amber-200">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                        <span className="text-[10px] font-black uppercase tracking-[0.1em]">Attorney Override Active</span>
                                    </div>
                                </div>
                                <AIRecommendation
                                    recommendation={recommendation}
                                    historicalOutcomes={globalOutcomes}
                                    editable={true}
                                    onApprove={(rec) => alert(`STRATEGY APPROVED\nOffer of ${rec.opening_offer_percentage}% issued to carrier for client: ${selectedCase.client_name}`)}
                                    onReject={() => alert("REVIEW REJECTED\nStrategy discarded. AI re-calibration requested.")}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="h-[700px] flex flex-col items-center justify-center text-center p-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-inner group">
                                <svg className="w-12 h-12 text-slate-200 group-hover:text-brand-purple transition-all duration-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" strokeWidth="2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" strokeWidth="2" /></svg>
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter italic">Review Queue</h2>
                            <p className="text-slate-400 max-w-sm leading-relaxed font-bold uppercase tracking-widest text-[10px] italic">
                                Select a pending settlement from the sidebar to review AI-generated results and perform final verification.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const VisionStat = ({ label, value, trend }: { label: string, value: string, trend: string }) => (
    <div className="bg-white/5 backdrop-blur-3xl px-8 py-5 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-colors group">
        <p className="text-[10px] font-black text-blue-200/40 uppercase tracking-[0.2em] mb-2">{label}</p>
        <div className="flex items-end gap-3">
            <span className="text-4xl font-black italic tracking-tighter">{value}</span>
            <span className={`text-[10px] font-black mb-1.5 px-2 py-0.5 rounded-lg ${trend.startsWith('+') ? 'bg-green-500/20 text-green-400' : 'bg-brand-blue/20 text-blue-300'}`}>
                {trend}
            </span>
        </div>
    </div>
);

export default AttorneyDashboard;
