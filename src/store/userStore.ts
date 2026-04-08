import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface UserData {
    userId: string;
    email: string;
    name: string;
}

interface UserState {
    isAuthenticated: boolean;
    currentUser: UserData | null;
    
    // Actions
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, password: string) => Promise<boolean>;
    logout: () => void;
    setDisplayName: (name: string) => void;
}

// ── Helpers para la "Base de datos" de cuentas ────────────────────────────────
const ACCOUNTS_KEY = 'windoor-accounts-v2';

const getRegisteredAccounts = (): any[] => {
    try {
        return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
    } catch {
        return [];
    }
};

const saveAccount = (account: any) => {
    const accs = getRegisteredAccounts();
    accs.push(account);
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accs));
};

const generateUserId = (): string => {
    const hex = () => Math.floor(Math.random() * 0xFFFF).toString(16).padStart(4, '0');
    return `usr-${hex()}${hex()}-${hex()}`;
};

// ── Store ─────────────────────────────────────────────────────────────────────
/**
 * 🔐 Local User Identity Store
 * Maneja la sesión activa del usuario. Guarda solo el usuario actual en 
 * `windoor-session-v2`. Además maneja la simulación de registro/login.
 */
export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            isAuthenticated: false,
            currentUser: null,

            login: async (email, password) => {
                const accounts = getRegisteredAccounts();
                const user = accounts.find(a => a.email.toLowerCase() === email.toLowerCase() && a.password === password);
                
                if (user) {
                    set({ 
                        isAuthenticated: true, 
                        currentUser: {
                            userId: user.userId,
                            email: user.email,
                            name: user.name
                        } 
                    });
                    return true;
                }
                return false;
            },

            register: async (name, email, password) => {
                const accounts = getRegisteredAccounts();
                if (accounts.some(a => a.email.toLowerCase() === email.toLowerCase())) {
                    throw new Error("El correo ya está registrado");
                }

                const newUser = {
                    userId: generateUserId(),
                    name,
                    email,
                    password // En una app real, nunca se guarda en texto claro
                };

                saveAccount(newUser);

                // Auto-login after register
                set({
                    isAuthenticated: true,
                    currentUser: {
                        userId: newUser.userId,
                        email: newUser.email,
                        name: newUser.name
                    }
                });

                return true;
            },

            logout: () => {
                set({ isAuthenticated: false, currentUser: null });
            },

            setDisplayName: (name) => {
                const { currentUser } = get();
                if (currentUser) {
                    // Update session
                    set({ currentUser: { ...currentUser, name } });
                    
                    // Update in 'database'
                    const accounts = getRegisteredAccounts();
                    const idx = accounts.findIndex(a => a.userId === currentUser.userId);
                    if (idx > -1) {
                        accounts[idx].name = name;
                        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
                    }
                }
            },
        }),
        {
            name: 'windoor-session-v2', // Persistimos solo la sesión actual con key v2 para arrancar de cero
        }
    )
);
