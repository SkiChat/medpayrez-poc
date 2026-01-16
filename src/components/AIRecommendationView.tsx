import React from 'react';
import type { AIRecommendation } from '../types';

interface AIRecommendationViewProps {
    recommendation: AIRecommendation | null;
    isGenerating: boolean;
}

const AIRecommendationView: React.FC<AIRecommendationViewProps> = ({ recommendation, isGenerating }) => {
    if (isGenerating) {
        return (
            <div className="bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-black text-slate-800 animate-pulse">Running OpenRouter Analysis...</h3>
                <p className="text-slate-500 text-sm mt-2 max-w-xs uppercase tracking-widest font-bold">Consulting Statutory Cites & Provider History</p>
            </div>
        );
    }

    if (!recommendation) {
        return (
            <div className="bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-400">Strategy Engine Idle</h3>
                <p className="text-slate-400 text-sm mt-1">Adjust parameters and click generate to run strategy.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in zoom-in duration-500">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 text-white">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-md">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" /></svg>
                        </div>
                        <h3 className="text-xl font-black italic tracking-tight">AI Strategy Result</h3>
                    </div>
                    <span className="bg-green-500/20 text-green-300 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider border border-green-500/30">
                        {recommendation.compliance_status}
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <StatItem label="Opening Offer" value={`${recommendation.opening_offer_percentage}%`} />
                    <StatItem label="Offer Amount" value={`$${recommendation.opening_offer_amount.toLocaleString()}`} />
                    <StatItem label="Win Probability" value={`${(recommendation.win_probability * 100).toFixed(0)}%`} />
                    <StatItem label="Confidence" value={`${(recommendation.confidence_score * 100).toFixed(0)}%`} />
                </div>
            </div>

            <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Reasoning & Precedent</h4>
                        <p className="text-slate-700 text-sm leading-relaxed font-medium">{recommendation.ai_reasoning}</p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Likely Acceptance Range</h4>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-center items-center">
                            <p className="text-2xl font-black text-slate-800 tracking-tight">
                                {recommendation.likely_acceptance_range.low_percent}% – {recommendation.likely_acceptance_range.high_percent}%
                            </p>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                                ${recommendation.likely_acceptance_range.low_amount.toLocaleString()} – ${recommendation.likely_acceptance_range.high_amount.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row gap-6 justify-between items-start">
                    <div className="flex-1">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Statutory Basis</h4>
                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold ring-1 ring-blue-100">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" /><path d="M8 7h6" /><path d="M8 11h8" /></svg>
                            {recommendation.statutory_basis}
                        </div>
                    </div>
                    <div className="flex-1">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Risk Flags</h4>
                        <div className="flex flex-wrap gap-2">
                            {recommendation.risk_flags.length > 0 ? (
                                recommendation.risk_flags.map((flag, idx) => (
                                    <span key={idx} className="bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg text-xs font-bold ring-1 ring-amber-100 flex items-center gap-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                                        {flag}
                                    </span>
                                ))
                            ) : (
                                <span className="text-green-600 text-xs font-bold flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                    No Compliance Conflicts Identified
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatItem = ({ label, value }: { label: string, value: string }) => (
    <div>
        <p className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className="text-3xl font-black tabular-nums">{value}</p>
    </div>
);

export default AIRecommendationView;
