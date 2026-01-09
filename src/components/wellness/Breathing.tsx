import React, { useState, useEffect } from 'react';

const Breathing = () => {
    const [isActive, setIsActive] = useState(false);
    const [text, setText] = useState('Начать');
    const [phase, setPhase] = useState<'inhale' | 'hold-in' | 'exhale' | 'hold-out' | 'idle'>('idle');

    useEffect(() => {
        if (!isActive) {
            setPhase('idle');
            setText('Начать');
            return;
        }

        let timer: NodeJS.Timeout;
        const cycle = () => {
            // Inhale 4s
            setPhase('inhale');
            setText('Вдох');
            timer = setTimeout(() => {
                // Hold 4s
                setPhase('hold-in');
                setText('Задержка');
                timer = setTimeout(() => {
                    // Exhale 4s
                    setPhase('exhale');
                    setText('Выдох');
                    timer = setTimeout(() => {
                        // Hold 4s
                        setPhase('hold-out');
                        setText('Задержка');
                        timer = setTimeout(cycle, 4000);
                    }, 4000);
                }, 4000);
            }, 4000);
        };

        cycle();

        return () => clearTimeout(timer);
    }, [isActive]);

    return (
        <div className="card glass" style={{
            padding: '30px', borderRadius: 'var(--radius-xl)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            minHeight: '300px', justifyContent: 'center'
        }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Дыхание 4-4-4-4</h3>

            <div
                onClick={() => setIsActive(!isActive)}
                style={{
                    width: '180px', height: '180px',
                    borderRadius: '50%',
                    background: 'var(--bg-tertiary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', position: 'relative',
                    transition: 'all 4s ease-in-out',
                    transform: phase === 'inhale' || phase === 'hold-in' ? 'scale(1.3)' : 'scale(1)',
                    border: '4px solid',
                    borderColor: phase === 'inhale' ? '#818cf8' : phase === 'exhale' ? '#34d399' : 'var(--border)',
                    boxShadow: isActive ? '0 0 40px rgba(99, 102, 241, 0.2)' : 'none'
                }}
            >
                <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {text}
                </div>

                {/* Progress Ring could go here */}
            </div>

            <div style={{ marginTop: '30px', fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '240px', textAlign: 'center' }}>
                Квадратное дыхание для снятия стресса и концентрации.
            </div>
        </div>
    );
};

export default Breathing;
