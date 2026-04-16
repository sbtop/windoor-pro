import React from 'react';
import { ViewType } from '../../types';
import { Home, Square, FolderOpen, Users, Calendar, Save, Box, Receipt } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface BottomNavProps {
    activeView: ViewType;
    onViewChange: (view: ViewType) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, onViewChange }) => {
    const isDesignerView = activeView === 'window' || activeView === 'door' || activeView === 'designer';

    const menuItems = [
        { id: 'home', label: 'Inicio', icon: Home },
        { id: 'window', label: 'Crear', icon: Square },
        { id: 'projects', label: 'Proyectos', icon: FolderOpen },
        { id: 'clients', label: 'Clientes', icon: Users },
        { id: 'calendar', label: 'Agenda', icon: Calendar },
    ];

    const designerActions = [
        { 
            id: 'save', 
            label: 'Guardar', 
            icon: Save,
            onClick: () => {} // Handled in DesignerPage but kept for UI
        },
        { 
            id: 'calculator', 
            label: 'Costos', 
            icon: Box,
            onClick: () => onViewChange('calculator')
        },
        { 
            id: 'quote', 
            label: 'Cotizar', 
            icon: Receipt,
            onClick: () => onViewChange('quote')
        },
    ];

    return (
        <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm">
            <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="glass-card bg-white/60 backdrop-blur-2xl rounded-[32px] p-2 flex items-center justify-around shadow-2xl border-white/40 ring-1 ring-black/5"
            >
                {isDesignerView ? (
                    designerActions.map((action) => (
                        <motion.button
                            key={action.id}
                            whileTap={{ scale: 0.9 }}
                            onClick={action.onClick}
                            className="flex flex-col items-center justify-center gap-1.5 p-3 text-slate-500 hover:text-primary transition-colors"
                        >
                            <action.icon size={20} strokeWidth={2.5} />
                            <span className="text-[8px] font-black uppercase tracking-widest">{action.label}</span>
                        </motion.button>
                    ))
                ) : (
                    menuItems.map((item) => {
                        const isActive = activeView === item.id;
                        return (
                            <motion.button
                                key={item.id}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onViewChange(item.id as ViewType)}
                                className={cn(
                                    "relative flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl transition-all",
                                    isActive ? "text-primary" : "text-slate-400"
                                )}
                            >
                                {isActive && (
                                    <motion.div 
                                        layoutId="active-pill"
                                        className="absolute inset-0 bg-primary/10 rounded-2xl -z-10"
                                    />
                                )}
                                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                <span className={cn(
                                    "text-[8px] font-black uppercase tracking-widest",
                                    isActive ? "opacity-100" : "opacity-0 invisible h-0"
                                )}>
                                    {item.label}
                                </span>
                            </motion.button>
                        );
                    })
                )}
            </motion.div>
        </nav>
    );
};

export default BottomNav;
