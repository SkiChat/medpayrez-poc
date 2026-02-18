import React, { useState } from 'react';
import { useDataStore } from '../hooks/useDataStore';
import { FileText, ChevronRight, PenTool, ShieldCheck, AlertTriangle, Minus } from 'lucide-react';
import type { Case, ContractType } from '../types';
import IntakeSuccess from './IntakeSuccess';

const US_STATES = ['CA', 'NV', 'TX', 'FL', 'NY', 'GA', 'AZ', 'WA', 'IL', 'OH'];
const INJURY_TYPES = ['Soft Tissue', 'Fracture', 'Surgical', 'Chronic Pain', 'Whiplash', 'Other'];

const CONTRACT_OPTIONS: { value: ContractType; label: string; description: string; recommended?: boolean; warning?: boolean }[] = [
    {
        value: 'MedPayRez',
        label: 'MedPayRez Enforceable Fee Contract',
        description: 'Documented fee assignment with attorney notification. Strongest recovery position.',
        recommended: true,
    },
    {
        value: 'Legacy LOP',
        label: 'Legacy LOP / Existing Agreement',
        description: 'Existing letter of protection or prior agreement. Standard recovery workflow.',
    },
    {
        value: 'No Contract',
        label: 'No Contract (Discouraged)',
        description: 'No documented fee rights. Recovery risk is elevated. Operational guidance: execute a contract.',
        warning: true,
    },
];

const Intake: React.FC = () => {
    const { selectors, addCase, addEvent } = useDataStore();

    // Form State
    const [patientAlias, setPatientAlias] = useState('');
    const [injuryType, setInjuryType] = useState(INJURY_TYPES[0]);
    const [state, setState] = useState(US_STATES[0]);
    const [providerId, setProviderId] = useState('');
    const [attorneyId, setAttorneyId] = useState('');
    const [billedAmount, setBilledAmount] = useState<number>(0);
    const [lienAmount, setLienAmount] = useState<number>(0);
    const [contractType, setContractType] = useState<ContractType>('MedPayRez');

    const [step, setStep] = useState<1 | 2>(1);
    const [contractAck, setContractAck] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdCase, setCreatedCase] = useState<Case | null>(null);

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

        const recoveryPct = Math.floor(Math.random() * (85 - 55) + 55);
        const selectedAttorney = attorneys.find(a => a.id === attorneyId);

        const newCase: Case = {
            id: newCaseId,
            patientAlias,
            ageBucket: '30-40',
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
            riskTier: contractType === 'No Contract' ? 'High' : 'Low',
            intakeDate: now.toISOString().split('T')[0],
            lastUpdatedDate: now.toISOString().split('T')[0],
            // PI extensions
            contractType,
            contractStatus: contractType === 'No Contract' ? 'None' : 'Executed',
            attorneyName: selectedAttorney?.attorneyName,
            lawFirm: selectedAttorney?.firmName,
            attorneyAcknowledged: false,
            recoveryRisk: contractType === 'No Contract' ? 'High' : 'Low',
            ageBucketDays: 0,
        };

        addCase(newCase);

        addEvent({
            caseId: newCaseId,
            timestamp: now.toISOString(),
            type: 'IntakeCompleted',
            description: `New PI case intake created via Provider Portal. Contract type: ${contractType}.`,
        });

        const signedTime = new Date(now.getTime() + 60000);
        addEvent({
            caseId: newCaseId,
            timestamp: signedTime.toISOString(),
            type: 'ContractSigned',
            description: `${contractType} fee recovery agreement signed. Attorney notification pending.`,
        });

        if (contractType === 'No Contract') {
            addEvent({
                caseId: newCaseId,
                timestamp: new Date(now.getTime() + 120000).toISOString(),
                type: 'Alert',
                description: 'Case opened without MedPayRez contract. Recovery risk is elevated. Operational guidance: execute documented fee agreement.',
            });
        }

        setTimeout(() => {
            setIsSubmitting(false);
            setCreatedCase(newCase);
        }, 800);
    };

    const handleReset = () => {
        setCreatedCase(null);
        setPatientAlias('');
        setBilledAmount(0);
        setLienAmount(0);
        setContractType('MedPayRez');
        setContractAck(false);
        setStep(1);
    };

    const selectedContract = CONTRACT_OPTIONS.find(o => o.value === contractType);

    // ── Success screen ──
    if (createdCase) {
        return (
            <IntakeSuccess
                caseId={createdCase.id}
                contractType={createdCase.contractType ?? 'MedPayRez'}
                lawFirm={createdCase.lawFirm ?? 'Attorney of Record'}
                patientAlias={createdCase.patientAlias}
                onReset={handleReset}
            />
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 animate-fade-in">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <FileText className="text-blue-600 flex-shrink-0" />
                    New Case Intake
                </h1>
                <p className="text-slate-500 mt-2">
                    Intake (Kiosk / Mobile / Office Portal) — Contract-Backed Enrollment. Patient data is de-identified.
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

                        {/* Contract Type Selection */}
                        <div className="pt-4 border-t border-slate-100">
                            <label className="block text-sm font-bold text-slate-800 mb-3">Contract Type</label>
                            <div className="space-y-3">
                                {CONTRACT_OPTIONS.map(opt => (
                                    <label
                                        key={opt.value}
                                        className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${contractType === opt.value
                                            ? opt.warning
                                                ? 'border-amber-400 bg-amber-50'
                                                : 'border-blue-500 bg-blue-50'
                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="contractType"
                                            value={opt.value}
                                            checked={contractType === opt.value}
                                            onChange={() => setContractType(opt.value)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-slate-900">{opt.label}</span>
                                                {opt.recommended && (
                                                    <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Recommended</span>
                                                )}
                                                {opt.warning && (
                                                    <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Discouraged</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">{opt.description}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            {/* Summary Panel */}
                            {selectedContract && (
                                <div className={`mt-4 p-4 rounded-xl border ${contractType === 'MedPayRez'
                                    ? 'bg-blue-50 border-blue-200'
                                    : contractType === 'No Contract'
                                        ? 'bg-amber-50 border-amber-200'
                                        : 'bg-slate-50 border-slate-200'
                                    }`}>
                                    <div className="flex items-start gap-3">
                                        {contractType === 'MedPayRez' && <ShieldCheck className="text-blue-600 mt-0.5 flex-shrink-0" size={18} />}
                                        {contractType === 'Legacy LOP' && <Minus className="text-slate-500 mt-0.5 flex-shrink-0" size={18} />}
                                        {contractType === 'No Contract' && <AlertTriangle className="text-amber-600 mt-0.5 flex-shrink-0" size={18} />}
                                        <div className="space-y-1 text-xs">
                                            <p className="font-semibold text-slate-800">Patients are never personally billed.</p>
                                            <p className="text-slate-600">Provider holds documented fee rights through this contract.</p>
                                            <p className="text-slate-600">Attorney will be notified of this contract upon case creation.</p>
                                            {contractType === 'No Contract' && (
                                                <p className="text-amber-700 font-semibold mt-2">⚠ Recovery risk is elevated without a contract. Consider upgrading to MedPayRez.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-6">
                            <button
                                onClick={handleNext}
                                disabled={!patientAlias || billedAmount <= 0 || lienAmount <= 0}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 min-h-[48px]"
                            >
                                Continue <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-8">
                        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 font-serif text-slate-600 text-sm leading-relaxed">
                            <h3 className="font-bold text-slate-800 text-lg mb-4 font-sans border-b border-slate-200 pb-2">
                                {contractType === 'MedPayRez' ? 'MedPayRez Enforceable Fee Recovery Agreement (Demo)' : 'Fee Recovery Agreement (Demo)'}
                            </h3>
                            <p className="mb-4">
                                This agreement creates a contractual lien against any settlement, judgment, or verdict obtained by the Patient in favor of the Provider for medical services rendered.
                            </p>
                            <p className="mb-4">
                                <strong>1. Contract-Backed Billing.</strong> Patient agrees that payment for services is deferred until resolution of the legal claim. Provider agrees not to pursue personal collection against Patient during the pendency of the claim.
                            </p>
                            <p className="mb-4">
                                <strong>2. Documented Fee Assignment.</strong> Patient hereby assigns to Provider a portion of the settlement proceeds equal to the customary charge for services deemed necessary. This is a documented fee assignment, not a guarantee of payment.
                            </p>
                            <p className="mb-4">
                                <strong>3. Attorney Notification.</strong> The patient's attorney ({attorneys.find(a => a.id === attorneyId)?.firmName ?? 'selected firm'}) will be notified of this documented fee assignment as part of the contract-backed workflow.
                            </p>
                            <p>
                                <em>Sign below to acknowledge terms. Patients are never personally billed.</em>
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
                                I acknowledge the contract-backed fee recovery terms and authorize direct payment from settlement proceeds. Contract type: <strong>{contractType}</strong>. (Demo)
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
                                className="bg-emerald-600 text-white px-6 md:px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-200 min-h-[48px]"
                            >
                                {isSubmitting ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        <PenTool size={18} />
                                        Sign & Create Case (Demo)
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
