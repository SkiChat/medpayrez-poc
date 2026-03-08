import React, { useState } from 'react';
import { Landmark, TrendingUp, Clock, Wallet, CheckCircle2, Loader2 } from 'lucide-react';
import { formatCurrency } from '../../lib/displayUtils';
import { useDataStore } from '../../hooks/useDataStore';
import type { Case } from '../../types';

interface ReceivableLiquidityCardProps {
    caseItem: Case;
}

const ReceivableLiquidityCard: React.FC<ReceivableLiquidityCardProps> = ({ caseItem }) => {
    const { addEvent } = useDataStore();
    const [isSimulating, setIsSimulating] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const expectedRecovery = caseItem.lienAmount * (caseItem.predictedRecoveryPercent / 100);
    const advanceOffer = expectedRecovery * 0.70;
    const platformFee = advanceOffer * 0.03;
    const netLiquidity = advanceOffer - platformFee;

    const handleSimulate = () => {
        setIsSimulating(true);
        // Simulate a brief analysis/processing delay
        setTimeout(() => {
            setIsSimulating(false);
            setShowSuccess(true);
            addEvent({
                caseId: caseItem.id,
                timestamp: new Date().toISOString(),
                type: 'ReceivableAdvanceSimulated',
                description: `Simulated a receivable advance of ${formatCurrency(advanceOffer)} against expected recovery of ${formatCurrency(expectedRecovery)}.`
            });
        }, 1200);
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-wide">
                <Landmark size={18} className="text-blue-600" /> Receivable Liquidity
            </h3>

            <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                        <TrendingUp size={14} /> Expected Recovery
                    </span>
                    <span className="text-sm font-bold text-slate-900">{formatCurrency(expectedRecovery)}</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                        <Clock size={14} /> Settlement Window
                    </span>
                    <span className="text-sm font-bold text-slate-900">{caseItem.predictedTimeToSettlementDays} days</span>
                </div>

                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-blue-700">Advance Offer (70%)</span>
                        <span className="text-sm font-bold text-blue-900">{formatCurrency(advanceOffer)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[11px] text-blue-600">Estimated Platform Fee (3%)</span>
                        <span className="text-[11px] font-bold text-blue-800">-{formatCurrency(platformFee)}</span>
                    </div>
                    <div className="pt-2 border-t border-blue-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                            <Wallet size={14} /> Net Immediate Liquidity
                        </span>
                        <span className="text-lg font-black text-blue-600">{formatCurrency(netLiquidity)}</span>
                    </div>
                </div>
            </div>

            <button
                onClick={handleSimulate}
                disabled={isSimulating}
                className="w-full py-3.5 bg-slate-900 hover:bg-black text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                {isSimulating ? (
                    <>
                        <Loader2 size={16} className="animate-spin" />
                        Generating Offer...
                    </>
                ) : (
                    'Simulate Advance'
                )}
            </button>

            <p className="mt-4 text-[10px] text-slate-400 text-center leading-relaxed italic">
                Platform facilitates liquidity through assignment-backed acquisition. Demo simulation only.
            </p>

            {/* Success Modal Overlay */}
            {showSuccess && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={32} className="text-emerald-500" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 mb-2">Advance Accepted (Demo)</h4>
                        <div className="my-6 p-4 bg-slate-50 rounded-xl border border-slate-100 text-left">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-500">Immediate Funds:</span>
                                <span className="font-bold text-slate-900">{formatCurrency(netLiquidity)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Status:</span>
                                <span className="font-bold text-blue-600">Simulated Only</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mb-8 leading-relaxed">
                            Repayment will be sourced from settlement proceeds upon case resolution. This simulation has been logged to the audit trail.
                        </p>
                        <button
                            onClick={() => setShowSuccess(false)}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors"
                        >
                            Return to Case
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReceivableLiquidityCard;
