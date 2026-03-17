"use client";

import {  useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import api from '../services/api';
import ProtectedLayout from '../components/Layout/ProtectedLayout';
import ToastContainer from '../components/ui/ToastContainer';

export default function AdminPage() {
    const { user } = useAuth();
    const { toasts, addToast } = useToast();
    const [clinic, setClinic] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Patient' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [clinicRes, usersRes] = await Promise.all([
                api.get('/admin/clinic'),
                api.get('/admin/users')
            ]);
            setClinic(clinicRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            console.error(error);
            addToast('Failed to load admin data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'Admin') {
            fetchData();
        }
    }, [user]);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/admin/users', newUser);
            addToast(`User ${newUser.name} created successfully!`, 'success');
            setShowModal(false);
            setNewUser({ name: '', email: '', password: '', role: 'patient' });
            fetchData();
        } catch (error: any) {
            addToast(error.response?.data?.error || 'Failed to create user', 'error');
        }
    };



    return (
        <ProtectedLayout allowedRoles={['Admin']}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h1>Admin Dashboard</h1>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>➕ Create User</button>
            </div>

            {loading ? (
                <p>Loading clinic data...</p>
            ) : (
                <>
                    {clinic && (
                        <div className="card" style={{ marginBottom: 30, background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))', border: '1px solid rgba(99,102,241,0.3)' }}>
                            <h2 style={{ marginTop: 0 }}> Clinic: {clinic.name}  <span style={{ fontSize: 14, background: '#4f46e5', padding: '2px 8px', borderRadius: 12 }}>{clinic.code}</span></h2>
                            <div style={{ display: 'flex', gap: 30, marginTop: 15 }}>
                                <div>
                                    <p style={{ margin: 0, color: '#475569', fontSize: 14 }}>Total Users</p>
                                    <h3 style={{ margin: 0, fontSize: 24 }}>{clinic.userCount}</h3>
                                </div>
                                <div>
                                    <p style={{ margin: 0, color: '#475569', fontSize: 14 }}>Appointments Today</p>
                                    <h3 style={{ margin: 0, fontSize: 24 }}>{clinic.queueCount}</h3>
                                </div>
                                <div>
                                    <p style={{ margin: 0, color: '#475569', fontSize: 14 }}>Total Appointments</p>
                                    <h3 style={{ margin: 0, fontSize: 24 }}>{clinic.appointmentCount}</h3>
                                </div>
                            </div>
                        </div>
                    )}




                    <h2>Users Directory</h2>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #333', textAlign: 'left' }}>
                                    <th style={{ padding: 12 }}>ID</th>
                                    <th style={{ padding: 12 }}>Name</th>
                                    <th style={{ padding: 12 }}>Email</th>
                                    <th style={{ padding: 12 }}>Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} style={{ borderBottom: '1px solid #222' }}>
                                        <td style={{ padding: 12 }}>{u.id}</td>
                                        <td style={{ padding: 12 }}>{u.name}</td>
                                        <td style={{ padding: 12 }}>{u.email}</td>
                                        <td style={{ padding: 12 }}>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: 20, fontSize: 12,
                                                background:
                                                    u.role === 'Admin' ? 'rgba(239,68,68,0.2)' :
                                                        u.role === 'Doctor' ? 'rgba(59,130,246,0.2)' :
                                                            u.role === 'Receptionist' ? 'rgba(245,158,11,0.2)' :
                                                                'rgba(16,185,129,0.2)',
                                                color:
                                                    u.role === 'Admin' ? '#ef4444' :
                                                        u.role === 'Doctor' ? '#3b82f6' :
                                                            u.role === 'Receptionist' ? '#f59e0b' :
                                                                '#10b981'
                                            }}>
                                                {u.role}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: 400, position: 'relative' }}>
                        <button
                            onClick={() => setShowModal(false)}
                            style={{ position: 'absolute', top: 10, right: 15, background: 'transparent', border: 'none', color: 'var(--text)', fontSize: 20, cursor: 'pointer' }}
                        >✕</button>

                        <h2 style={{ marginTop: 0 }}>Create New User</h2>
                        <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div>
                                <label style={{ fontSize: 12, color: '#475569' }}>Name</label>
                                <input className="form-input" type="text" required value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: '#475569' }}>Email</label>
                                <input className="form-input" type="email" required value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: '#475569' }}>Password</label>
                                <input className="form-input" type="password" required value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: '#475569' }}>Role</label>
                                <select className="form-input" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                                    <option value="patient">patient</option>
                                    <option value="receptionist">Receptionist</option>
                                    <option value="doctor">Doctor</option>
                                </select>
                            </div>
                            <button className="btn btn-primary" type="submit" style={{ marginTop: 10 }}>Create User</button>
                        </form>
                    </div>
                </div>
            )}

            <ToastContainer toasts={toasts} />
        </ProtectedLayout>
    );
}