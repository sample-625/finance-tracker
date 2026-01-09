import React, { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { DEFAULT_CATEGORIES } from '../lib/constants';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { formatMoney } from '../lib/utils';

const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16'];

const Analytics = () => {
    const { state } = useStore();
    const { transactions } = state;
    const currency = state.settings.mainCurrency;

    const expensesByCategory = useMemo(() => {
        const data: Record<string, number> = {};
        const categories = [...DEFAULT_CATEGORIES.expense, ...state.customCategories];

        transactions.filter(t => t.type === 'expense').forEach(t => {
            const cat = categories.find(c => c.id === t.categoryId);
            const name = cat ? cat.name : 'Unknown';
            data[name] = (data[name] || 0) + (t.amountInMainCurrency || t.amount);
        });

        return Object.entries(data)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [transactions, state.customCategories]);

    const last6Months = useMemo(() => {
        const data = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthKey = d.toISOString().slice(0, 7); // YYYY-MM

            const income = transactions
                .filter(t => t.type === 'income' && t.date.startsWith(monthKey))
                .reduce((sum, t) => sum + (t.amountInMainCurrency || t.amount), 0);

            const expense = transactions
                .filter(t => t.type === 'expense' && t.date.startsWith(monthKey))
                .reduce((sum, t) => sum + (t.amountInMainCurrency || t.amount), 0);

            data.push({
                name: d.toLocaleDateString('ru-RU', { month: 'short' }),
                income,
                expense
            });
        }
        return data;
    }, [transactions]);

    return (
        <div className="page-content" style={{ paddingBottom: '90px' }}>
            <header style={{ padding: '20px', paddingBottom: '10px' }}>
                <h1 className="text-gradient" style={{ fontSize: '28px', fontWeight: 700 }}>Аналитика</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Статистика и тренды</p>
            </header>

            <div style={{ padding: '0 20px' }}>
                {/* Expenses Pie */}
                <section className="card" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Расходы по категориям</h3>
                    {expensesByCategory.length > 0 ? (
                        <div style={{ height: '250px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={expensesByCategory}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {expensesByCategory.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(val: number) => formatMoney(val, currency)}
                                        contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                                {expensesByCategory.slice(0, 6).map((e, i) => (
                                    <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                                        <span>{e.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Нет данных</div>
                    )}
                </section>

                {/* Income vs Expense Bar */}
                <section className="card" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Доходы и Расходы (6 мес)</h3>
                    <div style={{ height: '200px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={last6Months}>
                                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'var(--bg-tertiary)' }}
                                    contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}
                                    formatter={(val: number) => formatMoney(val, currency)}
                                />
                                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Доход" />
                                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Расход" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Analytics;
