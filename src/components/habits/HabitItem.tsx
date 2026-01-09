import React from 'react';
import { Habit } from '../../types';
import { getDaysInStreak, getToday } from '../../lib/utils';
import { Check, Edit2, Trash } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface Props {
    habit: Habit;
    onEdit: (h: Habit) => void;
    onDelete: (id: string) => void;
}

const HabitItem: React.FC<Props> = ({ habit, onEdit, onDelete }) => {
    const { dispatch } = useStore();
    const today = getToday();
    const isCompleted = habit.completedDates.includes(today);
    const streak = getDaysInStreak(habit.completedDates);

    const toggleHabit = () => {
        const dates = isCompleted
            ? habit.completedDates.filter(d => d !== today)
            : [...habit.completedDates, today];

        dispatch({ type: 'UPDATE_HABIT', payload: { ...habit, completedDates: dates } });
    };

    return (
        <div className="habit-item" style={{
            display: 'flex', alignItems: 'center',
            padding: '16px', background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)', marginBottom: '8px'
        }}>
            <div
                onClick={toggleHabit}
                style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    border: `2px solid ${isCompleted ? 'var(--success)' : 'var(--border)'}`,
                    background: isCompleted ? 'var(--success)' : 'transparent',
                    marginRight: '14px', cursor: 'pointer', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s'
                }}
            >
                <Check size={16} strokeWidth={3} color="white" style={{ opacity: isCompleted ? 1 : 0 }} />
            </div>

            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 500, marginBottom: '2px' }}>
                    {habit.emoji} {habit.name}
                </div>
                {streak > 0 && (
                    <div style={{ fontSize: '11px', color: 'var(--warning)', fontWeight: 600 }}>
                        🔥 {streak} дней
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={() => onEdit(habit)} style={{ padding: '6px', color: 'var(--text-muted)' }}>
                    <Edit2 size={14} />
                </button>
                <button onClick={() => onDelete(habit.id)} style={{ padding: '6px', color: 'var(--text-muted)' }}>
                    <Trash size={14} />
                </button>
            </div>
        </div>
    );
};

export default HabitItem;
