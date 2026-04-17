import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Workspace from './components/layout/Workspace';
import BottomNav from './components/layout/BottomNav';
import { ViewType } from './types';
import { UserProvider, useUserContext } from './context/UserContext';
import AuthPage from './components/auth/AuthPage';



const AppContent: React.FC = () => {
    const [activeView, setActiveView] = useState<ViewType>('home');
    const { isAuthenticated } = useUserContext();

    if (!isAuthenticated) {
        return <AuthPage />;
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-body">
            {/* 🖥️ Desktop Sidebar */}
            <Sidebar activeView={activeView} onViewChange={setActiveView} />

            <div className="flex-1 flex flex-col min-w-0 relative md:ml-64">
                {/* ─ Consistent Top Header ─ */}
                <Header activeView={activeView} onViewChange={setActiveView} />

                {/* ─ Central Workspace Canvas ─ */}
                <main className="flex-1 overflow-auto relative pt-16 pb-16 md:pb-0 custom-scrollbar">
                    <Workspace activeView={activeView} onViewChange={setActiveView} />
                </main>

                {/* 📱 Mobile Bottom Navigation */}
                <BottomNav activeView={activeView} onViewChange={setActiveView} />
            </div>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <UserProvider>
            <AppContent />
        </UserProvider>
    );
};

export default App;
