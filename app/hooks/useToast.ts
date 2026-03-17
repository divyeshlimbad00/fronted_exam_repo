import { useState } from 'react';

export function useToast() {
    const [toasts, setToasts] = useState<{ id: string, msg: string, type: string }[]>([]);

    const addToast = (msg: string, type: 'success' | 'error' = 'success') => {
        const id = Math.random().toString();
        setToasts(prev => [...prev, { id, msg, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    return { toasts, addToast };
}