import React, { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { formatMoney } from '../lib/utils'; // I will create utils next

const Dashboard = () => {
    const { state } = useStore();
    const { mainCurrency } = state.settings;

    // FIX: Calculate total balance from Accounts, not just transaction history
    const totalBalance = useMemo(() => {
        return state.accounts.reduce((sum, acc) => {
            // Simple sum for now, should handle currency conversion later
            return sum + acc.balance;
        }, 0);
    }, [state.accounts]);

    const thisMonthLines = useMemo(() => {
        const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const f = state.transactions.filter(t => new Date(t.date) >= start);
        return {
            income: f.filter(t => t.type === 'income').reduce((s, t) => s + (t.amountInMainCurrency || t.amount), 0),
            expenses: f.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amountInMainCurrency || t.amount), 0)
        };
    }, [state.transactions]);

    const greeting = (() => {
        const hour = new Date().getHours();
        if (hour < 6) return 'Доброй ночи';
        if (hour < 12) return 'Доброе утро';
        if (hour < 18) return 'Добрый день';
        return 'Добрый вечер';
    })();

    return (
        <div className="page-content" style={{ padding: '20px' }}>
            <header style={{ marginBottom: '24px', paddingTop: '10px' }}>
                <h1 className="text-gradient" style={{ fontSize: '28px', fontWeight: 800 }}>{greeting}</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
            </header>

            {/* Balance Card */}
            <div className="card" style={{
                background: 'var(--accent-gradient)',
                borderRadius: 'var(--radius-xl)',
                padding: '24px',
                marginBottom: '24px',
                position: 'relative',
                overflow: 'hidden',
                color: 'white',
                boxShadow: 'var(--accent-glow)'
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Общий капитал</div>
                    <div className="mono" style={{ fontSize: '36px', fontWeight: 700, marginBottom: '20px' }}>
                        {formatMoney(totalBalance, mainCurrency)}
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.15)', borderRadius: 'var(--radius-md)', padding: '10px' }}>
                            <div style={{ fontSize: '11px', opacity: 0.8 }}>Доход (мес)</div>
                            <div className="mono" style={{ fontWeight: 600 }}>+{formatMoney(thisMonthLines.income, mainCurrency)}</div>
                        </div>
                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.15)', borderRadius: 'var(--radius-md)', padding: '10px' }}>
                            <div style={{ fontSize: '11px', opacity: 0.8 }}>Расход (мес)</div>
                            <div className="mono" style={{ fontWeight: 600 }}>-{formatMoney(thisMonthLines.expenses, mainCurrency)}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats or Recent Activity Placeholder */}
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>
                <p>More widgets coming soon...</p>
            </div>
        </div>
    );
};

export default Dashboard;
