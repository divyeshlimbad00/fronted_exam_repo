'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';

export default function ProtectedLayout({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
    const { isAuthenticated, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) router.replace('/login');
        if (allowedRoles && user && !allowedRoles.includes(user.role)) {
            router.replace('/dashboard');
        }
    }, [isAuthenticated, user, router]);

    if (!isAuthenticated) return null;

    return (
        <div style={{ display: 'flex' }}>
            <aside style={{ width: 250, background: 'var(--bg-card)', borderRight: '1px solid var(--border)', height: '100vh', padding: 20 }}>
                <h2 style={{ marginBottom: 5 }}>My Clinic</h2>
                <p style={{ color: '#475569', fontSize: 12, marginBottom: 30 }}>Role: <strong style={{ color: 'var(--text)' }}>{user?.role.toUpperCase()}</strong></p>

                <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                    style={{ position: 'absolute', bottom: 20, background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                    Logout
                </button>
            </aside>

            <div style={{ flex: 1, padding: 30, background: 'var(--bg)', minHeight: '100vh', overflowY: 'auto' }}>
                {children}
            </div>
        </div>
    );
}
