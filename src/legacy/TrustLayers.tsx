import React from 'react';
import type { AIRecommendation, Lien } from '../types';

interface TrustLayersProps {
    recommendation: AIRecommendation;
    historicalOutcomes: Lien[];
}

const TrustLayers: React.FC<TrustLayersProps> = ({ recommendation, historicalOutcomes }) => {
    const similarCases = historicalOutcomes
        .filter(l => l.status === 'Resolved')
        .slice(0, 2);

    return (
        <div className="space-y-6 mt-12 animate-slide-up">
            <div className="flex items-center gap-4 px-2">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">AI Trust Architecture</h3>
                <div className="h-px bg-slate-200 w-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Layer 1: Transparency */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-blue-50 text-brand-blue rounded-xl flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                        </div>
                        <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">L1: Traceability</h4>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Model Infrastructure</p>
                            <p className="text-xs font-black text-slate-700 font-mono bg-slate-50 px-2 py-1 rounded inline-block">Llama-3-70B • OpenRouter</p>
                        </div>
                        <div>
                            <div className="flex justify-between items-end mb-1.5">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Confidence Index</p>
                                <span className="text-xs font-black text-brand-blue">{(recommendation.confidence_score * 100).toFixed(0)}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-blue rounded-full transition-all duration-1000" style={{ width: `${recommendation.confidence_score * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Layer 2: Precedent */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-purple-50 text-brand-purple rounded-xl flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>
                        </div>
                        <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">L2: Precedent</h4>
                    </div>
                    <div className="space-y-3">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Historical Matching</p>
                        {similarCases.length > 0 ? (
                            similarCases.map((c, idx) => (
                                <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-slate-50/50 border border-slate-100">
                                    <span className="text-[10px] font-bold text-slate-600 truncate max-w-[90px]">{c.provider_name}</span>
                                    <span className="text-[10px] font-black text-white bg-brand-purple px-1.5 py-0.5 rounded">-{(((c.original_lien_amount - c.negotiated_amount) / c.original_lien_amount) * 100).toFixed(0)}%</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 border-2 border-dashed border-slate-100 rounded-xl">
                                <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">No Matches</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Layer 3: Safeguards */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                        </div>
                        <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">L3: Safeguards</h4>
                    </div>
                    <div className="space-y-3">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Risk Mitigators</p>
                        <div className="flex flex-wrap gap-1.5">
                            {recommendation.risk_flags.length > 0 ? (
                                recommendation.risk_flags.map((flag, idx) => (
                                    <span key={idx} className="text-[9px] bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                                        {flag.split(' ').slice(0, 2).join(' ')}
                                    </span>
                                ))
                            ) : (
                                <span className="text-[9px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ring-1 ring-green-100">Statutory Clean</span>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-500 italic mt-3 line-clamp-2 leading-relaxed font-medium">"{recommendation.ai_reasoning}"</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TrustLayers;
