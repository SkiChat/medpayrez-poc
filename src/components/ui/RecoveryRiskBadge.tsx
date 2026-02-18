import React from 'react';

interface RecoveryRiskBadgeProps {
    risk?: 'Low' | 'Medium' | 'High';
}

const RecoveryRiskBadge: React.FC<RecoveryRiskBadgeProps> = ({ risk = 'Low' }) => {
    const styles = {
        Low: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        Medium: 'bg-amber-50 text-amber-700 border border-amber-200',
        High: 'bg-red-50 text-red-700 border border-red-200',
    };

    const dots = {
        Low: 'bg-emerald-500',
        Medium: 'bg-amber-500',
        High: 'bg-red-500',
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${styles[risk]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dots[risk]}`}></span>
            {risk}
        </span>
    );
};

export default RecoveryRiskBadge;
