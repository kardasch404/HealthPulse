import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { patientService } from '../../../core/infrastructure/api/services/patientService';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/atoms/Card';
import { Modal } from '../../components/molecules/Modal';

const patientSchema = z.object({
  fname: z.string().min(2, 'First name required'),
  lname: z.string().min(2, 'Last name required'),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^(\+212|0)[5-7]\d{8}$/, 'Invalid Moroccan phone'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type PatientFormData = z.infer<typeof patientSchema>;

export const MyPatients = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [medicalHistory, setMedicalHistory] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [patientRoleId, setPatientRoleId] = useState<string>('');

  useEffect(() => {
    fetchPatients();
    const storedRoleId = localStorage.getItem('patientRoleId');
    if (storedRoleId) {
      setPatientRoleId(storedRoleId);
    } else {
      setPatientRoleId('6909d3cf66d09c1635b62a15');
    }
  }, []);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  });

  useEffect(() => {
    if (searchTerm) {
      const filtered = patients.filter(patient =>
        patient.fname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.lname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.includes(searchTerm)
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [searchTerm, patients]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await patientService.getAll();
      const data = response?.data?.data || response?.data || [];
      setPatients(Array.isArray(data) ? data : []);
      setFilteredPatients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
      setFilteredPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: PatientFormData) => {
    try {
      if (!patientRoleId) {
        alert('Patient role not configured');
        return;
      }
      const payload = {
        ...data,
        roleId: patientRoleId,
      };
      await patientService.create(payload);
      reset();
      setShowCreateModal(false);
      fetchPatients();
      alert('Patient created successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create patient');
    }
  };

  const viewDetails = async (patient: any) => {
    try {
      const response = await patientService.getById(patient._id);
      setSelectedPatient(response?.data?.data || response?.data || patient);
      setShowDetailsModal(true);
    } catch (error) {
      setSelectedPatient(patient);
      setShowDetailsModal(true);
    }
  };

  const viewMedicalHistory = async (patient: any) => {
    try {
      const response = await patientService.getMedicalHistory(patient._id);
      setMedicalHistory(response?.data?.data || response?.data);
      setSelectedPatient(patient);
      setShowHistoryModal(true);
    } catch (error) {
      alert('Failed to load medical history');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Patients</h2>
          <p className="text-gray-600">Manage your patients</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Patient
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Patients ({filteredPatients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading patients...</div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No patients found</div>
          ) : (
            <div className="space-y-3">
              {filteredPatients.map((patient) => (
                <div key={patient._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{patient.fname} {patient.lname}</h4>
                      <p className="text-sm text-gray-600">{patient.email}</p>
                      <p className="text-xs text-gray-500 mt-1">{patient.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => viewDetails(patient)}>Details</Button>
                    <Button variant="outline" size="sm" onClick={() => viewMedicalHistory(patient)}>History</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); reset(); }} title="Create New Patient">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" placeholder="John" error={errors.fname?.message} {...register('fname')} />
            <Input label="Last Name" placeholder="Doe" error={errors.lname?.message} {...register('lname')} />
          </div>
          <Input label="Email" type="email" placeholder="patient@example.com" error={errors.email?.message} {...register('email')} />
          <Input label="Phone" type="tel" placeholder="0612345678" error={errors.phone?.message} {...register('phone')} />
          <Input label="Password" type="password" placeholder="Enter password" error={errors.password?.message} {...register('password')} />
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { setShowCreateModal(false); reset(); }}>Cancel</Button>
            <Button type="submit">Create Patient</Button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Patient Details">
        {selectedPatient && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">First Name</label>
                <p className="text-sm text-gray-900">{selectedPatient.fname}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Last Name</label>
                <p className="text-sm text-gray-900">{selectedPatient.lname}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="text-sm text-gray-900">{selectedPatient.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <p className="text-sm text-gray-900">{selectedPatient.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <p className="text-sm text-gray-900">{selectedPatient.isActive ? 'Active' : 'Inactive'}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Medical History Modal */}
      <Modal isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)} title="Medical History">
        {medicalHistory ? (
          <div className="space-y-4">
            {medicalHistory.consultations?.length > 0 ? (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Consultations</h4>
                <div className="space-y-2">
                  {medicalHistory.consultations.map((consultation: any) => (
                    <div key={consultation._id} className="p-3 border rounded">
                      <p className="text-sm font-medium">{consultation.diagnosis}</p>
                      <p className="text-xs text-gray-500">{new Date(consultation.consultationDate).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No medical history available</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Loading medical history...</p>
        )}
      </Modal>
    </div>
  );
};
