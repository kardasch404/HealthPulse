import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { labOrderService } from '../../../core/infrastructure/api/services/labOrderService';
import { laboratoryService } from '../../../core/infrastructure/api/services/laboratoryService';
import { patientService } from '../../../core/infrastructure/api/services/patientService';
import { consultationService } from '../../../core/infrastructure/api/services/consultationService';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/atoms/Card';
import { Modal } from '../../components/molecules/Modal';
import { labOrderSchema, LabOrderFormData } from '../../../shared/utils/validators';

export const MyLabOrders = () => {
  const [labOrders, setLabOrders] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [laboratories, setLaboratories] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedLabOrder, setSelectedLabOrder] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const { register, handleSubmit, formState: { errors }, reset, control, watch } = useForm<LabOrderFormData>({
    resolver: zodResolver(labOrderSchema),
    defaultValues: { tests: [{}] }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'tests' });

  const selectedPatientId = watch('patientId');

  useEffect(() => {
    fetchLabOrders();
    fetchPatients();
    fetchLaboratories();
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      fetchPatientConsultations(selectedPatientId);
    }
  }, [selectedPatientId]);

  const fetchLabOrders = async () => {
    setLoading(true);
    try {
      const response = await labOrderService.getAll();
      const data = response?.data?.data?.data?.orders || response?.data?.data?.orders || response?.data?.data || response?.data || [];
      setLabOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
      setLabOrders([]);
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

  const fetchLaboratories = async () => {
    try {
      const response = await laboratoryService.getAll();
      const data = response?.data?.data?.data || response?.data?.data || response?.data || [];
      setLaboratories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
      setLaboratories([]);
    }
  };

  const fetchPatientConsultations = async (patientId: string) => {
    try {
      // Try to get all consultations for the patient first
      let response = await consultationService.getPatientConsultations(patientId);
      console.log('All consultations response for patient:', patientId, response);
      let data = response?.data?.data?.data || response?.data?.data || response?.data || [];
      
      // If no consultations found, try the history endpoint
      if (!Array.isArray(data) || data.length === 0) {
        response = await consultationService.getPatientHistory(patientId);
        console.log('History consultations response for patient:', patientId, response);
        data = response?.data?.data || response?.data || [];
      }
      
      console.log('Final extracted consultations:', data);
      setConsultations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching consultations:', error);
      setConsultations([]);
    }
  };

  const onSubmit = async (data: LabOrderFormData) => {
    try {
      const payload: any = {
        patientId: data.patientId,
        laboratoryId: data.laboratoryId,
        tests: data.tests.map(test => ({
          name: test.name,
          code: test.code,
          category: test.category,
          urgency: test.urgency,
          instructions: test.instructions,
          expectedTurnaround: Number(test.expectedTurnaround)
        })),
        clinicalIndication: data.clinicalIndication,
        urgency: data.urgency,
        notes: data.notes,
        fastingRequired: data.fastingRequired,
        scheduledDate: data.scheduledDate,
        scheduledTime: data.scheduledTime,
        specialInstructions: data.specialInstructions,
      };
      
      // Only include consultationId if it has a value
      if (data.consultationId && data.consultationId.trim() !== '') {
        payload.consultationId = data.consultationId;
      }
      
      await labOrderService.create(payload);
      reset({ tests: [{}] });
      setShowCreateModal(false);
      fetchLabOrders();
      alert('Lab order created successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create lab order');
    }
  };

  const handleCancel = async (id: string) => {
    const reason = prompt('Enter cancellation reason:');
    if (!reason) return;
    try {
      await labOrderService.cancel(id, reason);
      fetchLabOrders();
      alert('Lab order cancelled successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to cancel lab order');
    }
  };

  const viewDetails = async (labOrder: any) => {
    try {
      const response = await labOrderService.getById(labOrder._id);
      setSelectedLabOrder(response?.data?.data?.data || response?.data?.data || response?.data || labOrder);
      setShowDetailsModal(true);
    } catch (error) {
      setSelectedLabOrder(labOrder);
      setShowDetailsModal(true);
    }
  };

  const viewResults = async (labOrder: any) => {
    try {
      const response = await labOrderService.getResults(labOrder._id);
      setSelectedLabOrder({ ...labOrder, results: response?.data?.data || response?.data });
      setShowResultsModal(true);
    } catch (error: any) {
      alert(error.response?.data?.message || 'No results available yet');
    }
  };

  const downloadReport = async (id: string) => {
    try {
      const response = await labOrderService.downloadReport(id);
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `lab-report-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(error.message || 'Lab report not available yet');
    }
  };

  const filteredLabOrders = labOrders.filter(order => 
    statusFilter === 'all' || order.status === statusFilter
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      'results-ready': 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Lab Orders</h2>
          <p className="text-gray-600">Manage patient lab orders</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Lab Order
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
              <option value="results-ready">Results Ready</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Lab Orders ({filteredLabOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : filteredLabOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No lab orders found</div>
          ) : (
            <div className="space-y-3">
              {filteredLabOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full flex items-center justify-center bg-green-100 text-green-600">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        {order.patientId?.fname} {order.patientId?.lname}
                      </h4>
                      <p className="text-sm text-gray-600">{order.tests?.length || 0} test(s) - {order.clinicalIndication}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        {order.urgency === 'urgent' && (
                          <span className="text-xs text-red-600">🚨 Urgent</span>
                        )}
                        {order.urgency === 'stat' && (
                          <span className="text-xs text-red-600">⚡ STAT</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => viewDetails(order)}>Details</Button>
                    {['completed', 'results-ready'].includes(order.status) && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => viewResults(order)}>Results</Button>
                        <Button variant="outline" size="sm" onClick={() => downloadReport(order._id)}>Download</Button>
                      </>
                    )}
                    {['pending', 'in-progress'].includes(order.status) && (
                      <Button variant="outline" size="sm" onClick={() => handleCancel(order._id)}>Cancel</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); reset({ tests: [{}] }); }} title="New Lab Order">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Laboratory</label>
            <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" {...register('laboratoryId')}>
              <option value="">Choose a laboratory</option>
              {laboratories.map((lab) => (
                <option key={lab._id} value={lab._id}>
                  {lab.name} - {lab.address?.city || 'N/A'}
                </option>
              ))}
            </select>
            {errors.laboratoryId && <p className="text-sm text-red-600 mt-1">{errors.laboratoryId.message}</p>}
          </div>

          {selectedPatientId && (
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
              {consultations.length === 0 && (
                <p className="text-sm text-amber-600 mt-1">No consultations found for this patient</p>
              )}
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900">Tests</h4>
              <Button type="button" variant="outline" size="sm" onClick={() => append({})}>Add Test</Button>
            </div>
            
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg mb-3 space-y-3">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="text-sm font-medium text-gray-700">Test {index + 1}</h5>
                  {fields.length > 1 && (
                    <Button type="button" variant="outline" size="sm" onClick={() => remove(index)}>Remove</Button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Test Name" placeholder="Complete Blood Count" error={errors.tests?.[index]?.name?.message} {...register(`tests.${index}.name`)} />
                  <Input label="Test Code" placeholder="CBC" error={errors.tests?.[index]?.code?.message} {...register(`tests.${index}.code`)} />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" {...register(`tests.${index}.category`)}>
                      <option value="">Select category</option>
                      <option value="Hematology">Hematology</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Microbiology">Microbiology</option>
                      <option value="Immunology">Immunology</option>
                      <option value="Endocrinology">Endocrinology</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.tests?.[index]?.category && <p className="text-sm text-red-600 mt-1">{errors.tests[index]?.category?.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
                    <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" {...register(`tests.${index}.urgency`)}>
                      <option value="">Select urgency</option>
                      <option value="routine">Routine</option>
                      <option value="urgent">Urgent</option>
                      <option value="stat">STAT</option>
                    </select>
                    {errors.tests?.[index]?.urgency && <p className="text-sm text-red-600 mt-1">{errors.tests[index]?.urgency?.message}</p>}
                  </div>

                  <Input label="Expected Turnaround (hours)" type="number" min="1" placeholder="24" error={errors.tests?.[index]?.expectedTurnaround?.message} {...register(`tests.${index}.expectedTurnaround`)} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                  <textarea className="flex min-h-[60px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="Fasting not required..." {...register(`tests.${index}.instructions`)} />
                </div>
              </div>
            ))}
            {errors.tests?.root && <p className="text-sm text-red-600 mt-1">{errors.tests.root.message}</p>}
          </div>

          <Input label="Clinical Indication" placeholder="Routine health check" error={errors.clinicalIndication?.message} {...register('clinicalIndication')} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Overall Urgency</label>
            <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" {...register('urgency')}>
              <option value="">Select urgency</option>
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="stat">STAT</option>
            </select>
            {errors.urgency && <p className="text-sm text-red-600 mt-1">{errors.urgency.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Scheduled Date" type="date" {...register('scheduledDate')} />
            <Input label="Scheduled Time" type="time" {...register('scheduledTime')} />
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" id="fasting" className="rounded border-gray-300" {...register('fastingRequired')} />
            <label htmlFor="fasting" className="text-sm text-gray-700">Fasting Required</label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="Additional notes..." {...register('notes')} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
            <textarea className="flex min-h-[60px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="Patient is pregnant..." {...register('specialInstructions')} />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { setShowCreateModal(false); reset({ tests: [{}] }); }}>Cancel</Button>
            <Button type="submit">Create Lab Order</Button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Lab Order Details">
        {selectedLabOrder && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Patient</h4>
              <p className="text-base text-gray-900">
                {selectedLabOrder.patientId?.fname} {selectedLabOrder.patientId?.lname}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Clinical Indication</h4>
              <p className="text-base text-gray-900">{selectedLabOrder.clinicalIndication}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Tests Ordered</h4>
              {selectedLabOrder.tests?.map((test: any, idx: number) => (
                <div key={idx} className="p-3 border rounded-lg mb-2">
                  <p className="font-medium text-gray-900">{test.name} ({test.code})</p>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                    <div><span className="font-medium">Category:</span> {test.category}</div>
                    <div><span className="font-medium">Urgency:</span> {test.urgency}</div>
                    <div><span className="font-medium">Turnaround:</span> {test.expectedTurnaround}h</div>
                  </div>
                  {test.instructions && (
                    <p className="text-sm text-gray-600 mt-2"><span className="font-medium">Instructions:</span> {test.instructions}</p>
                  )}
                </div>
              ))}
            </div>

            {selectedLabOrder.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                <p className="text-base text-gray-900">{selectedLabOrder.notes}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(selectedLabOrder.status)}`}>
                  {selectedLabOrder.status}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Created</h4>
                <p className="text-sm text-gray-900">{selectedLabOrder.createdAt ? new Date(selectedLabOrder.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Button onClick={() => downloadReport(selectedLabOrder._id)} className="w-full">
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Lab Report PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Results Modal */}
      <Modal isOpen={showResultsModal} onClose={() => setShowResultsModal(false)} title="Lab Results">
        {selectedLabOrder && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Patient</h4>
              <p className="text-base text-gray-900">
                {selectedLabOrder.patientId?.fname} {selectedLabOrder.patientId?.lname}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Test Results</h4>
              {selectedLabOrder.results ? (
                <div className="space-y-2">
                  {selectedLabOrder.results.map((result: any, idx: number) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <p className="font-medium text-gray-900">{result.testName}</p>
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Result:</span> {result.value} {result.unit}
                        <span className={`ml-2 px-2 py-0.5 rounded text-xs ${result.status === 'normal' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {result.status}
                        </span>
                      </div>
                      {result.referenceRange && (
                        <p className="text-xs text-gray-500 mt-1">Reference: {result.referenceRange}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No results available yet</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};