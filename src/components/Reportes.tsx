import React, { useState } from 'react';
import { Lock, Unlock, TrendingUp, DollarSign, PieChart, BarChart3, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';
import { motion, AnimatePresence } from 'framer-motion';

const Reportes: React.FC = () => {
    const { pricingConfig } = useSettingsStore();
    const { moneda } = pricingConfig;
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const ADMIN_PASSWORD = 'admin2024';

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Clave de seguridad incorrecta');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-4 relative overflow-hidden">
                {/* Background accents */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-10 max-w-md w-full border-white/40 shadow-2xl relative z-10"
                >
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary to-indigo-600 rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20">
                            <Lock className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Sección Restringida</h2>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Control Financiero de Alta Seguridad</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="relative group">
                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Clave Maestra"
                                className="w-full pl-12 pr-4 py-5 bg-white/50 border-2 border-white/60 rounded-3xl text-center font-black text-slate-800 tracking-[0.5em] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:tracking-normal placeholder:font-bold placeholder:text-slate-300"
                            />
                        </div>
                        
                        <AnimatePresence>
                            {error && (
                                <motion.p 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-500 text-[10px] font-black uppercase text-center tracking-widest"
                                >
                                    {error}
                                </motion.p>
                            )}
                        </AnimatePresence>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-3xl shadow-xl hover:bg-primary transition-all flex items-center justify-center gap-3"
                        >
                            Verificar Acceso
                            <ArrowRight size={16} />
                        </motion.button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-100/50 text-center">
                        <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                            El acceso a reportes financieros está limitado a usuarios con permisos de administrador. 
                            Todas las consultas son monitoreadas.
                        </p>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="p-8 md:p-12 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12"
            >
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                            <Unlock className="w-6 h-6 text-emerald-600" />
                        </div>
                        Ficha Financiera
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2 ml-16">
                        Métricas de Rendimiento & Rentabilidad
                    </p>
                </div>
                <motion.button
                    whileHover={{ x: 5 }}
                    onClick={() => setIsAuthenticated(false)}
                    className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest flex items-center gap-2 group transition-colors"
                >
                    Finalizar Sesión Segura
                    <Lock size={14} className="group-hover:text-red-500" />
                </motion.button>
            </motion.div>

            {/* Stats Grid - Bento Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {/* Ingresos Mensuales */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <DollarSign size={80} />
                    </div>
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                            <TrendingUp size={16} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Ingresos del Mes</span>
                    </div>
                    <div className="text-4xl font-black tracking-tighter mb-2">{moneda}42.8k</div>
                    <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                        <TrendingUp size={14} />
                        <span>Mejora +12.5%</span>
                    </div>
                </motion.div>

                {/* Ganancia Neta */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card bg-white/60 rounded-[40px] p-8 shadow-xl border-white/80 group overflow-hidden"
                >
                    <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-emerald-500/5 blur-3xl rounded-full" />
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <PieChart size={16} className="text-white" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Utilidad Neta</span>
                    </div>
                    <div className="text-4xl font-black text-slate-900 tracking-tighter mb-2">{moneda}18.4k</div>
                    <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                        <Sparkles size={14} />
                        <span>Sano +8.3%</span>
                    </div>
                </motion.div>

                {/* Proyectos Activos */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card bg-white/60 rounded-[40px] p-8 shadow-xl border-white/80"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <BarChart3 size={16} className="text-white" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Carga Operativa</span>
                    </div>
                    <div className="text-4xl font-black text-slate-900 tracking-tighter mb-2">14</div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Órdenes en proceso</p>
                </motion.div>

                {/* Margen Promedio */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card bg-white/60 rounded-[40px] p-8 shadow-xl border-white/80"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                            <TrendingUp size={16} className="text-white" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Margen Global</span>
                    </div>
                    <div className="text-4xl font-black text-slate-900 tracking-tighter mb-2">43%</div>
                    <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest">
                         Meta: 40%
                    </div>
                </motion.div>
            </div>

            {/* Evolución Gráfica Modernizada */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card bg-white/40 rounded-[50px] p-12 shadow-2xl border-white/60 mb-12"
            >
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Histórico de Ingresos</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Cierre proyectado Q4 2026</p>
                    </div>
                    <div className="flex gap-2">
                        {[1, 2, 3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-slate-200" />)}
                    </div>
                </div>

                <div className="flex items-end gap-6 md:gap-12 h-64 px-4 overflow-x-auto custom-scrollbar">
                    {[
                        { mes: 'JUN', ingreso: 32500, color: 'bg-indigo-500' },
                        { mes: 'JUL', ingreso: 35800, color: 'bg-indigo-500' },
                        { mes: 'AGO', ingreso: 34100, color: 'bg-indigo-500' },
                        { mes: 'SEP', ingreso: 38900, color: 'bg-primary' },
                        { mes: 'OCT', ingreso: 42850, color: 'bg-primary shadow-xl shadow-primary/30' },
                    ].map((data, i) => (
                        <div key={data.mes} className="flex-1 flex flex-col items-center gap-4 min-w-[60px]">
                            <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${(data.ingreso / 50000) * 100}%` }}
                                transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                                className={`w-full max-w-[40px] ${data.color} rounded-2xl relative group cursor-pointer`}
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-black py-1 px-3 rounded-lg pointer-events-none">
                                    {moneda}{data.ingreso.toLocaleString()}
                                </div>
                            </motion.div>
                            <span className="text-[11px] font-black text-slate-400 tracking-widest">{data.mes}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mt-12 mb-8"
            >
                Protocolo de Auditoría • {new Date().getFullYear()} • WinDoor Pro Secure
            </motion.p>
        </div>
    );
};

export default Reportes;
