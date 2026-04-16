import React, { useState, useEffect } from 'react';
// import Sidebar from './components/layout/Sidebar';
// import Header from './components/layout/Header';
// import Workspace from './components/layout/Workspace';
// import BottomNav from './components/layout/BottomNav';
import { ViewType } from './types';
// import { useUserStore } from './store/userStore';
import AuthPage from './components/auth/AuthPage';



const App: React.FC = () => {
    const [activeView, setActiveView] = useState<ViewType>('home');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check localStorage for session on mount
    useEffect(() => {
        const session = localStorage.getItem('windoor-session-v2');
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                setIsAuthenticated(sessionData.isAuthenticated || false);
            } catch {
                setIsAuthenticated(false);
            }
        }
    }, []);

    // Temporarily bypass Zustand
    // const { isAuthenticated } = useUserStore();

    if (!isAuthenticated) {
        return <AuthPage />;
    }

    console.log('App rendered, isAuthenticated:', isAuthenticated, 'activeView:', activeView);

    // Temporary simple view after authentication
    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-4xl font-black text-white mb-4">WinDoor Pro</h1>
                <p className="text-slate-400 mb-8">Sistema en mantenimiento - Solucionando problemas de Zustand</p>
                <button 
                    onClick={() => {
                        localStorage.removeItem('windoor-session-v2');
                        window.location.reload();
                    }}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                >
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

export default App;
