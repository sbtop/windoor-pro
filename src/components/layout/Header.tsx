import React, { useState } from 'react';
import { ViewType } from '../../types';
import { useUserStore } from '../../store/userStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Bell, 
    Settings, 
    User, 
    LogOut, 
    LayoutDashboard, 
    FolderKanban, 
    Users, 
    PenTool, 
    FileText,
    HelpCircle,
    ChevronDown,
    Lock
} from 'lucide-react';
import { cn } from '../../lib/utils';

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
        { id: 'home' as ViewType, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'projects' as ViewType, label: 'Proyectos', icon: FolderKanban },
        { id: 'clients' as ViewType, label: 'Clientes', icon: Users },
        { id: 'designer' as ViewType, label: 'Diseñador', icon: PenTool },
        { id: 'quote' as ViewType, label: 'Cotización', icon: FileText },
    ];

    const notifications = [
        { id: 1, title: 'Cambio de medidas', message: 'Proyecto #123 requiere revisión', time: '5 min', type: 'warning' },
        { id: 2, title: 'Aprobación cliente', message: 'Cotización aprobada #456', time: '1 hora', type: 'success' },
        { id: 3, title: 'Retraso producción', message: 'Vidrio templado pendiente', time: '2 horas', type: 'error' },
    ];

    return (
        <header className="fixed top-4 left-4 right-4 md:left-72 md:right-8 h-16 z-50">
            <div className="glass h-full rounded-2xl px-4 md:px-6 flex justify-between items-center border border-white/20 shadow-lg shadow-indigo-500/5">
                {/* Logo Section */}
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => onViewChange?.('home')}
                        className="flex items-center gap-2 group transition-transform active:scale-95"
                    >
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                            <PenTool size={18} strokeWidth={2.5} />
                        </div>
                        <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-primary transition-colors">
                            WinDoor <span className="text-primary/60">Pro</span>
                        </span>
                    </button>
                    
                    <div className="h-4 w-[1px] bg-slate-200 mx-2 hidden md:block" />
                    
                    <div className="hidden lg:flex items-center gap-1">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onViewChange?.(item.id)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
                                    activeView === item.id 
                                        ? "bg-primary/10 text-primary" 
                                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                                )}
                            >
                                <item.icon size={16} strokeWidth={activeView === item.id ? 2.5 : 2} />
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 md:gap-3">
                    {/* Status Badge */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100"
                    >
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Activo</span>
                    </motion.div>

                    {/* Notifications */}
                    <div className="relative">
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setShowNotifications(!showNotifications);
                                setShowSettings(false);
                                setShowUserMenu(false);
                            }}
                            className={cn(
                                "p-2 rounded-xl transition-all relative",
                                showNotifications ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-slate-500 hover:bg-slate-100"
                            )}
                        >
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </motion.button>
                        
                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-3 w-80 glass border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-20"
                                >
                                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white/20">
                                        <h4 className="font-bold text-slate-800">Notificaciones</h4>
                                        <button className="text-xs text-primary font-bold hover:underline">Ver todas</button>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.map((notif) => (
                                            <div key={notif.id} className="p-4 border-b border-slate-50 hover:bg-white/40 transition-colors cursor-pointer group">
                                                <div className="flex items-start gap-3">
                                                    <div className={cn(
                                                        "p-2 rounded-lg bg-opacity-10",
                                                        notif.type === 'warning' ? 'bg-amber-500 text-amber-500' :
                                                        notif.type === 'success' ? 'bg-emerald-500 text-emerald-500' : 'bg-red-500 text-red-500'
                                                    )}>
                                                        <Bell size={16} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-slate-800">{notif.title}</p>
                                                        <p className="text-xs text-slate-500 leading-relaxed">{notif.message}</p>
                                                        <p className="text-[10px] text-slate-400 mt-1 font-semibold">{notif.time}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden md:block" />

                    {/* Settings & User Menu */}
                    <div className="flex items-center gap-1 md:gap-2">
                        <motion.button 
                            whileHover={{ scale: 1.05, rotate: 15 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                onViewChange?.('settings');
                                setShowSettings(false);
                                setShowNotifications(false);
                                setShowUserMenu(false);
                            }}
                            className={cn(
                                "p-2 rounded-xl transition-all",
                                showSettings ? "bg-primary text-white" : "text-slate-500 hover:bg-slate-100"
                            )}
                        >
                            <Settings size={20} />
                        </motion.button>

                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setShowUserMenu(!showUserMenu);
                                setShowNotifications(false);
                            }}
                            className="w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-tr from-primary to-accent p-[2px] shadow-md active:scale-95 transition-all"
                        >
                            <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center overflow-hidden">
                                {currentUser?.name ? (
                                    <span className="text-primary font-black text-xs">{currentUser.name.substring(0, 2).toUpperCase()}</span>
                                ) : (
                                    <User size={18} className="text-primary" />
                                )}
                            </div>
                        </motion.button>
                    </div>

                    {/* User Dropdown */}
                    <AnimatePresence>
                        {showUserMenu && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 top-full mt-3 w-64 glass border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-20"
                            >
                                <div className="p-4 bg-primary/5 text-slate-800 mb-2">
                                    <p className="font-black text-sm">{currentUser?.name || 'Usuario'}</p>
                                    <p className="text-[10px] text-slate-500 font-bold tracking-tight truncate">{currentUser?.email || 'sin@email.com'}</p>
                                </div>
                                <div className="p-2 space-y-1">
                                    <button 
                                        onClick={() => {
                                            onViewChange?.('settings');
                                            setShowUserMenu(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-white/40 rounded-xl transition-colors"
                                    >
                                        <User size={16} /> Mi Perfil
                                    </button>
                                    <button 
                                        onClick={() => {
                                            alert('Función de cambio de contraseña próximamente disponible');
                                            setShowUserMenu(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-white/40 rounded-xl transition-colors"
                                    >
                                        <Lock size={16} /> Cambiar Contraseña
                                    </button>
                                    <button 
                                        onClick={() => {
                                            alert('Centro de ayuda: Próximamente disponible');
                                            setShowUserMenu(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-white/40 rounded-xl transition-colors"
                                    >
                                        <HelpCircle size={16} /> Ayuda
                                    </button>
                                    <div className="h-[1px] bg-slate-100 my-1" />
                                    <button 
                                        onClick={() => {
                                            if (confirm('¿Cerrar sesión?')) logout();
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                    >
                                        <LogOut size={16} /> Cerrar Sesión
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
};

export default Header;
