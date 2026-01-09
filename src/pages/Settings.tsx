import React, { useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Moon, Sun, Download, Upload, Trash2, Database } from 'lucide-react';

const Settings = () => {
    const { state, dispatch } = useStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const toggleTheme = () => {
        dispatch({ type: 'UPDATE_SETTINGS', payload: { ...state.settings, isDark: !state.settings.isDark } });
    };

    const handleReset = () => {
        if (confirm('Вы уверены? Все данные будут удалены безвозвратно.')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const activeDataCount =
        state.transactions.length +
        state.accounts.length +
        state.habits.length +
        state.goals.length;

    const handleExport = () => {
        const dataStr = JSON.stringify(state, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finance-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target?.result as string);
                // Basic validation could go here
                if (confirm('Заменить текущие данные данными из файла?')) {
                    // We need a way to bulk replace state. 
                    // Currently our reducer only supports atomic updates.
                    // For now, we will just save to localStorage and reload.
                    localStorage.setItem('finance_store', ev.target?.result as string);
                    window.location.reload();
                }
            } catch (err) {
                alert('Ошибка при чтении файла');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="page-content" style={{ paddingBottom: '90px' }}>
            <header style={{ padding: '20px', paddingBottom: '10px' }}>
                <h1 className="text-gradient" style={{ fontSize: '28px', fontWeight: 700 }}>Настройки</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Персонализация и данные</p>
            </header>

            <div style={{ padding: '0 20px' }}>
                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--text-muted)' }}>Внешний вид</h3>
                    <div className="card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {state.settings.isDark ? <Moon size={20} /> : <Sun size={20} />}
                            <span>Тёмная тема</span>
                        </div>
                        <div
                            onClick={toggleTheme}
                            style={{
                                width: '44px', height: '24px', background: state.settings.isDark ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'all 0.3s'
                            }}
                        >
                            <div style={{
                                width: '20px', height: '20px', background: 'white', borderRadius: '50%',
                                position: 'absolute', top: '2px', left: state.settings.isDark ? '22px' : '2px',
                                transition: 'all 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                            }} />
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--text-muted)' }}>Управление данными</h3>

                    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Database size={20} color="var(--text-muted)" />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '14px', fontWeight: 500 }}>Статистика</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{activeDataCount} объектов в базе</div>
                            </div>
                        </div>

                        <button
                            onClick={handleExport}
                            style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'transparent', border: 'none', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left' }}
                        >
                            <Download size={20} />
                            <span>Экспорт данных (JSON)</span>
                        </button>

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'transparent', border: 'none', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left' }}
                        >
                            <Upload size={20} />
                            <span>Импорт данных</span>
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" style={{ display: 'none' }} />

                        <button
                            onClick={handleReset}
                            style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', textAlign: 'left' }}
                        >
                            <Trash2 size={20} />
                            <span>Сбросить все данные</span>
                        </button>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-muted)', fontSize: '11px' }}>
                    Finance Tracker v2.0 <br />
                    Made by Antigravity
                </div>
            </div>
        </div>
    );
};

export default Settings;
