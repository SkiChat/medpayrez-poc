import React from 'react';
import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface KPICardProps {
    label: string;
    value: string | number;
    subValue?: string;
    icon: LucideIcon;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    className?: string;
}

const KPICard: React.FC<KPICardProps> = ({
    label,
    value,
    subValue,
    icon: Icon,
    trend,
    trendValue,
    className
}) => {
    return (
        <div className={clsx("bg-white p-6 rounded-2xl border border-slate-100 shadow-sm", className)}>
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className={clsx(
                        "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                        trend === 'up' ? 'bg-emerald-50 text-emerald-600' :
                            trend === 'down' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'
                    )}>
                        {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•'}
                        {trendValue}
                    </div>
                )}
            </div>
            <div>
                <h3 className="text-slate-500 text-sm font-medium mb-1">{label}</h3>
                <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
                {subValue && <div className="text-xs text-slate-400 mt-1">{subValue}</div>}
            </div>
        </div>
    );
};

export default KPICard;
