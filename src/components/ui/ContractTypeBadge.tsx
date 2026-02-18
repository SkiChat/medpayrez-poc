import React from 'react';
import type { ContractType } from '../../types';

interface ContractTypeBadgeProps {
    type?: ContractType;
}

const ContractTypeBadge: React.FC<ContractTypeBadgeProps> = ({ type = 'No Contract' }) => {
    const styles: Record<ContractType, string> = {
        'MedPayRez': 'bg-blue-100 text-blue-800 border border-blue-200',
        'Legacy LOP': 'bg-slate-100 text-slate-600 border border-slate-200',
        'No Contract': 'bg-amber-50 text-amber-700 border border-amber-200',
    };

    const dots: Record<ContractType, string> = {
        'MedPayRez': 'bg-blue-500',
        'Legacy LOP': 'bg-slate-400',
        'No Contract': 'bg-amber-500',
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${styles[type]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dots[type]}`}></span>
            {type}
        </span>
    );
};

export default ContractTypeBadge;
