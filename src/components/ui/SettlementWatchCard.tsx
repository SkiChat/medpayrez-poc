import React from 'react';
import { Target, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import type { Case, CaseEvent } from '../../types';

interface SettlementWatchCardProps {
    caseItem: Case;
    events: CaseEvent[];
}

const SettlementWatchCard: React.FC<SettlementWatchCardProps> = ({ caseItem, events }) => {
    const settlementReached = events.find(e => e.type === 'SettlementReached');
    const paymentReceived = events.find(e => e.type === 'PaymentReceived');
    const negotiationStarted = events.find(e => e.type === 'Negotiation');

    let currentStatus = 'Pre-Negotiation';
    let progress = 20;

    if (caseItem.status === 'Paid' || !!paymentReceived) {
        currentStatus = 'Paid';
        progress = 100;
    } else if (!!settlementReached) {
        currentStatus = 'Awaiting Disbursement';
        progress = 80;
    } else if (caseItem.status === 'Settled') {
        currentStatus = 'Settlement Reached';
        progress = 60;
    } else if (caseItem.status === 'Negotiation' || !!negotiationStarted) {
        currentStatus = 'Negotiation';
        progress = 40;
    }

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Target size={16} className="text-blue-600" /> Settlement Watch
            </h3>

            <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Stage</span>
                    <span className="text-sm font-bold text-blue-700">{currentStatus}</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                    <div
                        className={clsx(
                            "h-full rounded-full transition-all duration-700",
                            progress === 100 ? "bg-emerald-500" : "bg-blue-600"
                        )}
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <div className="flex justify-between mt-2">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Intake</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase text-right">Paid</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                        <TrendingUp size={14} className="text-emerald-500" />
                        <span className="text-xs font-medium text-slate-600">Settlement Probability</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900">{caseItem.predictedRecoveryPercent}%</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-blue-500" />
                        <span className="text-xs font-medium text-slate-600">Est. Settlement Window</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900">{caseItem.predictedTimeToSettlementDays} Days</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={14} className={clsx(
                            caseItem.recoveryRisk === 'High' ? "text-red-500" :
                                caseItem.recoveryRisk === 'Medium' ? "text-amber-500" : "text-emerald-500"
                        )} />
                        <span className="text-xs font-medium text-slate-600">Recovery Risk Tier</span>
                    </div>
                    <span className={clsx(
                        "text-xs font-bold",
                        caseItem.recoveryRisk === 'High' ? "text-red-600" :
                            caseItem.recoveryRisk === 'Medium' ? "text-amber-600" : "text-emerald-600"
                    )}>{caseItem.recoveryRisk || 'Low'}</span>
                </div>
            </div>
        </div>
    );
};

export default SettlementWatchCard;
