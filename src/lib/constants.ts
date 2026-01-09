import { Category, CurrencyCode, TransactionType } from '../types';

export const CURRENCIES: { fiat: { code: CurrencyCode; name: string; symbol: string }[]; crypto: { code: CurrencyCode; name: string; symbol: string }[] } = {
    fiat: [
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'GBP', name: 'British Pound', symbol: '£' },
        { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
        { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴' },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
        { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
        { code: 'KRW', name: 'Korean Won', symbol: '₩' },
        { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
        { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
        { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
        { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
        { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
        { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
        { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
        { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
        { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
        { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
        { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
        { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
        { code: 'ILS', name: 'Israeli Shekel', symbol: '₪' },
        { code: 'THB', name: 'Thai Baht', symbol: '฿' },
        { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
    ],
    crypto: [
        { code: 'BTC', name: 'Bitcoin', symbol: '₿' },
        { code: 'ETH', name: 'Ethereum', symbol: 'Ξ' },
        { code: 'USDT', name: 'Tether', symbol: '₮' },
        { code: 'USDC', name: 'USD Coin', symbol: '$' },
        { code: 'BNB', name: 'Binance Coin', symbol: 'BNB' },
        { code: 'XRP', name: 'Ripple', symbol: 'XRP' },
        { code: 'SOL', name: 'Solana', symbol: 'SOL' },
        { code: 'ADA', name: 'Cardano', symbol: 'ADA' },
        { code: 'DOGE', name: 'Dogecoin', symbol: 'Ð' },
        { code: 'TON', name: 'Toncoin', symbol: 'TON' },
    ],
};

export const ALL_CURRENCIES = [...CURRENCIES.fiat, ...CURRENCIES.crypto];

export const DEFAULT_CATEGORIES: Record<TransactionType, Omit<Category, 'type' | 'isCustom'>[]> = {
    expense: [
        { id: 'food', name: 'Еда', emoji: '🍔', color: '#ef4444' },
        { id: 'transport', name: 'Транспорт', emoji: '🚗', color: '#3b82f6' },
        { id: 'shopping', name: 'Покупки', emoji: '🛍️', color: '#8b5cf6' },
        { id: 'entertainment', name: 'Развлечения', emoji: '🎮', color: '#ec4899' },
        { id: 'health', name: 'Здоровье', emoji: '💊', color: '#10b981' },
        { id: 'utilities', name: 'Коммуналка', emoji: '💡', color: '#f59e0b' },
        { id: 'rent', name: 'Аренда', emoji: '🏠', color: '#6366f1' },
        { id: 'subscriptions', name: 'Подписки', emoji: '📱', color: '#14b8a6' },
        { id: 'education', name: 'Образование', emoji: '📚', color: '#a855f7' },
        { id: 'gifts', name: 'Подарки', emoji: '🎁', color: '#f43f5e' },
        { id: 'travel', name: 'Путешествия', emoji: '✈️', color: '#0ea5e9' },
        { id: 'other_expense', name: 'Другое', emoji: '📦', color: '#64748b' },
    ],
    income: [
        { id: 'salary', name: 'Зарплата', emoji: '💼', color: '#10b981' },
        { id: 'freelance', name: 'Фриланс', emoji: '💻', color: '#3b82f6' },
        { id: 'investments', name: 'Инвестиции', emoji: '📈', color: '#8b5cf6' },
        { id: 'gifts_income', name: 'Подарки', emoji: '🎁', color: '#f43f5e' },
        { id: 'cashback', name: 'Кэшбек', emoji: '💸', color: '#f59e0b' },
        { id: 'other_income', name: 'Другое', emoji: '✨', color: '#64748b' },
    ],
};

export const MOODS = [
    { id: 1, emoji: '😢', label: 'Ужасно', color: '#ef4444' },
    { id: 2, emoji: '😕', label: 'Плохо', color: '#f97316' },
    { id: 3, emoji: '😐', label: 'Норм', color: '#eab308' },
    { id: 4, emoji: '🙂', label: 'Хорошо', color: '#22c55e' },
    { id: 5, emoji: '😄', label: 'Отлично', color: '#10b981' },
];

export const ACCOUNT_ICONS = ['💳', '💵', '🏦', '💰', '🐷', '💎', '🪙', '📊', '📉', '📈'];

export const MOCK_RATES: Record<string, number> = {
    USD: 1,
    EUR: 0.91,
    GBP: 0.78,
    RUB: 89.5,
    UAH: 38.2,
    JPY: 148.5,
    CNY: 7.2,
    KRW: 1340,
    INR: 83.1,
    BRL: 4.95,
    BTC: 0.000021,
    ETH: 0.0004,
    USDT: 1,
    USDC: 1,
    BNB: 0.003,
    XRP: 1.8,
    SOL: 0.01,
    ADA: 1.8,
    DOGE: 12,
    TON: 0.45,
};

// Fallback for missing rates
export const getRate = (currency: string): number => {
    return MOCK_RATES[currency] || 1;
};
