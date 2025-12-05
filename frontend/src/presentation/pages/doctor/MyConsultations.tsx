import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { consultationService } from '../../../core/infrastructure/api/services/consultationService';
import { patientService } from '../../../core/infrastructure/api/services/patientService';
import { appointmentService } from '../../../core/infrastructure/api/services/appointmentService';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/atoms/Card';
import { Modal } from '../../components/molecules/Modal';
import { useAuth } from '../../hooks/useAuth';
import { consultationSchema, ConsultationFormData } from '../../../shared/utils/validators';

export const MyConsultations = () => {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patientAppointments, setPatientAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [patientHistory, setPatientHistory] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationSchema),
  });

  useEffect(() => {
    fetchConsultations();
    fetchPatients();
    fetchAppointments();
    
    // Auto-populate from URL params if coming from appointment
    const params = new URLSearchParams(window.location.search);
    const appointmentId = params.get('appointmentId');
    const patientId = params.get('patientId');
    
    if (appointmentId && patientId) {
      setShowCreateModal(true);
      setSelectedPatientId(patientId);
      // Pre-fill the form
      setTimeout(() => {
        reset({
          terminId: appointmentId,
          patientId: patientId,
        });
      }, 100);
    }
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      const filtered = appointments.filter(apt => 
        apt.patientId._id === selectedPatientId && apt.status === 'scheduled'
      );
      setPatientAppointments(filtered);
    } else {
      setPatientAppointments([]);
    }
  }, [selectedPatientId, appointments]);

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      const response = await consultationService.getAll();
      const data = response?.data?.data || response?.data || [];
      setConsultations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching consultations:', error);
      setConsultations([]);
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

  const fetchAppointments = async () => {
    try {
      const response = await appointmentService.getAll(user?._id);
      const data = response?.data?.data || response?.data || [];
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const onSubmit = async (data: ConsultationFormData) => {
    try {
      const consultationPayload = {
        terminId: data.terminId,
        patientId: data.patientId,
        chiefComplaint: data.chiefComplaint,
        historyOfPresentIllness: data.historyOfPresentIllness,
        symptoms: data.symptoms ? data.symptoms.split(',').map(s => s.trim()) : [],
        vitalSigns: {
          bloodPressure: data.bloodPressure,
          pulse: data.pulse ? Number(data.pulse) : undefined,
          temperature: data.temperature ? Number(data.temperature) : undefined,
          respiratoryRate: data.respiratoryRate ? Number(data.respiratoryRate) : undefined,
          weight: data.weight ? Number(data.weight) : undefined,
          height: data.height ? Number(data.height) : undefined,
          oxygenSaturation: data.oxygenSaturation ? Number(data.oxygenSaturation) : undefined,
        },
        physicalExamination: data.physicalExamination,
        diagnosis: data.diagnosis,
        treatmentPlan: data.treatmentPlan,
        notes: data.notes,
        followUpDate: data.followUpDate,
        followUpInstructions: data.followUpInstructions,
      };
      await consultationService.create(consultationPayload);
      reset();
      setShowCreateModal(false);
      fetchConsultations();
      alert('Consultation created successfully!');
    } catch (error: any) {
      console.error('Create consultation error:', error);
      alert(error.response?.data?.message || 'Failed to create consultation');
    }
  };

  const handleComplete = async (id: string) => {
    if (!confirm('Mark this consultation as completed?')) return;
    try {
      await consultationService.complete(id);
      fetchConsultations();
      alert('Consultation completed');
    } catch (error) {
      alert('Failed to complete consultation');
    }
  };

  const viewDetails = async (consultation: any) => {
    try {
      const response = await consultationService.getById(consultation._id);
      setSelectedConsultation(response?.data?.data || response?.data || consultation);
      setShowDetailsModal(true);
    } catch (error) {
      setSelectedConsultation(consultation);
      setShowDetailsModal(true);
    }
  };

  const viewPatientHistory = async (patientId: string) => {
    try {
      const response = await consultationService.getPatientHistory(patientId);
      setPatientHistory(response?.data?.data || response?.data || []);
      setShowHistoryModal(true);
    } catch (error) {
      alert('Failed to load patient history');
    }
  };

  const filteredConsultations = consultations.filter(cons => {
    if (statusFilter === 'all') return true;
    return cons.status === statusFilter;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'in-progress': 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Consultations</h2>
          <p className="text-gray-600">Manage patient consultations</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Consultation
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
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Consultations ({filteredConsultations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading consultations...</div>
          ) : filteredConsultations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No consultations found</div>
          ) : (
            <div className="space-y-3">
              {filteredConsultations.map((cons) => (
                <div key={cons._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full flex items-center justify-center bg-purple-100 text-purple-600">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        {cons.patientId?.fname} {cons.patientId?.lname}
                      </h4>
                      <p className="text-sm text-gray-600">{cons.chiefComplaint}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {new Date(cons.consultationDate || cons.createdAt).toLocaleDateString()}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(cons.status)}`}>
                          {cons.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => viewDetails(cons)}>Details</Button>
                    <Button variant="outline" size="sm" onClick={() => viewPatientHistory(cons.patientId._id)}>History</Button>
                    {cons.status !== 'completed' && (
                      <Button variant="outline" size="sm" onClick={() => handleComplete(cons._id)}>Complete</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); reset(); window.history.replaceState({}, '', '/dashboard/consultations'); }} title="New Consultation">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Patient</label>
            <select
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              {...register('patientId')}
              onChange={(e) => setSelectedPatientId(e.target.value)}
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

          {selectedPatientId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Link to Appointment (Optional)</label>
              <select
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                {...register('terminId')}
              >
                <option value="">No appointment (Walk-in)</option>
                {patientAppointments.map((apt) => (
                  <option key={apt._id} value={apt._id}>
                    {new Date(apt.date).toLocaleDateString()} at {apt.startTime} - {apt.type}
                  </option>
                ))}
              </select>
              {patientAppointments.length === 0 && selectedPatientId && (
                <p className="text-sm text-amber-600 mt-1">No scheduled appointments found for this patient</p>
              )}
            </div>
          )}

          <Input label="Chief Complaint" placeholder="Main reason for visit" error={errors.chiefComplaint?.message} {...register('chiefComplaint')} />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">History of Present Illness</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="Detailed history..."
              {...register('historyOfPresentIllness')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms (comma-separated)</label>
            <Input placeholder="Headache, Nausea, Fever" {...register('symptoms')} />
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Vital Signs</h4>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Blood Pressure" placeholder="120/80" error={errors.bloodPressure?.message} {...register('bloodPressure')} />
              <Input label="Pulse (bpm)" type="number" min="0" placeholder="72" error={errors.pulse?.message} {...register('pulse')} />
              <Input label="Temperature (°C)" type="number" step="0.1" min="0" placeholder="37.0" error={errors.temperature?.message} {...register('temperature')} />
              <Input label="Respiratory Rate" type="number" min="0" placeholder="18" error={errors.respiratoryRate?.message} {...register('respiratoryRate')} />
              <Input label="Weight (kg)" type="number" step="0.1" min="0" placeholder="70" error={errors.weight?.message} {...register('weight')} />
              <Input label="Height (cm)" type="number" min="0" placeholder="175" error={errors.height?.message} {...register('height')} />
              <Input label="O2 Saturation (%)" type="number" min="0" max="100" placeholder="98" error={errors.oxygenSaturation?.message} {...register('oxygenSaturation')} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Physical Examination</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="Physical examination findings..."
              {...register('physicalExamination')}
            />
          </div>

          <Input label="Diagnosis (Optional)" placeholder="Initial diagnosis" {...register('diagnosis')} />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Treatment Plan (Optional)</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="Treatment recommendations..."
              {...register('treatmentPlan')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="Additional notes..."
              {...register('notes')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Follow-up Date" type="date" {...register('followUpDate')} />
            <Input label="Follow-up Instructions" placeholder="Return if symptoms persist" {...register('followUpInstructions')} />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { setShowCreateModal(false); reset(); }}>Cancel</Button>
            <Button type="submit">Create Consultation</Button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Consultation Details">
        {selectedConsultation && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Patient</h4>
              <p className="text-base text-gray-900">
                {selectedConsultation.patientId?.fname} {selectedConsultation.patientId?.lname}
              </p>
              <p className="text-sm text-gray-600">{selectedConsultation.patientId?.email}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Chief Complaint</h4>
              <p className="text-base text-gray-900">{selectedConsultation.chiefComplaint}</p>
            </div>
            {selectedConsultation.symptoms && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Symptoms</h4>
                <p className="text-base text-gray-900">{selectedConsultation.symptoms}</p>
              </div>
            )}
            {selectedConsultation.vitalSigns && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Vital Signs</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {selectedConsultation.vitalSigns.bloodPressure && (
                    <div><span className="text-gray-600">BP:</span> <span className="font-medium">{selectedConsultation.vitalSigns.bloodPressure}</span></div>
                  )}
                  {selectedConsultation.vitalSigns.heartRate && (
                    <div><span className="text-gray-600">HR:</span> <span className="font-medium">{selectedConsultation.vitalSigns.heartRate} bpm</span></div>
                  )}
                  {selectedConsultation.vitalSigns.temperature && (
                    <div><span className="text-gray-600">Temp:</span> <span className="font-medium">{selectedConsultation.vitalSigns.temperature}°C</span></div>
                  )}
                  {selectedConsultation.vitalSigns.weight && (
                    <div><span className="text-gray-600">Weight:</span> <span className="font-medium">{selectedConsultation.vitalSigns.weight} kg</span></div>
                  )}
                  {selectedConsultation.vitalSigns.height && (
                    <div><span className="text-gray-600">Height:</span> <span className="font-medium">{selectedConsultation.vitalSigns.height} cm</span></div>
                  )}
                </div>
              </div>
            )}
            {selectedConsultation.diagnosis && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Diagnosis</h4>
                <p className="text-base text-gray-900">{selectedConsultation.diagnosis}</p>
              </div>
            )}
            {selectedConsultation.treatmentPlan && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Treatment Plan</h4>
                <p className="text-base text-gray-900">{selectedConsultation.treatmentPlan}</p>
              </div>
            )}
            {selectedConsultation.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                <p className="text-base text-gray-900">{selectedConsultation.notes}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Date</h4>
                <p className="text-sm text-gray-900">{new Date(selectedConsultation.consultationDate || selectedConsultation.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(selectedConsultation.status)}`}>
                  {selectedConsultation.status}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Patient History Modal */}
      <Modal isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)} title="Patient Consultation History">
        <div className="space-y-3">
          {patientHistory.length === 0 ? (
            <p className="text-center py-4 text-gray-500">No consultation history found</p>
          ) : (
            patientHistory.map((cons) => (
              <div key={cons._id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{cons.chiefComplaint}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(cons.consultationDate || cons.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(cons.status)}`}>
                    {cons.status}
                  </span>
                </div>
                {cons.diagnosis && (
                  <p className="text-sm text-gray-600 mt-2"><span className="font-medium">Diagnosis:</span> {cons.diagnosis}</p>
                )}
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};
