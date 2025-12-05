import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { prescriptionService } from '../../../core/infrastructure/api/services/prescriptionService';
import { patientService } from '../../../core/infrastructure/api/services/patientService';
import { consultationService } from '../../../core/infrastructure/api/services/consultationService';
import { pharmacyService } from '../../../core/infrastructure/api/services/pharmacyService';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/atoms/Card';
import { Modal } from '../../components/molecules/Modal';
import { prescriptionSchema, updatePrescriptionSchema, PrescriptionFormData, UpdatePrescriptionFormData } from '../../../shared/utils/validators';

export const MyPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [showPharmacyModal, setShowPharmacyModal] = useState(false);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState('');
  const [currentPrescriptionId, setCurrentPrescriptionId] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const { register, handleSubmit, formState: { errors }, reset, control, watch } = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: { medications: [{}] }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'medications' });

  const { register: registerUpdate, handleSubmit: handleSubmitUpdate, formState: { errors: errorsUpdate }, reset: resetUpdate } = useForm<UpdatePrescriptionFormData>({
    resolver: zodResolver(updatePrescriptionSchema),
  });

  const selectedPatientId = watch('patientId');

  useEffect(() => {
    fetchPrescriptions();
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      fetchPatientConsultations(selectedPatientId);
    }
  }, [selectedPatientId]);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const response = await prescriptionService.getAll();
      console.log('Prescription response:', response);
      // Backend returns: { success: true, data: { data: [...], pagination: {...} } }
      const prescriptionData = response?.data?.data?.data || response?.data?.data || response?.data || [];
      console.log('Extracted prescriptions:', prescriptionData);
      setPrescriptions(Array.isArray(prescriptionData) ? prescriptionData : []);
    } catch (error) {
      console.error('Error:', error);
      setPrescriptions([]);
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
      console.error('Error:', error);
      setPatients([]);
    }
  };

  const fetchPatientConsultations = async (patientId: string) => {
    try {
      const response = await consultationService.getPatientHistory(patientId);
      const data = response?.data?.data || response?.data || [];
      setConsultations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
      setConsultations([]);
    }
  };



  const onSubmit = async (data: PrescriptionFormData) => {
    try {
      const payload = {
        consultationId: data.consultationId,
        patientId: data.patientId,
        medications: data.medications.map(med => ({
          medicationName: med.medicationName,
          genericName: med.genericName,
          dosage: med.dosage,
          dosageForm: med.dosageForm,
          frequency: med.frequency,
          route: med.route,
          duration: {
            value: Number(med.durationValue),
            unit: med.durationUnit
          },
          quantity: Number(med.quantity),
          instructions: med.instructions
        })),
        doctorNotes: data.doctorNotes,
        validUntil: data.validUntil
      };
      await prescriptionService.create(payload);
      reset({ medications: [{}] });
      setShowCreateModal(false);
      fetchPrescriptions();
      alert('Prescription created successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create prescription');
    }
  };

  const onUpdate = async (data: UpdatePrescriptionFormData) => {
    try {
      await prescriptionService.update(selectedPrescription._id, data);
      resetUpdate();
      setShowUpdateModal(false);
      fetchPrescriptions();
      alert('Prescription updated successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update prescription');
    }
  };

  const handleSign = async (id: string) => {
    if (!confirm('Sign this prescription? This action cannot be undone.')) return;
    try {
      await prescriptionService.sign(id);
      fetchPrescriptions();
      alert('Prescription signed successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to sign prescription');
    }
  };

  const openPharmacyModal = async (prescriptionId: string) => {
    try {
      const response = await pharmacyService.getAll();
      const pharmacyData = response?.data?.data?.data || response?.data?.data || [];
      const pharmacyList = Array.isArray(pharmacyData) ? pharmacyData : [];
      
      if (pharmacyList.length === 0) {
        alert('No pharmacies available');
        return;
      }
      
      setPharmacies(pharmacyList);
      setCurrentPrescriptionId(prescriptionId);
      setSelectedPharmacyId('');
      setShowPharmacyModal(true);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to load pharmacies');
    }
  };

  const handleAssignPharmacy = async () => {
    if (!selectedPharmacyId) {
      alert('Please select a pharmacy');
      return;
    }
    
    try {
      await prescriptionService.assignPharmacy(currentPrescriptionId, selectedPharmacyId);
      setShowPharmacyModal(false);
      fetchPrescriptions();
      alert('Pharmacy assigned successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to assign pharmacy');
    }
  };

  const handleCancel = async (id: string) => {
    const reason = prompt('Enter cancellation reason:');
    if (!reason) return;
    try {
      await prescriptionService.cancel(id, reason);
      fetchPrescriptions();
      alert('Prescription cancelled successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to cancel prescription');
    }
  };

  const viewDetails = async (prescription: any) => {
    console.log('Viewing prescription:', prescription);
    setSelectedPrescription(prescription);
    setShowDetailsModal(true);
  };

  const openUpdateModal = (prescription: any) => {
    setSelectedPrescription(prescription);
    resetUpdate({ notes: prescription.notes, validUntil: prescription.validUntil });
    setShowUpdateModal(true);
  };

  const filteredPrescriptions = prescriptions.filter(p => 
    statusFilter === 'all' || p.status === statusFilter
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      dispensed: 'bg-blue-100 text-blue-800',
      completed: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
      expired: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Prescriptions</h2>
          <p className="text-gray-600">Manage patient prescriptions</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Prescription
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
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="dispensed">Dispensed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Prescriptions ({filteredPrescriptions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : filteredPrescriptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No prescriptions found</div>
          ) : (
            <div className="space-y-3">
              {filteredPrescriptions.map((presc) => (
                <div key={presc._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        {presc.patientId?.fname} {presc.patientId?.lname}
                      </h4>
                      <p className="text-sm text-gray-600">{presc.medications?.length || 0} medication(s)</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {new Date(presc.createdAt).toLocaleDateString()}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(presc.status)}`}>
                          {presc.status}
                        </span>
                        {presc.assignedPharmacyId && (
                          <span className="text-xs text-blue-600">
                            📍 {presc.assignedPharmacyId?.name || 'Pharmacy Assigned'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => viewDetails(presc)}>Details</Button>
                    {presc.status === 'draft' && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => openUpdateModal(presc)}>Edit</Button>
                        <Button variant="outline" size="sm" onClick={() => handleSign(presc._id)}>Sign</Button>
                      </>
                    )}
                    {presc.status === 'active' && !presc.assignedPharmacyId && (
                      <Button variant="outline" size="sm" onClick={() => openPharmacyModal(presc._id)}>Assign Pharmacy</Button>
                    )}
                    {['draft', 'active'].includes(presc.status) && (
                      <Button variant="outline" size="sm" onClick={() => handleCancel(presc._id)}>Cancel</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); reset({ medications: [{}] }); }} title="New Prescription">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Patient</label>
            <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" {...register('patientId')}>
              <option value="">Choose a patient</option>
              {patients.map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.fname} {patient.lname} - {patient.email}
                </option>
              ))}
            </select>
            {errors.patientId && <p className="text-sm text-red-600 mt-1">{errors.patientId.message}</p>}
          </div>

          {selectedPatientId && consultations.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Link to Consultation (Optional)</label>
              <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" {...register('consultationId')}>
                <option value="">No consultation</option>
                {consultations.map((cons) => (
                  <option key={cons._id} value={cons._id}>
                    {new Date(cons.consultationDate || cons.createdAt).toLocaleDateString()} - {cons.chiefComplaint}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900">Medications</h4>
              <Button type="button" variant="outline" size="sm" onClick={() => append({})}>Add Medication</Button>
            </div>
            
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg mb-3 space-y-3">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="text-sm font-medium text-gray-700">Medication {index + 1}</h5>
                  {fields.length > 1 && (
                    <Button type="button" variant="outline" size="sm" onClick={() => remove(index)}>Remove</Button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Medication Name" placeholder="Ibuprofen 400mg" error={errors.medications?.[index]?.medicationName?.message} {...register(`medications.${index}.medicationName`)} />
                  <Input label="Generic Name" placeholder="Ibuprofen" error={errors.medications?.[index]?.genericName?.message} {...register(`medications.${index}.genericName`)} />
                  <Input label="Dosage" placeholder="400mg" error={errors.medications?.[index]?.dosage?.message} {...register(`medications.${index}.dosage`)} />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dosage Form</label>
                    <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" {...register(`medications.${index}.dosageForm`)}>
                      <option value="">Select form</option>
                      <option value="tablet">Tablet</option>
                      <option value="capsule">Capsule</option>
                      <option value="syrup">Syrup</option>
                      <option value="injection">Injection</option>
                      <option value="cream">Cream</option>
                      <option value="drops">Drops</option>
                      <option value="inhaler">Inhaler</option>
                      <option value="patch">Patch</option>
                    </select>
                    {errors.medications?.[index]?.dosageForm && <p className="text-sm text-red-600 mt-1">{errors.medications[index]?.dosageForm?.message}</p>}
                  </div>

                  <Input label="Frequency" placeholder="3 times daily" error={errors.medications?.[index]?.frequency?.message} {...register(`medications.${index}.frequency`)} />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Route</label>
                    <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" {...register(`medications.${index}.route`)}>
                      <option value="">Select route</option>
                      <option value="oral">Oral</option>
                      <option value="topical">Topical</option>
                      <option value="intravenous">Intravenous</option>
                      <option value="intramuscular">Intramuscular</option>
                      <option value="subcutaneous">Subcutaneous</option>
                      <option value="inhalation">Inhalation</option>
                      <option value="rectal">Rectal</option>
                      <option value="sublingual">Sublingual</option>
                    </select>
                    {errors.medications?.[index]?.route && <p className="text-sm text-red-600 mt-1">{errors.medications[index]?.route?.message}</p>}
                  </div>

                  <Input label="Duration (value)" type="number" min="1" placeholder="7" error={errors.medications?.[index]?.durationValue?.message} {...register(`medications.${index}.durationValue`)} />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (unit)</label>
                    <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" {...register(`medications.${index}.durationUnit`)}>
                      <option value="">Select unit</option>
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                    </select>
                    {errors.medications?.[index]?.durationUnit && <p className="text-sm text-red-600 mt-1">{errors.medications[index]?.durationUnit?.message}</p>}
                  </div>

                  <Input label="Quantity" type="number" min="1" placeholder="21" error={errors.medications?.[index]?.quantity?.message} {...register(`medications.${index}.quantity`)} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                  <textarea className="flex min-h-[60px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="Take with food..." {...register(`medications.${index}.instructions`)} />
                </div>
              </div>
            ))}
            {errors.medications?.root && <p className="text-sm text-red-600 mt-1">{errors.medications.root.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Notes</label>
            <textarea className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="Additional notes..." {...register('doctorNotes')} />
          </div>

          <Input label="Valid Until (Optional)" type="date" {...register('validUntil')} />

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { setShowCreateModal(false); reset({ medications: [{}] }); }}>Cancel</Button>
            <Button type="submit">Create Prescription</Button>
          </div>
        </form>
      </Modal>

      {/* Update Modal */}
      <Modal isOpen={showUpdateModal} onClose={() => setShowUpdateModal(false)} title="Update Prescription">
        <form onSubmit={handleSubmitUpdate(onUpdate)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="Updated notes..." {...registerUpdate('notes')} />
          </div>

          <Input label="Valid Until" type="date" error={errorsUpdate.validUntil?.message} {...registerUpdate('validUntil')} />

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowUpdateModal(false)}>Cancel</Button>
            <Button type="submit">Update</Button>
          </div>
        </form>
      </Modal>

      {/* Pharmacy Selection Modal */}
      <Modal isOpen={showPharmacyModal} onClose={() => setShowPharmacyModal(false)} title="Assign Pharmacy">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Pharmacy</label>
            <select 
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              value={selectedPharmacyId}
              onChange={(e) => setSelectedPharmacyId(e.target.value)}
            >
              <option value="">Choose a pharmacy</option>
              {pharmacies.map((pharmacy) => (
                <option key={pharmacy._id} value={pharmacy._id}>
                  {pharmacy.name} - {pharmacy.address?.city || 'N/A'}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowPharmacyModal(false)}>Cancel</Button>
            <Button type="button" onClick={handleAssignPharmacy}>Assign</Button>
          </div>
        </div>
      </Modal>

      {/* Details Modal */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Prescription Details">
        {selectedPrescription && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Patient</h4>
              <p className="text-base text-gray-900">
                {selectedPrescription.patientId?.fname} {selectedPrescription.patientId?.lname}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Medications</h4>
              {selectedPrescription.medications?.map((med: any, idx: number) => (
                <div key={idx} className="p-3 border rounded-lg mb-2">
                  <p className="font-medium text-gray-900">{med.medicationName}</p>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                    <div><span className="font-medium">Dosage:</span> {med.dosage}</div>
                    <div><span className="font-medium">Form:</span> {med.dosageForm}</div>
                    <div><span className="font-medium">Frequency:</span> {med.frequency}</div>
                    <div><span className="font-medium">Route:</span> {med.route}</div>
                    <div><span className="font-medium">Duration:</span> {med.duration?.value} {med.duration?.unit}</div>
                    <div><span className="font-medium">Quantity:</span> {med.quantity}</div>
                  </div>
                  {med.instructions && (
                    <p className="text-sm text-gray-600 mt-2"><span className="font-medium">Instructions:</span> {med.instructions}</p>
                  )}
                </div>
              ))}
            </div>

            {selectedPrescription.doctorNotes && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Doctor Notes</h4>
                <p className="text-base text-gray-900">{selectedPrescription.doctorNotes}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(selectedPrescription.status)}`}>
                  {selectedPrescription.status}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Created</h4>
                <p className="text-sm text-gray-900">{new Date(selectedPrescription.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
