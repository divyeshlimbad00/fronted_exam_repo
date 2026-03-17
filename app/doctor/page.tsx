'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import api from '../services/api';
import ProtectedLayout from '../components/Layout/ProtectedLayout';
import ToastContainer from '../components/ui/ToastContainer';

export default function DoctorPage() {
    const { user } = useAuth();
    const { toasts, addToast } = useToast();
    const [queue, setQueue] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [activeModal, setActiveModal] = useState<'prescription' | 'report' | null>(null);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);

    const [notes, setNotes] = useState('');
    const [medicines, setMedicines] = useState([{ name: '', dosage: '', duration: '' }]);

    const [diagnosis, setDiagnosis] = useState('');
    const [tests, setTests] = useState('');
    const [remarks, setRemarks] = useState('');

    const fetchQueue = async () => {
        setLoading(true);
        try {
            const res = await api.get('/doctor/queue');
            setQueue(res.data);
        } catch (error) {
            console.error(error);
            addToast("Failed to load today's queue", 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'Doctor') {
            fetchQueue();
        }
    }, [user]);

    const handleAddMedicine = () => setMedicines([...medicines, { name: '', dosage: '', duration: '' }]);
    const handleRemoveMedicine = (index: number) => setMedicines(medicines.filter((_, i) => i !== index));
    const handleMedicineChange = (index: number, field: string, value: string) => {
        const newMeds = [...medicines];
        (newMeds[index] as any)[field] = value;
        setMedicines(newMeds);
    };

    const handleSubmitPrescription = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAppointmentId) return;
        try {
            await api.post(`/prescriptions/${selectedAppointmentId}`, { notes, medicines });
            addToast('Prescription added successfully', 'success');
            setActiveModal(null);
            setNotes('');
            setMedicines([{ name: '', dosage: '', duration: '' }]);
        } catch (error: any) {
            addToast(error.response?.data?.error || 'Failed to add prescription', 'error');
        }
    };

    const handleSubmitReport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAppointmentId) return;
        try {
            await api.post(`/reports/${selectedAppointmentId}`, { diagnosis, tests, remarks });
            addToast('Report added successfully', 'success');
            setActiveModal(null);
            setDiagnosis('');
            setTests('');
            setRemarks('');
        } catch (error: any) {
            addToast(error.response?.data?.error || 'Failed to add report', 'error');
        }
    };

    return (
        <ProtectedLayout allowedRoles={['Doctor']}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h1>Today's Consultations</h1>
            </div>

            {loading ? (
                <p>Loading queue...</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
                    {queue.length === 0 ? (
                        <p style={{ color: '#475569' }}>No patients in your queue today.</p>
                    ) : (
                        queue.map(entry => (
                            <div key={entry.id} className="card" style={{ borderLeft: '4px solid #3b82f6', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: 20 }}>{entry.patientName}</h3>
                                        <p style={{ color: '#475569', fontSize: 13, margin: '5px 0 0 0' }}>Appt ID: #{entry.appointmentId}</p>
                                    </div>
                                    <span style={{ fontSize: 24, fontWeight: 'bold', color: '#6366f1', background: 'rgba(99,102,241,0.1)', padding: '5px 15px', borderRadius: 8 }}>
                                        {entry.tokenNumber}
                                    </span>
                                </div>
                                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '10px 0' }} />
                                
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button 
                                        className="btn" 
                                        style={{ flex: 1, background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}
                                        onClick={() => { setSelectedAppointmentId(entry.appointmentId); setActiveModal('prescription'); }}
                                    >
                                        💊 Rx
                                    </button>
                                    <button 
                                        className="btn" 
                                        style={{ flex: 1, background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' }}
                                        onClick={() => { setSelectedAppointmentId(entry.appointmentId); setActiveModal('report'); }}
                                    >
                                        📋 Report
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeModal === 'prescription' && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                    <div className="card" style={{ width: 600, maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                        <button 
                            onClick={() => setActiveModal(null)}
                            style={{ position: 'absolute', top: 10, right: 15, background: 'transparent', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}
                        >✕</button>
                        
                        <h2 style={{ marginTop: 0, color: '#10b981' }}>Add Prescription</h2>
                        <form onSubmit={handleSubmitPrescription} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                            <div>
                                <label style={{ fontSize: 13, color: '#475569' }}>Doctor Notes</label>
                                <textarea className="form-input" required value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="General advice, instructions..."></textarea>
                            </div>
                            
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <label style={{ fontSize: 13, color: '#475569' }}>Medicines</label>
                                    <button type="button" className="btn" style={{ padding: '4px 8px', fontSize: 12, background: 'rgba(255,255,255,0.1)' }} onClick={handleAddMedicine}>+ Add Medicine</button>
                                </div>
                                {medicines.map((med, index) => (
                                    <div key={index} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: 10, borderRadius: 8 }}>
                                        <input className="form-input" style={{ flex: 2 }} placeholder="Name" required value={med.name} onChange={e => handleMedicineChange(index, 'name', e.target.value)} />
                                        <input className="form-input" style={{ flex: 1 }} placeholder="Dosage (e.g. 1-0-1)" required value={med.dosage} onChange={e => handleMedicineChange(index, 'dosage', e.target.value)} />
                                        <input className="form-input" style={{ flex: 1 }} placeholder="Duration (e.g. 5 days)" required value={med.duration} onChange={e => handleMedicineChange(index, 'duration', e.target.value)} />
                                        {medicines.length > 1 && (
                                            <button type="button" onClick={() => handleRemoveMedicine(index)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16 }}>✕</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            
                            <button className="btn" type="submit" style={{ marginTop: 10, background: '#10b981', color: '#fff' }}>Submit Prescription</button>
                        </form>
                    </div>
                </div>
            )}

            {activeModal === 'report' && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                    <div className="card" style={{ width: 600, maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                        <button 
                            onClick={() => setActiveModal(null)}
                            style={{ position: 'absolute', top: 10, right: 15, background: 'transparent', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}
                        >✕</button>
                        
                        <h2 style={{ marginTop: 0, color: '#3b82f6' }}>Add Medical Report</h2>
                        <form onSubmit={handleSubmitReport} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                            <div>
                                <label style={{ fontSize: 13, color: '#475569' }}>Diagnosis</label>
                                <input className="form-input" required value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="e.g. Viral Fever" />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, color: '#475569' }}>Suggested Tests</label>
                                <input className="form-input" value={tests} onChange={e => setTests(e.target.value)} placeholder="e.g. CBC, X-Ray (Optional)" />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, color: '#475569' }}>Remarks</label>
                                <textarea className="form-input" value={remarks} onChange={e => setRemarks(e.target.value)} rows={3} placeholder="Additional observations..."></textarea>
                            </div>
                            
                            <button className="btn" type="submit" style={{ marginTop: 10, background: '#3b82f6', color: '#fff' }}>Submit Report</button>
                        </form>
                    </div>
                </div>
            )}

            <ToastContainer toasts={toasts} />
        </ProtectedLayout>
    );
}
