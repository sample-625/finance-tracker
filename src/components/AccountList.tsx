import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatMoney } from '../lib/utils';
import { Plus } from 'lucide-react';
import { Account } from '../types';

interface Props {
    onAddAccount: () => void;
    onEditAccount?: (acc: Account) => void;
}

const AccountList: React.FC<Props> = ({ onAddAccount, onEditAccount }) => {
    const { state } = useStore();
    const { accounts } = state;

    return (
        <div style={{ padding: '0 20px 20px', overflowX: 'auto', display: 'flex', gap: '10px', scrollbarWidth: 'none' }}>
            {accounts.map(acc => (
                <div
                    key={acc.id}
                    onClick={() => onEditAccount && onEditAccount(acc)}
                    style={{
                        minWidth: '140px',
                        background: 'var(--bg-card)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '16px',
                        border: '1px solid var(--border)',
                        flexShrink: 0,
                        cursor: 'pointer'
                    }}
                >
                    <div style={{
                        width: '32px', height: '32px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--accent-gradient)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '16px', marginBottom: '8px'
                    }}>
                        {acc.icon}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{acc.type === 'debt' ? 'Долг' : acc.name}</div>
                    <div className="mono" style={{ fontSize: '14px', fontWeight: 600 }}>{formatMoney(acc.balance, acc.currency)}</div>

                    {acc.type === 'investment' && acc.interestRate && (
                        <div style={{ fontSize: '10px', color: 'var(--success)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <span>📈</span> +{acc.interestRate}%
                        </div>
                    )}

                    {acc.type === 'debt' && (
                        <div style={{ marginTop: '6px' }}>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                                <span>{acc.name}</span>
                                {acc.principal ? <span>{Math.round((acc.balance / acc.principal) * 100)}%</span> : null}
                            </div>
                            {acc.principal && (
                                <div style={{ width: '100%', height: '3px', background: 'var(--bg-tertiary)', borderRadius: '2px', marginTop: '2px', overflow: 'hidden' }}>
                                    <div style={{ width: `${Math.min(100, (acc.balance / acc.principal) * 100)}%`, height: '100%', background: 'var(--danger)', borderRadius: '2px' }} />
                                </div>
                            )}
                            {acc.dueDate && (
                                <div style={{ fontSize: '9px', color: 'var(--text-secondary)', marginTop: '4px', textAlign: 'right' }}>
                                    До: {new Date(acc.dueDate).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}

            {/* Add Button */}
            <div
                onClick={onAddAccount}
                style={{
                    minWidth: '140px',
                    background: 'transparent',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px',
                    border: '1px dashed var(--border)',
                    flexShrink: 0,
                    cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-muted)'
                }}
            >
                <div style={{
                    width: '32px', height: '32px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-tertiary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '8px'
                }}>
                    <Plus size={16} />
                </div>
                <div style={{ fontSize: '12px', fontWeight: 500 }}>Добавить</div>
            </div>
        </div>
    );
};

export default AccountList;
