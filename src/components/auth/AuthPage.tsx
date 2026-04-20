import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Building2, KeyRound, CheckCircle2, ShieldCheck, Zap, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserContext } from '../../context/UserContext';

type AuthMode = 'login' | 'register' | 'forgot';

const AuthPage: React.FC = () => {
    const [authMode, setAuthMode] = useState<AuthMode>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const { login, register, resetPassword } = useUserContext();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            if (authMode === 'login') {
                const success = await login(email, password);
                if (!success) {
                    setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
                }
            } else if (authMode === 'register') {
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
            } else if (authMode === 'forgot') {
                if (!email || !newPassword) {
                    setError('Todos los campos son obligatorios.');
                    setLoading(false);
                    return;
                }
                if (newPassword.length < 6) {
                    setError('La nueva contraseña debe tener al menos 6 caracteres.');
                    setLoading(false);
                    return;
                }
                const success = await resetPassword(email, newPassword);
                if (success) {
                    setSuccessMessage('Contraseña actualizada correctamente. Ahora puedes iniciar sesión.');
                    setAuthMode('login');
                } else {
                    setError('No se encontró una cuenta con ese correo electrónico.');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error inesperado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#020617] font-body overflow-hidden">
            {/* ── Left Side: Hero Section ── */}
            <div className="relative hidden lg:flex lg:w-3/5 flex-col justify-center p-16 xl:p-24 overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sky-600/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[100px] rounded-full" />
                
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative z-10"
                >
                    <div className="flex items-center gap-4 mb-12">
                        <div className="w-12 h-12 bg-sky-600 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-600/30">
                            <Building2 className="text-white w-6 h-6" />
                        </div>
                        <span className="text-xl font-black text-white tracking-tighter uppercase">WinDoor Pro</span>
                    </div>

                    <h1 className="text-6xl xl:text-7xl font-black text-white tracking-tight mb-8 leading-none">
                        Diseño de <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-violet-400 to-sky-400">
                            Vanguardia
                        </span>
                    </h1>

                    <p className="text-slate-400 text-xl max-w-xl mb-12 leading-relaxed font-medium">
                        La plataforma definitiva para el diseño, cotización y gestión de proyectos de carpintería de aluminio y vidrio.
                    </p>

                    <div className="grid grid-cols-2 gap-8 mb-16">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sky-400">
                                <ShieldCheck size={20} />
                                <span className="font-bold uppercase tracking-widest text-[10px]">Seguridad</span>
                            </div>
                            <p className="text-white font-bold">Protección Grado Enterprise</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-violet-400">
                                <Zap size={20} />
                                <span className="font-bold uppercase tracking-widest text-[10px]">Velocidad</span>
                            </div>
                            <p className="text-white font-bold">Cálculos en Milisegundos</p>
                        </div>
                    </div>

                    {/* Social Proof */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="flex items-center gap-6 p-6 rounded-3xl bg-white/[0.03] border border-white/5 backdrop-blur-sm w-fit"
                    >
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 overflow-hidden ring-2 ring-sky-500/20">
                                    <img src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="User" />
                                </div>
                            ))}
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">+2,500 Profesionales</p>
                            <p className="text-slate-500 text-xs font-medium">Confían en la precisión de WinDoor Pro</p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* ── Right Side: Auth Card ── */}
            <div className="relative flex-1 flex items-center justify-center p-6 lg:p-12">
                <div className="absolute inset-0 bg-sky-600/5 lg:hidden blur-[100px]" />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-[460px] relative z-10"
                >
                    <div className="bg-slate-900/40 backdrop-blur-2xl p-8 lg:p-12 rounded-[40px] border border-white/10 shadow-2xl overflow-hidden relative group">
                        {/* Interactive glow effect */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-500/10 blur-[60px] rounded-full group-hover:bg-sky-500/20 transition-all duration-700" />
                        
                        <div className="relative z-10">
                            <div className="mb-10 lg:hidden flex flex-col items-center">
                                <div className="w-12 h-12 bg-sky-600 rounded-2xl flex items-center justify-center mb-4">
                                    <Building2 className="text-white w-6 h-6" />
                                </div>
                                <h1 className="text-xl font-black text-white uppercase tracking-tighter">WinDoor Pro</h1>
                            </div>

                            <div className="text-center lg:text-left mb-10">
                                <h2 className="text-3xl font-black text-white tracking-tight mb-3">
                                    {authMode === 'login' ? 'Bienvenido' : authMode === 'register' ? 'Nueva Cuenta' : 'Recuperar'}
                                </h2>
                                <p className="text-slate-400 font-medium">
                                    {authMode === 'login' ? 'Gestiona tus proyectos con precisión.' : authMode === 'register' ? 'Comienza tu viaje profesional hoy.' : 'Restablece tu acceso de seguridad.'}
                                </p>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.form 
                                    key={authMode}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    onSubmit={handleSubmit} 
                                    className="space-y-5"
                                >
                                    {authMode === 'register' && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Nombre de Empresa</label>
                                            <div className="relative group">
                                                <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                                                <input 
                                                    type="text" 
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white text-sm font-bold focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-600"
                                                    placeholder="Ej. Aluminios del Norte"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Correo Electrónico</label>
                                        <div className="relative group">
                                            <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                                            <input 
                                                type="email" 
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white text-sm font-bold focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-600"
                                                placeholder="tu@empresa.com"
                                            />
                                        </div>
                                    </div>

                                    {authMode !== 'forgot' && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Contraseña</label>
                                            <div className="relative group">
                                                <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                                                <input 
                                                    type="password" 
                                                    required
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white text-sm font-bold focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-600"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {authMode === 'forgot' && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Nueva Contraseña</label>
                                            <div className="relative group">
                                                <KeyRound size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                                                <input 
                                                    type="password" 
                                                    required
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white text-sm font-bold focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-600"
                                                    placeholder="Mínimo 6 caracteres"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {error && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-[11px] font-bold flex items-center gap-3"
                                        >
                                            <ShieldCheck size={16} />
                                            {error}
                                        </motion.div>
                                    )}

                                    {successMessage && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-[11px] font-bold flex items-center gap-3"
                                        >
                                            <CheckCircle2 size={16} />
                                            {successMessage}
                                        </motion.div>
                                    )}

                                    <button 
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-5 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-sky-600/20 transition-all hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 disabled:opacity-50 mt-4 overflow-hidden group"
                                    >
                                        <span className="relative z-10 flex items-center gap-3">
                                            {loading ? 'Procesando...' : (
                                                <>
                                                    {authMode === 'login' ? 'Iniciar Sesión' : authMode === 'register' ? 'Crear Licencia' : 'Restablecer'}
                                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </span>
                                    </button>
                                </motion.form>
                            </AnimatePresence>

                            <div className="pt-8 mt-8 border-t border-white/5 space-y-4">
                                {authMode === 'login' && (
                                    <>
                                        <button 
                                            type="button"
                                            onClick={() => setAuthMode('register')}
                                            className="w-full text-center text-[11px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-colors"
                                        >
                                            ¿No tienes cuenta? <span className="text-sky-400">Regístrate</span>
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setAuthMode('forgot')}
                                            className="w-full text-center text-[10px] font-black text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors"
                                        >
                                            Olvidé mi contraseña
                                        </button>
                                    </>
                                )}
                                {(authMode === 'register' || authMode === 'forgot') && (
                                    <button 
                                        type="button"
                                        onClick={() => setAuthMode('login')}
                                        className="w-full text-center text-[11px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-colors"
                                    >
                                        Volver al <span className="text-sky-400">Inicio de Sesión</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-8 text-center flex items-center justify-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                        <Globe size={12} />
                        WinDoor Pro v2.0 &bull; 2026 Premium Edition
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AuthPage;
