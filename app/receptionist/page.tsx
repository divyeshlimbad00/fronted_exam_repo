'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import api from '../services/api';
import ProtectedLayout from '../components/Layout/ProtectedLayout';
import ToastContainer from '../components/ui/ToastContainer';

export default function ReceptionistPage() {
    const { user } = useAuth();
    const { toasts, addToast } = useToast();
    const [queue, setQueue] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

    const fetchQueue = async (date: string) => {
        setLoading(true);
        try {
            const res = await api.get(`/queue?date=${date}`);
            setQueue(res.data);
        } catch (error) {
            console.error(error);
            addToast('Failed to load queue for selected date', 'error');
            setQueue([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'Receptionist') {
            fetchQueue(selectedDate);
        }
    }, [user, selectedDate]);

    const handleUpdateStatus = async (id: number, newStatus: string) => {
        try {
            await api.patch(`/queue/${id}`, { status: newStatus });
            addToast(`Queue status updated to ${newStatus}`, 'success');
            fetchQueue(selectedDate);
        } catch (error: any) {
            addToast(error.response?.data?.error || 'Failed to update status', 'error');
        }
    };

    return (
        <ProtectedLayout allowedRoles={['Receptionist']}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h1>Daily Queue Management</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <label style={{ color: '#475569' }}>Date:</label>
                    <input
                        type="date"
                        className="form-input"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ width: 'auto' }}
                    />
                </div>
            </div>

            {loading ? (
                <p>Loading queue...</p>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ padding: 15 }}>Token</th>
                                <th style={{ padding: 15 }}>Patient Name</th>
                                <th style={{ padding: 15 }}>Time Slot</th>
                                <th style={{ padding: 15 }}>Status</th>
                                <th style={{ padding: 15 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {queue.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: 20, textAlign: 'center', color: '#475569' }}>
                                        No appointments queued for this date.
                                    </td>
                                </tr>
                            ) : (
                                queue.map(entry => (
                                    <tr key={entry.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: 15, fontWeight: 'bold', fontSize: 18, color: '#6366f1' }}>
                                            {entry.tokenNumber}
                                        </td>
                                        <td style={{ padding: 15 }}>{entry.patientName}</td>
                                        <td style={{ padding: 15 }}>{entry.timeSlot}</td>
                                        <td style={{ padding: 15 }}>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: 20, fontSize: 12,
                                                background:
                                                    entry.status === 'waiting' ? 'rgba(245,158,11,0.2)' :
                                                        entry.status === 'in_progress' ? 'rgba(59,130,246,0.2)' :
                                                            entry.status === 'done' ? 'rgba(16,185,129,0.2)' :
                                                                'rgba(239,68,68,0.2)', 
                                                color:
                                                    entry.status === 'waiting' ? '#f59e0b' :
                                                        entry.status === 'in_progress' ? '#3b82f6' :
                                                            entry.status === 'done' ? '#10b981' :
                                                                '#ef4444' 
                                            }}>
                                                {entry.status.toUpperCase().replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td style={{ padding: 15 }}>
                                            {entry.status === 'waiting' && (
                                                <div style={{ display: 'flex', gap: 5 }}>
                                                    <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => handleUpdateStatus(entry.id, 'in_progress')}>Start</button>
                                                    <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => handleUpdateStatus(entry.id, 'skipped')}>Skip</button>
                                                </div>
                                            )}
                                            {entry.status === 'in_progress' && (
                                                <button className="btn" style={{ padding: '4px 8px', fontSize: 12, background: '#10b981', color: '#fff' }} onClick={() => handleUpdateStatus(entry.id, 'done')}>Mark Done</button>
                                            )}
                                            {(entry.status === 'done' || entry.status === 'skipped') && (
                                                <span style={{ color: '#475569', fontSize: 12 }}>No actions</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <ToastContainer toasts={toasts} />
        </ProtectedLayout>
    );
}
