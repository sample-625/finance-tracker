import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import { useStore } from '../../context/StoreContext';
import { Account, CurrencyCode } from '../../types';
import { CURRENCIES, ACCOUNT_ICONS } from '../../lib/constants';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Account;
}

const AccountModal: React.FC<Props> = ({ isOpen, onClose, initialData }) => {
    const { dispatch, state } = useStore();
    const [name, setName] = useState('');
    const [type, setType] = useState<Account['type']>('regular');
    const [balance, setBalance] = useState('');
    const [currency, setCurrency] = useState<CurrencyCode>(state.settings.mainCurrency);
    const [icon, setIcon] = useState(ACCOUNT_ICONS[0]);
    const [interestRate, setInterestRate] = useState('');

    // Debt specific
    const [principal, setPrincipal] = useState('');
    const [minPayment, setMinPayment] = useState('');
    const [dueDate, setDueDate] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name);
                setType(initialData.type);
                setBalance(initialData.balance.toString());
                setCurrency(initialData.currency);
                setIcon(initialData.icon);
                setInterestRate(initialData.interestRate?.toString() || '');
                setPrincipal(initialData.principal?.toString() || '');
                setMinPayment(initialData.minPayment?.toString() || '');
                setDueDate(initialData.dueDate || '');
            } else {
                setName('');
                setType('regular');
                setBalance('');
                setCurrency(state.settings.mainCurrency);
                setIcon(ACCOUNT_ICONS[0]);
                setInterestRate('');
                setPrincipal('');
                setMinPayment('');
                setDueDate('');
            }
        }
    }, [isOpen, initialData, state.settings.mainCurrency]);

    const handleSubmit = () => {
        if (!name) return;

        const acc: Account = {
            id: initialData?.id || Date.now().toString(),
            name,
            type,
            balance: parseFloat(balance) || 0,
            currency,
            icon,
            interestRate: interestRate ? parseFloat(interestRate) : undefined,
            principal: type === 'debt' ? (parseFloat(principal) || 0) : undefined,
            minPayment: type === 'debt' ? (parseFloat(minPayment) || 0) : undefined,
            dueDate: type === 'debt' ? dueDate : undefined,
        };

        if (initialData) {
            dispatch({ type: 'UPDATE_ACCOUNT', payload: acc });
        } else {
            dispatch({ type: 'ADD_ACCOUNT', payload: acc });
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Редактировать счёт' : 'Новый счёт'}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '4px' }}>
                    {['regular', 'investment', 'debt'].map(t => (
                        <button
                            key={t}
                            onClick={() => setType(t as any)}
                            style={{
                                flex: 1, padding: '8px', borderRadius: 'var(--radius-sm)',
                                background: type === t ? 'var(--accent-gradient)' : 'transparent',
                                color: type === t ? 'white' : 'var(--text-secondary)',
                                fontSize: '12px', fontWeight: 500, textTransform: 'capitalize'
                            }}
                        >
                            {t === 'regular' ? 'Обычный' : t === 'investment' ? 'Инвест' : 'Долг'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Иконка</label>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {ACCOUNT_ICONS.map(i => (
                        <button
                            key={i}
                            onClick={() => setIcon(i)}
                            style={{
                                width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                                background: icon === i ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-tertiary)',
                                border: `1px solid ${icon === i ? 'var(--accent-primary)' : 'transparent'}`,
                                fontSize: '20px', flexShrink: 0
                            }}
                        >
                            {i}
                        </button>
                    ))}
                </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Название</label>
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={type === 'debt' ? 'Ипотека' : 'Карта Тинькофф'}
                    style={{
                        width: '100%', padding: '12px', borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-tertiary)', color: 'var(--text-primary)'
                    }}
                />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {type === 'debt' ? 'Текущий долг' : 'Текущий баланс'}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="number"
                        value={balance}
                        onChange={e => setBalance(e.target.value)}
                        placeholder="0.00"
                        style={{
                            flex: 1, padding: '12px', borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-tertiary)', color: 'var(--text-primary)'
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
                        <optgroup label="Fiat">
                            {CURRENCIES.fiat.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                        </optgroup>
                        <optgroup label="Crypto">
                            {CURRENCIES.crypto.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                        </optgroup>
                    </select>
                </div>
            </div>

            {(type === 'investment' || type === 'debt') && (
                <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Процентная ставка (годовых %)</label>
                    <input
                        type="number"
                        value={interestRate}
                        onChange={e => setInterestRate(e.target.value)}
                        placeholder="0.0"
                        style={{
                            width: '100%', padding: '12px', borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-tertiary)', color: 'var(--text-primary)'
                        }}
                    />
                </div>
            )}

            {type === 'debt' && (
                <>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Изначальная сумма долга</label>
                        <input
                            type="number"
                            value={principal}
                            onChange={e => setPrincipal(e.target.value)}
                            placeholder="0.00"
                            style={{
                                width: '100%', padding: '12px', borderRadius: 'var(--radius-md)',
                                background: 'var(--bg-tertiary)', color: 'var(--text-primary)'
                            }}
                        />
                    </div>
                    {/* Min payment and due date can be added here if needed */}
                </>
            )}

            <button
                onClick={handleSubmit}
                disabled={!name}
                style={{
                    width: '100%', padding: '14px', borderRadius: 'var(--radius-md)',
                    background: 'var(--accent-gradient)', color: 'white', fontWeight: 600,
                    opacity: (!name) ? 0.5 : 1
                }}
            >
                {initialData ? 'Сохранить' : 'Создать'}
            </button>
        </Modal>
    );
};

export default AccountModal;
