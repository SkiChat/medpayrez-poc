import React from 'react';
import type { Settlement, Lien } from '../types';

interface CaseDetailsProps {
    settlement: Settlement;
    liens?: Lien[];
}

const CaseDetails: React.FC<CaseDetailsProps> = ({ settlement, liens = [] }) => {
    return (
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden animate-slide-up">
            {/* Dark Header */}
            <div className="bg-brand-dark p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue opacity-10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black bg-white/10 px-2 py-0.5 rounded tracking-widest uppercase">#{settlement.case_number}</span>
                            <span className="text-[10px] font-black bg-brand-blue/30 text-blue-200 px-2 py-0.5 rounded tracking-widest uppercase">{settlement.jurisdiction || 'CA'}</span>
                        </div>
                        <h2 className="text-2xl font-black tracking-tight">{settlement.client_name}</h2>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                            Primary: {settlement.injury_type}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gross Settlement</p>
                        <p className="text-3xl font-black text-white tracking-tighter">${settlement.settlement_amount.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="p-6 grid grid-cols-2 gap-6 bg-slate-50/50 border-b border-slate-100">
                <MetricItem label="Offer Date" value={settlement.settlement_offer_date} icon={<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2.5" /><line x1="16" y1="2" x2="16" y2="6" strokeWidth="2.5" /><line x1="8" y1="2" x2="8" y2="6" strokeWidth="2.5" /><line x1="3" y1="10" x2="21" y2="10" strokeWidth="2.5" /></svg>} />
                <MetricItem label="Process Velocity" value={`${settlement.days_in_settlement} Days`} icon={<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>} />
            </div>

            {/* Lien List */}
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Medical Lien Roster</h3>
                    <span className="text-[10px] font-black text-slate-400">{liens.length} Items</span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {liens.length > 0 ? (
                        liens.map((lien) => (
                            <div key={lien.lien_id} className="flex justify-between items-center p-3 rounded-xl bg-white border border-slate-100 hover:border-brand-blue/30 hover:shadow-sm transition-all group">
                                <div className="flex gap-3 items-center">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 font-black text-[10px] group-hover:bg-brand-blue group-hover:text-white transition-colors">
                                        {lien.provider_name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{lien.provider_name}</p>
                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">{lien.service_type}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-slate-900">${lien.charged_amount.toLocaleString()}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No Active Liens Identified</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Summary */}
            <div className="px-6 py-5 bg-slate-50 border-t border-slate-100">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Exposure</p>
                        <p className="text-xs font-bold text-slate-500">Initial Lien Burden</p>
                    </div>
                    <p className="text-2xl font-black text-brand-purple tracking-tighter">
                        ${settlement.total_lien_amount.toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
    );
};

const MetricItem = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
    <div className="flex gap-2.5 items-start">
        <div className="mt-1 text-brand-blue">{icon}</div>
        <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-0.5 leading-none">{label}</p>
            <p className="text-xs font-black text-slate-700">{value}</p>
        </div>
    </div>
);

export default CaseDetails;
