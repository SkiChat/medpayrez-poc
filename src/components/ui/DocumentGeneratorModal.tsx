import React, { useState } from 'react';
import { X, CheckCircle2, FileText, Sparkles, AlertCircle, Loader2, Download } from 'lucide-react';
import { useDataStore } from '../../hooks/useDataStore';
import type { WorkflowEventType, Case } from '../../types';
import { formatCurrency } from '../../lib/displayUtils';

type DocType = 'LienStatement' | 'DemandLetter' | 'MedicalNarrative' | 'SettlementReconciliation';

interface DocumentGeneratorModalProps {
    caseItem: Case;
    docType: DocType;
    onClose: () => void;
}

const DocumentGeneratorModal: React.FC<DocumentGeneratorModalProps> = ({ caseItem, docType, onClose }) => {
    const { addEvent } = useDataStore();
    const [isGenerating, setIsGenerating] = useState(false);
    const [done, setDone] = useState(false);

    const getDocTitle = () => {
        switch (docType) {
            case 'LienStatement': return 'Lien Statement';
            case 'DemandLetter': return 'Demand Letter';
            case 'MedicalNarrative': return 'Medical Narrative';
            case 'SettlementReconciliation': return 'Settlement Reconciliation';
        }
    };

    const getEventType = (): WorkflowEventType => {
        switch (docType) {
            case 'LienStatement': return 'LienStatementGenerated';
            case 'DemandLetter': return 'DemandSent';
            case 'MedicalNarrative': return 'DocumentGenerated';
            case 'SettlementReconciliation': return 'DocumentGenerated';
        }
    };

    const buildTemplate = () => {
        const date = new Date().toLocaleDateString();
        const commonFooter = `\n\nNotice: This provider holds a documented fee assignment for all services rendered. Patients are never personally billed; recovery is pursued exclusively through the assignment-backed workflow.\n\nGenerated via STAT Med Pay PI Recovery Command Center on ${date}.`;

        switch (docType) {
            case 'LienStatement':
                return `LIEN STATEMENT / NOTICE OF ASSIGNMENT
Date: ${date}
Case ID: ${caseItem.id}
Patient: ${caseItem.patientAlias}
Total Billed: ${formatCurrency(caseItem.billedAmount)}
Lien Amount: ${formatCurrency(caseItem.lienAmount)}

This statement represents the outstanding medical lien for services provided to the patient above. This balance is secured by a documented fee assignment executed by the patient. Under the terms of the assignment, the provider is entitled to direct payment from any settlement proceeds.${commonFooter}`;

            case 'DemandLetter':
                return `FORMAL DEMAND FOR PAYMENT
Date: ${date}
To: ${caseItem.lawFirm ?? 'Attorney of Record'}
Attn: ${caseItem.attorneyName ?? 'Counsel'}
RE: ${caseItem.patientAlias} (Case ID: ${caseItem.id})

Our records indicate that the legal matter for ${caseItem.patientAlias} has reached a settlement or negotiation phase. Pursuant to the documented fee assignment on file, we hereby demand payment of ${formatCurrency(caseItem.lienAmount)} for medical services rendered.

Please be advised that patients are never personally billed for these services. We look forward to receiving a settlement breakdown or disbursement within 15 days.${commonFooter}`;

            case 'MedicalNarrative':
                return `CERTIFIED MEDICAL NARRATIVE SUMMARY
Date: ${date}
Patient: ${caseItem.patientAlias}
Injury Type: ${caseItem.injuryType}
Provider: STAT Med Pay Network Physician

This narrative summarizes the clinical treatment plan and medical necessity for the injuries sustained by the patient. 

Clinical Findings: Initial assessment indicates ${caseItem.injuryType} consistent with the reported mechanism of injury. 
Treatment Plan: Documented protocol included diagnostic imaging and specialized physical therapy.

Note: All treatment costs are secured by a documented fee assignment.${commonFooter}`;

            case 'SettlementReconciliation':
                return `SETTLEMENT RECONCILIATION & DISBURSEMENT AUTHORIZATION
Date: ${date}
Case: ${caseItem.id} (${caseItem.patientAlias})
Proposed Settlement: [ENTER AMOUNT]
Provider Share: ${formatCurrency(caseItem.lienAmount)}
Net Recovery Action: ${caseItem.predictedRecoveryPercent}% of Lien

This document reconciles the final medical lien against the proposed settlement proceeds. The provider agrees to the risk-adjusted recovery of ${formatCurrency(caseItem.lienAmount * (caseItem.predictedRecoveryPercent / 100))} based on the documented fee assignment and current negotiation status.${commonFooter}`;
        }
    };

    const [draft, setDraft] = useState(buildTemplate());

    const handleLog = () => {
        setIsGenerating(true);
        setTimeout(() => {
            addEvent({
                caseId: caseItem.id,
                timestamp: new Date().toISOString(),
                type: getEventType(),
                description: `${getDocTitle()} generated for ${caseItem.patientAlias}. Document contains documented fee assignment language.`,
            });
            setIsGenerating(false);
            setDone(true);
        }, 800);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <FileText className="text-white w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-800">{getDocTitle()} Generator</h2>
                            <p className="text-[11px] text-slate-500 font-medium">Enterprise Document Suite</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {!done ? (
                    <>
                        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">
                            <div className="mb-4 flex items-center gap-2 bg-blue-50 border border-blue-100 p-3 rounded-xl">
                                <Sparkles size={16} className="text-blue-600" />
                                <p className="text-xs text-blue-800 font-medium">
                                    AI is drafting this document using assignment-backed templates.
                                </p>
                            </div>

                            <div className="mb-2 flex justify-between items-end">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Document Workspace</span>
                                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">AUTO-SAVED</span>
                            </div>

                            <textarea
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                className="w-full h-80 p-5 text-sm font-mono leading-relaxed text-slate-700 bg-white border border-slate-200 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                spellCheck={false}
                            />

                            <div className="mt-4 flex items-start gap-2 text-amber-600">
                                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                                <p className="text-[10px] font-medium leading-normal">
                                    Verify all financial details before logging. Documents including the "patients are never personally billed" clause are prioritized for recovery.
                                </p>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 bg-white">
                            <button
                                onClick={handleLog}
                                disabled={isGenerating}
                                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={18} />
                                        Log to Timeline & Close
                                    </>
                                )}
                            </button>
                            <button
                                onClick={onClose}
                                className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="p-12 text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 size={32} className="text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Document Logged</h3>
                        <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8">
                            The {getDocTitle()} has been successfully generated and timestamped in the case timeline.
                        </p>
                        <div className="flex gap-3 w-full max-w-md">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                            >
                                <Download size={18} />
                                Download PDF (Demo)
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                            >
                                Return to Case
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentGeneratorModal;
