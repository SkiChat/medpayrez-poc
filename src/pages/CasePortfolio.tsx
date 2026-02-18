import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Search } from 'lucide-react';
import { useDataStore } from '../hooks/useDataStore';
import DataTable, { type Column } from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import ContractTypeBadge from '../components/ui/ContractTypeBadge';
import RecoveryRiskBadge from '../components/ui/RecoveryRiskBadge';
import type { Case } from '../types';

const CasePortfolio: React.FC = () => {
    const { selectors, isLoading, error, addEvent } = useDataStore();
    const navigate = useNavigate();

    // Filter States
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [riskFilter, setRiskFilter] = useState<string>('All');
    const [providerFilter, setProviderFilter] = useState<string>('All');
    const [contractTab, setContractTab] = useState<string>('All');

    const cases = selectors?.getCases() || [];
    const providers = selectors?.getProviders() || [];

    const filteredCases = useMemo(() => {
        return cases.filter(c => {
            const matchesSearch = c.patientAlias.toLowerCase().includes(search.toLowerCase()) ||
                c.id.toLowerCase().includes(search.toLowerCase()) ||
                (c.lawFirm ?? '').toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
            const matchesRisk = riskFilter === 'All' || c.riskTier === riskFilter;
            const matchesProvider = providerFilter === 'All' || c.providerId === providerFilter;
            const matchesContract = contractTab === 'All' || c.contractType === contractTab;

            return matchesSearch && matchesStatus && matchesRisk && matchesProvider && matchesContract;
        });
    }, [cases, search, statusFilter, riskFilter, providerFilter, contractTab]);

    const handleGenerateNotice = (c: Case, e: React.MouseEvent) => {
        e.stopPropagation();
        addEvent({
            caseId: c.id,
            timestamp: new Date().toISOString(),
            type: 'NoticeGenerated',
            description: `Attorney notice generated for ${c.lawFirm ?? 'attorney'} regarding documented fee assignment.`,
        });
    };

    const handleScheduleFollowUp = (c: Case, e: React.MouseEvent) => {
        e.stopPropagation();
        addEvent({
            caseId: c.id,
            timestamp: new Date().toISOString(),
            type: 'FollowUpScheduled',
            description: `Follow-up scheduled with ${c.lawFirm ?? 'attorney'} for operational guidance on recovery status.`,
        });
    };

    const columns: Column<Case>[] = [
        { header: 'Case ID', accessor: (c) => <span className="font-mono text-xs">{c.id}</span> },
        { header: 'Patient Alias', accessor: (c) => <span className="font-semibold">{c.patientAlias}</span> },
        {
            header: 'Attorney', accessor: (c) => (
                <div>
                    <p className="text-xs font-medium text-slate-800">{c.lawFirm ?? '—'}</p>
                    <p className="text-[10px] text-slate-400">{c.attorneyName ?? ''}</p>
                </div>
            )
        },
        { header: 'Contract', accessor: (c) => <ContractTypeBadge type={c.contractType} /> },
        { header: 'Risk', accessor: (c) => <RecoveryRiskBadge risk={c.recoveryRisk} /> },
        { header: 'Status', accessor: (c) => <StatusBadge status={c.status} /> },
        { header: 'Lien Amount', accessor: (c) => `$${c.lienAmount.toLocaleString()}` },
        {
            header: 'Net Recovery', accessor: (c) => (
                <div className={c.predictedRecoveryPercent < 50 ? "text-red-600 font-bold" : "text-emerald-700 font-bold"}>
                    {c.predictedRecoveryPercent}%
                </div>
            )
        },
        {
            header: 'Actions', accessor: (c) => (
                <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                    <button
                        onClick={(e) => handleGenerateNotice(c, e)}
                        className="text-[10px] font-semibold px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition-colors whitespace-nowrap"
                    >
                        Notice
                    </button>
                    <button
                        onClick={(e) => handleScheduleFollowUp(c, e)}
                        className="text-[10px] font-semibold px-2 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded hover:bg-slate-100 transition-colors whitespace-nowrap"
                    >
                        Follow-up
                    </button>
                </div>
            )
        },
    ];

    if (isLoading) return <div className="p-12 text-center text-slate-400">Loading PI Cases...</div>;
    if (error) return <div className="p-12 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="space-y-4 md:space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">PI Cases</h1>
                    <p className="text-sm text-slate-500">Manage and track all outstanding PI medical liens.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold min-h-[36px] flex items-center">
                        {filteredCases.length} Cases
                    </span>
                </div>
            </div>

            {/* Contract Type Quick-Filter Tab Strip */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {(['All', 'MedPayRez', 'Legacy LOP', 'No Contract'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setContractTab(tab)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all min-h-[36px] ${contractTab === tab
                                ? tab === 'No Contract'
                                    ? 'bg-amber-500 text-white shadow-sm'
                                    : tab === 'MedPayRez'
                                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                                        : 'bg-slate-700 text-white shadow-sm'
                                : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600'
                            }`}
                    >
                        {tab}
                        {tab !== 'All' && (
                            <span className="ml-1.5 opacity-70">
                                ({cases.filter(c => c.contractType === tab).length})
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Filters Toolbar */}
            <div className="bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search patient, case ID, or law firm..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    <Filter size={18} className="text-slate-400" />

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Open">Open</option>
                        <option value="Active">Active</option>
                        <option value="Negotiation">Negotiation</option>
                        <option value="Settled">Settled</option>
                        <option value="Paid">Paid</option>
                    </select>

                    <select
                        value={riskFilter}
                        onChange={(e) => setRiskFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="All">All Risks</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>

                    <select
                        value={providerFilter}
                        onChange={(e) => setProviderFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
                    >
                        <option value="All">All Providers</option>
                        {providers.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <DataTable
                data={filteredCases}
                columns={columns}
                keyField="id"
                onRowClick={(item) => navigate(`/cases/${item.id}`)}
            />
        </div>
    );
};

export default CasePortfolio;
