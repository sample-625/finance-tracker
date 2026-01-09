import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import { useStore } from '../../context/StoreContext';
import { Habit } from '../../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Habit;
}

const COMMON_HABITS = [
    { emoji: '✅', name: 'Сделано' },
    { emoji: '💪', name: 'Тренировка' },
    { emoji: '📚', name: 'Чтение' },
    { emoji: '🏃', name: 'Бег' },
    { emoji: '💧', name: 'Вода 2л' },
    { emoji: '🧘', name: 'Медитация' },
    { emoji: '😴', name: 'Сон 8ч' },
    { emoji: '🥗', name: 'Без сахара' },
    { emoji: '💊', name: 'Витамины' },
    { emoji: '🎯', name: 'Цель дня' },
    { emoji: '✍️', name: 'Дневник' },
    { emoji: '🎨', name: 'Хобби' },
];

const HabitModal: React.FC<Props> = ({ isOpen, onClose, initialData }) => {
    const { dispatch } = useStore();
    const [name, setName] = useState('');
    const [emoji, setEmoji] = useState('✅');
    const [targetMinutes, setTargetMinutes] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name);
                setEmoji(initialData.emoji);
                setTargetMinutes(initialData.targetMinutes?.toString() || '');
            } else {
                setName('');
                setEmoji('✅');
                setTargetMinutes('');
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = () => {
        if (!name) return;

        const h: Habit = {
            id: initialData?.id || Date.now().toString(),
            name,
            emoji,
            targetMinutes: parseInt(targetMinutes) || undefined,
            completedDates: initialData?.completedDates || []
        };

        if (initialData) {
            dispatch({ type: 'UPDATE_HABIT', payload: h });
        } else {
            dispatch({ type: 'ADD_HABIT', payload: h });
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Редактировать' : 'Новая привычка'}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Иконка</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {COMMON_HABITS.map(ch => (
                        <button
                            key={ch.name}
                            onClick={() => { setEmoji(ch.emoji); setName(ch.name); }}
                            style={{
                                width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                                background: emoji === ch.emoji ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-tertiary)',
                                border: `1px solid ${emoji === ch.emoji ? 'var(--accent-primary)' : 'transparent'}`,
                                fontSize: '22px', flexShrink: 0
                            }}
                            title={ch.name}
                        >
                            {ch.emoji}
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
                    placeholder="Название привычки"
                    style={{
                        width: '100%', padding: '12px', borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-tertiary)', color: 'var(--text-primary)'
                    }}
                />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Цель (минут, опционально)</label>
                <input
                    type="number"
                    value={targetMinutes}
                    onChange={e => setTargetMinutes(e.target.value)}
                    placeholder="Например, 10"
                    style={{
                        width: '100%', padding: '12px', borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-tertiary)', color: 'var(--text-primary)'
                    }}
                />
            </div>

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

export default HabitModal;
