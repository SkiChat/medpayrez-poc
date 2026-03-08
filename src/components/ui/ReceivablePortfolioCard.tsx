import React from 'react';
import { DollarSign, TrendingUp, Calendar, Clock, ArrowUpRight } from 'lucide-react';
import type { Case } from '../../types';

interface ReceivablePortfolioCardProps {
    cases: Case[];
}

const ReceivablePortfolioCard: React.FC<ReceivablePortfolioCardProps> = ({ cases }) => {
    const totalPIReceivables = cases.reduce((sum, c) => sum + c.lienAmount, 0);

    const expectedRecovery = cases.reduce((sum, c) => {
        return sum + (c.lienAmount * (c.predictedRecoveryPercent / 100));
    }, 0);

    const expected90DayCashFlow = cases
        .filter(c => c.predictedTimeToSettlementDays < 90 && c.status !== 'Paid')
        .reduce((sum, c) => sum + (c.lienAmount * (c.predictedRecoveryPercent / 100)), 0);

    const avgSettlementTimeline = cases.length > 0
        ? cases.reduce((sum, c) => sum + c.predictedTimeToSettlementDays, 0) / cases.length
        : 0;

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(amount);

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                    <h3 className="text-sm font-bold text-slate-800">PI Receivable Portfolio</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Assignment-backed physician receivables</p>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 border border-blue-100 rounded-md">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-tight">Financial Asset View</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                {/* Total Receivables */}
                <div className="p-6 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total PI Receivables</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h4 className="text-2xl font-bold text-slate-900">{formatCurrency(totalPIReceivables)}</h4>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium italic">Gross portfolio value</p>
                </div>

                {/* Expected Recovery */}
                <div className="p-6 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expected Recovery</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h4 className="text-2xl font-bold text-slate-900">{formatCurrency(expectedRecovery)}</h4>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center">
                            <ArrowUpRight className="w-3 h-3 mr-0.5" />
                            {((expectedRecovery / totalPIReceivables) * 100).toFixed(1)}%
                        </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">Risk-adjusted net value</p>
                </div>

                {/* 90-Day Cash Flow */}
                <div className="p-6 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expected 90-Day Cash Flow</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h4 className="text-2xl font-bold text-slate-900">{formatCurrency(expected90DayCashFlow)}</h4>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">Projected near-term liquidity</p>
                </div>

                {/* Settlement Timeline */}
                <div className="p-6 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Settlement Timeline</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h4 className="text-2xl font-bold text-slate-900">{Math.round(avgSettlementTimeline)} Days</h4>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">Portfolio-wide cycle time</p>
                </div>
            </div>
        </div>
    );
};

export default ReceivablePortfolioCard;
