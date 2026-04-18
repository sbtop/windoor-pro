import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, RefreshCw, Ruler, Box, Package, User, Building2, Globe, ShieldCheck, Mail, Upload, X, MapPin, Phone } from 'lucide-react';
import { ViewType } from '../types';
import { useSettingsStore } from '../store/settingsStore';
import { MaterialDictionary } from '../services/pricing';
import { useUserContext } from '../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsPageProps {
    onViewChange: (view: ViewType) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onViewChange }) => {
    const { pricingConfig, updatePricingConfig, resetPricingConfig, companyProfile, updateCompanyProfile } = useSettingsStore();
    const { currentUser, setDisplayName } = useUserContext();

    const [localConfig, setLocalConfig] = useState(pricingConfig);
    const [localName, setLocalName] = useState(currentUser?.name || '');
    const [localProfile, setLocalProfile] = useState(companyProfile);
    const [savedState, setSavedState] = useState(false);

    useEffect(() => {
        setLocalConfig(pricingConfig);
        setLocalProfile(companyProfile);
    }, [pricingConfig, companyProfile]);

    const handleSave = (e?: React.FormEvent) => {
        if(e) e.preventDefault();
        updatePricingConfig(localConfig);
        updateCompanyProfile(localProfile);
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

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('El logo no debe superar los 2MB.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setLocalProfile(prev => ({ ...prev, logoBase64: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="p-8 md:p-12 max-w-7xl mx-auto min-h-screen">
            {/* 📋 Modern Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12"
            >
                <div>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
                        <Settings size={32} className="text-primary" />
                        Configuración Maestra
                    </h3>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2 ml-12">
                        Gestión de Perfil & Diccionario de Insumos
                    </p>
                </div>
                <div className="flex gap-4">
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleReset}
                        className="flex items-center justify-center gap-2 px-6 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-red-500 transition-all"
                    >
                        <RefreshCw size={14} />
                        Reset
                    </motion.button>
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all"
                    >
                        {savedState ? <CheckCircle2 size={16} /> : <Save size={16} />}
                        {savedState ? 'Actualizado' : 'Guardar Cambios'}
                    </motion.button>
                </div>
            </motion.div>

            <form onSubmit={handleSave} className="space-y-10 pb-20">
                
                {/* 👤 MARCA BLANCA Y PERFIL DE USUARIO */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-10 border-white/60 shadow-xl"
                >
                    <h4 className="text-sm font-black text-slate-900 mb-8 uppercase tracking-[0.2em] flex items-center gap-3">
                        <Building2 size={18} className="text-primary" />
                        Identidad Corporativa (Marca Blanca)
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Logo Upload Section */}
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block mb-3">
                                Logo Comercial (PDFs y Reportes)
                            </label>
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
                                    {localProfile.logoBase64 ? (
                                        <>
                                            <img src={localProfile.logoBase64} alt="Company Logo" className="w-full h-full object-contain p-2" />
                                            <button 
                                                type="button"
                                                onClick={() => setLocalProfile(prev => ({ ...prev, logoBase64: null }))}
                                                className="absolute inset-0 bg-red-500/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={24} />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-slate-300 flex flex-col items-center">
                                            <Building2 size={24} />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex-1">
                                    <label className="cursor-pointer flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-slate-100 rounded-xl font-bold text-xs text-slate-600 hover:border-primary hover:text-primary transition-all">
                                        <Upload size={16} />
                                        <span>Subir Imagen</span>
                                        <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleLogoUpload} />
                                    </label>
                                    <p className="text-[10px] text-slate-400 mt-3 font-semibold px-2">PNG o JPG. Recomendado: fondo transparente y máx 2MB.</p>
                                </div>
                            </div>
                        </div>

                        {/* Company Settings */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block">
                                    Razón Social / Comercial (PDFs)
                                </label>
                                <div className="relative group">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        value={localProfile.companyName}
                                        onChange={(e) => setLocalProfile(prev => ({ ...prev, companyName: e.target.value }))}
                                        className="w-full pl-12 pr-6 py-4 bg-white border-2 border-slate-50 rounded-2xl font-black text-slate-900 outline-none focus:border-primary transition-all"
                                        placeholder="Nombre que verán los clientes"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 pt-4 border-t border-slate-100">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block">
                                    Email de Salida (para cotizaciones)
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="email"
                                        value={localProfile.email || ''}
                                        onChange={(e) => setLocalProfile(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full pl-12 pr-6 py-4 bg-white border-2 border-slate-50 rounded-2xl font-black text-slate-900 outline-none focus:border-primary transition-all"
                                        placeholder="tu@email.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 pt-4 border-t border-slate-100">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block">
                                    Dirección de la Empresa
                                </label>
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        value={localProfile.address || ''}
                                        onChange={(e) => setLocalProfile(prev => ({ ...prev, address: e.target.value }))}
                                        className="w-full pl-12 pr-6 py-4 bg-white border-2 border-slate-50 rounded-2xl font-black text-slate-900 outline-none focus:border-primary transition-all"
                                        placeholder="Calle Principal #123, Ciudad"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 pt-4 border-t border-slate-100">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block">
                                    Teléfono de la Empresa
                                </label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="tel"
                                        value={localProfile.phone || ''}
                                        onChange={(e) => setLocalProfile(prev => ({ ...prev, phone: e.target.value }))}
                                        className="w-full pl-12 pr-6 py-4 bg-white border-2 border-slate-50 rounded-2xl font-black text-slate-900 outline-none focus:border-primary transition-all"
                                        placeholder="+52 55 1234 5678"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 pt-4 border-t border-slate-100">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block">
                                    Tu Nombre de Usuario
                                </label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                                    <input 
                                        type="text" 
                                        value={localName}
                                        onChange={(e) => setLocalName(e.target.value)}
                                        className="w-full pl-12 pr-6 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm text-slate-700 outline-none focus:border-primary transition-all"
                                        placeholder="Tú nombre"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 💰 GLOBALES FINANCIEROS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-slate-900 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-[-40px] right-[-40px] w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                            <Globe size={18} className="text-primary" />
                            Región & Márgenes
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-8 relative z-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                                    Divisa Local
                                </label>
                                <input 
                                    type="text" 
                                    value={localConfig.moneda}
                                    onChange={(e) => setLocalConfig({...localConfig, moneda: e.target.value})}
                                    className="w-full px-6 py-4 bg-white/5 border-2 border-white/10 rounded-2xl text-2xl font-black text-white focus:outline-none focus:border-primary transition-all text-center uppercase"
                                    maxLength={4}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">
                                    Utilidad Post-Fab (%)
                                </label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={Number((localConfig.margenGanancia * 100).toFixed(1))}
                                        onChange={(e) => setLocalConfig({...localConfig, margenGanancia: Number(e.target.value) / 100})}
                                        step="0.1" max="100" min="0"
                                        className="w-full px-6 py-4 bg-white/5 border-2 border-white/10 rounded-2xl text-2xl font-black text-emerald-400 focus:outline-none focus:border-emerald-500 transition-all text-center"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/10 relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cálculo Proyectado a 10,000 unidades en Materiales</h5>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 items-center bg-white/5 border border-white/10 rounded-[32px] p-6 text-white text-center">
                                <div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Costo Material</p>
                                    <p className="font-black text-lg">{localConfig.moneda}10k</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-emerald-500 uppercase mb-1">Margen ({Number(localConfig.margenGanancia * 100).toFixed(0)}%)</p>
                                    <p className="font-black text-emerald-400">+{localConfig.moneda}{(10000 * localConfig.margenGanancia).toLocaleString()}</p>
                                </div>
                                <div className="border-l border-white/10">
                                    <p className="text-[9px] font-black text-primary uppercase mb-1">Venta Estimada</p>
                                    <p className="font-black text-primary text-xl">{(10000 * (1 + localConfig.margenGanancia)).toLocaleString()}</p>
                                </div>
                            </div>
                            <p className="text-[9px] text-slate-500 text-center mt-3 font-semibold">* Ejemplo sin sumar Costos Operativos logísticos.</p>
                        </div>
                    </motion.div>
                    
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card bg-white/60 rounded-[48px] p-10 shadow-xl border-white/80"
                    >
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                            <Building2 size={18} className="text-primary" />
                            Costos Operativos Globales
                        </h4>
                        
                        <div className="space-y-6">
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between gap-6">
                                <div>
                                    <h5 className="text-sm font-black text-slate-900 mb-1">Mano de Obra (%)</h5>
                                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Porcentaje sobre el costo de materiales</p>
                                </div>
                                <input 
                                    type="number" 
                                    value={Number(((localConfig.costosOperativos?.manoObraPorcentaje || 0.15) * 100).toFixed(1))}
                                    onChange={(e) => setLocalConfig({...localConfig, costosOperativos: { ...localConfig.costosOperativos, manoObraPorcentaje: Number(e.target.value) / 100 } as any})}
                                    step="0.1" max="100" min="0"
                                    className="w-24 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-black text-slate-900 text-center"
                                />
                            </div>

                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between gap-6">
                                <div>
                                    <h5 className="text-sm font-black text-slate-900 mb-1">Costo Instalación ({localConfig.moneda})</h5>
                                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Por cada ventana instalada</p>
                                </div>
                                <input 
                                    type="number" 
                                    value={localConfig.costosOperativos?.instalacionFija ?? 300}
                                    onChange={(e) => setLocalConfig({...localConfig, costosOperativos: { ...localConfig.costosOperativos, instalacionFija: Number(e.target.value) } as any})}
                                    min="0"
                                    className="w-28 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-black text-emerald-600 text-center"
                                />
                            </div>

                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between gap-6">
                                <div>
                                    <h5 className="text-sm font-black text-slate-900 mb-1">Transporte y Flete ({localConfig.moneda})</h5>
                                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Monto plano por fabricación base</p>
                                </div>
                                <input
                                    type="number"
                                    value={localConfig.costosOperativos?.transporteFijo ?? 200}
                                    onChange={(e) => setLocalConfig({...localConfig, costosOperativos: { ...localConfig.costosOperativos, transporteFijo: Number(e.target.value) } as any})}
                                    min="0"
                                    className="w-28 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-black text-primary text-center"
                                />
                            </div>

                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between gap-6">
                                <div>
                                    <h5 className="text-sm font-black text-slate-900 mb-1">IVA (%)</h5>
                                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Impuesto al Valor Agregado</p>
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={(localConfig.iva || 0.16) * 100}
                                    onChange={(e) => setLocalConfig(prev => ({ ...prev, iva: (parseFloat(e.target.value) || 0) / 100 }))}
                                    className="w-28 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-black text-primary text-center"
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* 📖 DICCIONARIO DE MATERIALES */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card bg-white/40 rounded-[50px] overflow-hidden border-white/60 shadow-2xl"
                >
                    <div className="p-10 border-b border-white/60 bg-white/20 backdrop-blur-md flex justify-between items-center">
                        <div>
                            <h4 className="text-xl font-black text-slate-900 tracking-tighter">Diccionario Técnico de Materiales</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Personalización de Inventario & Costos por Unidad</p>
                        </div>
                        <ShieldCheck className="text-slate-200" size={32} />
                    </div>
                    
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    <th className="p-8 pl-10">Categoría</th>
                                    <th className="p-8">ID Sistema</th>
                                    <th className="p-8 w-1/3">Nombre Público</th>
                                    <th className="p-8 text-center">Unidad</th>
                                    <th className="p-8 pr-12 text-right">Costo Unitario</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/40 text-slate-900 font-black tracking-tight">
                                {Object.entries(localConfig.diccionario).map(([key, item]) => {
                                    let Icon = Box;
                                    let catColor = "text-slate-400 bg-slate-100";
                                    let catName = "Accesorios";
                                    
                                    if(item.unidad === 'ml') { Icon = Ruler; catColor = "text-indigo-600 bg-indigo-50"; catName = "Extruido"; }
                                    if(item.unidad === 'm2') { Icon = Package; catColor = "text-sky-600 bg-sky-50"; catName = "Cristalería"; }

                                    return (
                                        <tr key={key} className="hover:bg-white/40 transition-colors group">
                                            <td className="p-6 pl-10">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${catColor}`}>
                                                    <Icon size={12} />
                                                    {catName}
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className="text-[10px] font-mono font-bold text-slate-300">#{key}</span>
                                            </td>
                                            <td className="p-6">
                                                <input 
                                                    type="text" 
                                                    value={item.nombre}
                                                    onChange={e => handleDicChange(key as keyof MaterialDictionary, 'nombre', e.target.value)}
                                                    className="w-full bg-transparent border-b border-transparent group-hover:border-primary/20 hover:border-primary/50 py-1 transition-all outline-none"
                                                />
                                            </td>
                                            <td className="p-6 text-center text-[10px] text-slate-300 uppercase tracking-widest">
                                                [{item.unidad}]
                                            </td>
                                            <td className="p-6 pr-12">
                                                <div className="flex items-center justify-end relative">
                                                    <span className="text-slate-300 text-xs mr-2">{localConfig.moneda}</span>
                                                    <input 
                                                        type="number" 
                                                        value={item.precio}
                                                        onChange={e => handleDicChange(key as keyof MaterialDictionary, 'precio', e.target.value)}
                                                        className="w-24 bg-white/50 border border-transparent hover:border-primary/30 focus:border-primary focus:bg-white rounded-xl py-2 px-3 text-right transition-all"
                                                        step="0.01" min="0"
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </form>
        </div>
    );
};

export default SettingsPage;
