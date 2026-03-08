import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import clsx from 'clsx';
import type { Case, CaseEvent } from '../../types';

interface ContractStrengthPanelProps {
    caseItem: Case;
    events: CaseEvent[];
}

const ContractStrengthPanel: React.FC<ContractStrengthPanelProps> = ({ caseItem, events }) => {
    const noticeEvent = events.find(e => e.type === 'AttorneyNoticeSent' || e.type === 'NoticeGenerated');
    const ackEvent = events.find(e => e.type === 'AttorneyAcknowledged');
    const signedEvent = events.find(e => e.type === 'AssignmentSigned' || e.type === 'ContractSigned');
    const invoiceEvent = events.find(e => e.type === 'InvoiceIssued');
    const demandEvent = events.find(e => e.type === 'DemandSent');

    const steps = [
        { label: 'Assignment Signed', complete: caseItem.contractStatus === 'Executed' || !!signedEvent },
        { label: 'Attorney Notified', complete: !!noticeEvent },
        { label: 'Attorney Acknowledged', complete: caseItem.attorneyAcknowledged === true || !!ackEvent },
        { label: 'Invoice Issued', complete: !!invoiceEvent },
        { label: 'Demand Sent', complete: !!demandEvent },
    ];

    const stepsComplete = steps.filter(s => s.complete).length;

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" /> Contract Strength
            </h3>

            <div className="flex-1 space-y-4">
                {steps.map((step, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            {step.complete ? (
                                <div className="bg-emerald-50 p-1 rounded-full">
                                    <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                                </div>
                            ) : (
                                <div className="p-1">
                                    <Circle size={14} className="text-slate-300 flex-shrink-0" />
                                </div>
                            )}
                            <span className={clsx("text-xs font-medium", step.complete ? "text-slate-700" : "text-slate-400")}>
                                {step.label}
                            </span>
                        </div>
                        <span className={clsx("text-[10px] font-bold uppercase tracking-wider", step.complete ? "text-emerald-600" : "text-slate-300")}>
                            {step.complete ? 'Completed' : 'Pending'}
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-50">
                <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Readiness Score</span>
                    <span className="text-xs font-bold text-blue-600">{stepsComplete} / 5 Steps Complete</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(stepsComplete / 5) * 100}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default ContractStrengthPanel;
