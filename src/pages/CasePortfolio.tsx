import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Search } from 'lucide-react';
import { useDataStore } from '../hooks/useDataStore';
import DataTable, { type Column } from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import RiskBadge from '../components/ui/RiskBadge';
import type { Case } from '../types';

const CasePortfolio: React.FC = () => {
    const { selectors, isLoading, error } = useDataStore();
    const navigate = useNavigate();

    // Filter States
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [riskFilter, setRiskFilter] = useState<string>('All');
    const [providerFilter, setProviderFilter] = useState<string>('All');

    const cases = selectors?.getCases() || [];
    const providers = selectors?.getProviders() || [];

    const filteredCases = useMemo(() => {
        return cases.filter(c => {
            const matchesSearch = c.patientAlias.toLowerCase().includes(search.toLowerCase()) ||
                c.id.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
            const matchesRisk = riskFilter === 'All' || c.riskTier === riskFilter;
            const matchesProvider = providerFilter === 'All' || c.providerId === providerFilter;

            return matchesSearch && matchesStatus && matchesRisk && matchesProvider;
        });
    }, [cases, search, statusFilter, riskFilter, providerFilter]);

    const columns: Column<Case>[] = [
        { header: 'Case ID', accessor: (c) => <span className="font-mono text-xs">{c.id}</span> },
        { header: 'Patient Alias', accessor: (c) => <span className="font-semibold">{c.patientAlias}</span> },
        { header: 'Status', accessor: (c) => <StatusBadge status={c.status} /> },
        { header: 'Lien Amount', accessor: (c) => `$${c.lienAmount.toLocaleString()}` },
        { header: 'Pred. Recovery', accessor: (c) => <div className={c.predictedRecoveryPercent < 50 ? "text-red-600 font-bold" : "text-emerald-700 font-bold"}>{c.predictedRecoveryPercent}%</div> },
        { header: 'Risk Tier', accessor: (c) => <RiskBadge level={c.riskTier} /> },
        { header: 'State', accessor: (c) => c.state },
    ];

    if (isLoading) return <div className="p-12 text-center text-slate-400">Loading Portfolio...</div>;
    if (error) return <div className="p-12 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Case Portfolio</h1>
                    <p className="text-slate-500">Manage and track all outstanding medical liens.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                        {filteredCases.length} Cases
                    </span>
                </div>
            </div>

            {/* Filters Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search patient or case ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                    <Filter size={18} className="text-slate-400" />

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Open">Open</option>
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
