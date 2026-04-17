import React, { useState, useEffect, useMemo } from 'react';
import { ViewType } from '../../types';
import { useDesignerStore } from '../../store/designerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { calcularMaterialesVentana } from '../../services/manufacturing';
import { calcularCotizacionSaaS } from '../../services/pricing';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Home, 
    Users, 
    FolderOpen, 
    BarChart3, 
    Calendar as CalendarIcon, 
    Calculator, 
    Settings, 
    HelpCircle, 
    FileText, 
    Plus,
    Maximize2,
    CheckCircle2,
    Info,
    ChevronRight,
    MousePointer2,
    Ruler,
    Layers,
    Wrench,
    AlertTriangle,
    Check
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Calendar from '../Calendar';
import SupportModal from './SupportModal';
import UserManualModal from './UserManualModal';

interface SidebarProps {
    activeView: ViewType;
    onViewChange: (view: ViewType) => void;
}

const THICKNESS_TO_DICT_ID: Record<string, string> = {
    '6mm': 'vidrio_6mm',
    '8mm': 'vidrio_8mm',
    '10mm': 'vidrio_10mm',
    '12mm': 'vidrio_12mm',
    '15mm': 'vidrio_15mm',
    '19mm': 'vidrio_19mm',
};

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
    // Technical state for designer
    const [glassCategory, setGlassCategory] = useState('templado');
    const [thickness, setThickness] = useState('6mm');
    const [hardware, setHardware] = useState('standard');
    const [maxWeight, setMaxWeight] = useState(150);
    const [tolerance, setTolerance] = useState(2);
    const [applied, setApplied] = useState(false);
    
    // Modal states
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [showManualModal, setShowManualModal] = useState(false);

    const { elements, selectedId, updateElement } = useDesignerStore();
    const { pricingConfig } = useSettingsStore();

    const selectedElement = selectedId
        ? elements.find(el => el.id === selectedId)
        : elements.length === 1 ? elements[0] : null;

    const widthMm = selectedElement?.width || 1500;
    const heightMm = selectedElement?.height || 1200;

    const isDesignerView = activeView === 'designer' || activeView === 'window' || activeView === 'door';

    const menuItems = [
        { id: 'home', label: 'Dashboard', icon: Home },
        { id: 'projects', label: 'Proyectos', icon: FolderOpen },
        { id: 'clients', label: 'Clientes', icon: Users },
        { id: 'designer', label: 'Diseñador', icon: Maximize2 },
        { id: 'reports', label: 'Reportes', icon: BarChart3 },
        { id: 'calendar', label: 'Agenda', icon: CalendarIcon },
    ];

    const handleWidthChange = (value: number) => {
        if (selectedElement && selectedId) updateElement(selectedId, { width: value });
    };

    const handleHeightChange = (value: number) => {
        if (selectedElement && selectedId) updateElement(selectedId, { height: value });
    };

    const glassId = THICKNESS_TO_DICT_ID[thickness] || 'vidrio_6mm';

    const calcResult = useMemo(() => {
        if (!selectedElement) return null;
        return calcularMaterialesVentana({
            ancho: widthMm,
            alto: heightMm,
            tipo: selectedElement.openingType || 'corrediza',
            hojas: selectedElement.panels.length,
            glassType: glassId,
        });
    }, [widthMm, heightMm, selectedElement?.openingType, selectedElement?.panels.length, glassId]);

    const pricingResult = useMemo(() => {
        if (!calcResult) return null;
        return calcularCotizacionSaaS(calcResult, pricingConfig);
    }, [calcResult, pricingConfig]);

    const selectedGlassName = pricingConfig.diccionario[glassId as keyof typeof pricingConfig.diccionario]?.nombre || thickness;

    const handleApplyChanges = () => {
        if (selectedElement && selectedId) {
            updateElement(selectedId, { glassType: glassId });
        }
        setApplied(true);
        setTimeout(() => setApplied(false), 2000);
    };

    const inputClass = "w-full px-3 py-2 bg-white/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all";

    return (
        <aside className="hidden md:flex fixed left-4 top-24 bottom-4 w-64 z-40 transition-all">
            <div className="glass w-full h-full rounded-2xl flex flex-col border border-white/20 shadow-xl shadow-indigo-500/5 overflow-hidden">
                <AnimatePresence mode="wait">
                    {isDesignerView ? (
                        <motion.div 
                            key="designer-panel"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1 flex flex-col overflow-y-auto"
                        >
                            {/* Technical Header */}
                            <div className="p-4 bg-primary/5 border-b border-primary/10">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="p-1.5 bg-primary rounded-lg text-white">
                                        <Settings size={14} />
                                    </div>
                                    <h3 className="text-[11px] font-black uppercase tracking-widest text-primary">Configuración</h3>
                                </div>
                                <p className="text-[10px] text-slate-500 font-bold">Ajustes técnicos de precisión</p>
                            </div>

                            <div className="p-4 space-y-6 flex-1">
                                {/* Glass Type */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                        <Layers size={12} className="text-primary" />
                                        Material de Vidrio
                                    </label>
                                    <select
                                        value={glassCategory}
                                        onChange={(e) => setGlassCategory(e.target.value)}
                                        className={inputClass}
                                    >
                                        <option value="templado">Templado (Seguridad)</option>
                                        <option value="laminado">Laminado (Protección)</option>
                                        <option value="esmerilado">Esmerilado (Privacidad)</option>
                                        <option value="doble">Doble Acristalamiento</option>
                                        <option value="low-e">Low-E (Eficiencia)</option>
                                    </select>
                                </div>

                                {/* Thickness Selection */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                        <Ruler size={12} className="text-primary" />
                                        Espesor Recomendado
                                    </label>
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {['6mm', '8mm', '10mm', '12mm', '15mm', '19mm'].map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => setThickness(t)}
                                                className={cn(
                                                    "py-2 rounded-lg text-[10px] font-black transition-all border",
                                                    thickness === t
                                                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105 z-10"
                                                        : "bg-white text-slate-500 border-slate-100 hover:border-primary/30"
                                                )}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                    {pricingConfig.diccionario[glassId as keyof typeof pricingConfig.diccionario] && (
                                        <div className="flex justify-between items-center px-1">
                                            <span className="text-[10px] text-slate-400 font-bold">{selectedGlassName}</span>
                                            <span className="text-[10px] text-emerald-600 font-black">
                                                {pricingConfig.moneda}{pricingConfig.diccionario[glassId as keyof typeof pricingConfig.diccionario].precio.toLocaleString()}/m²
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Dimensions */}
                                <div className="space-y-3 pt-2">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                        <Maximize2 size={12} className="text-primary" />
                                        Corte de Precisión (m)
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Ancho</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={(widthMm / 1000).toFixed(2)}
                                                onChange={(e) => handleWidthChange(Math.round(Number(e.target.value) * 1000))}
                                                className={inputClass}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Alto</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={(heightMm / 1000).toFixed(2)}
                                                onChange={(e) => handleHeightChange(Math.round(Number(e.target.value) * 1000))}
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                                        <Info size={12} className="text-primary" />
                                        <p className="text-[9px] text-slate-500 font-bold">
                                            Área Total: <span className="text-slate-900 font-black tracking-tight">{((widthMm / 1000) * (heightMm / 1000)).toFixed(2)} m²</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Real-time Pricing Card */}
                                <AnimatePresence>
                                    {pricingResult && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="rounded-2xl bg-slate-900 p-4 shadow-xl border border-white/10"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Cotización Live</span>
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                            </div>
                                            <div className="space-y-2">
                                                {pricingResult.desglose.map((item, i) => (
                                                    item.subtotal > 0 && (
                                                        <div key={i} className="flex justify-between text-[10px]">
                                                            <span className="text-slate-500 font-medium">{item.rubro}</span>
                                                            <span className="font-bold text-slate-300">
                                                                {pricingResult.moneda}{item.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                            </span>
                                                        </div>
                                                    )
                                                ))}
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-white/10">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none">Total Venta</span>
                                                    <span className="text-xl font-black text-white leading-none">
                                                        {pricingResult.moneda}{pricingResult.totales.precioVenta.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Technical Footer Actions */}
                            <div className="p-4 bg-white/40 border-t border-white/20">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleApplyChanges}
                                    disabled={!selectedElement}
                                    className={cn(
                                        "w-full btn-premium shadow-xl transition-all",
                                        applied ? "bg-emerald-500 text-white" : "bg-primary text-white",
                                        !selectedElement && "opacity-50 grayscale cursor-not-allowed"
                                    )}
                                >
                                    {applied ? <CheckCircle2 size={18} /> : <Check size={18} />}
                                    <span className="text-sm font-bold">{applied ? 'Configuración Guardada' : 'Aplicar a Selección'}</span>
                                </motion.button>
                                <p className="text-[9px] text-slate-400 text-center mt-3 font-bold flex items-center justify-center gap-1">
                                    <MousePointer2 size={10} />
                                    {selectedElement ? 'Elemento seleccionado' : 'Selecciona un módulo en el canvas'}
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="nav-panel"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex-1 flex flex-col p-4"
                        >
                            {/* Navigation Sidebar Header */}
                            <div className="mb-8 px-2">
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-primary mb-1">WinDoor <span className="text-slate-300">SaaS</span></h3>
                                <p className="text-[10px] text-slate-500 font-bold">Gestión y Herramientas</p>
                            </div>

                            <nav className="flex-1 space-y-1.5 overflow-y-auto">
                                {menuItems.map((item) => (
                                    <motion.button
                                        key={item.id}
                                        whileHover={{ x: 5 }}
                                        onClick={() => onViewChange(item.id as ViewType)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all",
                                            activeView === item.id
                                                ? "bg-primary text-white shadow-xl shadow-primary/20"
                                                : "text-slate-600 hover:bg-slate-100"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon size={18} strokeWidth={activeView === item.id ? 2.5 : 2} />
                                            {item.label}
                                        </div>
                                        {activeView === item.id && <ChevronRight size={14} />}
                                    </motion.button>
                                ))}

                                <div className="my-6 border-t border-slate-100" />
                                
                                <div className="px-2">
                                    <Calendar variant="mini" onExpand={() => onViewChange('calendar')} />
                                    <p className="text-[9px] text-slate-400 text-center mt-3 font-bold flex items-center justify-center gap-1">
                                        <Info size={10} /> Shift + C para expandir
                                    </p>
                                </div>
                            </nav>

                            {/* Footer Links */}
                            <div className="pt-4 border-t border-slate-100 space-y-1">
                                <button 
                                    onClick={() => setShowSupportModal(true)}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-[11px] font-bold text-slate-400 hover:text-slate-800 transition-colors"
                                >
                                    <HelpCircle size={16} /> Soporte Técnico
                                </button>
                                <button 
                                    onClick={() => setShowManualModal(true)}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-[11px] font-bold text-slate-400 hover:text-slate-800 transition-colors"
                                >
                                    <FileText size={16} /> Manual de Usuario
                                </button>
                                
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => onViewChange('designer')}
                                    className="w-full mt-4 btn-primary"
                                >
                                    <Plus size={18} strokeWidth={3} />
                                    Nuevo Proyecto
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            {/* Modals */}
            <SupportModal isOpen={showSupportModal} onClose={() => setShowSupportModal(false)} />
            <UserManualModal isOpen={showManualModal} onClose={() => setShowManualModal(false)} />
        </aside>
    );
};

export default Sidebar;

