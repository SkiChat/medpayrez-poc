import React, { useMemo } from 'react';
import {
    DollarSign, TrendingUp, Calendar, Clock,
    Download, ShieldCheck, Timer, BarChart3
} from 'lucide-react';
import { useDataStore } from '../hooks/useDataStore';
import { formatCurrency } from '../lib/displayUtils';
import type { Case, CaseEvent } from '../types';

const ReceivablesLedger: React.FC = () => {
    const { selectors, isLoading, error } = useDataStore();

    const cases = useMemo(() => selectors?.getCases() || [], [selectors]);
    const allEvents = useMemo(() => selectors?.getEvents() || [], [selectors]);

    // ─── Calculations ────────────────────────────────────────────────────────
    const summary = useMemo(() => {
        const totalPIReceivables = cases.reduce((sum, c) => sum + c.lienAmount, 0);
        const expectedRecovery = cases.reduce((sum, c) => sum + (c.lienAmount * (c.predictedRecoveryPercent / 100)), 0);
        const expected90DayCash = cases
            .filter(c => c.predictedTimeToSettlementDays <= 90 && c.status !== 'Paid')
            .reduce((sum, c) => sum + (c.lienAmount * (c.predictedRecoveryPercent / 100)), 0);
        const avgSettlementTimeline = cases.length > 0
            ? cases.reduce((sum, c) => sum + c.predictedTimeToSettlementDays, 0) / cases.length
            : 0;

        return {
            totalPIReceivables,
            expectedRecovery,
            expected90DayCash,
            avgSettlementTimeline
        };
    }, [cases]);

    const agingData = useMemo(() => {
        const buckets = [
            { name: '0–90 days', range: [0, 90], count: 0, value: 0 },
            { name: '91–180 days', range: [91, 180], count: 0, value: 0 },
            { name: '181–365 days', range: [181, 365], count: 0, value: 0 },
            { name: '365+ days', range: [366, Infinity], count: 0, value: 0 },
        ];

        cases.forEach(c => {
            if (c.status === 'Paid') return;
            const days = c.predictedTimeToSettlementDays;
            const bucket = buckets.find(b => days >= b.range[0] && days <= b.range[1]);
            if (bucket) {
                bucket.count++;
                bucket.value += c.lienAmount;
            }
        });

        return buckets;
    }, [cases]);

    const forecastData = useMemo(() => {
        const buckets = [
            { name: '0–90d', range: [0, 90], recovery: 0 },
            { name: '91–180d', range: [91, 180], recovery: 0 },
            { name: '181–365d', range: [181, 365], recovery: 0 },
            { name: '365+ d', range: [366, Infinity], recovery: 0 },
        ];

        cases.forEach(c => {
            if (c.status === 'Paid') return;
            const days = c.predictedTimeToSettlementDays;
            const bucket = buckets.find(b => days >= b.range[0] && days <= b.range[1]);
            if (bucket) {
                bucket.recovery += (c.lienAmount * (c.predictedRecoveryPercent / 100));
            }
        });

        return buckets;
    }, [cases]);

    const getContractStrength = (caseItem: Case, events: CaseEvent[]) => {
        const caseEvents = events.filter(e => e.caseId === caseItem.id);
        const milestones = [
            caseEvents.some(e => e.type === 'AssignmentSigned' || e.type === 'ContractSigned'),
            caseEvents.some(e => e.type === 'AttorneyNoticeSent' || e.type === 'NoticeGenerated'),
            caseEvents.some(e => e.type === 'AttorneyAcknowledged' || caseItem.attorneyAcknowledged === true),
            caseEvents.some(e => e.type === 'InvoiceIssued'),
            caseEvents.some(e => e.type === 'DemandSent')
        ];
        const count = milestones.filter(Boolean).length;
        if (count >= 4) return { label: 'Strong', color: 'text-emerald-600 bg-emerald-50' };
        if (count >= 2) return { label: 'Medium', color: 'text-amber-600 bg-amber-50' };
        return { label: 'Weak', color: 'text-rose-600 bg-rose-50' };
    };

    if (isLoading) return <div className="p-12 text-center text-slate-400">Loading Ledger...</div>;
    if (error || !selectors) return <div className="p-12 text-center text-red-500">Error loading data.</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Receivables Ledger</h1>
                    <p className="text-sm text-slate-500">Managing assignment-backed physician receivables as financial assets.</p>
                </div>
                <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-lg hover:shadow-md transition-all">
                    <Download size={14} /> Export Portfolio
                </button>
            </div>

            {/* A) Summary Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total PI Receivables', value: formatCurrency(summary.totalPIReceivables), icon: DollarSign, color: 'text-slate-400' },
                    { label: 'Expected Recovery', value: formatCurrency(summary.expectedRecovery), icon: TrendingUp, color: 'text-emerald-500' },
                    { label: 'Expected Cash ≤ 90 Days', value: formatCurrency(summary.expected90DayCash), icon: Calendar, color: 'text-blue-500' },
                    { label: 'Average Settlement Timeline', value: `${Math.round(summary.avgSettlementTimeline)} Days`, icon: Clock, color: 'text-amber-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                            <stat.icon size={16} className={stat.color} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">{stat.value}</h2>
                    </div>
                ))}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    {/* C) Receivable Aging Widget */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Timer size={16} className="text-amber-500" /> Portfolio Aging
                        </h3>
                        <div className="space-y-4">
                            {agingData.map((bucket, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-xs font-bold text-slate-600">{bucket.name}</span>
                                        <span className="text-xs font-bold text-slate-900">{formatCurrency(bucket.value)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] text-slate-400 mb-2">
                                        <span>{bucket.count} cases</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className="bg-blue-600 h-full rounded-full"
                                            style={{ width: `${(bucket.value / (summary.totalPIReceivables || 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* D) Cash Flow Forecast */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <BarChart3 size={16} className="text-blue-600" /> Expected Recovery Forecast
                        </h3>
                        <div className="space-y-4">
                            {forecastData.map((bucket, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-xs font-medium text-slate-500">{bucket.name}</span>
                                        <span className="text-xs font-bold text-slate-900">{formatCurrency(bucket.recovery)}</span>
                                    </div>
                                    <div className="w-full bg-slate-50 border border-slate-100 h-8 rounded-lg overflow-hidden flex items-center px-1">
                                        <div
                                            className="bg-emerald-500 h-6 rounded px-2 flex items-center transition-all duration-1000"
                                            style={{ width: `calc(${Math.max(15, (bucket.recovery / (summary.expectedRecovery || 1)) * 100)}%)` }}
                                        >
                                            <span className="text-[9px] font-bold text-white">PROJECTION</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* B) Receivable Ledger Table */}
                <div className="lg:col-span-2 flex flex-col">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <ShieldCheck size={16} className="text-emerald-600" /> Active Receivables
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        <th className="px-6 py-3">Case ID</th>
                                        <th className="px-6 py-3">Provider</th>
                                        <th className="px-6 py-3">Law Firm</th>
                                        <th className="px-6 py-3 text-right">Lien Amount</th>
                                        <th className="px-6 py-3 text-right">Expected Recovery</th>
                                        <th className="px-6 py-3 text-center">Settlement Window</th>
                                        <th className="px-6 py-3 text-right">Contract</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {cases.map((c) => {
                                        const expectedRec = c.lienAmount * (c.predictedRecoveryPercent / 100);
                                        const strength = getContractStrength(c, allEvents);
                                        const provider = selectors.getProviderById(c.providerId);
                                        return (
                                            <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 text-xs font-mono font-bold text-slate-900">#{c.id.replace('case_', '')}</td>
                                                <td className="px-6 py-4 text-xs font-medium text-slate-700">{provider?.name || '—'}</td>
                                                <td className="px-6 py-4 text-xs font-medium text-slate-700 truncate max-w-[150px]">{c.lawFirm || '—'}</td>
                                                <td className="px-6 py-4 text-xs font-bold text-slate-900 text-right">{formatCurrency(c.lienAmount)}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="text-xs font-bold text-emerald-600">{formatCurrency(expectedRec)}</div>
                                                    <div className="text-[10px] text-slate-400">{c.predictedRecoveryPercent}% Prob.</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                                        {c.predictedTimeToSettlementDays}d
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border border-current ${strength.color}`}>
                                                        {strength.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceivablesLedger;
