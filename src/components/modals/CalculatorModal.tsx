import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import { formatMoney } from '../../lib/utils';
import { useStore } from '../../context/StoreContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const CalculatorModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const { state } = useStore();
    const [initial, setInitial] = useState('1000');
    const [monthly, setMonthly] = useState('500');
    const [rate, setRate] = useState('8');
    const [years, setYears] = useState('10');
    const [data, setData] = useState<any[]>([]);
    const [result, setResult] = useState({ total: 0, interest: 0, invested: 0 });

    useEffect(() => {
        calculate();
    }, [isOpen, initial, monthly, rate, years]);

    const calculate = () => {
        const p = parseFloat(initial) || 0;
        const pm = parseFloat(monthly) || 0;
        const r = (parseFloat(rate) || 0) / 100;
        const y = parseFloat(years) || 1;

        let balance = p;
        let totalInvested = p;
        const chartData = [];

        // Monthly compounding for simplicity in chart
        for (let i = 0; i <= y * 12; i++) {
            if (i > 0) {
                balance = balance * (1 + r / 12) + pm;
                totalInvested += pm;
            }
            if (i % 12 === 0) {
                chartData.push({
                    year: i / 12,
                    balance: Math.round(balance),
                    invested: Math.round(totalInvested)
                });
            }
        }

        setData(chartData);
        setResult({
            total: balance,
            invested: totalInvested,
            interest: balance - totalInvested
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Сложный процент">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div className="form-group">
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Старт. капитал</label>
                    <input type="number" value={initial} onChange={e => setInitial(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }} />
                </div>
                <div className="form-group">
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Ежемесячно</label>
                    <input type="number" value={monthly} onChange={e => setMonthly(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }} />
                </div>
                <div className="form-group">
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Ставка (%)</label>
                    <input type="number" value={rate} onChange={e => setRate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }} />
                </div>
                <div className="form-group">
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Срок (лет)</label>
                    <input type="number" value={years} onChange={e => setYears(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }} />
                </div>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-lg)', marginBottom: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Через {years} лет у вас будет</div>
                <div className="text-gradient" style={{ fontSize: '32px', fontWeight: 700, margin: '4px 0' }}>{formatMoney(result.total, state.settings.mainCurrency)}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Вложено: {formatMoney(result.invested, state.settings.mainCurrency)} • Проценты: <span style={{ color: 'var(--success)' }}>+{formatMoney(result.interest, state.settings.mainCurrency)}</span>
                </div>
            </div>

            <div style={{ height: '200px', width: '100%', marginTop: 'auto' }}>
                <ResponsiveContainer>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <YAxis hide />
                        <Tooltip
                            contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}
                            labelStyle={{ color: 'var(--text-secondary)' }}
                            formatter={(val: number) => formatMoney(val, state.settings.mainCurrency)}
                        />
                        <Area type="monotone" dataKey="balance" stroke="#6366f1" fillOpacity={1} fill="url(#colorBal)" strokeWidth={2} />
                        <Area type="monotone" dataKey="invested" stroke="#ffffff" strokeOpacity={0.3} fill="transparent" strokeDasharray="3 3" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Modal>
    );
};

export default CalculatorModal;
