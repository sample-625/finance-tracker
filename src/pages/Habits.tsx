import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import HabitItem from '../components/habits/HabitItem';
import MoodSelector from '../components/MoodSelector';
import MoodCalendar from '../components/MoodCalendar';
import HabitModal from '../components/modals/HabitModal';
import { Habit } from '../types';
import { Plus } from 'lucide-react';

const Habits = () => {
    const { state, dispatch } = useStore();
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | undefined>(undefined);

    const handleEdit = (h: Habit) => {
        setEditingHabit(h);
        setModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Удалить привычку?')) {
            dispatch({ type: 'DELETE_HABIT', payload: id });
        }
    };

    const handleAdd = () => {
        setEditingHabit(undefined);
        setModalOpen(true);
    };

    return (
        <div className="page-content" style={{ paddingBottom: '90px' }}>
            <header style={{ padding: '20px', paddingBottom: '10px' }}>
                <h1 className="text-gradient" style={{ fontSize: '28px', fontWeight: 700 }}>Привычки</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Ежедневные ритуалы</p>
            </header>

            <div style={{ padding: '0 20px 20px' }}>
                <section className="card" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '14px', marginBottom: '14px', color: 'var(--text-secondary)' }}>Настроение сегодня</h3>
                    <MoodSelector />
                    <h3 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--text-secondary)' }}>Календарь</h3>
                    <MoodCalendar moods={state.moods} />
                </section>

                <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h3 style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Мои привычки</h3>
                    </div>

                    {state.habits.length === 0 ? (
                        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)' }}>
                            <div style={{ fontSize: '30px', marginBottom: '10px' }}>🎯</div>
                            <div>Добавьте первую привычку</div>
                        </div>
                    ) : (
                        state.habits.map(h => (
                            <HabitItem
                                key={h.id}
                                habit={h}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </section>
            </div>

            <button
                onClick={handleAdd}
                style={{
                    position: 'fixed', bottom: '95px', right: '20px',
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: 'var(--accent-gradient)', color: 'white',
                    border: 'none', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', zIndex: 900
                }}
            >
                <Plus size={28} />
            </button>

            <HabitModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                initialData={editingHabit}
            />
        </div>
    );
};

export default Habits;
