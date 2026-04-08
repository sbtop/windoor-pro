import React, { useState } from 'react';
import { Lock, Unlock, TrendingUp, DollarSign, PieChart, BarChart3 } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';

const Reportes: React.FC = () => {
    const { pricingConfig } = useSettingsStore();
    const { moneda } = pricingConfig;
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Clave simple - en producción debería venir de env vars
    const ADMIN_PASSWORD = 'admin2024';

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Clave incorrecta');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="bg-white rounded-2xl shadow-soft-lg p-8 max-w-md w-full border border-slate-100">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Reportes Financieros</h2>
                        <p className="text-slate-500 text-sm">Ingrese la clave de administrador para acceder</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Clave de acceso"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        {error && (
                            <p className="text-red-500 text-sm text-center">{error}</p>
                        )}
                        <button
                            type="submit"
                            className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-all active:scale-95"
                        >
                            Acceder
                        </button>
                    </form>

                    <p className="text-center text-xs text-slate-400 mt-6">
                        Esta sección contiene información confidencial del negocio
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <Unlock className="w-8 h-8 text-primary" />
                        Reportes Financieros
                    </h1>
                    <p className="text-slate-500 mt-1">Resumen de ingresos y métricas del negocio</p>
                </div>
                <button
                    onClick={() => setIsAuthenticated(false)}
                    className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-100 transition-all"
                >
                    Cerrar sesión
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Ingresos Mensuales */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="w-5 h-5" />
                        <span className="font-bold">Ingresos Mensuales</span>
                    </div>
                    <div className="text-3xl font-bold">{moneda}42,850.00</div>
                    <div className="flex items-center gap-2 mt-2 text-indigo-100 text-sm">
                        <TrendingUp className="w-4 h-4" />
                        <span>+12.5% vs mes anterior</span>
                    </div>
                </div>

                {/* Ganancia Neta */}
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-2 mb-4">
                        <PieChart className="w-5 h-5" />
                        <span className="font-bold">Ganancia Neta</span>
                    </div>
                    <div className="text-3xl font-bold">{moneda}18,420.00</div>
                    <div className="flex items-center gap-2 mt-2 text-emerald-100 text-sm">
                        <TrendingUp className="w-4 h-4" />
                        <span>+8.3% vs mes anterior</span>
                    </div>
                </div>

                {/* Proyectos Activos */}
                <div className="bg-white rounded-2xl p-6 shadow-soft-md border border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        <span className="font-bold text-slate-700">Proyectos Activos</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-800">14</div>
                    <p className="text-sm text-slate-500 mt-2">4 requieren actualización</p>
                </div>

                {/* Margen Promedio */}
                <div className="bg-white rounded-2xl p-6 shadow-soft-md border border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        <span className="font-bold text-slate-700">Margen Promedio</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-800">43%</div>
                    <p className="text-sm text-slate-500 mt-2">Meta anual: 40%</p>
                </div>
            </div>

            {/* Gráfico de Ingresos */}
            <div className="bg-white rounded-2xl p-6 shadow-soft-md border border-slate-100 mb-6">
                <h3 className="font-bold text-slate-700 mb-6">Evolución de Ingresos - Últimos 5 Meses</h3>
                <div className="flex items-end gap-4 h-48 px-4">
                    {[
                        { mes: 'Jun', ingreso: 32500, label: `${moneda}32,500` },
                        { mes: 'Jul', ingreso: 35800, label: `${moneda}35,800` },
                        { mes: 'Ago', ingreso: 34100, label: `${moneda}34,100` },
                        { mes: 'Sep', ingreso: 38900, label: `${moneda}38,900` },
                        { mes: 'Oct', ingreso: 42850, label: `${moneda}42,850` },
                    ].map((data, i) => (
                        <div key={data.mes} className="flex-1 flex flex-col items-center gap-2">
                            <div className="text-xs text-slate-400">{data.label}</div>
                            <div 
                                className="w-full bg-primary/20 rounded-t-lg relative group cursor-pointer"
                                style={{ height: `${(data.ingreso / 50000) * 100}%`, minHeight: '20px' }}
                            >
                                <div 
                                    className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-lg transition-all group-hover:bg-primary/80"
                                    style={{ height: '100%' }}
                                />
                            </div>
                            <div className="text-xs font-bold text-slate-600">{data.mes}</div>
                        </div>
                    ))}
                </div>
            </div>

            <p className="text-center text-xs text-slate-400 mt-8">
                Última actualización: {new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
        </div>
    );
};

export default Reportes;
