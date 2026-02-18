import React, { useState, useEffect } from 'react';
import type { AIRecommendation as AIRecommendationType, Lien } from '../types';
import TrustLayers from './TrustLayers';

interface AIRecommendationProps {
    recommendation: AIRecommendationType | null;
    historicalOutcomes: Lien[];
    editable?: boolean;
    onApprove?: (rec: AIRecommendationType) => void;
    onReject?: (rec: AIRecommendationType) => void;
}

const AIRecommendation: React.FC<AIRecommendationProps> = ({
    recommendation,
    historicalOutcomes,
    editable = false,
    onApprove,
    onReject
}) => {
    const [editedRec, setEditedRec] = useState<AIRecommendationType | null>(recommendation);

    useEffect(() => {
        setEditedRec(recommendation);
    }, [recommendation]);

    if (!recommendation || !editedRec) return null;

    const handleInputChange = (field: keyof AIRecommendationType, value: any) => {
        setEditedRec(prev => prev ? ({ ...prev, [field]: value }) : null);
    };

    return (
        <div className="animate-fade-in space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full -mr-32 -mt-32 blur-[80px]"></div>

                {/* Dashboard Header */}
                <div className="bg-slate-900 px-10 py-6 flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-blue/20">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
                        </div>
                        <div>
                            <h2 className="text-white font-black text-sm uppercase tracking-[0.2em] leading-none mb-1">
                                {editable ? 'Strategy Verification' : 'AI-Optimized Strategy'}
                            </h2>
                            <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Autonomous Engine Resolve</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Engine Active</span>
                    </div>
                </div>

                {/* Main Offer Grid */}
                <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-10 relative z-10">
                    {/* Column 1: Financials */}
                    <div className="space-y-8 lg:border-r lg:border-slate-100 lg:pr-10">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4">Target Resolution</p>
                            <div className="flex items-end gap-2">
                                {editable ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={editedRec.opening_offer_percentage}
                                            onChange={(e) => handleInputChange('opening_offer_percentage', parseInt(e.target.value))}
                                            className="w-24 h-16 bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 text-4xl font-black text-slate-900 focus:border-brand-blue outline-none transition-all"
                                        />
                                        <span className="text-4xl font-black text-slate-300">%</span>
                                    </div>
                                ) : (
                                    <span className="text-6xl font-black text-slate-900 tracking-tighter italic">{editedRec.opening_offer_percentage}%</span>
                                )}
                            </div>
                            <p className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-tight">Reduction Target</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Opening Payout</p>
                            {editable ? (
                                <div className="flex items-center gap-1.5">
                                    <span className="text-lg font-black text-slate-400">$</span>
                                    <input
                                        type="number"
                                        value={editedRec.opening_offer_amount}
                                        onChange={(e) => handleInputChange('opening_offer_amount', parseInt(e.target.value))}
                                        className="w-full h-10 bg-slate-50 border-2 border-slate-200 rounded-xl px-3 font-black text-brand-blue focus:border-brand-blue outline-none transition-all"
                                    />
                                </div>
                            ) : (
                                <p className="text-2xl font-black text-brand-blue tracking-tight">${editedRec.opening_offer_amount.toLocaleString()}</p>
                            )}
                        </div>
                    </div>

                    {/* Column 2: Confidence & Basis */}
                    <div className="space-y-8 lg:border-r lg:border-slate-100 lg:pr-10">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4">Probability Analysis</p>
                            <div className="flex items-center gap-4">
                                <div className={`w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center ${editedRec.win_probability > 0.8 ? 'border-green-500 bg-green-50 text-green-700' : 'border-amber-500 bg-amber-50 text-amber-700'
                                    }`}>
                                    <span className="text-xl font-black">{(editedRec.win_probability * 100).toFixed(0)}%</span>
                                    <span className="text-[8px] font-black uppercase tracking-widest">Yield</span>
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight">High Probability</p>
                                    <p className="text-[10px] text-slate-400 font-bold max-w-[120px]">Based on historical provider patterns.</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Statutory Basis</p>
                            {editable ? (
                                <input
                                    type="text"
                                    value={editedRec.statutory_basis}
                                    onChange={(e) => handleInputChange('statutory_basis', e.target.value)}
                                    className="w-full h-10 bg-slate-50 border-2 border-slate-200 rounded-xl px-3 text-xs font-bold text-slate-700 focus:border-brand-blue outline-none transition-all"
                                />
                            ) : (
                                <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 inline-block">
                                    <span className="text-[10px] font-black text-slate-700 uppercase">{editedRec.statutory_basis}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Column 3: Provider Sentiment */}
                    <div className="space-y-8">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4">Provider Intelligence</p>
                            <div className="grid grid-cols-2 gap-4">
                                <InsightBox label="Accept Rate" value={`${(editedRec.provider_insights.acceptance_rate * 100).toFixed(0)}%`} />
                                <InsightBox label="Hist. Yield" value={`${(editedRec.provider_insights.historical_avg_reduction * 100).toFixed(0)}%`} />
                            </div>
                        </div>
                        <div className="bg-brand-blue/5 p-4 rounded-2xl border border-brand-blue/10">
                            <p className="text-[9px] font-black text-brand-blue uppercase tracking-widest mb-1">Resolution Speed</p>
                            <p className="text-lg font-black text-brand-blue leading-none">{editedRec.provider_insights.response_time_days} days <span className="text-[10px] font-bold opacity-60">Avg</span></p>
                        </div>
                    </div>
                </div>

                {/* Final Review Actions */}
                {editable && (
                    <div className="px-10 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-4 relative z-10">
                        <button
                            onClick={() => onReject?.(editedRec)}
                            className="px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 active:scale-95"
                        >
                            Discard
                        </button>
                        <button
                            onClick={() => onApprove?.(editedRec)}
                            className="px-10 py-3 bg-brand-dark text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black hover:-translate-y-1 transition-all shadow-xl shadow-brand-dark/20 active:scale-95 flex items-center gap-2"
                        >
                            Final Approval
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>
                        </button>
                    </div>
                )}

                {/* Reasoning Panel */}
                <div className="p-10 bg-slate-50/50 border-t border-slate-100 relative z-10">
                    <div className="flex gap-6 items-start">
                        <div className="bg-brand-blue p-3 rounded-2xl text-white shadow-lg shadow-brand-blue/20">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><path d="M8 9h8" /><path d="M8 13h6" /></svg>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-3 leading-none">Neural Framework Analysis</h4>
                            {editable ? (
                                <textarea
                                    value={editedRec.ai_reasoning}
                                    onChange={(e) => handleInputChange('ai_reasoning', e.target.value)}
                                    className="w-full bg-white border-2 border-slate-200 rounded-[1.5rem] p-5 text-sm text-slate-700 font-medium italic focus:border-brand-blue outline-none transition-all shadow-inner"
                                    rows={4}
                                />
                            ) : (
                                <p className="text-base text-slate-700 leading-relaxed font-medium italic serif">"{editedRec.ai_reasoning}"</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <TrustLayers recommendation={editedRec} historicalOutcomes={historicalOutcomes} />
        </div>
    );
};

const InsightBox = ({ label, value }: { label: string, value: string }) => (
    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
        <p className="text-sm font-black text-slate-900">{value}</p>
    </div>
);

export default AIRecommendation;
