import React from 'react';
import { TrendingUp, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../../lib/displayUtils';
import type { Case } from '../../types';

interface RecoveryComparisonCardProps {
    caseItem: Case;
}

const RecoveryComparisonCard: React.FC<RecoveryComparisonCardProps> = ({ caseItem }) => {
    const traditionalRecovery = caseItem.lienAmount * 0.50;
    const statMedPayRecovery = caseItem.lienAmount * (caseItem.predictedRecoveryPercent / 100);

    const improvementPercent = traditionalRecovery > 0
        ? ((statMedPayRecovery - traditionalRecovery) / traditionalRecovery) * 100
        : 0;

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-600" /> Recovery Comparison
            </h3>

            <div className="flex-1 space-y-6">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Traditional LOP Recovery (50% Est.)</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-slate-400">{formatCurrency(traditionalRecovery)}</span>
                    </div>
                </div>

                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        STAT Med Pay Recovery <ArrowUpRight size={12} />
                    </p>
                    <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-bold text-emerald-700">{formatCurrency(statMedPayRecovery)}</span>
                        <div className="text-right">
                            <div className="text-xs font-bold text-emerald-600 bg-emerald-100/50 px-2 py-1 rounded-lg inline-block">
                                +{improvementPercent.toFixed(0)}% Improvement
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-[10px] text-slate-400 mt-6 pt-4 border-t border-slate-50 italic">
                Comparison based on traditional market average vs. platform-optimized fee restoration.
            </p>
        </div>
    );
};

export default RecoveryComparisonCard;
