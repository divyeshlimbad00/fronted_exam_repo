export default function ToastContainer({ toasts }: { toasts: any[] }) {
    if (toasts.length === 0) return null;
    return (
        <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {toasts.map(t => (
                <div key={t.id} style={{
                    padding: '12px 20px', borderRadius: 8, color: '#fff',
                    background: t.type === 'error' ? '#ef4444' : '#10b981'
                }}>
                    {t.msg}
                </div>
            ))}
        </div>
    );
}