import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const Meditation = () => {
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300); // 5 mins default
    const [duration, setDuration] = useState(300);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            intervalRef.current = window.setInterval(() => {
                setTimeLeft(t => t - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(duration);
    };

    const setTime = (mins: number) => {
        setIsActive(false);
        setDuration(mins * 60);
        setTimeLeft(mins * 60);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="card" style={{
            background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 100%)',
            borderRadius: 'var(--radius-xl)',
            padding: '30px',
            color: 'white',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            position: 'relative', overflow: 'hidden',
            marginBottom: '20px'
        }}>
            {/* Background Pulse Animation */}
            {isActive && (
                <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    width: '200px', height: '200px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    transform: 'translate(-50%, -50%)',
                    animation: 'pulse 4s infinite ease-in-out'
                }} />
            )}

            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', position: 'relative' }}>Медитация</h3>

            <div className="mono" style={{ fontSize: '64px', fontWeight: 700, marginBottom: '30px', position: 'relative', textShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                {formatTime(timeLeft)}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '30px', position: 'relative' }}>
                {[5, 10, 15].map(m => (
                    <button
                        key={m}
                        onClick={() => setTime(m)}
                        style={{
                            padding: '8px 16px', borderRadius: '20px',
                            background: duration === m * 60 ? 'white' : 'rgba(255,255,255,0.2)',
                            color: duration === m * 60 ? 'var(--accent-primary)' : 'white',
                            fontSize: '14px', fontWeight: 600, border: 'none'
                        }}
                    >
                        {m} мин
                    </button>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '20px', position: 'relative' }}>
                <button
                    onClick={toggleTimer}
                    style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'white', color: 'var(--accent-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)', border: 'none'
                    }}
                >
                    {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" style={{ marginLeft: '4px' }} />}
                </button>

                <button
                    onClick={resetTimer}
                    style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.2)', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: 'none'
                    }}
                >
                    <RotateCcw size={24} />
                </button>
            </div>

            <style>{`
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
          50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
        }
      `}</style>
        </div>
    );
};

export default Meditation;
