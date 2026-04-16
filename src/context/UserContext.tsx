import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface UserData {
    userId: string;
    email: string;
    name: string;
}

interface UserContextType {
    isAuthenticated: boolean;
    currentUser: UserData | null;
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, password: string) => Promise<boolean>;
    logout: () => void;
    setDisplayName: (name: string) => void;
    resetPassword: (email: string, newPassword: string) => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// ── Helpers para la "Base de datos" de cuentas ────────────────────────────────
const ACCOUNTS_KEY = 'windoor-accounts-v2';
const SESSION_KEY = 'windoor-session-v2';

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

// ── Provider ──────────────────────────────────────────────────────────────────
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);

    // Load session from localStorage on mount
    useEffect(() => {
        const session = localStorage.getItem(SESSION_KEY);
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                if (sessionData.isAuthenticated && sessionData.currentUser) {
                    setIsAuthenticated(true);
                    setCurrentUser(sessionData.currentUser);
                }
            } catch (e) {
                console.error('Failed to load session:', e);
            }
        }
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        const accounts = getRegisteredAccounts();
        const user = accounts.find(a => a.email.toLowerCase() === email.toLowerCase() && a.password === password);
        
        if (user) {
            const userData = {
                userId: user.userId,
                email: user.email,
                name: user.name
            };
            
            setCurrentUser(userData);
            setIsAuthenticated(true);
            
            // Save session to localStorage
            localStorage.setItem(SESSION_KEY, JSON.stringify({
                isAuthenticated: true,
                currentUser: userData
            }));
            
            return true;
        }
        return false;
    };

    const register = async (name: string, email: string, password: string): Promise<boolean> => {
        const accounts = getRegisteredAccounts();
        if (accounts.some(a => a.email.toLowerCase() === email.toLowerCase())) {
            throw new Error("El correo ya está registrado");
        }

        const newUser = {
            userId: generateUserId(),
            name,
            email,
            password
        };

        saveAccount(newUser);

        const userData = {
            userId: newUser.userId,
            email: newUser.email,
            name: newUser.name
        };

        setCurrentUser(userData);
        setIsAuthenticated(true);

        localStorage.setItem(SESSION_KEY, JSON.stringify({
            isAuthenticated: true,
            currentUser: userData
        }));

        return true;
    };

    const logout = () => {
        setCurrentUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem(SESSION_KEY);
    };

    const setDisplayName = (name: string) => {
        if (currentUser) {
            const updatedUser = { ...currentUser, name };
            setCurrentUser(updatedUser);

            // Update in localStorage session
            localStorage.setItem(SESSION_KEY, JSON.stringify({
                isAuthenticated: true,
                currentUser: updatedUser
            }));

            // Update in 'database'
            const accounts = getRegisteredAccounts();
            const idx = accounts.findIndex(a => a.userId === currentUser.userId);
            if (idx > -1) {
                accounts[idx].name = name;
                localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
            }
        }
    };

    const resetPassword = async (email: string, newPassword: string): Promise<boolean> => {
        const accounts = getRegisteredAccounts();
        const idx = accounts.findIndex(a => a.email.toLowerCase() === email.toLowerCase());

        if (idx === -1) {
            return false;
        }

        accounts[idx].password = newPassword;
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));

        return true;
    };

    return (
        <UserContext.Provider value={{
            isAuthenticated,
            currentUser,
            login,
            register,
            logout,
            setDisplayName,
            resetPassword
        }}>
            {children}
        </UserContext.Provider>
    );
};

// ── Hook ─────────────────────────────────────────────────────────────────────
export const useUserContext = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUserContext must be used within a UserProvider');
    }
    return context;
};
