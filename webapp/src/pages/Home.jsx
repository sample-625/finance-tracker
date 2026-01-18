import React, { useState, useEffect } from 'react';
import Card from '../components/Card';

export default function Home({ user }) {
    return (
        <div style={{ padding: '20px' }}>
            <header style={{ marginBottom: '24px' }}>
                <h1 className="title-large">Hi, {user?.first_name || 'Friend'} 👋</h1>
                <p style={{ color: 'var(--text-secondary)' }}>You're doing great today.</p>
            </header>

            <Card title="💰 Total Balance">
                <div style={{
                    fontSize: '42px',
                    fontWeight: '800',
                    background: 'var(--accent-gradient)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '10px'
                }}>
                    $1,240.50
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ background: 'rgba(48, 209, 88, 0.15)', color: 'var(--success-color)', padding: '4px 12px', borderRadius: '20px', fontSize: '14px' }}>
                        + $250.00
                    </div>
                    <div style={{ background: 'rgba(255, 69, 58, 0.15)', color: 'var(--danger-color)', padding: '4px 12px', borderRadius: '20px', fontSize: '14px' }}>
                        - $52.00
                    </div>
                </div>
            </Card>

            <Card title="🎭 Today's Mood">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '32px' }}>
                    <span>😫</span><span>😕</span><span>😐</span><span>🙂</span><span>🤩</span>
                </div>
            </Card>

            <Card title="✅ Habits Today">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input type="checkbox" style={{ accentColor: 'var(--accent-color)', width: '20px', height: '20px' }} checked readOnly />
                        <span style={{ textDecoration: 'line-through', color: 'var(--text-secondary)' }}>Drink Water</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input type="checkbox" style={{ accentColor: 'var(--accent-color)', width: '20px', height: '20px' }} />
                        <span>Read 10 pages</span>
                    </div>
                </div>
            </Card>
        </div>
    );
}
