import React, { useState, useEffect } from 'react';
import type { Settlement, Provider } from './types';
import Header from './components/Header';
import ParalegalDashboard from './components/ParalegalDashboard';
import AttorneyDashboard from './components/AttorneyDashboard';

const App: React.FC = () => {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  console.log('[App] Render - selectedCaseId:', selectedCaseId);
  console.log('[App] Settlements count:', settlements.length);
  const [currentView, setCurrentView] = useState<'Paralegal' | 'Attorney'>('Paralegal');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Debug export
  (window as any)._mprDebug = { settlements, selectedCaseId, currentView };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [settlementsRes, providersRes] = await Promise.all([
          fetch('/settlements.json'),
          fetch('/providers.json')
        ]);

        if (!settlementsRes.ok || !providersRes.ok) {
          throw new Error('Failed to load data files');
        }

        const settlementsData = await settlementsRes.json();
        const providersData = await providersRes.json();

        setSettlements(settlementsData);
        setProviders(providersData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to initialize application data. Please ensure JSON files are in the public folder.');
      } finally {
        // Add a slight artificial delay for the "premium" feel
        setTimeout(() => setIsLoading(false), 800);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-red-100 max-w-md text-center">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Initialization Error</h1>
          <p className="text-slate-500 font-medium leading-relaxed">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 w-full py-4 bg-brand-dark text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-brand-blue selection:text-white">
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      <main className="container mx-auto px-6 py-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-[2rem]"></div>
              <div className="absolute inset-0 border-4 border-brand-blue border-t-transparent rounded-[2rem] animate-spin"></div>
            </div>
            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs animate-pulse">Initializing PoC Engine...</p>
          </div>
        ) : (
          <div className="animate-fade-in">
            {currentView === 'Paralegal' ? (
              <ParalegalDashboard
                settlements={settlements}
                providers={providers}
                selectedCaseId={selectedCaseId}
                onCaseSelect={(id: string | null) => {
                  console.log('[App] onCaseSelect called with:', id);
                  setSelectedCaseId(id);
                }}
              />
            ) : (
              <AttorneyDashboard
                settlements={settlements}
                providers={providers}
                selectedCaseId={selectedCaseId}
                onCaseSelect={setSelectedCaseId}
              />
            )}
          </div>
        )}
      </main>

      <footer className="py-12 text-center border-t border-slate-100 mt-20">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
          &copy; 2026 MedPayRez AI Lien Negotiation Strategy PoC • Proprietary & Confidential
        </p>
      </footer>
    </div>
  );
};

export default App;
