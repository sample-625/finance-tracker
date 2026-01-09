export type CurrencyCode = 'USD' | 'EUR' | 'RUB' | 'GBP' | 'JPY' | 'CNY' | 'KRW' | 'INR' | 'BRL' | 'CAD' | 'AUD' | 'CHF' | 'PLN' | 'TRY' | 'AED' | 'SGD' | 'HKD' | 'SEK' | 'NOK' | 'CZK' | 'ILS' | 'THB' | 'MXN' | 'BTC' | 'ETH' | 'USDT' | 'USDC' | 'BNB' | 'XRP' | 'SOL' | 'ADA' | 'DOGE' | 'TON';

export type TransactionType = 'income' | 'expense';

export interface Category {
    id: string;
    name: string;
    emoji: string;
    color: string;
    type: TransactionType;
    isCustom?: boolean;
}

export interface Account {
    id: string;
    name: string;
    type: 'regular' | 'investment' | 'debt';
    balance: number;
    currency: CurrencyCode;
    icon: string;
    color?: string;
    interestRate?: number; // In percent, e.g., 5.5 for 5.5%
    // Debt specific
    principal?: number; // Original amount borrowed
    minPayment?: number;
    dueDate?: string; // ISO Date
}

export interface Transaction {
    id: string;
    type: TransactionType;
    amount: number;
    currency: CurrencyCode;
    amountInMainCurrency?: number; // For aggregation
    categoryId: string;
    date: string; // ISO Date YYYY-MM-DD
    description?: string;
    accountId?: string;
    rate?: number; // Exchange rate used
}

export interface Habit {
    id: string;
    name: string;
    emoji: string;
    completedDates: string[]; // ISO Date YYYY-MM-DD
    targetMinutes?: number; // For meditation/reading
    streak?: number;
}

export interface Goal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: string; // ISO Date
    color: string;
    icon: string;
    currency: CurrencyCode;
}

export interface Mood {
    date: string; // YYYY-MM-DD
    mood: number; // 1-5
    note?: string;
}

export interface AppSettings {
    mainCurrency: CurrencyCode;
    isDark: boolean;
    language: 'ru' | 'en';
}

export interface AppData {
    accounts: Account[];
    transactions: Transaction[];
    habits: Habit[];
    goals: Goal[];
    moods: Mood[];
    customCategories: Category[];
    settings: AppSettings;
}
