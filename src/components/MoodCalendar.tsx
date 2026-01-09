import React from 'react';
import { Mood } from '../types';
import { MOODS } from '../lib/constants';

interface Props {
    moods: Mood[];
}

const MoodCalendar: React.FC<Props> = ({ moods }) => {
    const getDays = () => { const d = []; for (let i = 29; i >= 0; i--) { const x = new Date(); x.setDate(x.getDate() - i); d.push(x.toISOString().split('T')[0]); } return d; };
    const days = getDays();
    const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const firstDay = new Date(days[0]);
    const startOffset = (firstDay.getDay() + 6) % 7;

    return (
        <div className="mood-calendar" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginTop: '10px' }}>
            {weekDays.map(d => (
                <div key={d} style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', padding: '2px' }}>{d}</div>
            ))}
            {Array(startOffset).fill(null).map((_, i) => <div key={`e-${i}`} />)}
            {days.map(date => {
                const m = moods?.find(x => x.date === date);
                const md = m ? MOODS.find(x => x.id === m.mood) : null;
                return (
                    <div key={date} style={{
                        aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)', fontSize: '14px'
                    }}>
                        {md?.emoji || ''}
                    </div>
                );
            })}
        </div>
    );
};

export default MoodCalendar;
