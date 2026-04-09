import React, { useState, useEffect, useMemo } from 'react';
import { ViewType } from '../../types';
import { useDesignerStore } from '../../store/designerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { calcularMaterialesVentana } from '../../services/manufacturing';
import { calcularCotizacionSaaS } from '../../services/pricing';
import Calendar from '../Calendar';

interface SidebarProps {
    activeView: ViewType;
    onViewChange: (view: ViewType) => void;
}

// Map espesor label → dictionary ID
const THICKNESS_TO_DICT_ID: Record<string, string> = {
    '6mm': 'vidrio_6mm',
    '8mm': 'vidrio_8mm',
    '10mm': 'vidrio_10mm',
    '12mm': 'vidrio_12mm',
    '15mm': 'vidrio_15mm',
    '19mm': 'vidrio_19mm',
};

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
    const [glassCategory, setGlassCategory] = useState('templado');
    const [thickness, setThickness] = useState('6mm');
    const [hardware, setHardware] = useState('standard');
    const [maxWeight, setMaxWeight] = useState(150);
    const [tolerance, setTolerance] = useState(2);
    const [applied, setApplied] = useState(false);

    const { elements, selectedId, updateElement } = useDesignerStore();
    const { pricingConfig } = useSettingsStore();

    const selectedElement = selectedId
        ? elements.find(el => el.id === selectedId)
        : elements.length === 1 ? elements[0] : null;

    const widthMm = selectedElement?.width || 1500;
    const heightMm = selectedElement?.height || 1200;

    const isDesignerView = activeView === 'designer' || activeView === 'window' || activeView === 'door';

    const configItems = [
        { id: 'window', label: 'Nueva Ventana', icon: 'window' },
        { id: 'door', label: 'Nueva Puerta', icon: 'door_open' },
    ];

    const toolsItems = [
        { id: 'calculator', label: 'Calculadora', icon: 'straighten' },
        { id: 'clients', label: 'Clientes', icon: 'people' },
        { id: 'projects', label: 'Proyectos', icon: 'folder_open' },
        { id: 'reports', label: 'Reportes', icon: 'analytics' },
        { id: 'calendar', label: 'Agenda', icon: 'calendar_month' },
    ];

    const handleWidthChange = (value: number) => {
        if (selectedElement && selectedId) updateElement(selectedId, { width: value });
    };

    const handleHeightChange = (value: number) => {
        if (selectedElement && selectedId) updateElement(selectedId, { height: value });
    };

    // ── LIVE PRICING CALCULATION ─────────────────────────────────────
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

    // ── APPLY CHANGES → persist config to the element ────────────────
    const handleApplyChanges = () => {
        if (selectedElement && selectedId) {
            updateElement(selectedId, { glassType: glassId });
        }
        setApplied(true);
        setTimeout(() => setApplied(false), 1800);
    };

    const inputClass = "w-full px-3 py-2 bg-white border border-primary/10 rounded-md text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20";

    // ─────────────────────────────────────────────────────────────────
    // DESIGNER PANEL
    // ─────────────────────────────────────────────────────────────────
    if (isDesignerView) {
        return (
            <aside className="hidden md:flex fixed left-0 top-16 h-[calc(100vh-64px)] w-72 bg-surface-container-low border-r border-primary/10 flex-col z-40 overflow-y-auto">
                {/* Header */}
                <div className="p-4 border-b border-slate-200">
                    <h3 className="font-body text-xs font-black uppercase tracking-widest text-slate-700">Configuración Técnica</h3>
                    <p className="text-[10px] text-slate-800 font-medium">Parámetros de diseño y materiales</p>
                </div>

                <div className="flex-1 p-4 space-y-6">
                    {/* Glass Type / Category */}
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">check_box_outline_blank</span>
                            Tipo de Vidrio
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

                    {/* Thickness → Maps to dictionary key */}
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">straighten</span>
                            Espesor
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {['6mm', '8mm', '10mm', '12mm', '15mm', '19mm'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setThickness(t)}
                                    className={`py-2 px-3 rounded-md text-xs font-bold transition-all ${thickness === t
                                        ? 'bg-primary text-white shadow-md'
                                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-primary/10'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                        {/* Show corresponding price */}
                        {pricingConfig.diccionario[glassId as keyof typeof pricingConfig.diccionario] && (
                            <p className="text-[10px] text-emerald-700 font-bold text-right">
                                {selectedGlassName} — {pricingConfig.moneda}{pricingConfig.diccionario[glassId as keyof typeof pricingConfig.diccionario].precio.toLocaleString()}/m²
                            </p>
                        )}
                    </div>

                    {/* Hardware */}
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">settings</span>
                            Herrajes y Perfiles
                        </label>
                        <select
                            value={hardware}
                            onChange={(e) => setHardware(e.target.value)}
                            className={inputClass}
                        >
                            <option value="standard">Estándar Aluminio</option>
                            <option value="premium">Premium Inoxidable</option>
                            <option value="minimal">Minimalista Oculto</option>
                            <option value="industrial">Industrial Reforzado</option>
                        </select>
                    </div>

                    {/* Dimensions */}
                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">square_foot</span>
                            Dimensiones (m)
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <span className="text-[10px] text-slate-400 block mb-1">Ancho (m)</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={(widthMm / 1000).toFixed(2)}
                                    onChange={(e) => handleWidthChange(Math.round(Number(e.target.value) * 1000))}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 block mb-1">Alto (m)</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={(heightMm / 1000).toFixed(2)}
                                    onChange={(e) => handleHeightChange(Math.round(Number(e.target.value) * 1000))}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400">
                            Área Total: <strong className="text-slate-700">{((widthMm / 1000) * (heightMm / 1000)).toFixed(2)} m²</strong>
                        </p>
                    </div>

                    {/* ── REAL-TIME QUOTE PREVIEW ─────────────── */}
                    {pricingResult && (
                        <div className="rounded-xl bg-slate-900 p-4 space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cotización en Tiempo Real</p>
                            {pricingResult.desglose.map((item, i) => (
                                item.subtotal > 0 && (
                                    <div key={i} className="flex justify-between text-xs">
                                        <span className="text-slate-400">{item.rubro}</span>
                                        <span className="font-bold text-white">
                                            {pricingResult.moneda}{item.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                )
                            ))}
                            <div className="border-t border-slate-700 pt-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Precio de Venta</span>
                                    <span className="text-lg font-black text-emerald-400">
                                        {pricingResult.moneda}{pricingResult.totales.precioVenta.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {!selectedElement && (
                        <div className="text-center py-4">
                            <p className="text-xs text-slate-400 font-medium">Añade una ventana al canvas para ver la cotización en tiempo real.</p>
                        </div>
                    )}

                    {/* Structural Constraints */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">warning</span>
                            Restricciones Estructurales
                        </label>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                    <span>Peso Máx. (kg)</span>
                                    <span className="font-bold text-primary">{maxWeight}kg</span>
                                </div>
                                <input
                                    type="range" min="50" max="500" value={maxWeight}
                                    onChange={(e) => setMaxWeight(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                    <span>Tolerancia</span>
                                    <span className="font-bold text-primary">±{tolerance}mm</span>
                                </div>
                                <input
                                    type="range" min="1" max="10" value={tolerance}
                                    onChange={(e) => setTolerance(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Apply Changes Button */}
                <div className="p-4 border-t border-primary/5 bg-surface-container-high/30">
                    <button
                        onClick={handleApplyChanges}
                        disabled={!selectedElement}
                        className={`w-full font-bold py-3 rounded-md text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${
                            applied
                                ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                                : selectedElement
                                    ? 'bg-primary text-white shadow-primary/20 hover:bg-primary/90'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        <span className="material-symbols-outlined text-sm">{applied ? 'check_circle' : 'check'}</span>
                        {applied ? '¡Cambios Aplicados!' : 'Aplicar Cambios'}
                    </button>
                    <p className="text-[10px] text-slate-400 text-center mt-2">
                        {selectedElement
                            ? `Ventana ${(widthMm/1000).toFixed(2)}m × ${(heightMm/1000).toFixed(2)}m · ${selectedGlassName}`
                            : 'Selecciona un elemento en el canvas'}
                    </p>
                </div>
            </aside>
        );
    }

    // ─────────────────────────────────────────────────────────────────
    // NAVIGATION SIDEBAR (non-designer views)
    // ─────────────────────────────────────────────────────────────────
    return (
        <aside className="hidden md:flex fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-surface-container-low border-r border-primary/10 flex-col p-4 space-y-2 z-40">
            {/* Header */}
            <div className="mb-6 px-4">
                <h3 className="font-body text-xs font-black uppercase tracking-widest text-slate-800">Menú Principal</h3>
                <p className="text-[10px] text-slate-800 font-bold">WinDoor Pro v2.0</p>
            </div>

            <nav className="flex-1 space-y-1">
                {configItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onViewChange(item.id as ViewType)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer active:opacity-80 hover:translate-x-1 ${activeView === item.id
                            ? 'bg-primary text-on-primary shadow-lg shadow-slate-900/40'
                            : 'text-slate-800 hover:bg-slate-200'
                        }`}
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        {item.label}
                    </button>
                ))}

                <div className="my-4 border-t border-primary/5" />

                {toolsItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onViewChange(item.id as ViewType)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer active:opacity-80 hover:translate-x-1 ${activeView === item.id
                            ? 'bg-primary text-on-primary shadow-lg shadow-slate-900/40'
                            : 'text-slate-800 hover:bg-slate-200'
                        }`}
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        {item.label}
                    </button>
                ))}

                <div className="mt-6 px-2">
                    <Calendar
                        variant="mini"
                        onExpand={() => onViewChange('calendar')}
                    />
                    <p className="text-[10px] text-slate-400 text-center mt-2 font-medium">
                        Click para expandir calendario
                    </p>
                </div>
            </nav>

            {/* Footer */}
            <div className="pt-4 border-t border-primary/5 space-y-1">
                <button
                    onClick={() => alert('Centro de Ayuda: Próximamente disponible')}
                    className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 hover:bg-white/50 rounded-r-lg font-body text-sm transition-all hover:translate-x-1"
                >
                    <span className="material-symbols-outlined">help</span>
                    Ayuda
                </button>
                <button
                    onClick={() => alert('Manual de Usuario: Próximamente disponible')}
                    className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 hover:bg-white/50 rounded-r-lg font-body text-sm transition-all hover:translate-x-1"
                >
                    <span className="material-symbols-outlined">description</span>
                    Documentación
                </button>

                <div className="mt-4 px-2">
                    <button
                        onClick={() => {
                            const { clearCanvas, setActiveClient } = useDesignerStore.getState();
                            clearCanvas();
                            setActiveClient(null);
                            onViewChange('window');
                        }}
                        className="w-full bg-primary text-white font-bold py-3 rounded-md text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all hover:bg-primary/90"
                    >
                        Crear Proyecto
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
