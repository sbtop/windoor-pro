import React from 'react';
import { Trash2, Plus, Minus, SplitSquareHorizontal, Layers, Settings2, Box, PenTool } from 'lucide-react';
import { DesignElement } from '../../types';
import { calcularMaterialesVentana } from '../../services/manufacturing';
import { calcularCotizacionSaaS } from '../../services/pricing';
import { useDesignerStore } from '../../store/designerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

const PropertiesPanel: React.FC = () => {
    const {
        selectedId,
        selectedElement: getSelected,
        updateElement,
        deleteElement,
        activeClient
    } = useDesignerStore();

    const { pricingConfig } = useSettingsStore();

    const element = getSelected();

    const onUpdate = (changes: Partial<DesignElement>) => {
        if (selectedId) updateElement(selectedId, changes);
    };

    const onDelete = () => {
        if (selectedId) deleteElement(selectedId);
    };

    if (!element) {
        return (
            <aside className="hidden md:flex w-96 glass-card border-y-0 border-r-0 border-l border-white/20 flex-col items-center justify-center p-8 text-center shrink-0 z-0">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-20 h-20 bg-slate-100/50 rounded-3xl flex items-center justify-center mb-6 ring-1 ring-slate-200"
                >
                    <Layers className="w-10 h-10 text-slate-300" />
                </motion.div>
                <h4 className="text-slate-900 font-black mb-2 uppercase tracking-tighter text-sm">Editor Desactivado</h4>
                <p className="text-[11px] font-bold text-slate-400 max-w-[180px] leading-relaxed italic">Selecciona un elemento en el canvas para iniciar la configuración técnica.</p>
            </aside>
        );
    }

    const baseColor = element.type === 'window' ? 'sky' : 'sky';

    const addPanel = () => {
        const n = element.panels.length;
        const ratio = 1 / (n + 1);
        const panels = [
            ...element.panels.map(p => ({ ...p, widthRatio: ratio })),
            { id: `p${Date.now()}`, widthRatio: ratio },
        ];
        onUpdate({ panels });
    };

    const removePanel = () => {
        if (element.panels.length <= 1) return;
        const n = element.panels.length - 1;
        const ratio = 1 / n;
        const panels = element.panels.slice(0, n).map(p => ({ ...p, widthRatio: ratio }));
        onUpdate({ panels });
    };

    const sectionClass = "p-5 rounded-3xl bg-white/40 border border-white/60 shadow-sm mb-4 last:mb-0";
    const labelClass = "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2";
    const inputClass = "w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl text-xs font-black text-slate-700 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-300";

    // Calculate manufacturing materials if applicable
    const calcResult = element.type === 'window' && element.material === 'aluminio'
        ? calcularMaterialesVentana({
            ancho: element.width,
            alto: element.height,
            tipo: element.openingType || 'corrediza',
            hojas: element.panels.length,
            glassType: element.glassType || 'vidrio_6mm'
        })
        : null;

    const pricingResult = calcResult ? calcularCotizacionSaaS(calcResult, pricingConfig) : null;
    const cristalesDisponibles = Object.entries(pricingConfig.diccionario).filter(([key]) => key.startsWith('vidrio_'));    return (
        <aside className={cn(
            "fixed bottom-0 left-0 right-0 z-50 md:relative md:w-96 md:h-full flex flex-col shrink-0",
            "glass-card border-none rounded-t-[40px] md:rounded-none shadow-2xl overflow-hidden"
        )}>
            {/* Mobile Header Grabber */}
            <div className="md:hidden w-full flex justify-center py-4 bg-white/20 sticky top-0 z-10">
                <div className="w-16 h-1.5 bg-slate-200/50 rounded-full" />
            </div>

            <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex-1 overflow-y-auto custom-scrollbar"
            >
                {/* Panel Header */}
                <div className="p-8 pb-6 border-b border-slate-100 bg-gradient-to-br from-white/80 to-slate-50/50">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white",
                                    element.type === 'window' ? 'bg-primary' : 'bg-sky-500'
                                )}>
                                    {element.type === 'window' ? 'Ventana' : 'Puerta'}
                                </span>
                                <span className="text-[10px] font-bold text-slate-300">#{element.id.split('-').pop()}</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Parámetros Técnicos</h3>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onDelete}
                            className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center transition-colors border border-red-100"
                        >
                            <Trash2 size={20} />
                        </motion.button>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    {/* Bento Box: Dimensiones */}
                    <div className={sectionClass}>
                        <span className={labelClass}>
                            <Settings2 size={12} className="text-primary" />
                            Dimensiones (m)
                        </span>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Ancho</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={Number((element.width / 1000).toFixed(2))}
                                    onChange={e => onUpdate({ width: Math.max(100, Number(e.target.value) * 1000) })}
                                    className={inputClass}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Alto</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={Number((element.height / 1000).toFixed(2))}
                                    onChange={e => onUpdate({ height: Math.max(100, Number(e.target.value) * 1000) })}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bento Box: Construcción */}
                    <div className={sectionClass}>
                        <span className={labelClass}>
                            <Box size={12} className="text-primary" />
                            Especificaciones
                        </span>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block">Material del Perfil</label>
                                <div className="flex gap-2 p-1 bg-slate-100/50 rounded-2xl ring-1 ring-slate-200">
                                    {(['aluminio', 'upvc'] as const).map(m => (
                                        <button
                                            key={m}
                                            onClick={() => onUpdate({ material: m })}
                                            className={cn(
                                                "flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                element.material === m ? "bg-white text-primary shadow-sm ring-1 ring-slate-200" : "text-slate-400 hover:text-slate-600"
                                            )}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {element.type === 'window' && (
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Tipo de Apertura</label>
                                    <select
                                        value={element.openingType || 'corrediza'}
                                        onChange={e => onUpdate({ openingType: e.target.value as any })}
                                        className={inputClass}
                                    >
                                        <option value="corrediza">Corrediza Central</option>
                                        <option value="fija">Fijo Arquitectónico</option>
                                        <option value="abatible">Abatible / Oscilo</option>
                                    </select>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Tipo de Acristalamiento</label>
                                <select
                                    value={element.glassType || 'vidrio_6mm'}
                                    onChange={e => onUpdate({ glassType: e.target.value })}
                                    className={inputClass}
                                >
                                    {cristalesDisponibles.map(([id, mat]) => (
                                        <option key={id} value={id}>{mat.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Bento Box: Hojas */}
                    <div className={cn(sectionClass, "bg-slate-900 border-none shadow-xl")}>
                        <span className={cn(labelClass, "text-slate-500")}>
                            <SplitSquareHorizontal size={12} className="text-primary" />
                            Configuración de Hojas
                        </span>
                        <div className="flex items-center justify-between gap-6 py-2">
                            <motion.button 
                                whileTap={{ scale: 0.9 }}
                                onClick={removePanel} 
                                disabled={element.panels.length <= 1} 
                                className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-2xl flex items-center justify-center disabled:opacity-20 transition-all border border-white/5"
                            >
                                <Minus size={20} />
                            </motion.button>
                            <div className="text-center">
                                <span className="text-4xl font-black text-white tracking-tighter">{element.panels.length}</span>
                                <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mt-1">Hojas</p>
                            </div>
                            <motion.button 
                                whileTap={{ scale: 0.9 }}
                                onClick={addPanel} 
                                className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20"
                            >
                                <Plus size={20} />
                            </motion.button>
                        </div>
                    </div>

                    {/* Engineering Details */}
                    {calcResult && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={sectionClass}
                        >
                            <span className={cn(labelClass, "text-sky-600")}>
                                <Layers size={12} /> Ingeniería de Despiece
                            </span>
                            <div className="space-y-3">
                                <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100/50">
                                    <div className="flex justify-between items-center text-[11px] font-black mb-1">
                                        <span className="text-sky-900/60 uppercase tracking-widest">Área Total</span>
                                        <span className="text-sky-600 font-display text-lg">{calcResult.resumen.areaVidrioM2} m²</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-sky-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-sky-500 w-[60%]" />
                                    </div>
                                </div>
                                <ul className="space-y-2">
                                    {[...calcResult.perfiles.marco, ...calcResult.perfiles.hojas].slice(0, 3).map((p, i) => (
                                        <li key={i} className="flex justify-between items-center text-[10px] font-bold">
                                            <span className="text-slate-500 uppercase tracking-tight truncate max-w-[150px]">
                                                {pricingConfig.diccionario[p.id as keyof typeof pricingConfig.diccionario]?.nombre || p.tipo}
                                            </span>
                                            <span className="text-slate-900 border-b border-slate-100">{p.totalLinealM} m</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    )}

                    {/* Final Pricing Card */}
                    {pricingResult && (
                        <motion.div 
                            whileHover={{ y: -5 }}
                            className="p-6 rounded-[32px] bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-2xl relative overflow-hidden group"
                        >
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-emerald-300 uppercase tracking-[0.2em] mb-4">Estimación Comercial</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black tracking-tighter">
                                        {pricingResult.moneda}{pricingResult.totales.precioVenta.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                                    </span>
                                    <span className="text-xs font-bold text-emerald-300">.{(pricingResult.totales.precioVenta % 1).toFixed(2).split('.')[1]}</span>
                                </div>
                                <p className="text-[9px] font-bold text-emerald-200 mt-2 italic flex items-center gap-1">
                                    <PenTool size={10} /> Sujeto a ajustes de remates y viáticos
                                </p>
                            </div>
                            <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12 group-hover:scale-110 transition-transform">
                                <Box size={140} />
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </aside>
    );
};

export default PropertiesPanel;
