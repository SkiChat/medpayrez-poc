import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../hooks/useDataStore';
import { FileText, ChevronRight, PenTool } from 'lucide-react';
import type { Case } from '../types';

const US_STATES = ['CA', 'NV', 'TX', 'FL', 'NY', 'GA', 'AZ', 'WA', 'IL', 'OH'];
const INJURY_TYPES = ['Soft Tissue', 'Fracture', 'Surgical', 'Chronic Pain', 'Other'];

const Intake: React.FC = () => {
    const navigate = useNavigate();
    const { selectors, addCase, addEvent } = useDataStore();

    // Form State
    const [patientAlias, setPatientAlias] = useState('');
    const [injuryType, setInjuryType] = useState(INJURY_TYPES[0]);
    const [state, setState] = useState(US_STATES[0]);
    const [providerId, setProviderId] = useState('');
    const [attorneyId, setAttorneyId] = useState('');
    const [billedAmount, setBilledAmount] = useState<number>(0);
    const [lienAmount, setLienAmount] = useState<number>(0);

    const [step, setStep] = useState<1 | 2>(1);
    const [contractAck, setContractAck] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const providers = selectors?.getProviders() || [];
    const attorneys = selectors?.getAttorneys() || [];

    // Initialize defaults when data loads
    React.useEffect(() => {
        if (providers.length > 0 && !providerId) setProviderId(providers[0].id);
        if (attorneys.length > 0 && !attorneyId) setAttorneyId(attorneys[0].id);
    }, [providers, attorneys, providerId, attorneyId]);

    const handleNext = () => {
        if (patientAlias && billedAmount > 0 && lienAmount > 0) {
            setStep(2);
        }
    };

    const handleSignAndSubmit = async () => {
        if (!contractAck) return;
        setIsSubmitting(true);

        const newCaseId = `case_${Date.now()}`;
        const now = new Date();

        // Mock predictions for demo
        const recoveryPct = Math.floor(Math.random() * (85 - 55) + 55);

        const newCase: Case = {
            id: newCaseId,
            patientAlias,
            ageBucket: '30-40', // Default for demo
            injuryType,
            state,
            providerId,
            attorneyId,
            lienAmount,
            billedAmount,
            predictedRecoveryPercent: recoveryPct,
            predictedRecoveryBaselinePercent: recoveryPct - 5,
            predictedTimeToSettlementDays: Math.floor(Math.random() * 200) + 100,
            status: 'Open',
            riskTier: 'Low', // Start low risk
            intakeDate: now.toISOString().split('T')[0],
            lastUpdatedDate: now.toISOString().split('T')[0],
        };

        // Add Case to Store
        addCase(newCase);

        // Add Workflow Events
        // 1. Intake Completed
        addEvent({
            caseId: newCaseId,
            timestamp: now.toISOString(),
            type: 'IntakeCompleted',
            description: 'New case intake created via Provider Portal.'
        });

        // 2. Contract Signed (simulated 1 min later)
        const signedTime = new Date(now.getTime() + 60000);
        addEvent({
            caseId: newCaseId,
            timestamp: signedTime.toISOString(),
            type: 'ContractSigned',
            description: 'Electronic fee recovery agreement signed by patient.'
        });

        // Simulate delay for effect
        setTimeout(() => {
            navigate(`/cases/${newCaseId}`);
        }, 800);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <FileText className="text-blue-600" />
                    New Case Intake
                </h1>
                <p className="text-slate-500 mt-2">
                    Contract-backed fee recovery workflow. Patient data is de-identified.
                </p>
            </div>

            {/* Progress Stepper */}
            <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
                <div className={`px-3 py-1 rounded-full ${step === 1 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100'}`}>1. Case Details</div>
                <div className="h-px bg-slate-200 w-12"></div>
                <div className={`px-3 py-1 rounded-full ${step === 2 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100'}`}>2. Contract & Sign</div>
            </div>

            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">

                {step === 1 && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Patient Alias</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. J. Doe"
                                    value={patientAlias}
                                    onChange={e => setPatientAlias(e.target.value)}
                                />
                                <p className="text-xs text-slate-400 mt-1">Do not use real names for demo.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Injury Type</label>
                                <select
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={injuryType}
                                    onChange={e => setInjuryType(e.target.value)}
                                >
                                    {INJURY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                                <select
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={state}
                                    onChange={e => setState(e.target.value)}
                                >
                                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Provider</label>
                                <select
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={providerId}
                                    onChange={e => setProviderId(e.target.value)}
                                >
                                    {providers.map(p => <option key={p.id} value={p.id}>{p.name} ({p.practiceName})</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Attorney / Firm</label>
                                <select
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={attorneyId}
                                    onChange={e => setAttorneyId(e.target.value)}
                                >
                                    {attorneys.map(a => <option key={a.id} value={a.id}>{a.firmName} ({a.attorneyName})</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Est. Billed Amount ($)</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={billedAmount || ''}
                                    onChange={e => setBilledAmount(Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Est. Lien Amount ($)</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={lienAmount || ''}
                                    onChange={e => setLienAmount(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-6">
                            <button
                                onClick={handleNext}
                                disabled={!patientAlias || billedAmount <= 0 || lienAmount <= 0}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                Continue <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-8">
                        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 font-serif text-slate-600 text-sm leading-relaxed">
                            <h3 className="font-bold text-slate-800 text-lg mb-4 font-sans border-b border-slate-200 pb-2">Fee Recovery Agreement (Demo)</h3>
                            <p className="mb-4">
                                This agreement ("Agreement") creates a contractual lien against any settlement, judgment, or verdict obtained by the Patient in favor of the Provider for medical services rendered.
                            </p>
                            <p className="mb-4">
                                <strong>1. Contract-Backed Billing.</strong> Patient agrees that payment for services is deferred until resolution of the legal claim. Provider agrees not to pursue personal collection against Patient during the pendency of the claim.
                            </p>
                            <p className="mb-4">
                                <strong>2. Assignment of Proceeds.</strong> Patient hereby assigns to Provider a portion of the settlement proceeds equal to the customary charge for services deemed necessary.
                            </p>
                            <p>
                                <em>Sign below to acknowledge terms.</em>
                            </p>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <input
                                type="checkbox"
                                id="contractAck"
                                checked={contractAck}
                                onChange={e => setContractAck(e.target.checked)}
                                className="mt-1 w-4 h-4 text-blue-600 rounded"
                            />
                            <label htmlFor="contractAck" className="text-sm text-blue-900 cursor-pointer select-none">
                                I acknowledge contract-backed fee recovery terms and authorize direct payment from settlement proceeds (Demo).
                            </label>
                        </div>

                        <div className="flex justify-between pt-4">
                            <button
                                onClick={() => setStep(1)}
                                className="text-slate-500 hover:text-slate-700 font-medium px-4 py-2"
                            >
                                Back to Details
                            </button>
                            <button
                                onClick={handleSignAndSubmit}
                                disabled={!contractAck || isSubmitting}
                                className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-200"
                            >
                                {isSubmitting ? (
                                    <>Signing...</>
                                ) : (
                                    <>
                                        <PenTool size={18} />
                                        Sign Contract (Demo)
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Intake;
