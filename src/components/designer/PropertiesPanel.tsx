import React from 'react';
import { Trash2, Plus, Minus, SplitSquareHorizontal, Layers, Settings2, Box, PenTool } from 'lucide-react';
import { DesignElement } from '../../types';
import { calcularMaterialesVentana } from '../../services/manufacturing';
import { calcularCotizacionSaaS } from '../../services/pricing';
import { useDesignerStore } from '../../store/designerStore';
import { useSettingsStore } from '../../store/settingsStore';

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
            <aside className="hidden md:flex w-80 bg-white border-l border-slate-200 flex-col items-center justify-center p-8 text-center shrink-0 z-0">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                    <Layers className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-sm font-bold text-slate-400">Selecciona un elemento en el canvas para editar sus propiedades.</p>
            </aside>
        );
    }

    const baseColor = element.type === 'window' ? 'indigo' : 'sky';

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

    const sectionClass = "mb-6 pb-6 border-b border-slate-100 last:border-b-0 last:mb-0 last:pb-0";
    const labelClass = "text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block";
    const inputClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all";

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
    const cristalesDisponibles = Object.entries(pricingConfig.diccionario).filter(([key]) => key.startsWith('vidrio_'));

    return (
        <aside className="fixed bottom-16 left-0 right-0 z-40 bg-white rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] max-h-[70vh] md:max-h-full flex flex-col overflow-y-auto shrink-0 custom-scrollbar md:translate-y-0 transition-transform duration-300 md:relative md:bottom-auto md:w-80 md:rounded-none md:shadow-none md:border-l md:border-slate-200">
            {/* Grab handle for mobile */}
            <div className="md:hidden w-full flex justify-center py-3 bg-white sticky top-0 z-10 rounded-t-[32px]">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
            </div>

            {/* Panel Header */}
            <div className={`p-6 md:pt-6 pt-2 border-b border-slate-100 bg-${baseColor}-50`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-display font-bold text-slate-900 capitalize">{element.type === 'window' ? 'Ventana' : 'Puerta'}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">{element.id}</p>
                            {activeClient && (
                                <>
                                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest leading-none">{activeClient.name}</p>
                                </>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onDelete}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="p-6 flex-1">
                {/* ─ Dimensions ─────────────── */}
                <div className={sectionClass}>
                    <span className={labelClass}>
                        <Settings2 className="w-3.5 h-3.5 inline mr-1.5" />
                        Dimensiones (Metros)
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-slate-500 mb-1 block">Ancho (m)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.1"
                                value={Number((element.width / 1000).toFixed(2))}
                                onChange={e => onUpdate({ width: Math.max(100, Number(e.target.value) * 1000) })}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 mb-1 block">Alto (m)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.1"
                                value={Number((element.height / 1000).toFixed(2))}
                                onChange={e => onUpdate({ height: Math.max(100, Number(e.target.value) * 1000) })}
                                className={inputClass}
                            />
                        </div>
                    </div>
                </div>

                {/* ─ Material & Type ──────────── */}
                <div className={sectionClass}>
                    <span className={labelClass}>Configuración</span>

                    <div className="mb-4">
                        <label className="text-xs font-medium text-slate-500 mb-2 block">Material</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['aluminio', 'upvc'] as const).map(m => (
                                <button
                                    key={m}
                                    onClick={() => onUpdate({ material: m })}
                                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${element.material === m ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-100' : 'border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-500'}`}
                                >
                                    {m === 'aluminio' ? 'Aluminio' : 'uPVC'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {element.type === 'window' && (
                        <div className="mb-4">
                            <label className="text-xs font-medium text-slate-500 mb-2 block">Apertura</label>
                            <select
                                value={element.openingType || 'corrediza'}
                                onChange={e => onUpdate({ openingType: e.target.value as any })}
                                className={inputClass}
                            >
                                <option value="corrediza">Corrediza</option>
                                <option value="fija">Fija</option>
                                <option value="abatible">Abatible</option>
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-medium text-slate-500 mb-2 block">Cristal / Vidrio</label>
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

                {/* ─ Panels / Hojas ─────────── */}
                <div className={sectionClass}>
                    <span className={labelClass}>
                        <SplitSquareHorizontal className="w-3.5 h-3.5 inline mr-1.5" />
                        Hojas / Paneles
                    </span>
                    <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4">
                        <button onClick={removePanel} disabled={element.panels.length <= 1} className="w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-500 disabled:opacity-30 transition-all shadow-soft-sm">
                            <Minus className="w-4 h-4" />
                        </button>
                        <div className="text-center">
                            <span className="text-3xl font-display font-bold text-slate-900">{element.panels.length}</span>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">hojas</p>
                        </div>
                        <button onClick={addPanel} className="w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-green-50 hover:border-green-200 hover:text-green-500 transition-all shadow-soft-sm">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* ─ Manufacturing Calculation ─────────── */}
                {calcResult && (
                    <div className="mt-8 pt-6 border-t border-slate-200">
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Box className="w-4 h-4" /> Ingeniería (Aluminio)
                        </span>

                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-4">
                            {/* Summary */}
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Cristales</p>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-600 font-medium">Área de Vidrio:</span>
                                    <span className="font-bold text-slate-900">{calcResult.resumen.areaVidrioM2} m²</span>
                                </div>
                            </div>

                            {/* Profiles */}
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Perfiles Requeridos</p>
                                <ul className="space-y-2">
                                    {[...calcResult.perfiles.marco, ...calcResult.perfiles.hojas, ...calcResult.perfiles.junquillos].map((p, i) => (
                                        <li key={i} className="flex justify-between items-start text-xs border-b border-slate-200/50 pb-2 last:border-0 last:pb-0">
                                            <span className="text-slate-600 leading-tight">
                                                <span className="font-bold text-slate-900">{p.cantidad}x</span> {pricingConfig.diccionario[p.id as keyof typeof pricingConfig.diccionario]?.nombre || p.tipo}
                                            </span>
                                            <span className="font-bold text-slate-900 ml-2 whitespace-nowrap">{p.totalLinealM} m</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Accessories */}
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><PenTool className="w-3 h-3" /> Accesorios</p>
                                <ul className="space-y-2">
                                    {calcResult.accesorios.map((a, i) => (
                                        <li key={i} className="flex justify-between items-center text-xs">
                                            <span className="text-slate-600 leading-tight">{pricingConfig.diccionario[a.id as keyof typeof pricingConfig.diccionario]?.nombre || a.nombre}</span>
                                            <span className="font-bold text-slate-900 ml-2 whitespace-nowrap">{a.cantidad} {a.unidad}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─ Quotation / Pricing ─────────── */}
                {pricingResult && (
                    <div className="mt-8 pt-6 border-t border-slate-200 mb-8">
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                            Cotización (SaaS Estimado)
                        </span>

                        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 space-y-4">
                            {/* Cost Desglose */}
                            <div>
                                <ul className="space-y-2">
                                    {pricingResult.desglose.map((item, i) => (
                                        <li key={i} className="flex justify-between items-center text-xs">
                                            <span className="text-emerald-700/80">{item.rubro}</span>
                                            <span className="font-medium text-emerald-900">{pricingResult.moneda}{item.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="border-t border-emerald-200/50 pt-3">
                                <div className="flex justify-between items-center text-sm mb-1">
                                    <span className="text-emerald-800 font-medium">Costo Total Directo:</span>
                                    <span className="font-bold text-emerald-900">{pricingResult.moneda}{pricingResult.totales.costoDirecto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs mb-3">
                                    <span className="text-emerald-700/80">Margen de Ganancia ({pricingResult.totales.margenPorcentaje}%):</span>
                                    <span className="font-medium text-emerald-800">+{pricingResult.moneda}{pricingResult.totales.gananciaBruta.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                </div>

                                <div className="flex justify-between items-end mt-4 p-3 bg-white/60 rounded-xl">
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none">Precio<br />Venta</span>
                                    <span className="text-xl font-display font-black text-emerald-900 leading-none">
                                        {pricingResult.moneda}{pricingResult.totales.precioVenta.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

            </div>
        </aside>
    );
};

export default PropertiesPanel;
