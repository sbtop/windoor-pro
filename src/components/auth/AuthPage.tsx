import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Building2 } from 'lucide-react';

const AuthPage: React.FC = () => {
    console.log('AuthPage rendered');
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const ACCOUNTS_KEY = 'windoor-accounts-v2';
    const SESSION_KEY = 'windoor-session-v2';

    const getAccounts = () => {
        try {
            return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
        } catch {
            return [];
        }
    };

    const login = async (email: string, password: string) => {
        const accounts = getAccounts();
        const user = accounts.find((a: any) => a.email.toLowerCase() === email.toLowerCase() && a.password === password);
        if (user) {
            localStorage.setItem(SESSION_KEY, JSON.stringify({
                isAuthenticated: true,
                currentUser: {
                    userId: user.userId,
                    email: user.email,
                    name: user.name
                }
            }));
            return true;
        }
        return false;
    };

    const register = async (name: string, email: string, password: string) => {
        const accounts = getAccounts();
        if (accounts.some((a: any) => a.email.toLowerCase() === email.toLowerCase())) {
            throw new Error("El correo ya está registrado");
        }

        const newUser = {
            userId: `usr-${Math.random().toString(36).substr(2, 9)}`,
            name,
            email,
            password
        };

        accounts.push(newUser);
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));

        localStorage.setItem(SESSION_KEY, JSON.stringify({
            isAuthenticated: true,
            currentUser: {
                userId: newUser.userId,
                email: newUser.email,
                name: newUser.name
            }
        }));

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const success = await login(email, password);
                if (!success) {
                    setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
                } else {
                    window.location.reload();
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
                window.location.reload();
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
                                {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                            </h3>
                            <p className="text-slate-400 font-medium text-sm">
                                {isLogin ? 'Accede a tu panel de trabajo.' : 'Regístra tu espacio profesional.'}
                            </p>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-bold flex items-center gap-3">
                                <Lock size={16} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
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

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-500/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
                            >
                                {loading ? (
                                    <span className="animate-spin w-5 h-5 border-2 border-white/20 border-t-white rounded-full" />
                                ) : (
                                    <>
                                        {isLogin ? 'Entrar' : 'Registrarse'} 
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="pt-6 border-t border-white/5">
                            <button 
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-[11px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-colors w-full"
                            >
                                {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AuthPage;
