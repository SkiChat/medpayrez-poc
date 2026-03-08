import React, { useState } from 'react';
import { Landmark, TrendingUp, Clock, Wallet, CheckCircle2, Loader2, Info } from 'lucide-react';
import { formatCurrency } from '../../lib/displayUtils';
import { useDataStore } from '../../hooks/useDataStore';
import type { Case } from '../../types';

interface LiquidityPanelProps {
    caseItem: Case;
}

const LiquidityPanel: React.FC<LiquidityPanelProps> = ({ caseItem }) => {
    const { addEvent } = useDataStore();
    const [isSimulating, setIsSimulating] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const expectedRecovery = caseItem.lienAmount * (caseItem.predictedRecoveryPercent / 100);
    const advanceOffer = expectedRecovery * 0.7;

    const handleSimulate = () => {
        setIsSimulating(true);
        setTimeout(() => {
            const date = new Date().toISOString();
            addEvent({
                caseId: caseItem.id,
                timestamp: date,
                type: 'ReceivableAdvanceSimulated',
                description: `Receivable Liquidity Advance simulated for ${formatCurrency(advanceOffer)}. Advance represents 70% of expected recovery (${formatCurrency(expectedRecovery)}).`,
            });
            setIsSimulating(false);
            setShowModal(true);
        }, 1200);
    };

    return (
        <>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Landmark size={18} className="text-blue-600" />
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 leading-none">Receivable Liquidity</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Asset Financing Simulation</p>
                        </div>
                    </div>
                    <div className="p-1 px-2 bg-blue-50 border border-blue-100 rounded flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold text-blue-600 uppercase">Demo</span>
                    </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="flex justify-between items-end border-b border-slate-50 pb-3">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                    Expected Recovery <TrendingUp size={10} />
                                </p>
                                <p className="text-lg font-bold text-slate-900">{formatCurrency(expectedRecovery)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confidence</p>
                                <p className="text-xs font-bold text-emerald-600">{caseItem.predictedRecoveryPercent}% Prob.</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                    Settlement Window <Clock size={10} />
                                </p>
                                <p className="text-lg font-bold text-slate-900">{caseItem.predictedTimeToSettlementDays} Days</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Net Advance</p>
                                <p className="text-lg font-bold text-blue-600">{formatCurrency(advanceOffer)}</p>
                            </div>
                        </div>

                        <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100">
                            <div className="flex items-start gap-2">
                                <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                <p className="text-[10px] font-medium text-blue-800 leading-normal">
                                    Advance offers are calculated as a fixed 70% of the risk-adjusted expected recovery. Funds are disbursed within 24 hours of signature.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSimulate}
                        disabled={isSimulating}
                        className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSimulating ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Calculating Terms...
                            </>
                        ) : (
                            <>
                                <Wallet size={18} />
                                Simulate Advance
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Success Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 size={32} className="text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Advance Accepted (Demo)</h3>
                            <p className="text-slate-500 text-sm mb-8">
                                A simulation of the receivable advance has been logged to the case timeline.
                            </p>

                            <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-8">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-slate-500">Funds Available</span>
                                    <span className="text-base font-bold text-blue-600">{formatCurrency(advanceOffer)}</span>
                                </div>
                                <div className="border-t border-slate-200/50 pt-3 flex justify-between items-center">
                                    <span className="text-xs font-medium text-slate-500">Settlement Transfer</span>
                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Upon resolution</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors"
                            >
                                Close Simulation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default LiquidityPanel;
