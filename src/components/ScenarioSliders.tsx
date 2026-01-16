import React from 'react';

type RiskTolerance = 'Low' | 'Moderate' | 'High';
type ProviderStrategy = 'Cooperative' | 'Defensive' | 'Aggressive';

interface ScenarioSlidersProps {
    settlementAmount: number;
    setSettlementAmount: (val: number) => void;
    riskTolerance: RiskTolerance;
    setRiskTolerance: (val: RiskTolerance) => void;
    providerStrategy: ProviderStrategy;
    setProviderStrategy: (val: ProviderStrategy) => void;
}

const ScenarioSliders: React.FC<ScenarioSlidersProps> = ({
    settlementAmount,
    setSettlementAmount,
    riskTolerance,
    setRiskTolerance,
    providerStrategy,
    setProviderStrategy
}) => {
    return (
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 space-y-10 animate-slide-up">
            {/* Settlement Amount Slider */}
            <div>
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none mb-1">Calibration</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Projected Gross Recovery</p>
                    </div>
                    <span className="text-3xl font-black text-brand-blue tabular-nums tracking-tighter">${settlementAmount.toLocaleString()}</span>
                </div>
                <div className="px-1">
                    <input
                        type="range"
                        min={1000}
                        max={500000}
                        step={500}
                        value={settlementAmount}
                        onChange={(e) => setSettlementAmount(parseInt(e.target.value))}
                        className="w-full h-2.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-blue hover:accent-brand-purple transition-all"
                    />
                    <div className="flex justify-between text-[10px] font-black text-slate-300 mt-3 uppercase tracking-[0.2em]">
                        <span>$1k</span>
                        <span>$500k</span>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <CategoricalSwitch
                    label="Acceptance Risk"
                    description="Willingness to risk counter-offers."
                    options={['Low', 'Moderate', 'High']}
                    currentValue={riskTolerance}
                    onChange={(val) => setRiskTolerance(val as RiskTolerance)}
                    colorClass="bg-brand-blue"
                />

                <CategoricalSwitch
                    label="Negotiation Posture"
                    description="Assumed provider system stance."
                    options={['Cooperative', 'Defensive', 'Aggressive']}
                    currentValue={providerStrategy}
                    onChange={(val) => setProviderStrategy(val as ProviderStrategy)}
                    colorClass="bg-brand-purple"
                />
            </div>

            <div className="pt-8 border-t border-slate-50">
                <div className="flex items-center gap-4 p-4 bg-brand-blue/5 rounded-2xl border border-brand-blue/10">
                    <div className="w-10 h-10 bg-brand-blue text-white rounded-xl flex items-center justify-center shadow-lg shadow-brand-blue/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    </div>
                    <p className="text-[10px] text-brand-blue font-black leading-tight uppercase tracking-widest">
                        Statutory Guardrails Auto-Adjusted
                    </p>
                </div>
            </div>
        </div>
    );
};

interface CategoricalSwitchProps {
    label: string;
    description: string;
    options: string[];
    currentValue: string;
    onChange: (val: string) => void;
    colorClass: string;
}

const CategoricalSwitch: React.FC<CategoricalSwitchProps> = ({ label, description, options, currentValue, onChange, colorClass }) => (
    <div className="space-y-4">
        <div className="flex justify-between items-end">
            <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-widest block leading-none mb-1">{label}</label>
                <span className="text-[10px] text-slate-400 font-bold block">{description}</span>
            </div>
            <span className="text-[10px] font-black text-brand-blue uppercase tracking-tighter">{currentValue}</span>
        </div>
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
            {options.map((opt) => (
                <button
                    key={opt}
                    onClick={() => onChange(opt)}
                    className={`py-2 rounded-lg text-[10px] font-black transition-all duration-300 tracking-[0.1em] uppercase ${currentValue === opt
                            ? `${colorClass} text-white shadow-md transform scale-[1.03]`
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    {opt}
                </button>
            ))}
        </div>
    </div>
);

export default ScenarioSliders;
