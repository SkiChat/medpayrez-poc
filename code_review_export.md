# STAT Med Pay Provider Portal - Code Review Export

This document contains a consolidated export of the **STAT Med Pay** (formerly MedPayRez) Provider Portal codebase for review.

## Project Overview
- **Stack**: React 19, Vite 7, TypeScript 5.9, Tailwind CSS 4.
- **Architecture**: Single Page Application (SPA) with a centralized Data Store via React Context.
- **Backend**: Netlify Functions (Node.js) for AI-driven insights.
- **Domain**: Medical Provider Lien Management (Personal Injury Recovery).

---

## 1. Project Configuration

### package.json
```json
{
  "name": "medpayrez-provider",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "dev:netlify": "netlify dev",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@tailwindcss/vite": "^4.1.18",
    "clsx": "^2.1.1",
    "lucide-react": "^0.574.0",
    "node-fetch": "^2.7.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.13.0",
    "recharts": "^3.7.0",
    "stitch-mcp": "^1.3.2",
    "tailwind-merge": "^3.4.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@types/node": "^24.10.1",
    "@types/react": "^19.2.5",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "autoprefixer": "^10.4.23",
    "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.24",
    "globals": "^16.5.0",
    "netlify-cli": "^23.15.1",
    "postcss": "^8.5.6",
    "tailwindcss": "^4.1.18",
    "typescript": "~5.9.3",
    "typescript-eslint": "^8.46.4",
    "vite": "^7.2.4"
  }
}
```

### vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```

---

## 2. Core Application Logic

### src/types/index.ts
Contains the domain model for Providers, Attorneys, Cases, and Events.
```typescript
export interface Provider {
  id: string;
  name: string;
  specialty: string;
  practiceName: string;
  state: string;
}

export interface Attorney {
  id: string;
  firmName: string;
  attorneyName: string;
  caseVolumeTier: 'High' | 'Medium' | 'Low';
}

export type CaseStatus = 'Open' | 'Negotiation' | 'Settled' | 'Paid' | 'Active';
export type RiskTier = 'Low' | 'Medium' | 'High';
export type ContractType = 'MedPayRez' | 'Legacy LOP' | 'No Contract';
export type ContractStatus = 'Executed' | 'Pending Signature' | 'None';

export interface Case {
  id: string;
  patientAlias: string;
  ageBucket: string;
  injuryType: string;
  state: string;
  providerId: string;
  attorneyId: string;
  lienAmount: number;
  billedAmount: number;
  predictedRecoveryPercent: number;
  predictedRecoveryBaselinePercent: number;
  predictedTimeToSettlementDays: number;
  status: CaseStatus;
  riskTier: RiskTier;
  intakeDate: string;
  lastUpdatedDate: string;
  contractType?: ContractType;
  contractStatus?: ContractStatus;
  attorneyName?: string;
  lawFirm?: string;
  attorneyAcknowledged?: boolean;
  recoveryRisk?: 'Low' | 'Medium' | 'High';
  ageBucketDays?: number;
  assignedTo?: string;
  managementMode?: 'Staff' | 'AI-assisted';
}

export interface CaseEvent {
  caseId: string;
  timestamp: string;
  type: WorkflowEventType;
  description: string;
}

export interface AIInsight {
  nextBestActions: string[];
  documentationGaps: string[];
  paymentDelayRisk: 'Low' | 'Medium' | 'High';
  followUpRecommendation: string;
  confidence: number;
  model: string;
  generatedAt?: string;
}
```

### src/hooks/useDataStore.tsx
The "Brain" of the application. Handles data loading, session persistence, and state mutations.
```typescript
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { AppData, Case, Provider, Attorney, CaseEvent } from '../types';

const STORAGE_KEY = 'medpayrez_provider_appdata_v1';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [data, setData] = useState<AppData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const boot = useCallback(async (forceRefresh = false) => {
        setIsLoading(true);
        // Try session cache first
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (raw && !forceRefresh) {
            setData(JSON.parse(raw));
            setIsLoading(false);
            return;
        }

        // Fall back to JSON seed
        const response = await fetch('/data/medrezpay-data.json');
        const jsonData = await response.json();
        setData(jsonData);
        setIsLoading(false);
    }, []);

    useEffect(() => { boot(); }, [boot]);

    const addCase = (newCase: Case) => {
        setData(prev => prev ? { ...prev, cases: [...prev.cases, newCase] } : prev);
    };

    const addEvent = (newEvent: CaseEvent) => {
        setData(prev => prev ? { ...prev, events: [...prev.events, newEvent] } : prev);
    };

    return (
        <DataContext.Provider value={{ data, isLoading, addCase, addEvent }}>
            {children}
        </DataContext.Provider>
    );
};
```

---

## 3. Main Views Summary
- **src/pages/Overview.tsx**: Dashboard with KPIs and Action Feed.
- **src/pages/CasePortfolio.tsx**: Searchable case inventory.
- **src/pages/CaseDetail.tsx**: Case-specific details and AI insights.
- **src/pages/Intake.tsx**: New case wizard with signatures.

---

## 4. Backend Logic

### netlify/functions/generate-insight.js
AI Insight engine proxying OpenRouter.
```javascript
export const handler = async (event) => {
    const { injuryType, riskTier, status, predictedRecoveryPercent } = JSON.parse(event.body);
    // ... logic to call LLM ...
};
```

---
*End of export.*
