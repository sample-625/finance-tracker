import React from 'react';
import { MOODS } from '../lib/constants';
import { useStore } from '../context/StoreContext';
import { getToday } from '../lib/utils';
import { Mood } from '../types';

const MoodSelector: React.FC = () => {
    const { state, dispatch } = useStore();
    const today = getToday();
    const currentMood = state.moods.find(m => m.date === today);

    const setMood = (id: number) => {
        const m: Mood = { date: today, mood: id };
        dispatch({ type: 'ADD_MOOD', payload: m });
    };

    return (
        <div className="glass" style={{
            padding: '16px', borderRadius: 'var(--radius-lg)',
            display: 'flex', justifyContent: 'space-around',
            marginBottom: '20px', background: 'var(--bg-tertiary)'
        }}>
            {MOODS.map(m => (
                <div
                    key={m.id}
                    onClick={() => setMood(m.id)}
                    style={{
                        width: '44px', height: '44px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '24px', cursor: 'pointer',
                        background: currentMood?.mood === m.id ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                        border: `2px solid ${currentMood?.mood === m.id ? 'var(--accent-primary)' : 'transparent'}`,
                        transform: currentMood?.mood === m.id ? 'scale(1.1)' : 'scale(1)',
                        transition: 'all 0.2s'
                    }}
                    title={m.label}
                >
                    {m.emoji}
                </div>
            ))}
        </div>
    );
};

export default MoodSelector;
