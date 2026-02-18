import React from 'react';
import clsx from 'clsx';
import type { RiskTier } from '../../types';

interface RiskBadgeProps {
    level: RiskTier | string;
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ level }) => {
    const styles = {
        'High': 'bg-rose-50 text-rose-700 border-rose-100',
        'Medium': 'bg-orange-50 text-orange-700 border-orange-100',
        'Low': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    };

    const defaultStyle = 'bg-gray-50 text-gray-600 border-gray-200';
    const activeStyle = styles[level as keyof typeof styles] || defaultStyle;

    return (
        <span className={clsx("px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border", activeStyle)}>
            {level}
        </span>
    );
};

export default RiskBadge;
