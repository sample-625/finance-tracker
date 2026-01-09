import React from 'react';
import { useStore } from '../context/StoreContext';
import { formatMoney, formatDate } from '../lib/utils';
import { DEFAULT_CATEGORIES } from '../lib/constants';
import { Transaction, Category } from '../types';
import { Trash, Edit2 } from 'lucide-react';

interface Props {
    transactions: Transaction[];
    onEdit: (tx: Transaction) => void;
    onDelete: (id: string) => void;
}

const TransactionList: React.FC<Props> = ({ transactions, onEdit, onDelete }) => {
    const { state } = useStore();

    // Combine default and custom categories
    const allCategories: Category[] = [
        ...DEFAULT_CATEGORIES.expense,
        ...DEFAULT_CATEGORIES.income,
        ...state.customCategories
    ];

    if (transactions.length === 0) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '40px', opacity: 0.5, marginBottom: '10px' }}>📊</div>
                <div>Нет операций</div>
            </div>
        );
    }

    return (
        <div style={{ padding: '0 20px 20px' }}>
            {transactions.map(tx => {
                const cat = allCategories.find(c => c.id === tx.categoryId);
                return (
                    <div key={tx.id} className="transaction-item" style={{
                        display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)'
                    }}>
                        <div style={{
                            width: '40px', height: '40px',
                            borderRadius: 'var(--radius-md)',
                            background: (cat?.color || '#666') + '20',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '20px', marginRight: '12px', flexShrink: 0
                        }}>
                            {cat?.emoji || '📝'}
                        </div>

                        <div style={{ flex: 1, minWidth: 0, marginRight: '10px' }}>
                            <div style={{ fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {tx.description || cat?.name}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                {formatDate(tx.date)} • {state.accounts.find(a => a.id === tx.accountId)?.name || 'Наличные'}
                            </div>
                        </div>

                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <div className="mono" style={{
                                fontSize: '14px', fontWeight: 600,
                                color: tx.type === 'income' ? 'var(--success)' : 'var(--text-primary)'
                            }}>
                                {tx.type === 'income' ? '+' : '-'}{formatMoney(tx.amount, tx.currency)}
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                <button onClick={() => onEdit(tx)} style={{ color: 'var(--text-muted)' }}>
                                    <Edit2 size={12} />
                                </button>
                                <button onClick={() => onDelete(tx.id)} style={{ color: 'var(--text-muted)' }}>
                                    <Trash size={12} />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default TransactionList;
