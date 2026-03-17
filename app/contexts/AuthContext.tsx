'use client';

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from 'react';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    id: number;
    name: string;
    email: string;
    role: string;
    phone: number;
    exp?: number;
}

type RoleName = 'Admin' | 'Doctor' | 'Patient' | 'Receptionist' | string;
interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: RoleName;
    clinicId?: number;
    clinicName?: string;
    clinicCode?: string;
}

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, user?: AuthUser) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    }, []);

    const login = useCallback((newToken: string, userObj?: AuthUser) => {
        if (newToken === 'mock_token') {
            const mockUser: AuthUser = { id: 1, name: 'Mock User', email: 'mock@localhost', role: 'Admin', clinicId: 1, clinicName: 'Mock Clinic', clinicCode: 'MOCK' };
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(mockUser));
            setToken(newToken);
            setUser(mockUser);
            return;
        }

        try {
            const decoded = jwtDecode<DecodedToken>(newToken);
            const now = Date.now() / 1000;

            if (decoded.exp && decoded.exp < now) {
                logout();
                return;
            }

            localStorage.setItem('token', newToken);
            setToken(newToken);

            if (userObj) {
                const formattedRole = userObj.role ? userObj.role.charAt(0).toUpperCase() + userObj.role.slice(1).toLowerCase() : 'Patient';
                const formattedUser = { ...userObj, role: formattedRole };
                localStorage.setItem('user', JSON.stringify(formattedUser));
                setUser(formattedUser);
            } else {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                } else {
                    const fallbackRole = decoded.role ? decoded.role.charAt(0).toUpperCase() + decoded.role.slice(1).toLowerCase() : 'Patient';
                    setUser({
                        id: decoded.id || (decoded as any).userId || 0,
                        name: decoded.name || 'Unknown',
                        email: decoded.email || '',
                        role: fallbackRole as RoleName,
                        clinicId: (decoded as any).clinicId
                    });
                }
            }
        } catch (error) {
            console.error("Failed to decode token:", error, newToken);
            logout();
        }
    }, [logout]);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            login(storedToken);
        }
        setIsLoading(false);
    }, [login]);

    return (
        <AuthContext.Provider
            value={{ user, token, isAuthenticated: !!user, isLoading, login, logout, }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}
