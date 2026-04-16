import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Building2 } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

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
        <div className="min-h-screen w-full relative flex items-center justify-center p-4 md:p-8 bg-[#020617] overflow-hidden font-body">
            {/* 🎭 Complex Mesh Gradient Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-sky-600/20 blur-[120px] rounded-full" />
                <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] bg-purple-600/10 blur-[100px] rounded-full" />
            </div>

            <main className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center relative z-10">
                {/* 🚀 Brand Side */}
                <div className="hidden lg:flex flex-col">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-3 mb-10"
                    >
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 group overflow-hidden">
                            <Building2 className="text-white w-6 h-6 group-hover:scale-110 transition-transform" />
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tighter uppercase">WinDoor Pro</h1>
                    </motion.div>

                    <div className="space-y-8">
                        <motion.h2 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-6xl font-black text-white leading-[0.9] tracking-tighter"
                        >
                            Diseño de <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-sky-400">Vanguardia.</span>
                        </motion.h2>

                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-slate-400 text-lg max-w-md leading-relaxed"
                        >
                            La plataforma definitiva para el diseño y cotización técnica de carpintería de aluminio y vidrio.
                        </motion.p>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex items-center gap-4 py-6 border-t border-white/5"
                        >
                            <div className="flex -space-x-3">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center">
                                        <User size={16} className="text-slate-400" />
                                    </div>
                                ))}
                            </div>
                            <span className="text-sm font-bold text-slate-500 italic">+2,500 talleres en México confían en nosotros.</span>
                        </motion.div>
                    </div>
                </div>

                {/* 🔒 Auth Form Card */}
                <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-slate-900/50 backdrop-blur-xl shadow-2xl border border-white/10 ring-1 ring-black/5 p-8 md:p-12 rounded-3xl"
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isLogin ? 'login' : 'register'}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <div className="text-center lg:text-left">
                                <h3 className="text-3xl font-black text-white tracking-tight mb-2">
                                    {isLogin ? 'Iniciar Conexión' : 'Nueva Licencia'}
                                </h3>
                                <p className="text-slate-400 font-medium text-sm">
                                    {isLogin ? 'Accede a tu panel central de fabricación.' : 'Crea tu espacio de trabajo profesional.'}
                                </p>
                            </div>

                            {error && (
                                <motion.div 
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-bold flex items-center gap-3"
                                >
                                    <Lock size={16} />
                                    {error}
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {!isLogin && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Razón Social / Nombre</label>
                                        <div className="relative group">
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                                            <input 
                                                type="text" 
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                                                placeholder="Ej. Vidrios Alfa"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Correo Corporativo</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                                        <input 
                                            type="email" 
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                                            placeholder="admin@empresa.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Token de Acceso</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                                        <input 
                                            type="password" 
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-500/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
                                >
                                    {loading ? (
                                        <span className="animate-spin w-5 h-5 border-2 border-white/20 border-t-white rounded-full" />
                                    ) : (
                                        <>
                                            {isLogin ? 'Entrar al Sistema' : 'Completar Registro'} 
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </motion.button>
                            </form>

                            <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                                <button 
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="text-[11px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-colors"
                                >
                                    {isLogin ? '¿No tienes acceso? Crea tu cuenta' : '¿Ya tienes licencia? Conectar aquí'}
                                </button>
                                {isLogin && (
                                    <button 
                                        onClick={() => setShowResetPassword(true)}
                                        className="text-[11px] font-black text-indigo-500 hover:text-white uppercase tracking-[0.2em] transition-colors"
                                    >
                                        Restablecer Credenciales
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </main>

            {/* Modal de Restablecimiento */}
            <AnimatePresence>
                {showResetPassword && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] p-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900 border border-white/10 rounded-[40px] shadow-2xl max-w-md w-full p-10"
                        >
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Sparkles className="text-indigo-500 w-8 h-8" />
                                </div>
                                <h4 className="text-2xl font-black text-white mb-2 tracking-tighter">Recuperar Acceso</h4>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed">Te enviaremos las instrucciones de restablecimiento de seguridad.</p>
                            </div>

                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-600"
                                    placeholder="Tu correo corporativo"
                                />
                                <div className="flex gap-4 pt-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowResetPassword(false)}
                                        className="flex-1 py-4 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/20"
                                    >
                                        Enviar
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AuthPage;
