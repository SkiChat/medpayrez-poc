import React, { useMemo } from 'react';
import {
    DollarSign, TrendingUp, Calendar, Clock,
    BarChart3, Download,
    Search, ChevronRight, ShieldCheck, Timer
} from 'lucide-react';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip
} from 'recharts';
import { useDataStore } from '../hooks/useDataStore';
import { formatCurrency } from '../lib/displayUtils';

const Receivables: React.FC = () => {
    const { selectors, isLoading, error } = useDataStore();

    const cases = useMemo(() => selectors?.getCases() || [], [selectors]);
    const allEvents = useMemo(() => selectors?.getEvents() || [], [selectors]);

    // ─── 1. Portfolio Summary Data ───────────────────────────────────────────
    const summary = useMemo(() => {
        const totalPIReceivables = cases.reduce((sum, c) => sum + c.lienAmount, 0);
        const expectedRecovery = cases.reduce((sum, c) => sum + (c.lienAmount * (c.predictedRecoveryPercent / 100)), 0);
        const expected90DayCash = cases
            .filter(c => c.predictedTimeToSettlementDays < 90 && c.status !== 'Paid')
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

    // ─── 2. Aging Buckets ───────────────────────────────────────────────────
    const agingBuckets = useMemo(() => {
        const buckets = [
            { name: '0–90d', count: 0, value: 0 },
            { name: '90–180d', count: 0, value: 0 },
            { name: '180–365d', count: 0, value: 0 },
            { name: '365+ d', count: 0, value: 0 },
        ];

        cases.forEach(c => {
            const days = c.predictedTimeToSettlementDays;
            const value = c.lienAmount * (c.predictedRecoveryPercent / 100);
            if (days < 90) { buckets[0].count++; buckets[0].value += value; }
            else if (days < 180) { buckets[1].count++; buckets[1].value += value; }
            else if (days < 365) { buckets[2].count++; buckets[2].value += value; }
            else { buckets[3].count++; buckets[3].value += value; }
        });

        return buckets;
    }, [cases]);

    // ─── 3. Cash Flow Forecast ──────────────────────────────────────────────
    const forecastData = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const monthlyData = months.map((m) => ({
            name: m,
            projected: 0
        }));

        cases.forEach(c => {
            if (c.status === 'Paid') return;
            const monthIdx = Math.floor(c.predictedTimeToSettlementDays / 30);
            if (monthIdx < 6) {
                monthlyData[monthIdx].projected += (c.lienAmount * (c.predictedRecoveryPercent / 100));
            }
        });

        return monthlyData;
    }, [cases]);

    // ─── 4. Ledger Helper ──────────────────────────────────────────────────
    const getContractStrength = (caseId: string) => {
        const caseEvents = allEvents.filter(e => e.caseId === caseId);
        const steps = [
            caseEvents.some(e => e.type === 'AssignmentSigned' || e.type === 'ContractSigned'),
            caseEvents.some(e => e.type === 'AttorneyNoticeSent' || e.type === 'NoticeGenerated'),
            caseEvents.some(e => e.type === 'AttorneyAcknowledged'),
            caseEvents.some(e => e.type === 'InvoiceIssued'),
            caseEvents.some(e => e.type === 'DemandSent')
        ];
        return steps.filter(Boolean).length;
    };

    if (isLoading) return <div className="p-12 text-center text-slate-400 animate-pulse">Loading Ledger...</div>;
    if (error || !selectors) return <div className="p-12 text-center text-red-500">Error loading data: {error}</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Receivables Ledger</h1>
                    <p className="text-sm text-slate-500">PI medical receivables managed as financial assets.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-lg hover:shadow-md transition-all">
                        <Download className="w-4 h-4" /> Export Ledger
                    </button>
                </div>
            </div>

            {/* 1. Portfolio Summary Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total PI Receivables', value: formatCurrency(summary.totalPIReceivables), icon: DollarSign, color: 'text-slate-400', sub: 'Gross Book Value' },
                    { label: 'Expected Recovery', value: formatCurrency(summary.expectedRecovery), icon: TrendingUp, color: 'text-emerald-500', sub: `${((summary.expectedRecovery / (summary.totalPIReceivables || 1)) * 100).toFixed(1)}% Recovery Rate` },
                    { label: 'Expected 90-Day Cash', value: formatCurrency(summary.expected90DayCash), icon: Calendar, color: 'text-blue-500', sub: 'Projected Liquidity' },
                    { label: 'Avg Settlement Timeline', value: `${Math.round(summary.avgSettlementTimeline)} Days`, icon: Clock, color: 'text-amber-500', sub: 'Portfolio Cycle Time' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">{stat.value}</h2>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium italic">{stat.sub}</p>
                    </div>
                ))}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 4. Aging Widget & 5. Cash Flow Chart */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Aging Widget */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Timer size={16} className="text-amber-500" /> Receivable Aging Buckets
                        </h3>
                        <div className="space-y-4">
                            {agingBuckets.map((bucket, i) => (
                                <div key={i} className="group cursor-default">
                                    <div className="flex justify-between items-end mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-700">{bucket.name}</span>
                                            <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.5 bg-slate-50 rounded border border-slate-100">{bucket.count} Cases</span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-900">{formatCurrency(bucket.value)}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-blue-600 h-full rounded-full transition-all duration-500 group-hover:bg-blue-500"
                                            style={{ width: `${(bucket.value / (summary.expectedRecovery || 1)) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cash Flow Forecast */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <BarChart3 size={16} className="text-blue-600" /> Cash Flow Forecast
                        </h3>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={forecastData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 600 }} stroke="#94A3B8" />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        formatter={(val: any) => [formatCurrency(Number(val) || 0), 'Projected Recovery']}
                                    />
                                    <Bar dataKey="projected" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-4 text-center italic">Projected recovery across next 180 days based on case lifecycle intelligence.</p>
                    </div>
                </div>

                {/* 3. Receivable Ledger Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <ShieldCheck size={16} className="text-emerald-600" /> Receivable Ledger
                            </h3>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                                <input
                                    type="text"
                                    className="bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-[11px] w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Search ledger..."
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-24">ID</th>
                                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-40">Law Firm / Provider</th>
                                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right w-32">Lien Amt</th>
                                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right w-32">Expected Rec.</th>
                                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center w-28">Win.</th>
                                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right w-24">Strength</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-[11px]">
                                    {cases.map((c) => {
                                        const expectedRec = c.lienAmount * (c.predictedRecoveryPercent / 100);
                                        const strength = getContractStrength(c.id);
                                        return (
                                            <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                                                <td className="px-6 py-4 font-mono font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                    #{c.id.replace('case_', '')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-800 truncate">{c.lawFirm || '—'}</div>
                                                    <div className="text-slate-400 truncate">{c.patientAlias}</div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-slate-900">
                                                    {formatCurrency(c.lienAmount)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="font-bold text-emerald-600">{formatCurrency(expectedRec)}</div>
                                                    <div className="text-slate-400">{c.predictedRecoveryPercent}% Prob.</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="px-2 py-1 bg-slate-100 rounded text-slate-600 font-bold whitespace-nowrap">
                                                        {c.predictedTimeToSettlementDays}d
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < strength ? 'bg-blue-600' : 'bg-slate-200'}`} />
                                                        ))}
                                                    </div>
                                                    <div className="text-slate-400 mt-1 font-bold">{strength}/5 Steps</div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-auto">
                            <span>Showing {cases.length} PI Assets</span>
                            <div className="flex items-center gap-1">
                                <span className="text-blue-600">Patients are never personally billed</span>
                                <ChevronRight size={10} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Receivables;
