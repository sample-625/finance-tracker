import React from 'react';
import { useStore } from '../context/StoreContext';
import { formatMoney } from '../lib/utils';
import { Goal } from '../types';
import { Plus, Edit2, Trash } from 'lucide-react';

interface Props {
    onAdd: () => void;
    onEdit: (g: Goal) => void;
    onDelete: (id: string) => void;
}

const GoalList: React.FC<Props> = ({ onAdd, onEdit, onDelete }) => {
    const { state } = useStore();
    const { goals } = state;

    return (
        <div style={{ padding: '0 20px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Цели накопления</h3>
                <button onClick={onAdd} style={{ fontSize: '12px', color: 'var(--accent-primary)', fontWeight: 600 }}>+ Добавить</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px' }}>
                {goals.map(g => {
                    const percent = Math.min(100, (g.currentAmount / g.targetAmount) * 100);
                    return (
                        <div key={g.id} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '12px', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <div style={{ fontSize: '24px' }}>{g.icon}</div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button onClick={() => onEdit(g)} style={{ color: 'var(--text-muted)' }}><Edit2 size={12} /></button>
                                    <button onClick={() => onDelete(g.id)} style={{ color: 'var(--text-muted)' }}><Trash size={12} /></button>
                                </div>
                            </div>

                            <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.name}</div>

                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                <span>{formatMoney(g.currentAmount, g.currency)}</span>
                                <span>{formatMoney(g.targetAmount, g.currency)}</span>
                            </div>

                            <div style={{ width: '100%', height: '4px', background: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ width: `${percent}%`, height: '100%', background: g.color || 'var(--accent-primary)', transition: 'width 0.5s ease-out' }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default GoalList;
