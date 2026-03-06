import type { ContractType } from '../types';

/**
 * Maps technical contract type keys to user-facing "Assignment" terminology.
 */
export function mapContractLabel(type?: ContractType): string {
    if (!type) return 'No Assignment / No Contract';

    const mapping: Record<ContractType, string> = {
        'MedPayRez': 'STAT Med Pay Assignment',
        'Legacy LOP': 'Legacy LOP',
        'No Contract': 'No Assignment / No Contract',
    };

    return mapping[type] || type;
}

/**
 * Formats currency values consistently across the app.
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}
