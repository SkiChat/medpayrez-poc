import React, { useState } from 'react';
import type { Settlement, Lien } from '../types';

interface NewCaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settlement: Settlement, liens: Lien[]) => void;
}

const NewCaseModal: React.FC<NewCaseModalProps> = ({ isOpen, onClose, onSave }) => {
    const [clientName, setClientName] = useState('');
    const [settlementAmount, setSettlementAmount] = useState<number>(0);
    const [jurisdiction, setJurisdiction] = useState('CA');
    const [injuryType, setInjuryType] = useState('');
    const [liens, setLiens] = useState<{ provider_name: string; amount: number }[]>([
        { provider_name: '', amount: 0 }
    ]);

    if (!isOpen) return null;

    const addLien = () => {
        setLiens([...liens, { provider_name: '', amount: 0 }]);
    };

    const updateLien = (index: number, field: 'provider_name' | 'amount', value: string | number) => {
        const newLiens = [...liens];
        newLiens[index] = { ...newLiens[index], [field]: value };
        setLiens(newLiens);
    };

    const removeLien = (index: number) => {
        setLiens(liens.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        const settlement_id = `SETTLE-NEW-${Date.now()}`;
        const total_lien_amount = liens.reduce((sum, l) => sum + l.amount, 0);

        const newSettlement: Settlement = {
            settlement_id,
            case_number: `NEW-${Math.floor(Math.random() * 10000)}`,
            client_name: clientName,
            injury_type: injuryType,
            settlement_amount: settlementAmount,
            settlement_offer_date: new Date().toISOString().split('T')[0],
            days_in_settlement: 0,
            status: 'In Resolution',
            total_liens: liens.length,
            total_lien_amount: total_lien_amount,
            negotiated_lien_amount: 0,
            attorney_assigned: 'Unassigned',
            paralegal_assigned: 'Jennifer Park',
            opposing_party: 'TBD',
            jurisdiction
        };

        const newLiens: Lien[] = liens.map((l, idx) => ({
            lien_id: `LIEN-NEW-${Date.now()}-${idx}`,
            settlement_id,
            provider_name: l.provider_name,
            service_type: 'Medical Services',
            charged_amount: l.amount,
            original_lien_amount: l.amount,
            ai_recommended_amount: l.amount * 0.6,
            reduction_statute: jurisdiction === 'CA' ? 'CA BC §3040' : 'Common Law',
            provider_response: 'Pending',
            negotiated_amount: 0,
            status: 'Pending'
        }));

        onSave(newSettlement, newLiens);
        resetForm();
    };

    const resetForm = () => {
        setClientName('');
        setSettlementAmount(0);
        setJurisdiction('CA');
        setInjuryType('');
        setLiens([{ provider_name: '', amount: 0 }]);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 animate-fade-in">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>

            <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-slide-up">
                <div className="p-8 sm:p-10 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight italic">Initiate New Case</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Repository Intake Module</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>

                <div className="p-8 sm:p-10 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-8">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client Name</label>
                            <input
                                type="text"
                                placeholder="Full Legal Name"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 font-bold text-slate-800 focus:bg-white focus:border-brand-blue outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jurisdiction</label>
                            <select
                                value={jurisdiction}
                                onChange={(e) => setJurisdiction(e.target.value)}
                                className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 font-bold text-slate-800 focus:bg-white focus:border-brand-blue outline-none transition-all"
                            >
                                <option value="CA">California (CA)</option>
                                <option value="UT">Utah (UT)</option>
                                <option value="TX">Texas (TX)</option>
                                <option value="NY">New York (NY)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gross Settlement ($)</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={settlementAmount || ''}
                                onChange={(e) => setSettlementAmount(Number(e.target.value))}
                                className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 font-bold text-slate-800 focus:bg-white focus:border-brand-blue outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Injury</label>
                            <input
                                type="text"
                                placeholder="e.g. Soft Tissue / Lumbar"
                                value={injuryType}
                                onChange={(e) => setInjuryType(e.target.value)}
                                className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 font-bold text-slate-800 focus:bg-white focus:border-brand-blue outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Liens Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end mb-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-brand-blue">Medical Liens Inventory</label>
                            <button
                                onClick={addLien}
                                className="text-[10px] font-black text-brand-blue uppercase tracking-widest hover:underline flex items-center gap-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                Add Provider
                            </button>
                        </div>

                        <div className="space-y-3">
                            {liens.map((lien, index) => (
                                <div key={index} className="flex gap-3 group">
                                    <input
                                        type="text"
                                        placeholder="Provider Name"
                                        value={lien.provider_name}
                                        onChange={(e) => updateLien(index, 'provider_name', e.target.value)}
                                        className="flex-1 h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 text-sm font-bold text-slate-800 outline-none focus:border-slate-300"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Lien Amount"
                                        value={lien.amount || ''}
                                        onChange={(e) => updateLien(index, 'amount', Number(e.target.value))}
                                        className="w-32 h-12 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 text-sm font-black text-slate-800 outline-none focus:border-slate-300"
                                    />
                                    <button
                                        onClick={() => removeLien(index)}
                                        className="p-3 text-slate-300 hover:text-red-500 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-8 sm:p-10 border-t border-slate-100 bg-slate-50/30 flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-200"
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!clientName || !settlementAmount}
                        className="flex-[2] h-14 bg-brand-dark text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200 disabled:opacity-50 disabled:shadow-none"
                    >
                        Save & Initialize Case
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewCaseModal;
