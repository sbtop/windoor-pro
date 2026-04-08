import React from 'react';
import { ViewType } from '../../types';

interface BottomNavProps {
    activeView: ViewType;
    onViewChange: (view: ViewType) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, onViewChange }) => {
    const isDesignerView = activeView === 'window' || activeView === 'door' || activeView === 'designer';

    // Navigation menu for general views
    const menuItems = [
        { id: 'home', label: 'Inicio', icon: 'dashboard' },
        { id: 'window', label: 'Ventanas', icon: 'window' },
        { id: 'projects', label: 'Proyectos', icon: 'folder_open' },
        { id: 'clients', label: 'Clientes', icon: 'people' },
        { id: 'calendar', label: 'Agenda', icon: 'calendar_month' },
    ];

    // Designer actions for mobile (Save, 3D View, Quote)
    const designerActions = [
        { 
            id: 'save', 
            label: 'Guardar', 
            icon: 'save',
            onClick: () => alert('Medidas guardadas correctamente')
        },
        { 
            id: '3d', 
            label: 'Vista 3D', 
            icon: 'view_in_ar',
            onClick: () => alert('Abriendo vista 3D...')
        },
        { 
            id: 'quote', 
            label: 'Cotizar', 
            icon: 'request_quote',
            onClick: () => onViewChange('quote')
        },
    ];

    // Show designer actions when in designer view
    if (isDesignerView) {
        return (
            <nav className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex justify-center items-center gap-6 bg-white/90 backdrop-blur-xl rounded-full px-6 py-3 border border-primary/10 shadow-[0_24px_48px_-12px_rgba(30,58,138,0.2)]">
                {designerActions.map((action) => (
                    <button
                        key={action.id}
                        onClick={action.onClick}
                        className="flex flex-col items-center justify-center gap-1 transition-all text-slate-600 hover:text-primary px-3 py-1 active:scale-95"
                    >
                        <span className="material-symbols-outlined text-xl">{action.icon}</span>
                        <span className="font-headline text-[10px] uppercase font-bold tracking-widest">
                            {action.label}
                        </span>
                    </button>
                ))}
            </nav>
        );
    }

    // Default navigation for other views
    return (
        <nav className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex justify-center items-center gap-4 bg-white/80 backdrop-blur-lg rounded-full px-8 py-2 w-max min-w-[320px] border border-primary/10 shadow-[0_24px_48px_-12px_rgba(30,58,138,0.15)]">
            {menuItems.map((item) => {
                const isActive = activeView === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => onViewChange(item.id as ViewType)}
                        className={`flex flex-col items-center justify-center gap-1 transition-all ${
                            isActive 
                                ? 'text-primary px-4 py-2 bg-primary-container/30 rounded-full' 
                                : 'text-slate-500 hover:text-primary px-4 py-2'
                        }`}
                    >
                        <span className={`material-symbols-outlined ${isActive ? 'font-variation-600' : ''}`}>
                            {item.icon}
                        </span>
                        <span className="font-headline text-[10px] uppercase font-bold tracking-widest">
                            {item.label}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
};

export default BottomNav;
