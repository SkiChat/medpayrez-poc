import React, { useMemo, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { useDataStore } from '../hooks/useDataStore';
import AttorneyPerformanceTable from '../components/ui/AttorneyPerformanceTable';

const Analytics: React.FC = () => {
    const { selectors, isLoading } = useDataStore();
    const [dateRange, setDateRange] = useState<'90d' | '12m' | 'all'>('all');

    const cases = selectors?.getCases() || [];
    const providers = selectors?.getProviders() || [];

    // Provider label abbreviation helper
    const abbreviateProvider = (name: string): string => {
        const abbrevMap: Record<string, string> = {
            'Advanced Imaging Center': 'Adv. Imaging',
            'Regional Orthopedic Center': 'Regional Ortho',
            'Metro Pain Management': 'Metro Pain',
            'Coastal Rehabilitation': 'Coastal Rehab',
            'Summit Surgical Center': 'Summit Surgical',
        };
        return abbrevMap[name] || name.replace(/Center|Institute|Associates|Group/gi, 'Ctr.').trim().slice(0, 14);
    };

    // Date range multipliers (deterministic, UI-only)
    const rangeMultiplier = dateRange === '90d' ? 0.25 : dateRange === '12m' ? 0.85 : 1.0;

    // Chart Data Preparation
    const recoveryByProvider = useMemo(() => {
        return providers.map(p => {
            const providerCases = cases.filter(c => c.providerId === p.id);
            const avgRecovery = providerCases.length
                ? providerCases.reduce((sum, c) => sum + c.predictedRecoveryPercent, 0) / providerCases.length
                : 0;
            const avgBaseline = providerCases.length
                ? providerCases.reduce((sum, c) => sum + c.predictedRecoveryBaselinePercent, 0) / providerCases.length
                : 0;

            return {
                name: abbreviateProvider(p.name),
                avgRecovery: Math.round(avgRecovery),
                baseline: Math.round(avgBaseline)
            };
        });
    }, [cases, providers]);

    const statusDistribution = useMemo(() => {
        const counts: Record<string, number> = {};
        cases.forEach(c => {
            counts[c.status] = (counts[c.status] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [cases]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    if (isLoading) return <div className="p-12 text-center text-slate-400">Loading Analytics...</div>;

    return (
        <div className="space-y-4 md:space-y-8 animate-fade-in">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">PI Recovery Analytics</h1>
                <p className="text-sm text-slate-500">Performance metrics, recovery uplift, and strategic insights.</p>
            </div>

            {/* Date Range Toggle */}
            <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Period:</span>
                {([['90d', 'Last 90 Days'], ['12m', 'Last 12 Months'], ['all', 'All Time']] as const).map(([val, label]) => (
                    <button
                        key={val}
                        onClick={() => setDateRange(val)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all min-h-[36px] ${dateRange === val
                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600'
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Recovery Uplift Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                {/* Recovery Uplift Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Recovery Uplift by Contract</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-semibold text-blue-700">MedPayRez</span>
                                <span className="text-sm font-bold text-blue-700">78%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full rounded-full" style={{ width: '78%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-semibold text-slate-500">Legacy LOP</span>
                                <span className="text-sm font-bold text-slate-500">61%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                <div className="bg-slate-400 h-full rounded-full" style={{ width: '61%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-semibold text-amber-600">No Contract</span>
                                <span className="text-sm font-bold text-amber-600">42%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                <div className="bg-amber-400 h-full rounded-full" style={{ width: '42%' }}></div>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                            Patients are never personally billed. Recovery is through documented fee assignment.
                        </p>
                    </div>
                </div>

                {/* Days to Cash Comparison */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Days to Cash Trend</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-semibold text-slate-500">Without MedPayRez</span>
                                <span className="text-sm font-bold text-red-600">420d</span>
                            </div>
                            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                <div className="bg-red-400 h-full rounded-full" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-semibold text-blue-700">With MedPayRez</span>
                                <span className="text-sm font-bold text-blue-700">280d</span>
                            </div>
                            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full rounded-full" style={{ width: '67%' }}></div>
                            </div>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mt-2">
                            <p className="text-xs font-bold text-emerald-700">33% faster to cash</p>
                            <p className="text-[10px] text-emerald-600 mt-0.5">Contract-backed workflow accelerates settlement timelines.</p>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Portfolio Snapshot</h3>
                    <div className="space-y-3">
                        {[
                            { label: 'MedPayRez Contracts', value: cases.filter(c => c.contractType === 'MedPayRez').length, color: 'text-blue-700', bg: 'bg-blue-50' },
                            { label: 'Legacy LOP', value: cases.filter(c => c.contractType === 'Legacy LOP').length, color: 'text-slate-600', bg: 'bg-slate-50' },
                            { label: 'No Contract', value: cases.filter(c => c.contractType === 'No Contract').length, color: 'text-amber-700', bg: 'bg-amber-50' },
                            { label: 'Atty Acknowledged', value: cases.filter(c => c.attorneyAcknowledged === true).length, color: 'text-emerald-700', bg: 'bg-emerald-50' },
                            { label: 'Pending Acknowledgment', value: cases.filter(c => c.attorneyAcknowledged === false).length, color: 'text-red-700', bg: 'bg-red-50' },
                        ].map(stat => (
                            <div key={stat.label} className={`flex items-center justify-between px-3 py-2 rounded-lg ${stat.bg}`}>
                                <span className="text-xs font-medium text-slate-600">{stat.label}</span>
                                <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Attorney Performance Table */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4">Attorney Performance</h3>
                <p className="text-xs text-slate-400 mb-4">Avg days to settlement, reduction %, and active case count by law firm. Use for operational guidance on follow-up priority.</p>
                <AttorneyPerformanceTable />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Provider Performance Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-6">Net Recovery vs Billed by Provider</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={recoveryByProvider}
                                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 11 }}
                                    stroke="#64748B"
                                    angle={-15}
                                    textAnchor="end"
                                    interval={0}
                                />
                                <YAxis tick={{ fontSize: 12 }} stroke="#64748B" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(val: number | undefined) => [`${Math.round((val ?? 0) * rangeMultiplier)}%`]}
                                />
                                <Legend />
                                <Bar dataKey="avgRecovery" fill="#3B82F6" name="Net Recovery %" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="baseline" fill="#CBD5E1" name="Baseline %" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Distribution Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-6">Case Status Distribution</h3>
                    <div className="h-80 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusDistribution.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Analytics;
