import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Calendar, User, Briefcase, FileText,
    BrainCircuit, Sparkles, CheckCircle2, Clock,
    AlertCircle, DollarSign, FileCheck, Send
} from 'lucide-react';
import { useDataStore } from '../hooks/useDataStore';
import StatusBadge from '../components/ui/StatusBadge';
import RiskBadge from '../components/ui/RiskBadge';
import ContractTypeBadge from '../components/ui/ContractTypeBadge';
import { generateRuleBasedInsights } from '../lib/insights';
import clsx from 'clsx';
import type { WorkflowEventType, AIInsight } from '../types';

const CaseDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { selectors, addEvent, isLoading } = useDataStore();

    // Local state for AI Insight
    const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);

    if (isLoading) return <div className="p-12 text-center text-slate-400">Loading Case...</div>;

    const caseItem = selectors?.getCaseById(id || '');
    if (!caseItem) return <div className="p-12 text-center text-red-500">Case not found.</div>;

    const provider = selectors?.getProviderById(caseItem.providerId);
    const attorney = selectors?.getAttorneyById(caseItem.attorneyId);
    const events = selectors?.getCaseEvents(caseItem.id) || [];

    const ruleInsights = generateRuleBasedInsights(caseItem);

    const invoiceEvent = events.find(e => e.type === 'InvoiceIssued');
    const isSettled = caseItem.status === 'Settled' || caseItem.status === 'Paid';

    // Actions
    const handleAddEvent = (type: WorkflowEventType, description: string) => {
        addEvent({
            caseId: caseItem.id,
            timestamp: new Date().toISOString(),
            type,
            description
        });
    };

    const handleGenerateAiInsight = async () => {
        setIsGeneratingAi(true);
        const enableAi = import.meta.env.VITE_ENABLE_AI_INSIGHTS === 'true';

        try {
            if (enableAi) {
                const response = await fetch('/.netlify/functions/generate-insight', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        caseId: caseItem.id,
                        injuryType: caseItem.injuryType,
                        riskTier: caseItem.riskTier,
                        status: caseItem.status,
                        predictedRecoveryPercent: caseItem.predictedRecoveryPercent,
                        predictedTimeToSettlementDays: caseItem.predictedTimeToSettlementDays,
                        recentEventTypes: events.slice(0, 5).map(e => e.type)
                    })
                });

                if (!response.ok) throw new Error('AI Service Unavailable');

                const data = await response.json();
                setAiInsight(data);
            } else {
                // Fallback Simulation for Offline/Demo
                setTimeout(() => {
                    setAiInsight({
                        nextBestActions: ["Review documentation and initiate follow-up.", "Check for outstanding liens."],
                        documentationGaps: ["Unclear narrative for gap in treatment > 30 days."],
                        paymentDelayRisk: "Medium",
                        followUpRecommendation: "Manual review recommended to ensure no timelines are missed.",
                        confidence: 0.88,
                        model: "demo-simulation"
                    });
                    setIsGeneratingAi(false);
                }, 1500);
            }
        } catch (err) {
            console.error(err);
            // Fallback on error so UI doesn't break
            setAiInsight({
                nextBestActions: ["Review documentation manually."],
                documentationGaps: ["Unable to analyze."],
                paymentDelayRisk: "Medium",
                followUpRecommendation: "System unavailable, please review manually.",
                confidence: 0.0,
                model: "error-fallback"
            });
            setIsGeneratingAi(false);
        } finally {
            if (enableAi) setIsGeneratingAi(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12 max-w-6xl mx-auto">
            {/* Header Navigation */}
            <button
                onClick={() => navigate('/cases')}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-2 transition-colors font-medium text-sm"
            >
                <ArrowLeft size={16} /> Back to Cases
            </button>

            {/* A. Summary Header */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{caseItem.patientAlias}</h1>
                            <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-xs font-mono">#{caseItem.id}</span>
                            <ContractTypeBadge type={caseItem.contractType} />
                            {caseItem.contractType === 'No Contract' && (
                                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                                    No fee agreement on file
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 mt-2">
                            <span className="flex items-center gap-1.5"><User size={16} className="text-blue-500" /> {provider?.name}</span>
                            <span className="flex items-center gap-1.5"><Briefcase size={16} className="text-slate-400" /> {attorney?.firmName}</span>
                            <span className="flex items-center gap-1.5"><FileText size={16} className="text-slate-400" /> {caseItem.injuryType}</span>
                            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 rounded border border-slate-100">{caseItem.state}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right mr-4">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lien Amount</p>
                            <p className="text-2xl font-bold text-slate-900">${caseItem.lienAmount.toLocaleString()}</p>
                        </div>
                        <StatusBadge status={caseItem.status} />
                    </div>
                </div>
            </div>

            {/* B. Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-slate-400 text-xs font-bold uppercase mb-1">Predicted Recovery</p>
                    <div className="flex items-end gap-2">
                        <span className={clsx("text-2xl font-bold", caseItem.predictedRecoveryPercent >= 60 ? "text-emerald-600" : "text-amber-600")}>
                            {caseItem.predictedRecoveryPercent}%
                        </span>
                        <span className="text-xs text-slate-500 mb-1">Target</span>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-slate-400 text-xs font-bold uppercase mb-1">Baseline Recovery</p>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-slate-700">{caseItem.predictedRecoveryBaselinePercent}%</span>
                        <span className="text-xs text-slate-500 mb-1">Hist. Avg</span>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-slate-400 text-xs font-bold uppercase mb-1">Est. Time to Set.</p>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-slate-700">{caseItem.predictedTimeToSettlementDays}</span>
                        <span className="text-xs text-slate-500 mb-1">Days</span>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center">
                    <p className="text-slate-400 text-xs font-bold uppercase mb-2 self-start w-full">Risk Profile</p>
                    <div className="w-full flex justify-between items-center">
                        <RiskBadge level={caseItem.riskTier} />
                        <span className="text-xs text-slate-400">AI Assessed</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Workflow & Invoicing */}
                <div className="lg:col-span-2 space-y-8">

                    {/* D. Invoicing Block */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <DollarSign size={18} className="text-emerald-600" /> Invoicing & Fee Recovery
                            </h3>
                            {invoiceEvent && <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">INVOICE ACTIVE</span>}
                        </div>
                        <div className="p-6">
                            {invoiceEvent ? (
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                        <FileCheck size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-900">Invoice Generated</p>
                                        <p className="text-sm text-slate-500">Issued on {new Date(invoiceEvent.timestamp).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-slate-900">${caseItem.lienAmount.toLocaleString()}</p>
                                        <p className="text-xs text-slate-500">Scheduled for recovery</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-slate-900">No invoice currently issued.</p>
                                        <p className="text-sm text-slate-500">Generate invoice to begin recovery workflow.</p>
                                    </div>
                                    <button
                                        onClick={() => handleAddEvent('InvoiceIssued', `Invoice for $${caseItem.lienAmount} generated and sent.`)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                                    >
                                        <FileText size={16} /> Issue Invoice (Demo)
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* C. Workflow Timeline */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Calendar size={18} className="text-blue-600" /> Workflow Timeline
                            </h3>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Clock size={12} /> All actions timestamped
                            </span>
                        </div>

                        <div className="space-y-0 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-[19px] top-2 bottom-4 w-0.5 bg-slate-200"></div>

                            {events.map((ev, idx) => (
                                <div key={idx} className="relative pl-12 pb-8 last:pb-0">
                                    {/* Dot */}
                                    <div className={clsx(
                                        "absolute left-[13px] top-1 w-3.5 h-3.5 rounded-full border-2 z-10",
                                        ev.type === 'IntakeCompleted' || ev.type === 'ContractSigned' ? "bg-blue-500 border-blue-500" :
                                            ev.type === 'InvoiceIssued' ? "bg-emerald-500 border-emerald-500" :
                                                ev.type === 'Alert' ? "bg-amber-500 border-amber-500" :
                                                    "bg-white border-slate-400"
                                    )}></div>

                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{ev.type}</p>
                                            <p className="text-slate-600 text-sm mt-0.5">{ev.description}</p>
                                        </div>
                                        <span className="text-xs font-mono text-slate-400 whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded">
                                            {new Date(ev.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-4 border-t border-slate-100 text-xs text-slate-400 italic text-center">
                            Documentation trail active used for audit and recovery support.
                        </div>
                    </div>
                </div>

                {/* Right Column: Actions & Insights */}
                <div className="space-y-6">

                    {/* E. Action Panel */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide text-slate-400">Quick Actions</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => handleAddEvent('RecordsRequested', 'Medical records requested from provider.')}
                                className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium transition-colors flex items-center justify-between group"
                            >
                                Request Records <Send size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                            <button
                                onClick={() => handleAddEvent('FollowUpSent', 'Status inquiry sent to attorney.')}
                                className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium transition-colors flex items-center justify-between group"
                            >
                                Send Follow-up <Send size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                            <button
                                onClick={() => handleAddEvent('PaymentReceived', 'Payment received and processed.')}
                                disabled={isSettled}
                                className="w-full text-left px-4 py-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 text-emerald-800 text-sm font-medium transition-colors flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Mark Payment Received <CheckCircle2 size={14} className="text-emerald-600" />
                            </button>
                        </div>
                    </div>

                    {/* Insights & AI */}
                    <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <BrainCircuit size={20} className="text-blue-400" />
                            Smart Insights
                        </h3>

                        <div className="space-y-3">
                            {ruleInsights.map((ins, idx) => (
                                <div key={idx} className={clsx(
                                    "p-3 rounded-xl text-sm border",
                                    ins.type === 'Alert' ? "bg-amber-900/30 border-amber-700/50 text-amber-100" :
                                        ins.type === 'Risk' ? "bg-rose-900/30 border-rose-700/50 text-rose-100" :
                                            "bg-blue-900/30 border-blue-700/50 text-blue-100"
                                )}>
                                    <div className="flex gap-2 items-start">
                                        <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                        <div>
                                            <span className="font-bold uppercase text-[10px] opacity-70 block mb-0.5">{ins.type}</span>
                                            {ins.message}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {ruleInsights.length === 0 && (
                                <p className="text-slate-400 text-sm italic">No specific risk alerts detected.</p>
                            )}
                        </div>

                        {/* Optional AI Section */}
                        {import.meta.env.VITE_ENABLE_AI_INSIGHTS === 'true' && (
                            <div className="mt-6 pt-6 border-t border-slate-700">
                                {!aiInsight ? (
                                    <button
                                        onClick={handleGenerateAiInsight}
                                        disabled={isGeneratingAi}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                    >
                                        {isGeneratingAi ? (
                                            <>Analyzing...</>
                                        ) : (
                                            <><Sparkles size={16} /> Generate AI Insight (Demo)</>
                                        )}
                                    </button>
                                ) : (
                                    <div className="animate-fade-in space-y-4">

                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-bold text-blue-200 uppercase tracking-widest">Revenue Acceleration Insight</h4>
                                            <span className={clsx(
                                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                                                aiInsight.paymentDelayRisk === 'High' ? "bg-rose-900/50 border-rose-500 text-rose-200" :
                                                    aiInsight.paymentDelayRisk === 'Medium' ? "bg-amber-900/50 border-amber-500 text-amber-200" :
                                                        "bg-emerald-900/50 border-emerald-500 text-emerald-200"
                                            )}>
                                                {aiInsight.paymentDelayRisk} Delay Risk
                                            </span>
                                        </div>

                                        <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                            <p className="text-xs font-bold text-blue-300 uppercase mb-2">Next Best Actions</p>
                                            <ul className="list-disc list-inside text-sm text-blue-50 space-y-1">
                                                {aiInsight.nextBestActions?.map((action: string, i: number) => (
                                                    <li key={i}>{action}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                            <p className="text-xs font-bold text-amber-300 uppercase mb-2">Documentation Gaps</p>
                                            <ul className="list-disc list-inside text-sm text-amber-50 space-y-1">
                                                {aiInsight.documentationGaps?.map((gap: string, i: number) => (
                                                    <li key={i}>{gap}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="text-sm text-slate-300 italic bg-white/5 p-3 rounded-lg border border-white/10">
                                            <span className="font-bold text-slate-400 not-italic block text-xs mb-1">Recommendation:</span>
                                            "{aiInsight.followUpRecommendation}"
                                        </div>

                                        <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-800">
                                            <span>Model: {aiInsight.model}</span>
                                            <span>Conf: {(aiInsight.confidence * 100).toFixed(0)}%</span>
                                        </div>

                                        <button
                                            onClick={() => setAiInsight(null)}
                                            className="w-full text-center text-xs text-slate-400 hover:text-white mt-2"
                                        >
                                            Reset AI
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <p className="text-xs text-blue-800 text-center">
                            Patients are never personally billed. Recovery is pursued through contract-backed rights.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CaseDetail;
