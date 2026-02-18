import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, FolderKanban, ExternalLink, ShieldCheck, Clock } from 'lucide-react';
import type { ContractType } from '../types';

interface IntakeSuccessProps {
    caseId: string;
    contractType: ContractType;
    lawFirm: string;
    patientAlias: string;
    onReset: () => void;
}

const IntakeSuccess: React.FC<IntakeSuccessProps> = ({
    caseId,
    contractType,
    lawFirm,
    patientAlias,
    onReset,
}) => {
    const navigate = useNavigate();

    const recordTimestamp = new Date().toLocaleString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
    });
    const contractStatus = contractType === 'No Contract' ? 'Pending Signature' : 'Executed';
    const contractColor =
        contractType === 'MedPayRez'
            ? 'text-blue-700 bg-blue-50 border-blue-200'
            : contractType === 'No Contract'
                ? 'text-amber-700 bg-amber-50 border-amber-200'
                : 'text-slate-600 bg-slate-50 border-slate-200';

    return (
        <div className="max-w-lg mx-auto py-8 px-4 space-y-6 animate-fade-in">
            {/* Success icon */}
            <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center shadow-lg shadow-emerald-100">
                    <CheckCircle2 size={40} className="text-emerald-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Case Created</h1>
                <p className="text-sm text-slate-500 max-w-xs">
                    The PI case has been opened and the fee recovery workflow has been initiated.
                </p>
            </div>

            {/* Summary card */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Case ID</span>
                    <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                        {caseId}
                    </span>
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Patient Alias</span>
                    <span className="text-sm font-semibold text-slate-800">{patientAlias}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contract</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded border ${contractColor}`}>
                        {contractType} — {contractStatus}
                    </span>
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attorney Notified</span>
                    <span className="text-sm font-semibold text-slate-800 text-right max-w-[200px] truncate">{lawFirm}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock size={11} /> Record Timestamp
                    </span>
                    <span className="text-xs font-mono text-slate-600 text-right">{recordTimestamp}</span>
                </div>
                <div className="px-5 py-4 bg-blue-50">
                    <div className="flex items-start gap-2">
                        <ShieldCheck size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-800 leading-relaxed">
                            Patients are never personally billed. Recovery is pursued through contract-backed rights and documented fee assignments.
                        </p>
                    </div>
                </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col gap-3">
                <button
                    onClick={() => navigate(`/cases/${caseId}`)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 min-h-[52px]"
                >
                    <ExternalLink size={16} /> View Case
                </button>
                <button
                    onClick={() => navigate('/cases')}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors min-h-[52px]"
                >
                    <FolderKanban size={16} /> Go to PI Cases
                </button>
                <button
                    onClick={onReset}
                    className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                    Start Another Intake
                </button>
            </div>
        </div>
    );
};

export default IntakeSuccess;
