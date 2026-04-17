import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Building2, KeyRound, CheckCircle2 } from 'lucide-react';
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
        <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-[#020617] font-body">
            <main className="w-full max-w-md">
                <div className="bg-slate-900/50 backdrop-blur-xl shadow-2xl border border-white/10 ring-1 ring-black/5 p-8 md:p-12 rounded-3xl">
                    <div className="space-y-8">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
                                    <Building2 className="text-white w-6 h-6" />
                                </div>
                                <h1 className="text-2xl font-black text-white tracking-tighter uppercase">WinDoor Pro</h1>
                            </div>
                            <h3 className="text-3xl font-black text-white tracking-tight mb-2">
                                {authMode === 'login' ? 'Iniciar Sesión' : authMode === 'register' ? 'Crear Cuenta' : 'Recuperar Contraseña'}
                            </h3>
                            <p className="text-slate-400 font-medium text-sm">
                                {authMode === 'login' ? 'Accede a tu panel de trabajo.' : authMode === 'register' ? 'Regístra tu espacio profesional.' : 'Restablece tu contraseña de acceso.'}
                            </p>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-bold flex items-center gap-3">
                                <Lock size={16} />
                                {error}
                            </div>
                        )}

                        {successMessage && (
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs font-bold flex items-center gap-3">
                                <CheckCircle2 size={16} />
                                {successMessage}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {authMode === 'register' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Nombre</label>
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-4 py-4 text-white text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                                        placeholder="Ej. Vidrios Alfa"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Correo</label>
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-4 py-4 text-white text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                                    placeholder="admin@empresa.com"
                                />
                            </div>

                            {authMode !== 'forgot' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Contraseña</label>
                                    <input 
                                        type="password" 
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-4 py-4 text-white text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                                        placeholder="••••••••"
                                    />
                                </div>
                            )}

                            {authMode === 'forgot' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Nueva Contraseña</label>
                                    <input 
                                        type="password" 
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-4 py-4 text-white text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                                        placeholder="••••••••"
                                    />
                                </div>
                            )}

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-500/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
                            >
                                {loading ? (
                                    <span className="animate-spin w-5 h-5 border-2 border-white/20 border-t-white rounded-full" />
                                ) : (
                                    <>
                                        {authMode === 'login' ? 'Entrar' : authMode === 'register' ? 'Registrarse' : 'Restablecer'}
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="pt-6 border-t border-white/5 space-y-2">
                            {authMode === 'login' && (
                                <>
                                    <button 
                                        onClick={() => setAuthMode('forgot')}
                                        className="text-[11px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-colors w-full flex items-center justify-center gap-2"
                                    >
                                        <KeyRound size={14} />
                                        ¿Olvidaste tu contraseña?
                                    </button>
                                    <button 
                                        onClick={() => setAuthMode('register')}
                                        className="text-[11px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-colors w-full"
                                    >
                                        ¿No tienes cuenta? Regístrate
                                    </button>
                                </>
                            )}
                            {authMode === 'register' && (
                                <button 
                                    onClick={() => setAuthMode('login')}
                                    className="text-[11px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-colors w-full"
                                >
                                    ¿Ya tienes cuenta? Inicia sesión
                                </button>
                            )}
                            {authMode === 'forgot' && (
                                <button 
                                    onClick={() => setAuthMode('login')}
                                    className="text-[11px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-colors w-full"
                                >
                                    Volver a Iniciar Sesión
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AuthPage;
