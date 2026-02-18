import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { useDataStore } from '../hooks/useDataStore';

const Analytics: React.FC = () => {
    const { selectors, isLoading } = useDataStore();

    const cases = selectors?.getCases() || [];
    const providers = selectors?.getProviders() || [];

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
                name: p.name.split(' ').pop() || p.name, // Last name or full name
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
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Portfolio Analytics</h1>
                <p className="text-slate-500">Performance metrics and strategic insights.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Provider Performance Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-6">Avg Recovery % by Provider</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={recoveryByProvider}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748B" />
                                <YAxis tick={{ fontSize: 12 }} stroke="#64748B" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Bar dataKey="avgRecovery" fill="#3B82F6" name="Predicted Recovery %" radius={[4, 4, 0, 0]} />
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
