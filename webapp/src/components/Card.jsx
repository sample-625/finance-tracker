import React from 'react';

export default function Card({ children, title, className = '' }) {
    return (
        <div className={`glass ${className}`} style={{ padding: '20px', borderRadius: 'var(--radius-lg)', marginBottom: '16px' }}>
            {title && <h3 className="title-medium" style={{ marginTop: 0 }}>{title}</h3>}
            {children}
        </div>
    );
}
