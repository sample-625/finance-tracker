import React, { useState } from 'react';
import Meditation from '../components/wellness/Meditation';
import Breathing from '../components/wellness/Breathing';

const Wellness = () => {
    const [activeTab, setActiveTab] = useState<'meditation' | 'breathing'>('meditation');

    return (
        <div className="page-content" style={{ paddingBottom: '90px' }}>
            <header style={{ padding: '20px', paddingBottom: '10px' }}>
                <h1 className="text-gradient" style={{ fontSize: '28px', fontWeight: 700 }}>Wellness</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Здоровье и спокойствие</p>
            </header>

            <div style={{ padding: '0 20px 20px' }}>
                <div style={{ display: 'flex', background: 'var(--bg-card)', padding: '4px', borderRadius: 'var(--radius-lg)', marginBottom: '20px' }}>
                    <button
                        onClick={() => setActiveTab('meditation')}
                        style={{
                            flex: 1, padding: '10px', borderRadius: 'var(--radius-md)',
                            background: activeTab === 'meditation' ? 'var(--bg-tertiary)' : 'transparent',
                            color: activeTab === 'meditation' ? 'var(--text-primary)' : 'var(--text-secondary)',
                            fontWeight: 500, fontSize: '14px', transition: 'all 0.2s'
                        }}
                    >
                        Медитация
                    </button>
                    <button
                        onClick={() => setActiveTab('breathing')}
                        style={{
                            flex: 1, padding: '10px', borderRadius: 'var(--radius-md)',
                            background: activeTab === 'breathing' ? 'var(--bg-tertiary)' : 'transparent',
                            color: activeTab === 'breathing' ? 'var(--text-primary)' : 'var(--text-secondary)',
                            fontWeight: 500, fontSize: '14px', transition: 'all 0.2s'
                        }}
                    >
                        Дыхание
                    </button>
                </div>

                {activeTab === 'meditation' ? <Meditation /> : <Breathing />}
            </div>
        </div>
    );
};

export default Wellness;
