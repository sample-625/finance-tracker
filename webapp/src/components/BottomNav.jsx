import React from 'react';

const tabs = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'wallet', icon: '👛', label: 'Wallet' },
    { id: 'habits', icon: '✅', label: 'Habits' },
];

export default function BottomNav({ activeTab, onTabChange }) {
    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '80px',
            background: 'rgba(15, 15, 18, 0.9)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            zIndex: 100
        }}>
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    style={{
                        background: 'none',
                        border: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        color: activeTab === tab.id ? 'var(--accent-color)' : 'var(--text-secondary)',
                        transition: 'color 0.2s',
                        cursor: 'pointer'
                    }}
                >
                    <span style={{ fontSize: '24px', marginBottom: '4px' }}>{tab.icon}</span>
                    <span style={{ fontSize: '11px', fontWeight: 500 }}>{tab.label}</span>
                </button>
            ))}
        </div>
    );
}
