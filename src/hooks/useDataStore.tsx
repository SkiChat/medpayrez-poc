import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { AppData, Case, Provider, Attorney, CaseEvent } from '../types';

interface DataContextType {
    data: AppData | null;
    isLoading: boolean;
    error: string | null;
    addCase: (newCase: Case) => void;
    addEvent: (newEvent: CaseEvent) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [data, setData] = useState<AppData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/data/medrezpay-data.json');
                if (!response.ok) {
                    throw new Error('Failed to load application data');
                }
                const jsonData: AppData = await response.json();
                setData(jsonData);
            } catch (err) {
                console.error('Data Store Error:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const addCase = (newCase: Case) => {
        setData(prev => {
            if (!prev) return null;
            return { ...prev, cases: [...prev.cases, newCase] };
        });
    };

    const addEvent = (newEvent: CaseEvent) => {
        setData(prev => {
            if (!prev) return null;
            return { ...prev, events: [...prev.events, newEvent] };
        });
    };

    return (
        <DataContext.Provider value={{ data, isLoading, error, addCase, addEvent }}>
            {children}
        </DataContext.Provider>
    );
};

export const useDataStore = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useDataStore must be used within a DataProvider');
    }

    const { data, isLoading, error, addCase, addEvent } = context;

    const selectors = useMemo(() => {
        if (!data) return null;

        return {
            getCases: () => data.cases || [],
            getProviders: () => data.providers || [],
            getAttorneys: () => data.attorneys || [],
            getEvents: () => data.events || [],

            getCaseById: (id: string): Case | undefined => {
                return data.cases.find(c => c.id === id);
            },

            getCaseEvents: (caseId: string): CaseEvent[] => {
                return data.events
                    .filter(e => e.caseId === caseId)
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            },

            getProviderById: (id: string): Provider | undefined => {
                return data.providers.find(p => p.id === id);
            },

            getAttorneyById: (id: string): Attorney | undefined => {
                return data.attorneys.find(a => a.id === id);
            },

            // KPI Computations
            getPortfolioKPIs: () => {
                const totalOutstanding = data.cases
                    .filter(c => c.status !== 'Paid')
                    .reduce((sum, c) => sum + c.lienAmount, 0);

                const activeCases = data.cases.filter(c => c.status === 'Open' || c.status === 'Negotiation' || c.status === 'Active').length;

                const avgRecovery = data.cases.reduce((sum, c) => sum + c.predictedRecoveryPercent, 0) / (data.cases.length || 1);

                const avgTime = data.cases.reduce((sum, c) => sum + c.predictedTimeToSettlementDays, 0) / (data.cases.length || 1);

                return {
                    totalOutstanding,
                    activeCases,
                    avgRecovery,
                    avgTime
                };
            },

            getAtRiskCases: () => {
                return data.cases
                    .filter(c => c.riskTier === 'High' || c.predictedRecoveryPercent < 50)
                    .sort((a, b) => a.predictedRecoveryPercent - b.predictedRecoveryPercent)
                    .slice(0, 5);
            },

            getRecentActivity: () => {
                return data.events
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, 5);
            }
        };
    }, [data]);

    return {
        data,
        isLoading,
        error,
        selectors,
        addCase,
        addEvent
    };
};
