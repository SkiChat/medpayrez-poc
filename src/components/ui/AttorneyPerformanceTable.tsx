import React from 'react';
import { TrendingDown } from 'lucide-react';

interface AttorneyRow {
    lawFirm: string;
    avgDaysToSettlement: number;
    avgReductionPct: number;
    activeCaseCount: number;
}

// Static mocked data — representative of PI portfolio
const ATTORNEY_DATA: AttorneyRow[] = [
    { lawFirm: 'Smith & Reyes Injury Law', avgDaysToSettlement: 210, avgReductionPct: 12, activeCaseCount: 3 },
    { lawFirm: 'Hamlin & McGill Injury', avgDaysToSettlement: 280, avgReductionPct: 18, activeCaseCount: 2 },
    { lawFirm: 'Schweikart Injury Group', avgDaysToSettlement: 320, avgReductionPct: 22, activeCaseCount: 2 },
    { lawFirm: 'Davis & Main PI Law', avgDaysToSettlement: 190, avgReductionPct: 9, activeCaseCount: 1 },
    { lawFirm: 'Reyes Injury Group', avgDaysToSettlement: 350, avgReductionPct: 28, activeCaseCount: 2 },
    { lawFirm: 'Coastal PI Partners', avgDaysToSettlement: 420, avgReductionPct: 35, activeCaseCount: 1 },
];

const AttorneyPerformanceTable: React.FC = () => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="px-4 py-3">Law Firm</th>
                        <th className="px-4 py-3 text-right">Avg Days to Settlement</th>
                        <th className="px-4 py-3 text-right">Avg Reduction %</th>
                        <th className="px-4 py-3 text-right">Active Cases</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {ATTORNEY_DATA.map((row) => (
                        <tr key={row.lawFirm} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-900">{row.lawFirm}</td>
                            <td className="px-4 py-3 text-right">
                                <span className={`font-semibold ${row.avgDaysToSettlement > 300 ? 'text-red-600' : row.avgDaysToSettlement > 220 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                    {row.avgDaysToSettlement}d
                                </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                                <span className="flex items-center justify-end gap-1">
                                    <TrendingDown size={12} className={row.avgReductionPct > 25 ? 'text-red-500' : 'text-amber-500'} />
                                    <span className={`font-semibold ${row.avgReductionPct > 25 ? 'text-red-600' : 'text-amber-600'}`}>
                                        -{row.avgReductionPct}%
                                    </span>
                                </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                                    {row.activeCaseCount}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AttorneyPerformanceTable;
