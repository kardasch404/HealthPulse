import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { appointmentService } from '../../../core/infrastructure/api/services/appointmentService';
import { patientService } from '../../../core/infrastructure/api/services/patientService';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/atoms/Card';
import { Modal } from '../../components/molecules/Modal';

const appointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient required'),
  appointmentDate: z.string().min(1, 'Date required'),
  appointmentTime: z.string().min(1, 'Time required'),
  type: z.string().min(1, 'Type required'),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

export const MyAppointments = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
  });

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await appointmentService.getAll();
      const data = response?.data?.data || response?.data || [];
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await patientService.getAll();
      const data = response?.data?.data || response?.data || [];
      setPatients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      await appointmentService.create(data);
      reset();
      setShowCreateModal(false);
      fetchAppointments();
      alert('Appointment created successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create appointment');
    }
  };

  const handleComplete = async (id: string) => {
    if (!confirm('Mark this appointment as completed?')) return;
    try {
      await appointmentService.complete(id);
      fetchAppointments();
      alert('Appointment completed');
    } catch (error) {
      alert('Failed to complete appointment');
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await appointmentService.cancel(id);
      fetchAppointments();
      alert('Appointment cancelled');
    } catch (error) {
      alert('Failed to cancel appointment');
    }
  };

  const viewDetails = async (appointment: any) => {
    try {
      const response = await appointmentService.getById(appointment._id);
      setSelectedAppointment(response?.data?.data || response?.data || appointment);
      setShowDetailsModal(true);
    } catch (error) {
      setSelectedAppointment(appointment);
      setShowDetailsModal(true);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (statusFilter === 'all') return true;
    return apt.status === statusFilter;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Appointments</h2>
          <p className="text-gray-600">Manage your appointments</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Appointment
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Appointments ({filteredAppointments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading appointments...</div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No appointments found</div>
          ) : (
            <div className="space-y-3">
              {filteredAppointments.map((apt) => (
                <div key={apt._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        {apt.patientId?.fname} {apt.patientId?.lname}
                      </h4>
                      <p className="text-sm text-gray-600">{apt.type}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {new Date(apt.appointmentDate).toLocaleDateString()} at {apt.appointmentTime}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(apt.status)}`}>
                          {apt.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => viewDetails(apt)}>Details</Button>
                    {apt.status === 'scheduled' && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleComplete(apt._id)}>Complete</Button>
                        <Button variant="outline" size="sm" onClick={() => handleCancel(apt._id)} className="text-red-600">Cancel</Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); reset(); }} title="Create New Appointment">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Patient</label>
            <select
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              {...register('patientId')}
            >
              <option value="">Choose a patient</option>
              {patients.map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.fname} {patient.lname} - {patient.email}
                </option>
              ))}
            </select>
            {errors.patientId && <p className="text-sm text-red-600 mt-1">{errors.patientId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" error={errors.appointmentDate?.message} {...register('appointmentDate')} />
            <Input label="Time" type="time" error={errors.appointmentTime?.message} {...register('appointmentTime')} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Type</label>
            <select
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              {...register('type')}
            >
              <option value="">Select type</option>
              <option value="consultation">Consultation</option>
              <option value="follow-up">Follow-up</option>
              <option value="emergency">Emergency</option>
              <option value="routine-checkup">Routine Checkup</option>
            </select>
            {errors.type && <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>}
          </div>

          <Input label="Reason (Optional)" placeholder="Reason for visit" error={errors.reason?.message} {...register('reason')} />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="Additional notes..."
              {...register('notes')}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { setShowCreateModal(false); reset(); }}>Cancel</Button>
            <Button type="submit">Create Appointment</Button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Appointment Details">
        {selectedAppointment && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Patient</h4>
              <p className="text-base text-gray-900">
                {selectedAppointment.patientId?.fname} {selectedAppointment.patientId?.lname}
              </p>
              <p className="text-sm text-gray-600">{selectedAppointment.patientId?.email}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Date</h4>
                <p className="text-base text-gray-900">{new Date(selectedAppointment.appointmentDate).toLocaleDateString()}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Time</h4>
                <p className="text-base text-gray-900">{selectedAppointment.appointmentTime}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Type</h4>
                <p className="text-base text-gray-900 capitalize">{selectedAppointment.type}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>
                  {selectedAppointment.status}
                </span>
              </div>
            </div>
            {selectedAppointment.reason && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Reason</h4>
                <p className="text-base text-gray-900">{selectedAppointment.reason}</p>
              </div>
            )}
            {selectedAppointment.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                <p className="text-base text-gray-900">{selectedAppointment.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
