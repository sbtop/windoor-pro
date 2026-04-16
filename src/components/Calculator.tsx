import React, { useState } from 'react';
import { Calculator as CalcIcon, ArrowRightLeft, Square, Ruler, Maximize2, Hash, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Calculator: React.FC = () => {
    const [ancho, setAncho] = useState<number>(1.5);
    const [alto, setAlto] = useState<number>(1.2);
    const [unidad, setUnidad] = useState<'m' | 'cm' | 'mm'>('m');

    const toMeters = (valor: number, unidad: 'm' | 'cm' | 'mm'): number => {
        switch (unidad) {
            case 'm': return valor;
            case 'cm': return valor / 100;
            case 'mm': return valor / 1000;
        }
    };

    const areaM2 = toMeters(ancho, unidad) * toMeters(alto, unidad);
    const perimetroM = 2 * (toMeters(ancho, unidad) + toMeters(alto, unidad));

    const handleSwap = () => {
        setAncho(alto);
        setAlto(ancho);
    };

    return (
        <div className="p-8 md:p-12 max-w-7xl mx-auto min-h-screen">
            {/* 📋 Modern Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <CalcIcon size={24} className="text-primary" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Motor de Cálculos</h1>
                </div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] ml-16">
                    Dimensionamiento Técnico & Conversión de Unidades
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* 🎛️ Input Section (left) */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-4 space-y-6"
                >
                    <div className="bg-white p-8 border border-slate-100 rounded-3xl shadow-xl relative overflow-hidden">
                        <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
                        
                        <div className="flex items-center gap-3 mb-8">
                            <Ruler size={18} className="text-primary" />
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Dimensiones</h2>
                        </div>

                        {/* Selector de unidad */}
                        <div className="mb-10">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Sistema Metral</label>
                            <div className="flex p-1 bg-slate-100 rounded-2xl">
                                {(['m', 'cm', 'mm'] as const).map((u) => (
                                    <button
                                        key={u}
                                        onClick={() => setUnidad(u)}
                                        className={`flex-1 py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                            unidad === u
                                                ? 'bg-white text-slate-900 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                    >
                                        {u}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Inputs de dimensiones */}
                        <div className="space-y-6">
                            <div className="relative group">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Ancho ({unidad})</label>
                                <input
                                    type="number"
                                    value={ancho}
                                    onChange={(e) => setAncho(Number(e.target.value))}
                                    className="w-full px-6 py-5 bg-white border-2 border-slate-100 rounded-2xl text-xl font-black text-slate-900 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                                />
                            </div>

                            <div className="flex justify-center -my-2 relative z-10">
                                <motion.button
                                    whileHover={{ rotate: 180 }}
                                    onClick={handleSwap}
                                    className="p-3 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-primary transition-colors"
                                >
                                    <RefreshCcw size={14} strokeWidth={3} />
                                </motion.button>
                            </div>

                            <div className="relative group">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Alto ({unidad})</label>
                                <input
                                    type="number"
                                    value={alto}
                                    onChange={(e) => setAlto(Number(e.target.value))}
                                    className="w-full px-6 py-5 bg-white border-2 border-slate-100 rounded-2xl text-xl font-black text-slate-900 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 📊 Results Section (right) */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Área Bento Card */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-slate-900 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Square size={120} />
                        </div>
                        <div className="flex items-center gap-2 mb-8">
                            <Maximize2 size={16} className="text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Superficie Total</span>
                        </div>
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={areaM2}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-6xl font-black tracking-tighter mb-4"
                            >
                                {areaM2.toFixed(3)} <span className="text-xl font-bold text-slate-500 italic lowercase tracking-normal">m²</span>
                            </motion.div>
                        </AnimatePresence>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                            {toMeters(ancho, unidad).toFixed(2)}m × {toMeters(alto, unidad).toFixed(2)}m
                        </p>
                    </motion.div>

                    {/* Perímetro Card */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-[40px] p-10 shadow-xl border border-slate-100"
                    >
                        <div className="flex items-center gap-2 mb-8">
                            <Hash size={16} className="text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Perímetro Lineal</span>
                        </div>
                        <div className="text-4xl font-black text-slate-900 tracking-tighter mb-4">
                            {perimetroM.toFixed(2)} <span className="text-base font-bold text-slate-400">m</span>
                        </div>
                        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '60%' }}
                                className="h-full bg-primary"
                            />
                        </div>
                    </motion.div>

                    {/* Conversión Detallada Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="md:col-span-2 bg-slate-900/5 backdrop-blur-3xl rounded-[48px] p-12 border border-slate-200 shadow-xl overflow-x-auto"
                    >
                        <table className="w-full">
                            <thead>
                                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                    <th className="text-left pb-6">Dimensión Técnica</th>
                                    <th className="text-right pb-6">Mts</th>
                                    <th className="text-right pb-6">Cms</th>
                                    <th className="text-right pb-6">Mms</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-900">
                                <tr className="border-t border-slate-200/50">
                                    <td className="py-6 font-black tracking-tight flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-primary" /> Ancho Nominal
                                    </td>
                                    <td className="text-right font-black">{toMeters(ancho, unidad).toFixed(3)}</td>
                                    <td className="text-right font-bold text-slate-400">{(toMeters(ancho, unidad) * 100).toFixed(1)}</td>
                                    <td className="text-right font-bold text-slate-400">{(toMeters(ancho, unidad) * 1000).toFixed(0)}</td>
                                </tr>
                                <tr className="border-t border-slate-200/50">
                                    <td className="py-6 font-black tracking-tight flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-slate-300" /> Atura Nominal
                                    </td>
                                    <td className="text-right font-black">{toMeters(alto, unidad).toFixed(3)}</td>
                                    <td className="text-right font-bold text-slate-400">{(toMeters(alto, unidad) * 100).toFixed(1)}</td>
                                    <td className="text-right font-bold text-slate-400">{(toMeters(alto, unidad) * 1000).toFixed(0)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Calculator;
