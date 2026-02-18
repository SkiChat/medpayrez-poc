import React from 'react';
import { Receipt, Send } from 'lucide-react';
import type { CaseEvent, WorkflowEventType } from '../../types';

interface InvoiceSummaryCardProps {
    caseId: string;
    billedAmount: number;
    lienAmount: number;
    events: CaseEvent[];
    onAddEvent: (type: WorkflowEventType, description: string) => void;
}

const InvoiceSummaryCard: React.FC<InvoiceSummaryCardProps> = ({
    caseId,
    billedAmount,
    lienAmount,
    events,
    onAddEvent,
}) => {
    // Only render if there's billing data or an invoice event
    const invoiceEvent = events.find(e => e.type === 'InvoiceIssued');
    const demandEvent = events.find(e => e.type === 'DemandSent');
    const paymentEvent = events.find(e => e.type === 'PaymentReceived');

    const shouldRender = invoiceEvent || billedAmount > 0 || lienAmount > 0;
    if (!shouldRender) return null;

    // Derive status
    const invoiceStatus: string = paymentEvent
        ? 'Paid'
        : demandEvent
            ? 'Demand Sent'
            : invoiceEvent
                ? 'Issued'
                : 'Pending';

    const statusColor =
        invoiceStatus === 'Paid'
            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
            : invoiceStatus === 'Demand Sent'
                ? 'bg-blue-100 text-blue-700 border-blue-200'
                : invoiceStatus === 'Issued'
                    ? 'bg-amber-100 text-amber-700 border-amber-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200';

    const invoiceDateLabel = invoiceEvent
        ? new Date(invoiceEvent.timestamp).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
        })
        : 'Not Yet Issued';

    const handleGenerateDemand = () => {
        onAddEvent(
            'DemandSent',
            `Demand packet generated for Case ${caseId} — $${lienAmount.toLocaleString()} outstanding.`
        );
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                    <Receipt size={16} className="text-blue-600" />
                    Invoice Summary
                </h3>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide ${statusColor}`}>
                    {invoiceStatus}
                </span>
            </div>

            {/* Fields */}
            <div className="divide-y divide-slate-100">
                <div className="flex items-center justify-between px-6 py-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Billed Amount</span>
                    <span className="text-sm font-bold text-slate-800">${billedAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between px-6 py-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Lien Amount</span>
                    <span className="text-sm font-bold text-slate-800">${lienAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between px-6 py-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Invoice Issued</span>
                    <span className={`text-xs font-mono ${invoiceEvent ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                        {invoiceDateLabel}
                    </span>
                </div>
            </div>

            {/* Demand button — only show if not already paid and demand not yet sent */}
            {!paymentEvent && !demandEvent && (
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
                    <button
                        onClick={handleGenerateDemand}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors"
                    >
                        <Send size={14} /> Generate Demand Packet
                    </button>
                </div>
            )}

            {/* Paid confirmation */}
            {paymentEvent && (
                <div className="px-6 py-3 border-t border-emerald-100 bg-emerald-50">
                    <p className="text-xs text-emerald-700 font-semibold text-center">
                        ✓ Payment received — {new Date(paymentEvent.timestamp).toLocaleDateString()}
                    </p>
                </div>
            )}
        </div>
    );
};

export default InvoiceSummaryCard;
