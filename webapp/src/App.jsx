import React, { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';

export default function App() {
    const [activeTab, setActiveTab] = useState('home');
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check if running in Telegram WebApp
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.ready();
            window.Telegram.WebApp.expand();

            const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
            if (tgUser) {
                setUser(tgUser);
            }

            // Apply theme params if needed (though we rely on our own dark theme)
            document.body.style.backgroundColor = 'var(--bg-primary)';
        }
    }, []);

    const renderContent = () => {
        switch (activeTab) {
            case 'home': return <Home user={user} />;
            case 'wallet': return <div className="flex-center" style={{ height: '100%' }}>Wallet Coming Soon</div>;
            case 'habits': return <div className="flex-center" style={{ height: '100%' }}>Habits Coming Soon</div>;
            default: return <Home user={user} />;
        }
    };

    return (
        <div className="app-container">
            {renderContent()}
            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
    );
}
