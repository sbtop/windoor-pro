import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useUserStore } from '../../store/userStore';

const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, register, resetPassword } = useUserStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (isLogin) {
                const success = await login(email, password);
                if (!success) {
                    setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
                }
            } else {
                if (!name || !email || !password) {
                    setError('Todos los campos son obligatorios.');
                    setLoading(false);
                    return;
                }
                if (password.length < 6) {
                    setError('La contraseña debe tener al menos 6 caracteres.');
                    setLoading(false);
                    return;
                }
                await register(name, email, password);
            }
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error inesperado.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (!email || !newPassword) {
                setError('Todos los campos son obligatorios.');
                setLoading(false);
                return;
            }
            if (newPassword.length < 6) {
                setError('La contraseña debe tener al menos 6 caracteres.');
                setLoading(false);
                return;
            }

            const success = await resetPassword(email, newPassword);
            if (success) {
                setSuccess('¡Contraseña restablecida con éxito! Ahora puedes iniciar sesión.');
                setTimeout(() => {
                    setShowResetPassword(false);
                    setSuccess('');
                    setNewPassword('');
                }, 2000);
            } else {
                setError('No se encontró una cuenta con ese correo electrónico.');
            }
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error inesperado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-body overflow-hidden">
            {/* 📸 Panel Izquierdo (Visual) */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden flex-col items-center justify-center p-12">
                {/* Patrón de fondo geométrico (simulando vidrios) */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[120%] bg-indigo-500 transform rotate-12" />
                    <div className="absolute top-[20%] right-[-20%] w-[60%] h-[80%] bg-blue-500 transform -rotate-12" />
                </div>
                
                <div className="relative z-10 text-center max-w-lg">
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                            <span className="material-symbols-outlined text-white text-4xl">architecture</span>
                        </div>
                    </div>
                    <h1 className="text-5xl font-display font-black text-white mb-6 uppercase tracking-tight">
                        WinDoor Pro
                    </h1>
                    <p className="text-slate-300 text-lg font-medium leading-relaxed mb-12">
                        El cotizador y diseñador más avanzado para profesionales del aluminio y el vidrio. Gestiona tu negocio desde un solo lugar.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 text-left">
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                            <ShieldCheck className="w-8 h-8 text-indigo-400 mb-3" />
                            <h3 className="text-white font-bold mb-1">Cotizaciones Precisas</h3>
                            <p className="text-slate-400 text-sm">Calcula costos reales basados en perfiles y desperdicios.</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                            <span className="material-symbols-outlined text-blue-400 text-3xl mb-3 block">draw</span>
                            <h3 className="text-white font-bold mb-1">Diseño Visual 2D</h3>
                            <p className="text-slate-400 text-sm">Traza ventanas y puertas con nuestro lienzo interactivo.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🔐 Panel Derecho (Formulario) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
                <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-display font-black text-slate-900 mb-2">
                            {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
                        </h2>
                        <p className="text-slate-500 font-medium">
                            {isLogin 
                                ? 'Ingresa tus credenciales para acceder a tus proyectos.' 
                                : 'Regístrate y comienza a cotizar como todo un profesional.'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm font-bold flex items-center gap-3">
                            <span className="material-symbols-outlined text-red-500">error</span>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-lg text-sm font-bold flex items-center gap-3">
                            <span className="material-symbols-outlined text-green-500">check_circle</span>
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div>
                                <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2 block">Nombre de tu Empresa / Tuyo</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 font-bold text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-medium"
                                        placeholder="Ej. Vidrios Alfa"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2 block">Correo Electrónico</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 font-bold text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-medium"
                                    placeholder="ejemplo@correo.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2 block">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 font-bold text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                            {isLogin && (
                                <button
                                    type="button"
                                    onClick={() => setShowResetPassword(true)}
                                    className="mt-2 text-sm text-indigo-600 font-bold hover:underline"
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                            )}
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-slate-900/20 transition-all flex items-center justify-center gap-2 mt-8 disabled:opacity-70"
                        >
                            {loading ? (
                                <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span>
                            ) : isLogin ? (
                                <>Entrar al cotizador <ArrowRight className="w-5 h-5" /></>
                            ) : (
                                <>Completar Registro <CheckCircle2 className="w-5 h-5" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm font-medium">
                            {isLogin ? '¿No tienes cuenta en WinDoor Pro?' : '¿Ya eres usuario de WinDoor Pro?'}
                        </p>
                        <button 
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                            className="mt-2 text-indigo-600 font-bold hover:underline"
                        >
                            {isLogin ? 'Crear una cuenta gratis' : 'Inicia sesión aquí'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de Restablecimiento de Contraseña */}
            {showResetPassword && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Lock className="w-8 h-8 text-indigo-600" />
                            </div>
                            <h3 className="text-2xl font-display font-black text-slate-900 mb-2">
                                Restablecer Contraseña
                            </h3>
                            <p className="text-slate-500 text-sm font-medium">
                                Ingresa tu correo y la nueva contraseña para restablecer tu cuenta.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-red-500 text-lg">error</span>
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-lg text-sm font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2 block">Correo Electrónico</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 font-bold text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-medium"
                                        placeholder="ejemplo@correo.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2 block">Nueva Contraseña</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 font-bold text-slate-900 transition-all placeholder:text-slate-400 placeholder:font-medium"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowResetPassword(false);
                                        setError('');
                                        setSuccess('');
                                        setNewPassword('');
                                    }}
                                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {loading ? (
                                        <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span>
                                    ) : (
                                        <>Restablecer <CheckCircle2 className="w-5 h-5" /></>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthPage;
