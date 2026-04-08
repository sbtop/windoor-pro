import React, { useState } from 'react';
import { ViewType } from '../../types';
import { useUserStore } from '../../store/userStore';

interface HeaderProps {
    activeView: ViewType;
    onViewChange?: (view: ViewType) => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, onViewChange }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { currentUser, logout } = useUserStore();

    const navItems = [
        { id: 'home' as ViewType, label: 'Dashboard' },
        { id: 'projects' as ViewType, label: 'Proyectos' },
        { id: 'clients' as ViewType, label: 'Clientes' },
        { id: 'designer' as ViewType, label: 'Diseñador' },
        { id: 'quote' as ViewType, label: 'Cotización' },
    ];

    // Mock notifications data
    const notifications = [
        { id: 1, title: 'Cambio de medidas', message: 'Proyecto #123 requiere revisión', time: '5 min', type: 'warning' },
        { id: 2, title: 'Aprobación cliente', message: 'Cotización aprobada #456', time: '1 hora', type: 'success' },
        { id: 3, title: 'Retraso producción', message: 'Vidrio templado pendiente', time: '2 horas', type: 'error' },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-surface/90 backdrop-blur-xl border-b border-primary/10 z-50 shadow-[0_24px_48px_-12px_rgba(30,58,138,0.08)]">
            <div className="flex justify-between items-center h-full px-4 md:px-8">
                {/* Logo - Click to return to dashboard */}
                <button 
                    onClick={() => onViewChange?.('home')}
                    className="text-xl font-bold tracking-tighter text-primary font-headline hover:opacity-80 transition-opacity"
                >
                    WinDoor Pro
                </button>

                {/* Main Navigation */}
                <nav className="hidden md:flex items-center gap-8 h-full">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onViewChange?.(item.id)}
                            className={`font-headline tracking-tight font-bold uppercase text-xs h-full flex items-center border-b-2 transition-colors ${
                                activeView === item.id
                                    ? 'text-primary border-primary'
                                    : 'text-slate-700 border-transparent hover:text-primary'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    {/* Reportes con candado */}
                    <button
                        onClick={() => onViewChange?.('reports')}
                        className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeView === 'reports'
                                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                        }`}
                    >
                        <span className="material-symbols-outlined text-sm">lock</span>
                        Reportes
                    </button>

                    {/* Project Status Badge */}
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span className="text-xs font-bold uppercase tracking-wide">Activo</span>
                    </div>
                    
                    {/* Notifications */}
                    <div className="relative">
                        <button 
                            onClick={() => {
                                setShowNotifications(!showNotifications);
                                setShowSettings(false);
                            }}
                            className="relative p-2 text-slate-700 hover:bg-slate-200 transition-colors rounded-full active:scale-95 duration-200"
                        >
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        
                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
                                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                                    <h4 className="font-headline font-bold text-slate-800">Notificaciones</h4>
                                    <button 
                                        onClick={() => {
                                            onViewChange?.('notifications');
                                            setShowNotifications(false);
                                        }}
                                        className="text-xs text-primary font-medium hover:underline"
                                    >
                                        Ver todas
                                    </button>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {notifications.map((notif) => (
                                        <div key={notif.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
                                            <div className="flex items-start gap-3">
                                                <span className={`material-symbols-outlined ${
                                                    notif.type === 'warning' ? 'text-amber-500' :
                                                    notif.type === 'success' ? 'text-emerald-500' : 'text-red-500'
                                                }`}>
                                                    {notif.type === 'warning' ? 'warning' :
                                                     notif.type === 'success' ? 'check_circle' : 'error'}
                                                </span>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-slate-800">{notif.title}</p>
                                                    <p className="text-xs text-slate-500">{notif.message}</p>
                                                    <p className="text-[10px] text-slate-400 mt-1">{notif.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Settings */}
                    <div className="relative">
                        <button 
                            onClick={() => {
                                setShowSettings(!showSettings);
                                setShowNotifications(false);
                                setShowUserMenu(false);
                            }}
                            className="p-2 text-slate-700 hover:bg-slate-200 transition-colors rounded-full active:scale-95 duration-200"
                        >
                            <span className="material-symbols-outlined">settings</span>
                        </button>

                        {/* Settings Dropdown */}
                        {showSettings && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
                                <div className="p-3 border-b border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conectado como</p>
                                    <p className="text-sm font-bold text-slate-800 truncate">{currentUser?.name}</p>
                                    <p className="text-[10px] font-medium text-slate-500 truncate">{currentUser?.email}</p>
                                </div>
                                <button 
                                    onClick={() => {
                                        onViewChange?.('settings');
                                        setShowSettings(false);
                                    }}
                                    className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                                >
                                    <span className="material-symbols-outlined text-slate-400">tune</span>
                                    Configuración
                                </button>
                                <button 
                                    onClick={() => {
                                        onViewChange?.('settings');
                                        setShowSettings(false);
                                    }}
                                    className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                                >
                                    <span className="material-symbols-outlined text-slate-400">tune</span>
                                    Preferencias
                                </button>
                                <button 
                                    onClick={() => {
                                        alert('Sistema de ayuda:\n\n1. Dashboard: Gestiona proyectos y cotizaciones\n2. Diseñador: Crea ventanas y puertas personalizadas\n3. Clientes: Registra y gestiona tus clientes\n4. Calendario: Programa instalaciones y visitas\n\nPara más información contacta soporte.');
                                        setShowSettings(false);
                                    }}
                                    className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                                >
                                    <span className="material-symbols-outlined text-slate-400">help</span>
                                    Ayuda
                                </button>
                                <div className="border-t border-slate-100 p-3">
                                    <button 
                                        onClick={() => {
                                            if (confirm('¿Estás seguro de cerrar sesión?')) {
                                                logout();
                                            }
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-3"
                                    >
                                        <span className="material-symbols-outlined">logout</span>
                                        Cerrar sesión
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Avatar with Profile Menu */}
                    <div className="relative">
                        <button 
                            onClick={() => {
                                setShowUserMenu(!showUserMenu);
                                setShowNotifications(false);
                                setShowSettings(false);
                            }}
                            className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-100 bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center hover:ring-4 hover:ring-indigo-500/20 shadow-sm transition-all text-white font-bold text-sm tracking-widest"
                        >
                            {currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : <span className="material-symbols-outlined text-sm">person</span>}
                        </button>

                        {/* User Profile Dropdown */}
                        {showUserMenu && (
                            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
                                <div className="p-4 bg-gradient-to-br from-indigo-500 to-blue-600">
                                    <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white font-bold text-lg mb-3">
                                        {currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : <span className="material-symbols-outlined">person</span>}
                                    </div>
                                    <p className="text-white font-bold truncate">{currentUser?.name || 'Usuario'}</p>
                                    <p className="text-white/80 text-xs truncate">{currentUser?.email || 'sin@email.com'}</p>
                                </div>
                                <button 
                                    onClick={() => {
                                        onViewChange?.('settings');
                                        setShowUserMenu(false);
                                    }}
                                    className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                                >
                                    <span className="material-symbols-outlined text-slate-400">account_circle</span>
                                    Mi Perfil
                                </button>
                                <button 
                                    onClick={() => {
                                        alert('Función para cambiar contraseña próximamente');
                                        setShowUserMenu(false);
                                    }}
                                    className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                                >
                                    <span className="material-symbols-outlined text-slate-400">lock_reset</span>
                                    Cambiar Contraseña
                                </button>
                                <div className="border-t border-slate-100 p-3">
                                    <button 
                                        onClick={() => {
                                            if (confirm('¿Estás seguro de cerrar sesión?')) {
                                                logout();
                                                setShowUserMenu(false);
                                            }
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-3"
                                    >
                                        <span className="material-symbols-outlined">logout</span>
                                        Cerrar sesión
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
