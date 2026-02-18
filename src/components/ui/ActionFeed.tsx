import React, { useState } from 'react';
import { Zap, AlertTriangle, Clock, CheckSquare, Square, ListChecks } from 'lucide-react';
import type { Case } from '../../types';
import ActionModal, { type ActionModalItem } from './ActionModal';
import { useDataStore } from '../../hooks/useDataStore';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ActionItem {
    caseId: string;
    patientAlias: string;
    action: string;
    priority: 'high' | 'medium' | 'low';
    reason: string;
    lawFirm?: string;
    attorneyName?: string;
    // Extra case context forwarded to ActionModal
    contractType?: import('../../types').ContractType;
    recoveryRisk?: 'Low' | 'Medium' | 'High';
    status?: string;
    injuryType?: string;
    ageBucketDays?: number;
    lienAmount?: number;
    billedAmount?: number;
}

interface ActionFeedProps {
    cases: Case[];
}

// ─── Deterministic Rule Engine ────────────────────────────────────────────────
function generateActions(cases: Case[]): ActionItem[] {
    const actions: ActionItem[] = [];

    // Helper: common case context fields
    const ctx = (c: Case) => ({
        contractType: c.contractType,
        recoveryRisk: c.recoveryRisk,
        status: c.status,
        injuryType: c.injuryType,
        ageBucketDays: c.ageBucketDays,
        lienAmount: c.lienAmount,
        billedAmount: c.billedAmount,
        // Real case values — ground the AI payload (no hardcoding)
        riskTier: c.riskTier,
        predictedRecoveryPercent: c.predictedRecoveryPercent,
        predictedTimeToSettlementDays: c.predictedTimeToSettlementDays,
    });

    for (const c of cases) {
        if (actions.length >= 5) break;

        if ((c.ageBucketDays ?? 0) > 365 && c.contractType === 'MedPayRez') {
            actions.push({
                caseId: c.id, patientAlias: c.patientAlias,
                action: 'Generate attorney notice', priority: 'high',
                reason: `Case age ${c.ageBucketDays}d — documented fee assignment notice recommended.`,
                lawFirm: c.lawFirm, attorneyName: c.attorneyName, ...ctx(c),
            });
            continue;
        }

        if (c.status === 'Settled' && c.lienAmount > 0) {
            actions.push({
                caseId: c.id, patientAlias: c.patientAlias,
                action: 'Send payment demand packet', priority: 'high',
                reason: `Case settled but $${c.lienAmount.toLocaleString()} outstanding. Send demand to ${c.lawFirm ?? 'attorney'}.`,
                lawFirm: c.lawFirm, attorneyName: c.attorneyName, ...ctx(c),
            });
            continue;
        }

        if (c.attorneyAcknowledged === false) {
            actions.push({
                caseId: c.id, patientAlias: c.patientAlias,
                action: 'Request attorney acknowledgment', priority: 'medium',
                reason: `${c.lawFirm ?? 'Attorney'} has not acknowledged the documented fee assignment.`,
                lawFirm: c.lawFirm, attorneyName: c.attorneyName, ...ctx(c),
            });
            continue;
        }

        if (c.contractType === 'No Contract' && c.status !== 'Paid') {
            actions.push({
                caseId: c.id, patientAlias: c.patientAlias,
                action: 'Upgrade to MedPayRez contract', priority: 'medium',
                reason: `No contract on file — recovery risk is elevated. Operational guidance: execute fee agreement.`,
                lawFirm: c.lawFirm, attorneyName: c.attorneyName, ...ctx(c),
            });
            continue;
        }

        if (c.recoveryRisk === 'High' && (c.status === 'Open' || c.status === 'Active')) {
            actions.push({
                caseId: c.id, patientAlias: c.patientAlias,
                action: 'Schedule follow-up with attorney', priority: 'low',
                reason: `Recovery risk is High. Proactive follow-up with ${c.lawFirm ?? 'attorney'} recommended.`,
                lawFirm: c.lawFirm, attorneyName: c.attorneyName, ...ctx(c),
            });
        }
    }

    return actions.slice(0, 5);
}

// ─── Visual Helpers ───────────────────────────────────────────────────────────
const priorityIcon: Record<string, React.ReactNode> = {
    high: <Zap size={14} className="text-red-500 flex-shrink-0" />,
    medium: <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />,
    low: <Clock size={14} className="text-blue-400 flex-shrink-0" />,
};

const priorityBorder: Record<string, string> = {
    high: 'border-l-red-400',
    medium: 'border-l-amber-400',
    low: 'border-l-blue-300',
};

// ─── Bulk Confirm Modal ───────────────────────────────────────────────────────
interface BulkConfirmProps {
    count: number;
    onConfirm: () => void;
    onCancel: () => void;
}

const BulkConfirmModal: React.FC<BulkConfirmProps> = ({ count, onConfirm, onCancel }) => (
    <div
        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onCancel}
    >
        <div
            className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 space-y-5"
            onClick={e => e.stopPropagation()}
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <ListChecks size={20} className="text-blue-600" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-slate-900">Generate Batch Notices (Demo)</h2>
                    <p className="text-sm text-slate-500">{count} action{count > 1 ? 's' : ''} selected</p>
                </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
                This will generate {count} attorney notice{count > 1 ? 's' : ''} and append timeline events to each selected case. No real documents are created — this is a demo.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={onConfirm}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors min-h-[48px]"
                >
                    Run {count} Action{count > 1 ? 's' : ''} (Demo)
                </button>
                <button
                    onClick={onCancel}
                    className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors min-h-[48px]"
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
);

// ─── Main ActionFeed ──────────────────────────────────────────────────────────
const ActionFeed: React.FC<ActionFeedProps> = ({ cases }) => {
    const { addEvent } = useDataStore();
    const actions = generateActions(cases);

    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [modalItem, setModalItem] = useState<ActionModalItem | null>(null);
    const [showBulkConfirm, setShowBulkConfirm] = useState(false);
    const [bulkDone, setBulkDone] = useState(false);

    if (actions.length === 0) {
        return (
            <div className="text-sm text-slate-400 text-center py-6">
                No actions required this week. Portfolio is on track.
            </div>
        );
    }

    const toggleSelect = (idx: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(idx) ? next.delete(idx) : next.add(idx);
            return next;
        });
    };

    const handleBulkRun = () => {
        const selected = actions.filter((_, i) => selectedIds.has(i));
        selected.forEach(item => {
            addEvent({
                caseId: item.caseId,
                timestamp: new Date().toISOString(),
                type: 'NoticeGenerated',
                description: `Batch action: ${item.action} — ${item.reason}`,
            });
        });
        setShowBulkConfirm(false);
        setBulkDone(true);
        setSelectedIds(new Set());
        setTimeout(() => setBulkDone(false), 3000);
    };

    return (
        <>
            {/* Bulk action bar */}
            {selectedIds.size > 0 && (
                <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 mb-3">
                    <span className="text-xs font-semibold text-blue-700">{selectedIds.size} selected</span>
                    <button
                        onClick={() => setShowBulkConfirm(true)}
                        className="text-xs font-bold bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors min-h-[36px]"
                    >
                        Generate Batch Notices
                    </button>
                </div>
            )}

            {/* Bulk done toast */}
            {bulkDone && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 mb-3 text-xs font-semibold text-emerald-700">
                    <Zap size={12} className="text-emerald-500" />
                    Batch actions completed — timeline events appended (Demo)
                </div>
            )}

            <div className="space-y-2">
                {actions.map((item, idx) => (
                    <div
                        key={idx}
                        onClick={() => setModalItem(item)}
                        className={`bg-white border border-slate-200 border-l-4 ${priorityBorder[item.priority]} rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md hover:border-slate-300 transition-all active:scale-[0.99] min-h-[56px]`}
                    >
                        <div className="flex items-start gap-2">
                            {/* Checkbox */}
                            <button
                                onClick={e => toggleSelect(idx, e)}
                                className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-blue-600 transition-colors min-h-[24px] min-w-[24px] flex items-center justify-center"
                                aria-label={selectedIds.has(idx) ? 'Deselect' : 'Select'}
                            >
                                {selectedIds.has(idx)
                                    ? <CheckSquare size={15} className="text-blue-600" />
                                    : <Square size={15} />
                                }
                            </button>

                            {/* Priority icon */}
                            <div className="mt-0.5">{priorityIcon[item.priority]}</div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <p className="text-sm font-semibold text-slate-900">{item.action}</p>
                                    <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 whitespace-nowrap">
                                        {item.patientAlias}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{item.reason}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <p className="text-[10px] text-slate-400 mt-2 text-center">Tap an action to preview and add to case timeline.</p>

            {/* Single-item modal */}
            {modalItem && (
                <ActionModal item={modalItem} onClose={() => setModalItem(null)} />
            )}

            {/* Bulk confirm modal */}
            {showBulkConfirm && (
                <BulkConfirmModal
                    count={selectedIds.size}
                    onConfirm={handleBulkRun}
                    onCancel={() => setShowBulkConfirm(false)}
                />
            )}
        </>
    );
};

export default ActionFeed;
