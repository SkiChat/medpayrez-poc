import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Wallet, Search, Bell, FolderOpen, AlertTriangle, TrendingUp, Clock,
    Filter, Download, ChevronRight, ChevronLeft, ArrowUpRight, ArrowDownRight,
    Zap, ChevronDown
} from 'lucide-react';
import { useDataStore } from '../hooks/useDataStore';
import ContractTypeBadge from '../components/ui/ContractTypeBadge';
import RecoveryRiskBadge from '../components/ui/RecoveryRiskBadge';
import ActionFeed from '../components/ui/ActionFeed';
import type { Case } from '../types';

// ─── Mobile Case Card ────────────────────────────────────────────────────────
interface MobileCaseCardProps {
    c: Case;
    getAge: (d: string) => string;
    formatCurrency: (n: number) => string;
    navigate: (path: string) => void;
}

const MobileCaseCard: React.FC<MobileCaseCardProps> = ({ c, getAge, formatCurrency, navigate }) => {
    const { addEvent } = useDataStore();

    const handleNotice = (e: React.MouseEvent) => {
        e.stopPropagation();
        addEvent({
            caseId: c.id,
            timestamp: new Date().toISOString(),
            type: 'NoticeGenerated',
            description: `Attorney notice generated for ${c.lawFirm ?? 'attorney'} regarding documented fee assignment.`,
        });
    };

    return (
        <div
            onClick={() => navigate(`/cases/${c.id}`)}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm active:bg-blue-50 transition-colors cursor-pointer"
        >
            <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                    <span className="text-[10px] font-mono text-slate-400">#{c.id.replace('case_', '')}</span>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{c.patientAlias}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <ContractTypeBadge type={c.contractType} />
                    <RecoveryRiskBadge risk={c.recoveryRisk} />
                </div>
            </div>

            <div className="text-xs text-slate-600 mb-1 font-medium truncate">{c.lawFirm ?? '—'}</div>
            <div className="text-[10px] text-slate-400 mb-3">{c.attorneyName ?? ''}</div>

            <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Lien</p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">{formatCurrency(c.lienAmount)}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Recovery</p>
                    <p className={`text-xs font-bold mt-0.5 ${c.predictedRecoveryPercent < 50 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {c.predictedRecoveryPercent}%
                    </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Age</p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">{getAge(c.intakeDate)}</p>
                </div>
            </div>

            <button
                onClick={handleNotice}
                className="w-full py-2.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors min-h-[44px]"
            >
                Generate Notice
            </button>
        </div>
    );
};

// ─── Desktop Table Row ────────────────────────────────────────────────────────
interface CaseRowProps {
    c: Case;
    getProviderName: (id: string) => string;
    getAge: (date: string) => string;
    formatCurrency: (n: number) => string;
    navigate: (path: string) => void;
}

const CaseRow: React.FC<CaseRowProps> = ({ c, getAge, formatCurrency, navigate }) => {
    const { addEvent } = useDataStore();

    const handleGenerateNotice = (e: React.MouseEvent) => {
        e.stopPropagation();
        addEvent({
            caseId: c.id,
            timestamp: new Date().toISOString(),
            type: 'NoticeGenerated',
            description: `Attorney notice generated for ${c.lawFirm ?? 'attorney'} regarding documented fee assignment.`,
        });
    };

    const handleScheduleFollowUp = (e: React.MouseEvent) => {
        e.stopPropagation();
        addEvent({
            caseId: c.id,
            timestamp: new Date().toISOString(),
            type: 'FollowUpScheduled',
            description: `Follow-up scheduled with ${c.lawFirm ?? 'attorney'} for operational guidance on recovery status.`,
        });
    };

    return (
        <tr
            onClick={() => navigate(`/cases/${c.id}`)}
            className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
        >
            <td className="px-4 py-3">
                <span className="text-xs font-semibold text-slate-900 font-mono">#{c.id.replace('case_', '')}</span>
                <p className="text-[10px] text-slate-400 mt-0.5">{c.patientAlias}</p>
            </td>
            <td className="px-4 py-3">
                <span className="text-xs font-medium text-slate-700 leading-tight block">{c.lawFirm ?? '—'}</span>
                <span className="text-[10px] text-slate-400">{c.attorneyName ?? ''}</span>
            </td>
            <td className="px-4 py-3">
                <ContractTypeBadge type={c.contractType} />
            </td>
            <td className="px-4 py-3">
                <RecoveryRiskBadge risk={c.recoveryRisk} />
            </td>
            <td className="px-4 py-3 text-right">
                <span className="text-sm font-bold text-slate-900">{formatCurrency(c.lienAmount)}</span>
            </td>
            <td className="px-4 py-3 text-right">
                <span className="text-xs font-medium text-slate-500">{getAge(c.intakeDate)}</span>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                    <button
                        onClick={handleGenerateNotice}
                        className="text-[10px] font-semibold px-2 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition-colors whitespace-nowrap min-h-[32px]"
                    >
                        Notice
                    </button>
                    <button
                        onClick={handleScheduleFollowUp}
                        className="text-[10px] font-semibold px-2 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded hover:bg-slate-100 transition-colors whitespace-nowrap min-h-[32px]"
                    >
                        Follow-up
                    </button>
                </div>
            </td>
        </tr>
    );
};

// ─── Main Overview Page ───────────────────────────────────────────────────────
const Overview: React.FC = () => {
    const { selectors, isLoading, error } = useDataStore();
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All Cases');
    const [actionFeedOpen, setActionFeedOpen] = useState(true);

    if (isLoading) return <div className="p-12 text-center text-slate-400 animate-pulse">Loading Dashboard...</div>;
    if (error || !selectors) return <div className="p-12 text-center text-red-500">Error loading data: {error}</div>;

    const cases = selectors.getCases();

    // KPI Calculations
    const totalCases = cases.length;
    const atRiskCount = cases.filter(c => c.riskTier === 'High' || c.recoveryRisk === 'High').length;
    const avgRecovery = cases.reduce((sum, c) => sum + c.predictedRecoveryPercent, 0) / (cases.length || 1);
    const avgBaseline = cases.reduce((sum, c) => sum + c.predictedRecoveryBaselinePercent, 0) / (cases.length || 1);
    const avgDays = cases.reduce((sum, c) => sum + c.predictedTimeToSettlementDays, 0) / (cases.length || 1);
    const netRecoveryVsBilled = avgRecovery - avgBaseline;

    const needsActionCount = cases.filter(c =>
        c.attorneyAcknowledged === false ||
        c.contractType === 'No Contract' ||
        (c.recoveryRisk === 'High' && c.status !== 'Paid')
    ).length;

    // Filter Logic
    const filteredCases = cases.filter(c => {
        if (filter === 'All Cases') return true;
        if (filter === 'High Risk') return c.riskTier === 'High' || c.recoveryRisk === 'High';
        if (filter === 'Active') return c.status !== 'Paid' && c.status !== 'Settled';
        if (filter === '90+ Days') {
            const days = (new Date().getTime() - new Date(c.intakeDate).getTime()) / (1000 * 3600 * 24);
            return days > 90;
        }
        if (filter === 'Needs Action') return c.attorneyAcknowledged === false || c.contractType === 'No Contract';
        return true;
    });

    const getProviderName = (providerId: string) => {
        const provider = selectors.getProviders().find(p => p.id === providerId);
        return provider ? provider.practiceName : 'Unknown Provider';
    };

    const getAge = (dateStr: string) => {
        const days = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 3600 * 24));
        return `${days}d`;
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

    return (
        <div className="space-y-4 md:space-y-6">

            {/* ── Header (desktop only — mobile uses Layout's top bar) ── */}
            <header className="hidden md:flex items-center justify-between bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-600 p-2 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
                        <Wallet className="text-white w-5 h-5 xl:w-6 xl:h-6" />
                    </div>
                    <div>
                        <h1 className="text-lg xl:text-xl font-bold tracking-tight text-slate-900">PI Recovery Command Center</h1>
                        <p className="text-xs text-slate-500 font-medium">Enterprise Recovery View</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative hidden xl:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            className="bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm w-56 focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-400"
                            placeholder="Search portfolio..."
                            type="text"
                        />
                    </div>
                    <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors relative min-h-[44px] min-w-[44px] flex items-center justify-center">
                        <Bell className="text-slate-600 w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    </button>
                    <div className="h-8 w-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs cursor-pointer">
                        JD
                    </div>
                </div>
            </header>

            {/* ── Mobile page title ── */}
            <div className="md:hidden">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">PI Recovery Command Center</h1>
                <p className="text-xs text-slate-500 mt-1">
                    See your PI cases ranked by recovery strength, legal position, and time to cash.
                </p>
            </div>

            {/* ── Desktop subtitle ── */}
            <p className="hidden md:block text-sm text-slate-500 max-w-3xl -mt-2">
                See your PI cases ranked by recovery strength, legal position, and time to cash. Act on what matters this week.
            </p>

            {/* ── KPI Cards: 1 col mobile → 2 col tablet → 4 col desktop ── */}
            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
                {/* Card 1 */}
                <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all group duration-300 hover:shadow-md">
                    <div className="flex justify-between items-start mb-3">
                        <p className="text-sm font-medium text-slate-500">Total PI Cases</p>
                        <FolderOpen className="text-slate-400 group-hover:text-blue-600 transition-colors w-5 h-5" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{totalCases.toLocaleString()}</h2>
                        <span className="text-xs font-semibold text-emerald-600 flex items-center bg-emerald-50 px-1.5 py-0.5 rounded">
                            <ArrowUpRight className="w-3 h-3 mr-0.5" /> 12%
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1 mt-3 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <p className="text-[10px] mt-2 text-slate-400 uppercase font-bold tracking-widest">Active Inventory</p>
                </div>

                {/* Card 2 */}
                <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm hover:border-amber-300 transition-all group duration-300 hover:shadow-md">
                    <div className="flex justify-between items-start mb-3">
                        <p className="text-sm font-medium text-slate-500">Cases at Risk of Write-off</p>
                        <AlertTriangle className="text-slate-400 group-hover:text-amber-500 transition-colors w-5 h-5 flex-shrink-0" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{atRiskCount}</h2>
                        <span className="text-xs font-semibold text-emerald-600 flex items-center bg-emerald-50 px-1.5 py-0.5 rounded">
                            <ArrowDownRight className="w-3 h-3 mr-0.5" /> 5%
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1 mt-3 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(atRiskCount / totalCases) * 100}%` }}></div>
                    </div>
                    <p className="text-[10px] mt-2 text-slate-400 uppercase font-bold tracking-widest">{needsActionCount} Needs Action This Week</p>
                </div>

                {/* Card 3 */}
                <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all group duration-300 hover:shadow-md">
                    <div className="flex justify-between items-start mb-3">
                        <p className="text-sm font-medium text-slate-500">Net Recovery vs Billed</p>
                        <TrendingUp className="text-slate-400 group-hover:text-emerald-500 transition-colors w-5 h-5" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{avgRecovery.toFixed(1)}%</h2>
                        <span className="text-xs font-semibold text-emerald-600 flex items-center bg-emerald-50 px-1.5 py-0.5 rounded">
                            <ArrowUpRight className="w-3 h-3 mr-0.5" /> +{netRecoveryVsBilled.toFixed(1)}pts
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1 mt-3 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${avgRecovery}%` }}></div>
                    </div>
                    <p className="text-[10px] mt-2 text-slate-400 uppercase font-bold tracking-widest">vs {avgBaseline.toFixed(1)}% Baseline</p>
                </div>

                {/* Card 4 */}
                <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all group duration-300 hover:shadow-md">
                    <div className="flex justify-between items-start mb-3">
                        <p className="text-sm font-medium text-slate-500">Days to Cash (PI Only)</p>
                        <Clock className="text-slate-400 group-hover:text-blue-500 transition-colors w-5 h-5" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{Math.round(avgDays)}</h2>
                        <span className="text-xs font-semibold text-emerald-600 flex items-center bg-emerald-50 px-1.5 py-0.5 rounded">
                            <ArrowDownRight className="w-3 h-3 mr-0.5" /> 3%
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1 mt-3 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <p className="text-[10px] mt-2 text-slate-400 uppercase font-bold tracking-widest">Days to Cash Trend</p>
                </div>
            </section>

            {/* ── Action Feed: full-width on mobile/tablet, right panel on xl ── */}
            {/* Mobile / Tablet: collapsible panel ABOVE the table */}
            <div className="xl:hidden">
                <button
                    onClick={() => setActionFeedOpen(o => !o)}
                    className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm min-h-[44px]"
                >
                    <div className="flex items-center gap-2">
                        <Zap size={16} className="text-amber-500" />
                        <span className="text-sm font-bold text-slate-900">What Should I Do This Week</span>
                        {needsActionCount > 0 && (
                            <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">{needsActionCount}</span>
                        )}
                    </div>
                    <ChevronDown
                        size={16}
                        className={`text-slate-400 transition-transform duration-200 ${actionFeedOpen ? 'rotate-180' : ''}`}
                    />
                </button>
                {actionFeedOpen && (
                    <div className="bg-slate-50 border border-slate-200 border-t-0 rounded-b-xl p-4">
                        <ActionFeed cases={cases} />
                        <p className="text-[10px] text-slate-400 leading-relaxed mt-3">
                            Patients are never personally billed. Recovery is pursued through contract-backed rights and documented fee assignments.
                        </p>
                    </div>
                )}
            </div>

            {/* ── Two-column layout on xl: Table (2/3) + Action Feed (1/3) ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">

                {/* Case List — full width on mobile/tablet, 2/3 on xl */}
                <div className="xl:col-span-2 space-y-3 md:space-y-4">

                    {/* Filter pills */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                            {['All Cases', 'High Risk', 'Active', '90+ Days', 'Needs Action'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-full transition-all min-h-[36px] md:min-h-[auto] ${filter === f
                                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                        <button className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-lg hover:shadow-md transition-all hover:text-blue-600">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>

                    {/* ── MOBILE: Card list (hidden on md+) ── */}
                    <div className="md:hidden space-y-3">
                        {filteredCases.slice(0, 10).map(c => (
                            <MobileCaseCard
                                key={c.id}
                                c={c}
                                getAge={getAge}
                                formatCurrency={formatCurrency}
                                navigate={navigate}
                            />
                        ))}
                        {filteredCases.length === 0 && (
                            <div className="p-8 text-center text-slate-400 text-sm bg-white rounded-xl border border-slate-200">
                                No cases found matching filters.
                            </div>
                        )}
                        <p className="text-xs text-slate-400 text-center">
                            Showing {Math.min(filteredCases.length, 10)} of {filteredCases.length} cases
                        </p>
                    </div>

                    {/* ── TABLET / DESKTOP: Table (hidden on mobile) ── */}
                    <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Case</th>
                                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Attorney</th>
                                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Contract</th>
                                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Risk</th>
                                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Lien Amt</th>
                                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Age</th>
                                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredCases.slice(0, 10).map((c) => (
                                        <CaseRow
                                            key={c.id}
                                            c={c}
                                            getProviderName={getProviderName}
                                            getAge={getAge}
                                            formatCurrency={formatCurrency}
                                            navigate={navigate}
                                        />
                                    ))}
                                </tbody>
                            </table>
                            {filteredCases.length === 0 && (
                                <div className="p-8 text-center text-slate-400 text-sm">No cases found matching filters.</div>
                            )}
                        </div>
                        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between">
                            <p className="text-xs text-slate-500 font-medium">
                                Showing {Math.min(filteredCases.length, 10)} of {filteredCases.length} cases
                            </p>
                            <div className="flex gap-2">
                                <button className="p-1.5 rounded bg-white border border-slate-200 text-slate-400 hover:text-blue-600 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button className="p-1.5 rounded bg-white border border-slate-200 text-slate-400 hover:text-blue-600 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Action Feed: right panel on xl only ── */}
                <div className="hidden xl:block space-y-4">
                    <div className="flex items-center gap-2">
                        <Zap size={18} className="text-amber-500" />
                        <h2 className="text-base font-bold text-slate-900">What Should I Do This Week</h2>
                    </div>
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                        <ActionFeed cases={cases} />
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                        Patients are never personally billed. Recovery is pursued through contract-backed rights and documented fee assignments.
                    </p>
                </div>
            </div>

            {/* Mobile filter icon row */}
            <div className="md:hidden flex items-center justify-between text-xs text-slate-400 pb-2">
                <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg min-h-[44px]">
                    <Filter className="w-4 h-4" />
                    More Filters
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg min-h-[44px]">
                    <Download className="w-4 h-4" />
                    Export
                </button>
            </div>

        </div>
    );
};

export default Overview;
