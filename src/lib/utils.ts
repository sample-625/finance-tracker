import { CURRENCIES, ALL_CURRENCIES } from './constants';
import { CurrencyCode } from '../types';

export const formatMoney = (amount: number, currency: CurrencyCode = 'USD'): string => {
    const c = ALL_CURRENCIES.find(x => x.code === currency);
    const symbol = c?.symbol || currency;
    return `${amount < 0 ? '-' : ''}${symbol}${Math.abs(amount).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
};

export const getToday = (): string => new Date().toISOString().split('T')[0];

export const getDaysInStreak = (dates?: string[]): number => {
    if (!dates?.length) return 0;
    const sorted = [...dates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const today = getToday();
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

    let streak = 1;
    for (let i = 1; i < sorted.length; i++) {
        const diff = (new Date(sorted[i - 1]).getTime() - new Date(sorted[i]).getTime()) / 86400000;
        if (Math.round(diff) === 1) streak++;
        else break;
    }
    return streak;
};
