import React from 'react';
import clsx from 'clsx';
import type { CaseStatus } from '../../types';

interface StatusBadgeProps {
    status: CaseStatus | string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const styles = {
        'Open': 'bg-blue-50 text-blue-700 border-blue-100',
        'Active': 'bg-blue-50 text-blue-700 border-blue-100', // Treat Active same as Open for now
        'Negotiation': 'bg-amber-50 text-amber-700 border-amber-100',
        'Settled': 'bg-emerald-50 text-emerald-700 border-emerald-100',
        'Paid': 'bg-slate-100 text-slate-600 border-slate-200',
    };

    const defaultStyle = 'bg-gray-50 text-gray-600 border-gray-200';
    const activeStyle = styles[status as keyof typeof styles] || defaultStyle;

    return (
        <span className={clsx("px-2.5 py-1 rounded-full text-xs font-semibold border", activeStyle)}>
            {status}
        </span>
    );
};

export default StatusBadge;
