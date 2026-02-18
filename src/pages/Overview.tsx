import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Wallet, Search, Bell, FolderOpen, AlertTriangle, TrendingUp, Clock,
    Filter, Download, ChevronRight, ChevronLeft, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useDataStore } from '../hooks/useDataStore';

const Overview: React.FC = () => {
    const { selectors, isLoading, error } = useDataStore();
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All Cases');

    if (isLoading) return <div className="p-12 text-center text-slate-400 animate-pulse">Loading Dashboard...</div>;
    if (error || !selectors) return <div className="p-12 text-center text-red-500">Error loading data: {error}</div>;

    const cases = selectors.getCases();

    // KPI Calculations
    const totalCases = cases.length;
    const highRiskCount = cases.filter(c => c.riskTier === 'High').length;
    const avgRecovery = cases.reduce((sum, c) => sum + c.predictedRecoveryPercent, 0) / (cases.length || 1);
    const avgDays = cases.reduce((sum, c) => sum + c.predictedTimeToSettlementDays, 0) / (cases.length || 1);

    // Filter Logic
    const filteredCases = cases.filter(c => {
        if (filter === 'All Cases') return true;
        if (filter === 'High Risk') return c.riskTier === 'High';
        if (filter === 'Active') return c.status !== 'Paid' && c.status !== 'Settled';
        if (filter === '90+ Days') {
            // approximated by intake date
            const days = (new Date().getTime() - new Date(c.intakeDate).getTime()) / (1000 * 3600 * 24);
            return days > 90;
        }
        if (filter === 'Pending Payer') return c.status === 'Negotiation'; // Approx mapping
        return true;
    });

    // Helper to get Provider Name
    const getProviderName = (providerId: string) => {
        const provider = selectors.getProviders().find(p => p.id === providerId);
        return provider ? provider.practiceName : 'Unknown Provider';
    };

    // Helper to get Age (Days)
    const getAge = (dateStr: string) => {
        const days = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 3600 * 24));
        return `${days} Days`;
    };

    // Format Currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    return (
        <div className="min-h-screen flex flex-col bg-background-light font-sans text-slate-900">
            {/* Header Section */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <div className="bg-primary p-2 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                        <Wallet className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">Portfolio Management</h1>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Enterprise Recovery View</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative hidden md:block group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-primary transition-colors" />
                        <input
                            className="bg-slate-50 border-none rounded-lg pl-10 pr-4 py-2 text-sm w-64 focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-400"
                            placeholder="Search portfolio..."
                            type="text"
                        />
                    </div>
                    <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors relative">
                        <Bell className="text-slate-600 w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    </button>
                    <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs ring-2 ring-transparent hover:ring-primary/20 transition-all cursor-pointer">
                        JD
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6 space-y-6 overflow-y-auto">
                {/* KPI Cards */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-primary/30 transition-all group duration-300 hover:shadow-md">
                        <div className="flex justify-between items-start mb-3">
                            <p className="text-sm font-medium text-slate-500">Total Cases</p>
                            <FolderOpen className="text-slate-400 group-hover:text-primary transition-colors w-5 h-5" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-3xl font-bold text-slate-900">{totalCases.toLocaleString()}</h2>
                            <span className="text-xs font-semibold text-emerald-500 flex items-center bg-emerald-50 px-1.5 py-0.5 rounded">
                                <ArrowUpRight className="w-3 h-3 mr-0.5" /> 12%
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1 mt-3 rounded-full overflow-hidden">
                            <div className="bg-primary h-full rounded-full" style={{ width: '75%' }}></div>
                        </div>
                        <p className="text-[10px] mt-2 text-slate-400 uppercase font-bold tracking-widest">Active Inventory</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-primary/30 transition-all group duration-300 hover:shadow-md">
                        <div className="flex justify-between items-start mb-3">
                            <p className="text-sm font-medium text-slate-500">High Risk Count</p>
                            <AlertTriangle className="text-slate-400 group-hover:text-amber-500 transition-colors w-5 h-5" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-3xl font-bold text-slate-900">{highRiskCount}</h2>
                            <span className="text-xs font-semibold text-emerald-500 flex items-center bg-emerald-50 px-1.5 py-0.5 rounded">
                                <ArrowDownRight className="w-3 h-3 mr-0.5" /> 5%
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1 mt-3 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full rounded-full" style={{ width: '40%' }}></div>
                        </div>
                        <p className="text-[10px] mt-2 text-slate-400 uppercase font-bold tracking-widest">Immediate Attention</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-primary/30 transition-all group duration-300 hover:shadow-md">
                        <div className="flex justify-between items-start mb-3">
                            <p className="text-sm font-medium text-slate-500">Avg Recovery %</p>
                            <TrendingUp className="text-slate-400 group-hover:text-emerald-500 transition-colors w-5 h-5" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-3xl font-bold text-slate-900">{avgRecovery.toFixed(1)}%</h2>
                            <span className="text-xs font-semibold text-emerald-500 flex items-center bg-emerald-50 px-1.5 py-0.5 rounded">
                                <ArrowUpRight className="w-3 h-3 mr-0.5" /> 2.1%
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1 mt-3 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${avgRecovery}%` }}></div>
                        </div>
                        <p className="text-[10px] mt-2 text-slate-400 uppercase font-bold tracking-widest">Efficiency Bench</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-primary/30 transition-all group duration-300 hover:shadow-md">
                        <div className="flex justify-between items-start mb-3">
                            <p className="text-sm font-medium text-slate-500">Avg Days to Pymt</p>
                            <Clock className="text-slate-400 group-hover:text-blue-500 transition-colors w-5 h-5" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-3xl font-bold text-slate-900">{Math.round(avgDays)}</h2>
                            <span className="text-xs font-semibold text-emerald-500 flex items-center bg-emerald-50 px-1.5 py-0.5 rounded">
                                <ArrowDownRight className="w-3 h-3 mr-0.5" /> 3%
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1 mt-3 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full" style={{ width: '60%' }}></div>
                        </div>
                        <p className="text-[10px] mt-2 text-slate-400 uppercase font-bold tracking-widest">Cycle Velocity</p>
                    </div>
                </section>

                {/* Filters */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        {['All Cases', 'High Risk', 'Active', '90+ Days', 'Pending Payer'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${filter === f
                                    ? 'bg-primary text-white shadow-sm shadow-primary/20'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                        <div className="h-6 w-px bg-slate-200 mx-1"></div>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-primary text-sm font-medium transition-colors">
                            <Filter className="w-4 h-4" />
                            More Filters
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-lg hover:shadow-md transition-all hover:text-primary hover:border-primary/30">
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Case ID</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Provider/Facility</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Payer</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Risk Level</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Recovery Amt</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Age</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredCases.slice(0, 10).map((c) => ( // Limiting to 10 for demo/perf
                                    <tr
                                        key={c.id}
                                        onClick={() => navigate(`/cases/${c.id}`)}
                                        className="hover:bg-primary/5 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold text-slate-900">#{c.id.substring(0, 8).toUpperCase()}</span>
                                            <p className="text-[10px] text-slate-400 uppercase mt-0.5">Updated {Math.floor(Math.random() * 24)}h ago</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-slate-700">{getProviderName(c.providerId)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-slate-700">{'BlueCross Shield'}</span> {/* Mocked */}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${c.riskTier === 'High' ? 'bg-red-50 text-red-600' :
                                                c.riskTier === 'Medium' ? 'bg-amber-50 text-amber-600' :
                                                    'bg-emerald-50 text-emerald-600'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${c.riskTier === 'High' ? 'bg-red-500' :
                                                    c.riskTier === 'Medium' ? 'bg-amber-500' :
                                                        'bg-emerald-500'
                                                    }`}></span>
                                                {c.riskTier === 'High' ? 'Critical' : c.riskTier}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-bold text-slate-900">{formatCurrency(c.lienAmount)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-medium text-slate-500">{getAge(c.intakeDate)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <ChevronRight className="text-slate-300 group-hover:text-primary transition-colors w-5 h-5 ml-auto" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredCases.length === 0 && (
                            <div className="p-8 text-center text-slate-400 text-sm">No cases found matching filters.</div>
                        )}
                    </div>
                    <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
                        <p className="text-xs text-slate-500 font-medium">Showing {Math.min(filteredCases.length, 10)} of {filteredCases.length} cases</p>
                        <div className="flex gap-2">
                            <button className="p-1 rounded bg-white border border-slate-200 text-slate-400 hover:text-primary transition-colors hover:border-primary/50 disabled:opacity-50">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button className="p-1 rounded bg-white border border-slate-200 text-slate-400 hover:text-primary transition-colors hover:border-primary/50">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Overview;
