import React from 'react';

interface HeaderProps {
    currentView: 'Clinical' | 'Administrative';
    setCurrentView: (view: 'Clinical' | 'Administrative') => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
    return (
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">

                {/* Logo & Title Section */}
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-brand-blue rounded-xl flex items-center justify-center shadow-lg shadow-brand-blue/20 ring-2 ring-white overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue to-brand-purple opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <span className="text-white font-black text-2xl italic tracking-tighter relative z-10">M</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none group cursor-default">
                            MedPay<span className="text-brand-blue group-hover:text-brand-purple transition-colors duration-500">Rez</span>
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Provider Portal
                        </p>
                    </div>
                </div>

                {/* View Toggle Switch */}
                <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
                    <button
                        onClick={() => setCurrentView('Clinical')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${currentView === 'Clinical'
                            ? 'bg-white text-brand-blue shadow-md transform scale-[1.02]'
                            : 'text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Clinical
                    </button>

                    <button
                        onClick={() => setCurrentView('Administrative')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${currentView === 'Administrative'
                            ? 'bg-white text-brand-blue shadow-md transform scale-[1.02]'
                            : 'text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                        </svg>
                        Administrative
                    </button>
                </div>

                {/* User Context */}
                <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
                    <div className="hidden lg:block text-right leading-tight">
                        <p className="text-xs font-black text-slate-800 uppercase tracking-wider">
                            {currentView === 'Clinical' ? 'Dr. Sarah Miller' : 'Billing Dept'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold">PoC v1.0 • Live</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-400 ring-1 ring-slate-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                </div>

            </div>
        </header>
    );
};

export default Header;
