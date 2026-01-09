import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import { useStore } from '../../context/StoreContext';
import { Goal, CurrencyCode } from '../../types';
import { CURRENCIES } from '../../lib/constants';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Goal;
}

const ICONS = ['🎯', '🏝️', '🚗', '🏠', '💻', '🚲', '🎁', '💍', '🎓', '🚑'];
const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];

const GoalModal: React.FC<Props> = ({ isOpen, onClose, initialData }) => {
    const { dispatch, state } = useStore();
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [currentAmount, setCurrentAmount] = useState('');
    const [currency, setCurrency] = useState<CurrencyCode>(state.settings.mainCurrency);
    const [icon, setIcon] = useState(ICONS[0]);
    const [color, setColor] = useState(COLORS[5]);
    const [deadline, setDeadline] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name);
                setTargetAmount(initialData.targetAmount.toString());
                setCurrentAmount(initialData.currentAmount.toString());
                setCurrency(initialData.currency);
                setIcon(initialData.icon);
                setColor(initialData.color);
                setDeadline(initialData.deadline || '');
            } else {
                setName('');
                setTargetAmount('');
                setCurrentAmount('');
                setCurrency(state.settings.mainCurrency);
                setIcon(ICONS[0]);
                setColor(COLORS[5]);
                setDeadline('');
            }
        }
    }, [isOpen, initialData, state.settings.mainCurrency]);

    const handleSubmit = () => {
        if (!name || !targetAmount) return;

        const g: Goal = {
            id: initialData?.id || Date.now().toString(),
            name,
            targetAmount: parseFloat(targetAmount),
            currentAmount: parseFloat(currentAmount) || 0,
            currency,
            icon,
            color,
            deadline: deadline || undefined,
        };

        if (initialData) {
            dispatch({ type: 'UPDATE_GOAL', payload: g });
        } else {
            dispatch({ type: 'ADD_GOAL', payload: g });
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Редактировать цель' : 'Новая цель'}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Иконка и цвет</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', overflowX: 'auto' }}>
                    {ICONS.map(i => (
                        <button key={i} onClick={() => setIcon(i)} style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: icon === i ? 'rgba(255,255,255,0.1)' : 'transparent', border: icon === i ? `1px solid ${color}` : '1px solid transparent', fontSize: '20px', flexShrink: 0 }}>{i}</button>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
                    {COLORS.map(c => (
                        <button key={c} onClick={() => setColor(c)} style={{ width: '24px', height: '24px', borderRadius: '50%', background: c, border: color === c ? '2px solid white' : 'none', flexShrink: 0 }} />
                    ))}
                </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Название</label>
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Например: Новый Macbook"
                    style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Цель</label>
                        <input
                            type="number"
                            value={targetAmount}
                            onChange={e => setTargetAmount(e.target.value)}
                            placeholder="0.00"
                            style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Накоплено</label>
                        <input
                            type="number"
                            value={currentAmount}
                            onChange={e => setCurrentAmount(e.target.value)}
                            placeholder="0.00"
                            style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                        />
                    </div>
                </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Валюта</label>
                <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value as CurrencyCode)}
                    style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                >
                    <optgroup label="Fiat">{CURRENCIES.fiat.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}</optgroup>
                    <optgroup label="Crypto">{CURRENCIES.crypto.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}</optgroup>
                </select>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Дедлайн (опционально)</label>
                <input
                    type="date"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                />
            </div>

            <button
                onClick={handleSubmit}
                disabled={!name || !targetAmount}
                style={{
                    width: '100%', padding: '14px', borderRadius: 'var(--radius-md)',
                    background: 'var(--accent-gradient)', color: 'white', fontWeight: 600,
                    opacity: (!name || !targetAmount) ? 0.5 : 1
                }}
            >
                {initialData ? 'Сохранить' : 'Создать'}
            </button>
        </Modal>
    );
};

export default GoalModal;
