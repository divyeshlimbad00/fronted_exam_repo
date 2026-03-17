'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import api from '../services/api';
import ProtectedLayout from '../components/Layout/ProtectedLayout';
import ToastContainer from '../components/ui/ToastContainer';

export default function PatientPage() {
    const { user } = useAuth();
    const { toasts, addToast } = useToast();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('');

    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
    const [appointmentDetails, setAppointmentDetails] = useState<any>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const res = await api.get('/appointments/my');
            setAppointments(res.data);
        } catch (error) {
            console.error(error);
            addToast('Failed to load appointments', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'patient' || user?.role === 'Patient') {
            fetchAppointments();
        }
    }, [user]);

    const handleBookAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/appointments', { appointmentDate: bookingDate, timeSlot: bookingTime });
            addToast('Appointment booked successfully!', 'success');
            setShowBookingModal(false);
            setBookingDate('');
            setBookingTime('');
            fetchAppointments();
        } catch (error: any) {
            addToast(error.response?.data?.error || 'Failed to book appointment', 'error');
        }
    };

    const handleViewDetails = async (appointment: any) => {
        setSelectedAppointment(appointment);
        setDetailsLoading(true);
        try {
            const res = await api.get(`/appointments/${appointment.id}`);
            setAppointmentDetails(res.data);
        } catch (error) {
            console.error(error);
            addToast('Failed to load appointment details', 'error');
            setAppointmentDetails(null);
        } finally {
            setDetailsLoading(false);
        }
    };

    return (
        <ProtectedLayout allowedRoles={['Patient', 'patient']}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h1>My Appointments</h1>
                <button className="btn btn-primary" onClick={() => setShowBookingModal(true)}>➕ Book Appointment</button>
            </div>

            {loading ? (
                <p>Loading your appointments...</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                    {appointments.length === 0 ? (
                        <p style={{ color: '#475569' }}>No appointments found. Book one to get started!</p>
                    ) : (
                        appointments.map(app => (
                            <div key={app.id} className="card" style={{ borderLeft: '4px solid #6366f1' }}>
                                <h3 style={{ marginTop: 0 }}>Date: {app.appointmentDate?.split('T')[0] || app.date}</h3>
                                <p style={{ color: '#475569', fontSize: 14 }}>Slot: {app.timeSlot}</p>
                                <p style={{ margin: '10px 0' }}>Status:
                                    <span style={{
                                        marginLeft: 10, padding: '4px 10px', borderRadius: 20, fontSize: 12,
                                        background: app.status === 'queued' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)',
                                        color: app.status === 'queued' ? '#f59e0b' : '#10b981'
                                    }}>{app.status}</span>
                                </p>
                                <button className="btn" style={{ width: '100%', marginTop: 10, background: 'rgba(255,255,255,0.1)' }} onClick={() => handleViewDetails(app)}>
                                    View Details
                                </button>
                            </div>
                        ))
                    )}
                </div>




            )}




            {showBookingModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: 400, position: 'relative' }}>
                        <button
                            onClick={() => setShowBookingModal(false)}
                            style={{ position: 'absolute', top: 10, right: 15, background: 'transparent', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}
                        >✕</button>

                        <h2 style={{ marginTop: 0 }}>Book Appointment</h2>
                        <form onSubmit={handleBookAppointment} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div>
                                <label style={{ fontSize: 12, color: '#475569' }}>Date</label>
                                <input className="form-input" type="date" required value={bookingDate} onChange={e => setBookingDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: '#475569' }}>Time Slot (e.g., 09:00 AM)</label>
                                <select className="form-input" required value={bookingTime} onChange={e => setBookingTime(e.target.value)}>
                                    <option value="" disabled>Select a slot</option>
                                    <option value="09:00-10:00">09:00-10:00</option>
                                    <option value="10:00-10:30">10:00-10:30</option>
                                    <option value="10:30-11:00">10:30-11:00</option>
                                    <option value="11:00-11:30">11:00-11:30</option>
                                    <option value="11:30-12:00">11:30-12:00</option>
                                    <option value="02:00-02:30">02:00-02:30</option>
                                    <option value="02:30-03:00">02:30-03:00</option>
                                    <option value="03:00-03:30">03:00-03:30</option>
                                    <option value="03:30-04:00">03:30-04:00</option>
                                    <option value="04:00-04:30">04:00-04:30</option>
                                    <option value="04:30-05:00">04:30-05:00</option>
                                    <option value="05:00-05:30">05:00-05:30</option>
                                    <option value="05:30-06:00">05:30-06:00</option>
                                </select>
                            </div>
                            <button className="btn btn-primary" type="submit" style={{ marginTop: 10 }}>Confirm Booking</button>
                        </form>
                    </div>
                </div>
            )}

            {selectedAppointment && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                    <div className="card" style={{ width: 600, maxHeight: '80vh', overflowY: 'auto', position: 'relative' }}>
                        <button
                            onClick={() => setSelectedAppointment(null)}
                            style={{ position: 'absolute', top: 10, right: 15, background: 'transparent', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}
                        >✕</button>

                        <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                            Appointment Info
                            <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 12, background: 'rgba(99,102,241,0.2)', color: '#6366f1' }}>
                                #{selectedAppointment.id}
                            </span>
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 20 }}>
                            <div>
                                <p style={{ fontSize: 12, color: '#475569', margin: '0 0 5px 0' }}>Date</p>
                                <p style={{ margin: 0, fontWeight: 500 }}>{selectedAppointment.appointmentDate?.split('T')[0] || selectedAppointment.date}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: 12, color: '#475569', margin: '0 0 5px 0' }}>Time</p>
                                <p style={{ margin: 0, fontWeight: 500 }}>{selectedAppointment.timeSlot}</p>
                            </div>
                        </div>

                        {detailsLoading ? (
                            <p style={{ textAlign: 'center', padding: 20 }}>Loading records...</p>
                        ) : appointmentDetails ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                                {appointmentDetails.queueEntry && (
                                    <div style={{ padding: 15, background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
                                        <h3 style={{ margin: '0 0 10px 0', fontSize: 16 }}>Queue Status</h3>
                                        <p style={{ margin: '0 0 5px 0' }}>Token Number: <strong style={{ color: '#fff' }}>{appointmentDetails.queueEntry.tokenNumber}</strong></p>
                                        <p style={{ margin: 0 }}>Status: <span style={{ color: '#f59e0b' }}>{appointmentDetails.queueEntry.status.toUpperCase()}</span></p>
                                    </div>
                                )}

                                {appointmentDetails.prescription ? (
                                    <div style={{ border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, overflow: 'hidden' }}>
                                        <div style={{ background: 'rgba(16,185,129,0.1)', padding: 10, borderBottom: '1px solid rgba(16,185,129,0.3)' }}>
                                            <h3 style={{ margin: 0, fontSize: 16, color: '#10b981' }}>💊 Prescription</h3>
                                        </div>
                                        <div style={{ padding: 15 }}>
                                            <p style={{ margin: '0 0 10px 0', fontSize: 14 }}><strong>Notes:</strong> {appointmentDetails.prescription.notes}</p>
                                            <h4 style={{ margin: '0 0 10px 0', fontSize: 14, color: '#475569' }}>Medicines:</h4>
                                            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14 }}>
                                                {appointmentDetails.prescription.medicines.map((med: any, i: number) => (
                                                    <li key={i} style={{ marginBottom: 5 }}>
                                                        <strong style={{ color: '#fff' }}>{med.name}</strong> - {med.dosage} ({med.duration})
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ) : (
                                    <p style={{ color: '#475569', fontSize: 14, fontStyle: 'italic' }}>No prescription issued yet.</p>
                                )}

                                {appointmentDetails.report ? (
                                    <div style={{ border: '1px solid rgba(59,130,246,0.3)', borderRadius: 8, overflow: 'hidden' }}>
                                        <div style={{ background: 'rgba(59,130,246,0.1)', padding: 10, borderBottom: '1px solid rgba(59,130,246,0.3)' }}>
                                            <h3 style={{ margin: 0, fontSize: 16, color: '#3b82f6' }}>📋 Medical Report</h3>
                                        </div>
                                        <div style={{ padding: 15 }}>
                                            <p style={{ margin: '0 0 10px 0', fontSize: 14 }}><strong>Diagnosis:</strong> {appointmentDetails.report.diagnosis}</p>
                                            <p style={{ margin: '0 0 10px 0', fontSize: 14 }}><strong>Suggested Tests:</strong> {appointmentDetails.report.tests || 'None'}</p>
                                            <p style={{ margin: 0, fontSize: 14 }}><strong>Remarks:</strong> {appointmentDetails.report.remarks || 'None'}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p style={{ color: '#475569', fontSize: 14, fontStyle: 'italic' }}>No medical report issued yet.</p>
                                )}
                            </div>
                        ) : (
                            <p style={{ color: '#ef4444' }}>Unable to fetch details.</p>
                        )}
                    </div>
                </div>
            )}

            <ToastContainer toasts={toasts} />
        </ProtectedLayout>
    );
}
