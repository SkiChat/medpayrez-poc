import React, { useMemo } from 'react';
import { TrendingDown, Users, Clock, ShieldCheck, ChevronRight } from 'lucide-react';
import type { Case, CaseEvent } from '../../types';

interface AttorneyPerformanceIntelligenceProps {
    cases: Case[];
    getCaseEvents: (caseId: string) => CaseEvent[];
}

interface AttorneyStats {
    lawFirm: string;
    activeCases: number;
    avgDaysToAck: number;
    avgSettlementDuration: number;
    avgFeeReduction: number;
    netRecovery: number;
}

const AttorneyPerformanceIntelligence: React.FC<AttorneyPerformanceIntelligenceProps> = ({ cases, getCaseEvents }) => {
    const attorneyStats = useMemo(() => {
        const firms: Record<string, {
            activeCases: number;
            totalAckDays: number;
            ackCount: number;
            totalSettlementDays: number;
            totalRecovery: number;
            caseCount: number;
        }> = {};

        cases.forEach(c => {
            const firm = c.lawFirm || 'Unknown';
            if (!firms[firm]) {
                firms[firm] = {
                    activeCases: 0,
                    totalAckDays: 0,
                    ackCount: 0,
                    totalSettlementDays: 0,
                    totalRecovery: 0,
                    caseCount: 0
                };
            }

            firms[firm].caseCount += 1;
            firms[firm].totalRecovery += c.predictedRecoveryPercent;
            firms[firm].totalSettlementDays += c.predictedTimeToSettlementDays;
            if (c.status !== 'Paid' && c.status !== 'Settled') {
                firms[firm].activeCases += 1;
            }

            // Calculate Ack Days
            const events = getCaseEvents(c.id);
            const notice = events.find(e => e.type === 'AttorneyNoticeSent' || e.type === 'NoticeGenerated');
            const ack = events.find(e => e.type === 'AttorneyAcknowledged');

            if (notice && ack) {
                const diff = (new Date(ack.timestamp).getTime() - new Date(notice.timestamp).getTime()) / (1000 * 60 * 60 * 24);
                firms[firm].totalAckDays += Math.max(1, diff);
                firms[firm].ackCount += 1;
            } else if (c.attorneyAcknowledged) {
                // Deterministic mock fallback
                firms[firm].totalAckDays += (c.id.length % 5) + 2;
                firms[firm].ackCount += 1;
            }
        });

        return Object.entries(firms).map(([lawFirm, data]): AttorneyStats => {
            const netRecovery = Math.round(data.totalRecovery / data.caseCount);
            return {
                lawFirm,
                activeCases: data.activeCases || 1, // Ensure at least 1 for demo
                avgDaysToAck: data.ackCount > 0 ? Math.round(data.totalAckDays / data.ackCount) : 14,
                avgSettlementDuration: Math.round(data.totalSettlementDays / data.caseCount),
                avgFeeReduction: 100 - netRecovery,
                netRecovery: netRecovery
            };
        }).sort((a, b) => b.netRecovery - a.netRecovery);
    }, [cases, getCaseEvents]);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">Attorney Performance Intelligence</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Aggregate PI Portfolio Intelligence</p>
                    </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-2 py-1 rounded">
                    Data aggregated across provider portfolio
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Law Firm</th>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Active Cases</th>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Days to Ack</th>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Settlement Duration</th>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Avg Reduction</th>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Net Recovery</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm">
                        {attorneyStats.map((row) => (
                            <tr key={row.lawFirm} className="hover:bg-blue-50/30 transition-colors group cursor-pointer">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-slate-100 p-1.5 rounded group-hover:bg-blue-100 transition-colors">
                                            <Users size={14} className="text-slate-500 group-hover:text-blue-600" />
                                        </div>
                                        <span className="font-bold text-slate-700">{row.lawFirm}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="px-2 py-1 bg-slate-100 rounded-md text-xs font-bold text-slate-600">
                                        {row.activeCases}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center font-medium text-slate-600">
                                    <span className={row.avgDaysToAck > 10 ? 'text-amber-600' : 'text-emerald-600'}>
                                        {row.avgDaysToAck}d
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-1.5 text-slate-600">
                                        <Clock size={12} className="text-slate-400" />
                                        <span className="font-medium">{row.avgSettlementDuration}d</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-1 text-amber-600">
                                        <TrendingDown size={12} />
                                        <span className="font-bold">-{row.avgFeeReduction}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="inline-flex items-center gap-2">
                                        <span className="text-base font-bold text-slate-900">{row.netRecovery}%</span>
                                        <ChevronRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AttorneyPerformanceIntelligence;
