import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Wallet, CheckSquare, BarChart2, Settings, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const Layout = () => {
    const { state } = useStore();
    const todayHabitCount = state.habits.filter(h => h.completedDates?.includes(new Date().toISOString().split('T')[0])).length;

    const navItems = [
        { to: '/', icon: LayoutDashboard, label: 'Главная' },
        { to: '/finance', icon: Wallet, label: 'Финансы' },
        { to: '/habits', icon: CheckSquare, label: 'Привычки', badge: todayHabitCount > 0 ? todayHabitCount : undefined },
        { to: '/analytics', icon: BarChart2, label: 'Аналитика' },
        { to: '/wellness', icon: Sparkles, label: 'Wellness' }, // New feature
        { to: '/settings', icon: Settings, label: 'Настройки' },
    ];

    return (
        <div className="layout-container" style={{ paddingBottom: '85px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <main style={{ flex: 1, position: 'relative' }}>
                <Outlet />
            </main>

            <nav className="nav-bar glass" style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'space-around',
                padding: '12px 6px 30px',
                borderTop: '1px solid var(--border)',
                zIndex: 1000
            }}>
                {navItems.map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        style={({ isActive }) => ({
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                            textDecoration: 'none',
                            fontSize: '10px',
                            fontWeight: 500,
                            flex: 1,
                            position: 'relative'
                        })}
                    >
                        <item.icon size={22} strokeWidth={2} style={{ marginBottom: '4px' }} />
                        <span>{item.label}</span>
                        {item.badge && (
                            <span style={{
                                position: 'absolute',
                                top: '-2px',
                                right: 'calc(50% - 12px)',
                                background: 'var(--accent-primary)',
                                color: 'white',
                                fontSize: '9px',
                                width: '14px',
                                height: '14px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid var(--bg-secondary)'
                            }}>
                                {item.badge}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default Layout;
