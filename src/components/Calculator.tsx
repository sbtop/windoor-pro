import React, { useState } from 'react';
import { Calculator as CalcIcon, ArrowRightLeft, Square, Ruler } from 'lucide-react';

const Calculator: React.FC = () => {
    const [ancho, setAncho] = useState<number>(1.5);
    const [alto, setAlto] = useState<number>(1.2);
    const [unidad, setUnidad] = useState<'m' | 'cm' | 'mm'>('m');

    // Convertir a metros para cálculos
    const toMeters = (valor: number, unidad: 'm' | 'cm' | 'mm'): number => {
        switch (unidad) {
            case 'm': return valor;
            case 'cm': return valor / 100;
            case 'mm': return valor / 1000;
        }
    };

    const areaM2 = toMeters(ancho, unidad) * toMeters(alto, unidad);
    const perimetroM = 2 * (toMeters(ancho, unidad) + toMeters(alto, unidad));

    // Precio estimado (ejemplo: $150 por m² de ventana)
    const precioPorM2 = 150;
    const precioEstimado = areaM2 * precioPorM2;

    const handleSwap = () => {
        setAncho(alto);
        setAlto(ancho);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                    <CalcIcon className="w-8 h-8 text-primary" />
                    Calculadora de Medidas
                </h1>
                <p className="text-slate-500">Convierte medidas y calcula áreas para ventanas y puertas</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Panel de entrada */}
                <div className="bg-white rounded-2xl p-6 shadow-soft-md border border-slate-100">
                    <div className="flex items-center gap-2 mb-6">
                        <Ruler className="w-5 h-5 text-primary" />
                        <h2 className="font-bold text-slate-700">Dimensiones</h2>
                    </div>

                    {/* Selector de unidad */}
                    <div className="mb-6">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Unidad</label>
                        <div className="flex gap-2">
                            {(['m', 'cm', 'mm'] as const).map((u) => (
                                <button
                                    key={u}
                                    onClick={() => setUnidad(u)}
                                    className={`flex-1 py-2 px-4 rounded-xl text-sm font-bold transition-all ${
                                        unidad === u
                                            ? 'bg-primary text-white shadow-md'
                                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    {u === 'm' ? 'Metros' : u === 'cm' ? 'Centímetros' : 'Milímetros'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Inputs de dimensiones */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                                Ancho ({unidad})
                            </label>
                            <input
                                type="number"
                                step={unidad === 'm' ? 0.01 : unidad === 'cm' ? 1 : 10}
                                value={ancho}
                                onChange={(e) => setAncho(Number(e.target.value))}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={handleSwap}
                                className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                                title="Intercambiar ancho y alto"
                            >
                                <ArrowRightLeft className="w-4 h-4 text-slate-500" />
                            </button>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                                Alto ({unidad})
                            </label>
                            <input
                                type="number"
                                step={unidad === 'm' ? 0.01 : unidad === 'cm' ? 1 : 10}
                                value={alto}
                                onChange={(e) => setAlto(Number(e.target.value))}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Panel de resultados */}
                <div className="space-y-6">
                    {/* Área */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center gap-2 mb-4">
                            <Square className="w-5 h-5" />
                            <span className="font-bold">Área Total</span>
                        </div>
                        <div className="text-4xl font-bold mb-2">
                            {areaM2.toFixed(2)} <span className="text-xl">m²</span>
                        </div>
                        <p className="text-indigo-100 text-sm">
                            {toMeters(ancho, unidad).toFixed(2)}m × {toMeters(alto, unidad).toFixed(2)}m
                        </p>
                    </div>

                    {/* Perímetro */}
                    <div className="bg-white rounded-2xl p-6 shadow-soft-md border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Ruler className="w-5 h-5 text-emerald-500" />
                            <span className="font-bold text-slate-700">Perímetro</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-800">
                            {perimetroM.toFixed(2)} <span className="text-base font-medium text-slate-500">m</span>
                        </div>
                    </div>

                    {/* Estimación de precio */}
                    <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-emerald-700">Precio Estimado</span>
                        </div>
                        <div className="text-3xl font-bold text-emerald-800">
                            ${precioEstimado.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <p className="text-emerald-600 text-xs mt-2">
                            Basado en ${precioPorM2}/m² (precio de referencia)
                        </p>
                    </div>

                    {/* Tabla de conversión */}
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                        <h3 className="font-bold text-slate-700 mb-4">Conversión de Medidas</h3>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-slate-400 text-xs uppercase tracking-wider">
                                    <th className="text-left pb-2">Dimensión</th>
                                    <th className="text-right pb-2">Metros</th>
                                    <th className="text-right pb-2">Centímetros</th>
                                    <th className="text-right pb-2">Milímetros</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-700">
                                <tr className="border-t border-slate-200">
                                    <td className="py-3 font-medium">Ancho</td>
                                    <td className="text-right font-bold">{toMeters(ancho, unidad).toFixed(2)}m</td>
                                    <td className="text-right">{(toMeters(ancho, unidad) * 100).toFixed(1)}cm</td>
                                    <td className="text-right">{(toMeters(ancho, unidad) * 1000).toFixed(0)}mm</td>
                                </tr>
                                <tr className="border-t border-slate-200">
                                    <td className="py-3 font-medium">Alto</td>
                                    <td className="text-right font-bold">{toMeters(alto, unidad).toFixed(2)}m</td>
                                    <td className="text-right">{(toMeters(alto, unidad) * 100).toFixed(1)}cm</td>
                                    <td className="text-right">{(toMeters(alto, unidad) * 1000).toFixed(0)}mm</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Calculator;
