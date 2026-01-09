import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppData, Transaction, Account, Habit, Goal, Category, Mood, AppSettings } from '../types';

const STORAGE_KEY = 'lifeTrackerData_v2';

const initialState: AppData = {
    accounts: [],
    transactions: [],
    habits: [],
    goals: [],
    moods: [],
    customCategories: [],
    settings: {
        mainCurrency: 'USD',
        isDark: true,
        language: 'ru',
    },
};

type Action =
    | { type: 'SET_DATA'; payload: AppData }
    | { type: 'ADD_TRANSACTION'; payload: Transaction }
    | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
    | { type: 'DELETE_TRANSACTION'; payload: string }
    | { type: 'ADD_ACCOUNT'; payload: Account }
    | { type: 'UPDATE_ACCOUNT'; payload: Account }
    | { type: 'DELETE_ACCOUNT'; payload: string }
    | { type: 'ADD_HABIT'; payload: Habit }
    | { type: 'UPDATE_HABIT'; payload: Habit }
    | { type: 'DELETE_HABIT'; payload: string }
    | { type: 'ADD_GOAL'; payload: Goal }
    | { type: 'UPDATE_GOAL'; payload: Goal }
    | { type: 'DELETE_GOAL'; payload: string }
    | { type: 'ADD_MOOD'; payload: Mood }
    | { type: 'ADD_CATEGORY'; payload: Category }
    | { type: 'DELETE_CATEGORY'; payload: string }
    | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
    | { type: 'RESET_DATA' };

const reducer = (state: AppData, action: Action): AppData => {
    switch (action.type) {
        case 'SET_DATA':
            return action.payload;

        case 'ADD_TRANSACTION': {
            const tx = action.payload;
            let accounts = state.accounts;
            if (tx.accountId) {
                accounts = accounts.map(acc => {
                    if (acc.id === tx.accountId) {
                        const change = tx.type === 'income' ? tx.amount : -tx.amount;
                        return { ...acc, balance: acc.balance + change };
                    }
                    return acc;
                });
            }
            return { ...state, transactions: [...state.transactions, tx], accounts };
        }

        case 'UPDATE_TRANSACTION': {
            const newTx = action.payload;
            const oldTx = state.transactions.find(t => t.id === newTx.id);
            if (!oldTx) return state;

            let accounts = state.accounts;

            // Revert old tx effect
            if (oldTx.accountId) {
                accounts = accounts.map(acc => {
                    if (acc.id === oldTx.accountId) {
                        const revertChange = oldTx.type === 'income' ? -oldTx.amount : oldTx.amount;
                        return { ...acc, balance: acc.balance + revertChange };
                    }
                    return acc;
                });
            }

            // Apply new tx effect
            if (newTx.accountId) {
                accounts = accounts.map(acc => {
                    if (acc.id === newTx.accountId) {
                        const change = newTx.type === 'income' ? newTx.amount : -newTx.amount;
                        return { ...acc, balance: acc.balance + change };
                    }
                    return acc;
                });
            }

            return {
                ...state,
                transactions: state.transactions.map(t => (t.id === newTx.id ? newTx : t)),
                accounts,
            };
        }

        case 'DELETE_TRANSACTION': {
            const txId = action.payload;
            const tx = state.transactions.find(t => t.id === txId);
            if (!tx) return state;

            let accounts = state.accounts;
            if (tx.accountId) {
                accounts = accounts.map(acc => {
                    if (acc.id === tx.accountId) {
                        const revertChange = tx.type === 'income' ? -tx.amount : tx.amount;
                        return { ...acc, balance: acc.balance + revertChange };
                    }
                    return acc;
                });
            }

            return {
                ...state,
                transactions: state.transactions.filter(t => t.id !== txId),
                accounts,
            };
        }

        case 'ADD_ACCOUNT':
            return { ...state, accounts: [...state.accounts, action.payload] };

        case 'UPDATE_ACCOUNT':
            return {
                ...state,
                accounts: state.accounts.map(a => (a.id === action.payload.id ? action.payload : a)),
            };

        case 'DELETE_ACCOUNT':
            return { ...state, accounts: state.accounts.filter(a => a.id !== action.payload) };

        case 'ADD_HABIT':
            return { ...state, habits: [...state.habits, action.payload] };

        case 'UPDATE_HABIT':
            return { ...state, habits: state.habits.map(h => (h.id === action.payload.id ? action.payload : h)) };

        case 'DELETE_HABIT':
            return { ...state, habits: state.habits.filter(h => h.id !== action.payload) };

        case 'ADD_GOAL':
            return { ...state, goals: [...state.goals, action.payload] };

        case 'UPDATE_GOAL':
            return { ...state, goals: state.goals.map(g => (g.id === action.payload.id ? action.payload : g)) };

        case 'DELETE_GOAL':
            return { ...state, goals: state.goals.filter(g => g.id !== action.payload) };

        case 'ADD_MOOD':
            return {
                ...state,
                moods: [...state.moods.filter(m => m.date !== action.payload.date), action.payload],
            };

        case 'ADD_CATEGORY':
            return { ...state, customCategories: [...state.customCategories, action.payload] };

        case 'DELETE_CATEGORY':
            return { ...state, customCategories: state.customCategories.filter(c => c.id !== action.payload) };

        case 'UPDATE_SETTINGS':
            return { ...state, settings: { ...state.settings, ...action.payload } };

        case 'RESET_DATA':
            return initialState;

        default:
            return state;
    }
};

interface StoreContextProps {
    state: AppData;
    dispatch: React.Dispatch<Action>;
}

const StoreContext = createContext<StoreContextProps>({
    state: initialState,
    dispatch: () => null,
});

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    // Load from local storage
    useEffect(() => {
        const loadData = async () => {
            // Logic from original code to support Telegram CloudStorage could be added here
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    dispatch({ type: 'SET_DATA', payload: parsed });
                } catch (e) {
                    console.error('Failed to parse data', e);
                }
            }
        };
        loadData();
    }, []);

    // Save to local storage
    useEffect(() => {
        if (state !== initialState) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }
    }, [state]);

    return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
};

export const useStore = () => useContext(StoreContext);
