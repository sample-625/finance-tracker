import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import { useStore } from '../../context/StoreContext';
import { Transaction, TransactionType, CurrencyCode } from '../../types';
import { CURRENCIES, DEFAULT_CATEGORIES } from '../../lib/constants';
import { formatMoney, getToday } from '../../lib/utils';
import { Check } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Transaction;
}

const OperationModal: React.FC<Props> = ({ isOpen, onClose, initialData }) => {
    const { state, dispatch } = useStore();
    const [type, setType] = useState<TransactionType>('expense');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState<CurrencyCode>(state.settings.mainCurrency);
    const [categoryId, setCategoryId] = useState('');
    const [accountId, setAccountId] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(getToday());

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setType(initialData.type);
                setAmount(initialData.amount.toString());
                setCurrency(initialData.currency);
                setCategoryId(initialData.categoryId);
                setAccountId(initialData.accountId || '');
                setDescription(initialData.description || '');
                setDate(initialData.date);
            } else {
                // Reset form
                setAmount('');
                setCategoryId('');
                setDescription('');
                setDate(getToday());
                setCurrency(state.settings.mainCurrency);
                // Default account logic could be here
                if (state.accounts.length > 0) setAccountId(state.accounts[0].id);
            }
        }
    }, [isOpen, initialData, state.settings.mainCurrency, state.accounts]);

    // Update categories based on type
    const availableCategories = type === 'expense'
        ? [...DEFAULT_CATEGORIES.expense, ...state.customCategories.filter(c => c.type === 'expense')]
        : [...DEFAULT_CATEGORIES.income, ...state.customCategories.filter(c => c.type === 'income')];

    const handleSubmit = () => {
        if (!amount || !categoryId) return;

        // Convert logic would go here (fetch rate), for now assuming 1:1 if same or just store as is
        // In a real app we'd await the rate. For now we skip conversion API to keep it simple or implement later.
        const numAmount = parseFloat(amount);

        const tx: Transaction = {
            id: initialData?.id || Date.now().toString(),
            type,
            amount: numAmount,
            currency,
            categoryId,
            accountId: accountId || undefined,
            description,
            date,
            // If currency differs, we'd calculate amountInMainCurrency here.
            amountInMainCurrency: numAmount, // simplified
        };

        if (initialData) {
            dispatch({ type: 'UPDATE_TRANSACTION', payload: tx });
        } else {
            dispatch({ type: 'ADD_TRANSACTION', payload: tx });
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Редактировать' : 'Новая операция'}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '4px' }}>
                    <button
                        onClick={() => setType('expense')}
                        style={{
                            flex: 1, padding: '8px', borderRadius: 'var(--radius-sm)',
                            background: type === 'expense' ? 'var(--accent-gradient)' : 'transparent',
                            color: type === 'expense' ? 'white' : 'var(--text-secondary)',
                            fontWeight: 500
                        }}
                    >Расход</button>
                    <button
                        onClick={() => setType('income')}
                        style={{
                            flex: 1, padding: '8px', borderRadius: 'var(--radius-sm)',
                            background: type === 'income' ? 'var(--accent-gradient)' : 'transparent',
                            color: type === 'income' ? 'white' : 'var(--text-secondary)',
                            fontWeight: 500
                        }}
                    >Доход</button>
                </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Сумма</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="glass"
                        style={{
                            flex: 1, padding: '12px', borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '16px'
                        }}
                    />
                    <select
                        value={currency}
                        onChange={e => setCurrency(e.target.value as CurrencyCode)}
                        style={{
                            width: '80px', padding: '0 12px', borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-tertiary)', color: 'var(--text-primary)'
                        }}
                    >
                        {CURRENCIES.fiat.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                    </select>
                </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Счёт</label>
                <select
                    value={accountId}
                    onChange={e => setAccountId(e.target.value)}
                    style={{
                        width: '100%', padding: '12px', borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-tertiary)', color: 'var(--text-primary)'
                    }}
                >
                    <option value="">Без счёта</option>
                    {state.accounts.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name} ({formatMoney(a.balance, a.currency)})</option>)}
                </select>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Категория</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                    {availableCategories.map(c => (
                        <div
                            key={c.id}
                            onClick={() => setCategoryId(c.id)}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                padding: '8px 4px', borderRadius: 'var(--radius-md)',
                                background: categoryId === c.id ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-tertiary)',
                                border: `1px solid ${categoryId === c.id ? 'var(--accent-primary)' : 'transparent'}`,
                                cursor: 'pointer'
                            }}
                        >
                            <span style={{ fontSize: '20px', marginBottom: '4px' }}>{c.emoji}</span>
                            <span style={{ fontSize: '10px', textAlign: 'center', lineHeight: 1.2 }}>{c.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Дата и Описание</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        style={{
                            flex: 1, padding: '12px', borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-tertiary)', color: 'var(--text-primary)'
                        }}
                    />
                </div>
                <input
                    type="text"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Комментарий (опционально)"
                    style={{
                        width: '100%', padding: '12px', borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-tertiary)', color: 'var(--text-primary)'
                    }}
                />
            </div>

            <button
                onClick={handleSubmit}
                disabled={!amount || !categoryId}
                style={{
                    width: '100%', padding: '14px', borderRadius: 'var(--radius-md)',
                    background: 'var(--accent-gradient)', color: 'white', fontWeight: 600,
                    opacity: (!amount || !categoryId) ? 0.5 : 1
                }}
            >
                {initialData ? 'Сохранить' : 'Добавить'}
            </button>
        </Modal>
    );
};

export default OperationModal;
