import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle2, ExternalLink, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useDataStore } from '../../hooks/useDataStore';
import type { WorkflowEventType, ContractType } from '../../types';

// ─── Public interface (also consumed by ActionFeed) ──────────────────────────
export interface ActionModalItem {
    caseId: string;
    patientAlias: string;
    action: string;
    reason: string;
    lawFirm?: string;
    attorneyName?: string;
    // Extra fields passed through for AI payload + context display
    contractType?: ContractType;
    recoveryRisk?: 'Low' | 'Medium' | 'High';
    status?: string;
    injuryType?: string;
    ageBucketDays?: number;
    lienAmount?: number;
    billedAmount?: number;
    // Prefer real case fields for AI payload (avoid hardcoding)
    riskTier?: 'Low' | 'Medium' | 'High';
    predictedRecoveryPercent?: number;
    predictedTimeToSettlementDays?: number;
}

interface ActionModalProps {
    item: ActionModalItem;
    onClose: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function resolveEventType(action: string): WorkflowEventType {
    const a = action.toLowerCase();
    if (a.includes('notice') || a.includes('acknowledgment')) return 'NoticeGenerated';
    if (a.includes('demand') || a.includes('payment')) return 'DemandSent';
    if (a.includes('follow-up') || a.includes('follow up') || a.includes('schedule')) return 'FollowUpScheduled';
    if (a.includes('records')) return 'RecordsRequested';
    if (a.includes('invoice')) return 'InvoiceIssued';
    // Safe default
    return 'FollowUpScheduled';
}

function resolveActionType(action: string): 'AttorneyNotice' | 'FollowUp' | 'DemandPacket' {
    const a = action.toLowerCase();
    if (a.includes('notice') || a.includes('acknowledgment')) return 'AttorneyNotice';
    if (a.includes('demand') || a.includes('payment')) return 'DemandPacket';
    return 'FollowUp';
}

/** Deterministic template — always available, never fails */
function buildDeterministicDraft(item: ActionModalItem): string {
    const firm = item.lawFirm ?? 'the attorney of record';
    const atty = item.attorneyName ?? 'Counsel';
    const type = resolveActionType(item.action);

    if (type === 'AttorneyNotice') {
        return `RE: Documented Fee Assignment Notice — Case ${item.caseId}

Dear ${atty} / ${firm},

This notice confirms that ${item.patientAlias} has executed a MedPayRez fee recovery agreement with the treating provider. Pursuant to that agreement, the provider holds a documented fee assignment against any settlement, judgment, or verdict obtained on behalf of the patient.

Please acknowledge receipt of this notice and confirm the expected timeline for resolution. The patient is not personally billed — recovery is pursued exclusively through contract-backed rights.

Action Required: ${item.action}
Context: ${item.reason}

Please respond within 10 business days with acknowledgment and next expected milestone.

[Demo document — no legal obligation created]`;
    }

    if (type === 'DemandPacket') {
        return `RE: Payment Demand — Case ${item.caseId}

Dear ${atty} / ${firm},

Our records indicate that Case ${item.caseId} (${item.patientAlias}) has reached a settlement stage with an outstanding lien of $${(item.lienAmount ?? 0).toLocaleString()}. We are formally requesting disbursement of the documented fee assignment amount from settlement proceeds.

The patient is not personally billed. This demand is made pursuant to the executed fee recovery agreement on file.

Please confirm receipt and advise on the expected disbursement timeline.

[Demo document — no legal obligation created]`;
    }

    // FollowUp
    return `RE: Status Follow-up — Case ${item.caseId}

Dear ${atty} / ${firm},

We are following up on the status of Case ${item.caseId} (${item.patientAlias}). Our records indicate this case requires attention: ${item.reason}

The patient is not personally billed. We are seeking an operational update on the current status and the next expected milestone.

Please respond within 5 business days.

[Demo document — no legal obligation created]`;
}

/**
 * Derive a draft string from the generate-insight JSON response.
 * The function returns a provider-insight shape; we adapt it into draft text.
 */
function deriveDraftFromInsight(
    insight: Record<string, unknown>,
    item: ActionModalItem
): string {
    const actions: string = Array.isArray(insight.nextBestActions)
        ? (insight.nextBestActions as string[]).join('\n• ')
        : '';
    const recommendation = typeof insight.followUpRecommendation === 'string'
        ? insight.followUpRecommendation
        : '';

    const firm = item.lawFirm ?? 'the attorney of record';
    const atty = item.attorneyName ?? 'Counsel';

    return `RE: ${item.action} — Case ${item.caseId}

Dear ${atty} / ${firm},

${recommendation ? `${recommendation}\n\n` : ''}${actions ? `Recommended next steps:\n• ${actions}\n\n` : ''}Context: ${item.reason}

The patient is not personally billed. Recovery is pursued through contract-backed rights and documented fee assignments. Please acknowledge receipt and advise on the expected timeline for resolution.

[AI-assisted draft — demo only, no legal obligation created]`;
}

// ─── Main Component ───────────────────────────────────────────────────────────
const ActionModal: React.FC<ActionModalProps> = ({ item, onClose }) => {
    const { addEvent } = useDataStore();
    const navigate = useNavigate();

    const aiEnabled = import.meta.env.VITE_ENABLE_AI_DRAFTS === 'true';

    const [draft, setDraft] = useState<string>(buildDeterministicDraft(item));
    const [done, setDone] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [aiUsed, setAiUsed] = useState(false);

    // ── AI Draft ──────────────────────────────────────────────────────────────
    const handleAiDraft = async () => {
        setAiLoading(true);
        setAiError(null);

        try {
            const predictedRecoveryPercent =
                typeof item.predictedRecoveryPercent === 'number' ? item.predictedRecoveryPercent : undefined;
            const predictedTimeToSettlementDays =
                typeof item.predictedTimeToSettlementDays === 'number' ? item.predictedTimeToSettlementDays : undefined;
            // Keep backward compat: riskTier preferred, fall back to recoveryRisk
            const riskTier = item.riskTier ?? item.recoveryRisk;

            const payload = {
                caseId: item.caseId,
                actionType: resolveActionType(item.action),
                lawFirm: item.lawFirm,
                attorneyName: item.attorneyName,
                contractType: item.contractType,
                recoveryRisk: item.recoveryRisk,
                status: item.status,
                injuryType: item.injuryType,
                ageBucketDays: item.ageBucketDays,
                lienAmount: item.lienAmount,
                billedAmount: item.billedAmount,
                riskTier,
                predictedRecoveryPercent,
                predictedTimeToSettlementDays,
                recentEventTypes: [],
            };

            const res = await fetch('/.netlify/functions/generate-insight', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(12000), // 12s hard timeout
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data: Record<string, unknown> = await res.json();
            // Guard: treat empty insight as a failure — don't overwrite template with nothing
            const hasActions = Array.isArray(data.nextBestActions) && (data.nextBestActions as unknown[]).length > 0;
            const hasRec = typeof data.followUpRecommendation === 'string' && (data.followUpRecommendation as string).trim().length > 0;
            if (!hasActions && !hasRec) {
                throw new Error('Empty insight response');
            }
            const derived = deriveDraftFromInsight(data, item);
            setDraft(derived);
            setAiUsed(true);
        } catch (err) {
            console.warn('[ActionModal] AI draft failed:', err);
            setAiError('AI draft unavailable — showing standard draft.');
            // Keep existing deterministic draft — do NOT overwrite
        } finally {
            setAiLoading(false);
        }
    };

    // ── Log to timeline ───────────────────────────────────────────────────────
    const handleGenerateAndLog = () => {
        addEvent({
            caseId: item.caseId,
            timestamp: new Date().toISOString(),
            type: resolveEventType(item.action),
            description: `${item.action} (${aiUsed ? 'AI-assisted' : 'Template'}) — ${item.lawFirm ?? 'No firm'} — ${item.reason}`,
        });
        setDone(true);
    };

    const handleViewCase = () => {
        onClose();
        navigate(`/cases/${item.caseId}`);
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={onClose}
        >
            <div
                className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[85vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* ── Header ── */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50 flex-shrink-0 rounded-t-2xl sm:rounded-t-2xl">
                    <div className="min-w-0 pr-2">
                        <h2 className="text-sm font-bold text-slate-900 leading-tight truncate">
                            {done ? 'Logged to Timeline ✓' : `${item.action} (Demo)`}
                        </h2>
                        {!done && (
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                                {item.caseId} · {item.lawFirm ?? 'No firm on file'}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {done ? (
                    /* ── Success State ── */
                    <div className="p-6 text-center space-y-4 flex-1 flex flex-col items-center justify-center">
                        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 size={28} className="text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-base font-bold text-slate-900">Logged to Timeline</p>
                            <p className="text-sm text-slate-500 mt-1">
                                Event recorded for <span className="font-semibold">{item.patientAlias}</span>.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
                            <button
                                onClick={handleViewCase}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors min-h-[48px]"
                            >
                                <ExternalLink size={16} /> View Case
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors min-h-[48px]"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                ) : (
                    /* ── Draft Preview State ── */
                    <>
                        {/* Scrollable body */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">

                            {/* Context chips */}
                            <div className="flex flex-wrap gap-1.5">
                                <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200">{item.caseId}</span>
                                {item.lawFirm && (
                                    <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">{item.lawFirm}</span>
                                )}
                                {item.attorneyName && (
                                    <span className="text-[10px] bg-slate-50 text-slate-600 px-2 py-1 rounded border border-slate-200">{item.attorneyName}</span>
                                )}
                                {item.contractType && (
                                    <span className={`text-[10px] font-semibold px-2 py-1 rounded border ${item.contractType === 'MedPayRez'
                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                        : item.contractType === 'No Contract'
                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                            : 'bg-slate-50 text-slate-600 border-slate-200'
                                        }`}>{item.contractType}</span>
                                )}
                                {item.recoveryRisk && (
                                    <span className={`text-[10px] font-semibold px-2 py-1 rounded border ${item.recoveryRisk === 'High'
                                        ? 'bg-red-50 text-red-700 border-red-200'
                                        : item.recoveryRisk === 'Medium'
                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        }`}>{item.recoveryRisk} Risk</span>
                                )}
                            </div>

                            {/* AI Draft button (flag-gated) */}
                            {aiEnabled && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleAiDraft}
                                        disabled={aiLoading}
                                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-60 min-h-[36px]"
                                    >
                                        {aiLoading
                                            ? <><Loader2 size={12} className="animate-spin" /> Generating...</>
                                            : <><Sparkles size={12} /> {aiUsed ? 'Regenerate AI Draft' : 'Generate AI Draft (Demo)'}</>
                                        }
                                    </button>
                                    {aiUsed && !aiLoading && (
                                        <span className="text-[10px] text-emerald-600 font-semibold">AI draft applied</span>
                                    )}
                                </div>
                            )}

                            {/* AI error inline message */}
                            {aiError && (
                                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                    <AlertCircle size={13} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-amber-700">{aiError}</p>
                                </div>
                            )}

                            {/* Draft textarea — editable */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        Draft Preview {aiUsed ? '(AI-assisted)' : '(Standard Template)'}
                                    </span>
                                    <button
                                        onClick={() => { setDraft(buildDeterministicDraft(item)); setAiUsed(false); setAiError(null); }}
                                        className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        Reset to template
                                    </button>
                                </div>
                                <textarea
                                    value={draft}
                                    onChange={e => setDraft(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 font-sans leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[160px]"
                                    rows={10}
                                    spellCheck={false}
                                />
                            </div>

                            <p className="text-[10px] text-slate-400 leading-relaxed">
                                Patients are never personally billed. Recovery is pursued through contract-backed rights and documented fee assignments. This is a demo document only.
                            </p>
                        </div>

                        {/* Sticky action buttons */}
                        <div className="flex-shrink-0 px-5 py-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row gap-3 rounded-b-2xl">
                            <button
                                onClick={handleGenerateAndLog}
                                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors min-h-[48px]"
                            >
                                Generate &amp; Log to Timeline
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors min-h-[48px]"
                            >
                                Cancel
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ActionModal;
