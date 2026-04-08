import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, RefreshCw, Ruler, Box, Package } from 'lucide-react';
import { ViewType } from '../types';
import { useSettingsStore } from '../store/settingsStore';
import { MaterialDictionary } from '../services/pricing';
import { useUserStore } from '../store/userStore';

interface SettingsPageProps {
    onViewChange: (view: ViewType) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onViewChange }) => {
    const { pricingConfig, updatePricingConfig, resetPricingConfig } = useSettingsStore();
    const { currentUser, setDisplayName } = useUserStore();

    // Estado local para edición fluida
    const [localConfig, setLocalConfig] = useState(pricingConfig);
    const [localName, setLocalName] = useState(currentUser?.name || '');
    const [savedState, setSavedState] = useState(false);

    useEffect(() => {
        setLocalConfig(pricingConfig);
    }, [pricingConfig]);

    const handleSave = (e?: React.FormEvent) => {
        if(e) e.preventDefault();
        
        // Guardar ajustes de precio
        updatePricingConfig(localConfig);
        
        // Guardar nombre de usuario si cambió
        if (localName.trim() && localName !== currentUser?.name) {
            setDisplayName(localName.trim());
        }

        setSavedState(true);
        setTimeout(() => setSavedState(false), 2000);
    };

    const handleReset = () => {
        if(window.confirm('¿Estás seguro de restaurar los nombres y precios predeterminados?')) {
            resetPricingConfig();
        }
    };

    const handleDicChange = (key: keyof MaterialDictionary, field: 'nombre' | 'precio', value: string | number) => {
        setLocalConfig((prev) => ({
            ...prev,
            diccionario: {
                ...prev.diccionario,
                [key]: {
                    ...prev.diccionario[key],
                    [field]: field === 'precio' ? Number(value) : value
                }
            }
        }));
    };

    return (
        <div className="p-6 md:p-12 max-w-6xl mx-auto min-h-full">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h3 className="text-2xl md:text-3xl font-display font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <Settings className="w-8 h-8 text-primary" />
                        Ajustes & Diccionario
                    </h3>
                    <p className="text-slate-500 font-medium mt-1">Configura el nombre local y el precio unitario exacto de cada insumo comercial.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={handleReset}
                        className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold shadow-sm transition-all hover:bg-slate-50"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Restaurar Valores
                    </button>
                    <button 
                        onClick={handleSave}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-2xl font-bold shadow-lg shadow-slate-900/40 transition-all hover:opacity-90 active:scale-95"
                    >
                        {savedState ? <CheckCircle2 className="w-5 h-5 text-emerald-300" /> : <Save className="w-5 h-5" />}
                        {savedState ? 'Guardado' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-8 pb-12">
                
                {/* 0. PERFIL DE USUARIO */}
                <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-soft-xl relative overflow-hidden">
                    <h4 className="text-xl font-display font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">person</span>
                        Mi Perfil
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">
                                Nombre de la Empresa / Tu Nombre
                            </label>
                            <input 
                                type="text" 
                                value={localName}
                                onChange={(e) => setLocalName(e.target.value)}
                                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 focus:outline-none focus:border-primary transition-all placeholder:text-slate-400"
                                placeholder="Nombre visible en reportes"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">
                                Correo Electrónico (No modificable)
                            </label>
                            <input 
                                type="email" 
                                value={currentUser?.email || ''}
                                disabled
                                className="w-full px-5 py-4 bg-slate-100 border-2 border-slate-200 rounded-2xl font-bold text-slate-500 cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>

                {/* 1. GLOBALES FINANCIEROS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-slate-900 rounded-[32px] p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
                        <h4 className="text-xl font-display font-bold text-white mb-6">Márgenes y Divisa</h4>
                        
                        <div className="grid grid-cols-2 gap-6 relative z-10">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">
                                    Símbolo de Moneda
                                </label>
                                <input 
                                    type="text" 
                                    value={localConfig.moneda}
                                    onChange={(e) => setLocalConfig({...localConfig, moneda: e.target.value})}
                                    onBlur={() => handleSave()}
                                    className="w-full px-5 py-4 bg-slate-800 border-2 border-slate-700 rounded-2xl text-xl font-black text-white focus:outline-none focus:border-emerald-500 transition-all text-center uppercase"
                                    maxLength={4}
                                />
                                <p className="text-xs text-slate-500 font-medium text-center">Ej. $, €, COP, PEN</p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-emerald-400 uppercase tracking-widest block">
                                    Margen de Ganancia Global
                                </label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={Number((localConfig.margenGanancia * 100).toFixed(1))}
                                        onChange={(e) => setLocalConfig({...localConfig, margenGanancia: Number(e.target.value) / 100})}
                                        onBlur={() => handleSave()}
                                        step="0.1" max="100" min="0"
                                        className="w-full pl-6 pr-12 py-4 bg-slate-800 border-2 border-slate-700 rounded-2xl text-xl font-black text-emerald-400 focus:outline-none focus:border-emerald-500 transition-all"
                                    />
                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-lg font-black text-emerald-400/50">%</span>
                                </div>
                                <p className="text-xs text-slate-500 font-medium">Margen a sumar post-fabricación.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-soft-xl flex flex-col justify-center">
                        <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Simulador Rápido</h5>
                        <p className="text-sm font-medium text-slate-600 mb-6">Basado en un Costo Directo simulado de fábrica de 10,000 unidades.</p>
                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase">Costo Base</p>
                                <p className="text-xl font-bold text-slate-800">{localConfig.moneda}10,000.00</p>
                            </div>
                            <div className="text-xl text-slate-300 font-light">+</div>
                            <div>
                                <p className="text-xs font-bold text-emerald-600 uppercase">Margen Ganancia</p>
                                <p className="text-xl font-bold text-emerald-600">{localConfig.moneda}{(10000 * localConfig.margenGanancia).toLocaleString('es-MX', {minimumFractionDigits: 2})}</p>
                            </div>
                            <div className="text-xl text-slate-300 font-light">=</div>
                            <div className="text-right">
                                <p className="text-xs font-black text-slate-900 uppercase">Precio Venta</p>
                                <p className="text-2xl font-black text-slate-900">{localConfig.moneda}{(10000 * (1 + localConfig.margenGanancia)).toLocaleString('es-MX', {minimumFractionDigits: 2})}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. DICCIONARIO DE MATERIALES */}
                <div className="bg-white rounded-[32px] overflow-hidden border border-slate-200 shadow-soft-xl">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                        <h4 className="text-xl font-display font-bold text-slate-900 mb-2">Diccionario de Materiales (Internacional)</h4>
                        <p className="text-sm text-slate-500">Personaliza cómo se llama cada refacción en tu país y establece su costo unitario.</p>
                    </div>
                    
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-100/50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <th className="p-4 pl-8">Categoría</th>
                                    <th className="p-4">Identificador Fijo</th>
                                    <th className="p-4 w-1/3">Nombre Público (Configurable)</th>
                                    <th className="p-4">Unidad</th>
                                    <th className="p-4 pr-8 text-right">Precio Unitario</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {Object.entries(localConfig.diccionario).map(([key, item]) => {
                                    // Determinar icono
                                    let Icon = Box;
                                    let catBg = "bg-slate-100 text-slate-600";
                                    let catName = "Accesorio";
                                    
                                    if(item.unidad === 'ml') { Icon = Ruler; catBg = "bg-indigo-100 text-indigo-700"; catName = "Perfil"; }
                                    if(item.unidad === 'm2') { Icon = Package; catBg = "bg-sky-100 text-sky-700"; catName = "Cristal"; }

                                    return (
                                        <tr key={key} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4 pl-8 align-middle">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${catBg}`}>
                                                    <Icon className="w-3 h-3" />
                                                    {catName}
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <code className="text-[11px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">#{key}</code>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <input 
                                                    type="text" 
                                                    value={item.nombre}
                                                    onChange={e => handleDicChange(key as keyof MaterialDictionary, 'nombre', e.target.value)}
                                                    onBlur={() => handleSave()}
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                />
                                            </td>
                                            <td className="p-4 align-middle">
                                                <span className="text-xs font-bold text-slate-400 uppercase">{item.unidad}</span>
                                            </td>
                                            <td className="p-4 pr-8 align-middle text-right">
                                                <div className="inline-flex items-center relative">
                                                    <span className="absolute left-3 text-sm font-bold text-slate-400">{localConfig.moneda}</span>
                                                    <input 
                                                        type="number" 
                                                        value={item.precio}
                                                        onChange={e => handleDicChange(key as keyof MaterialDictionary, 'precio', e.target.value)}
                                                        onBlur={() => handleSave()}
                                                        step="0.01" min="0"
                                                        className="w-32 pl-8 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-800 text-right focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default SettingsPage;
