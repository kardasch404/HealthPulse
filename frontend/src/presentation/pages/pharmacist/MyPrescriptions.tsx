import { useState, useEffect } from 'react';
import { prescriptionService } from '../../../core/infrastructure/api/services/prescriptionService';
import { Button } from '../../components/atoms/Button';
import { Modal } from '../../components/molecules/Modal';

export const MyPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [dispensingHistory, setDispensingHistory] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchPrescriptions();
  }, [statusFilter]);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const response = await prescriptionService.getMyPrescriptions();
      console.log('Prescriptions response:', response);
      
      // Backend returns: { data: { message, data: [...], pagination } }
      let data = [];
      if (response?.data?.data?.data && Array.isArray(response.data.data.data)) {
        data = response.data.data.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else if (Array.isArray(response?.data)) {
        data = response.data;
      }
      
      console.log('Extracted prescriptions:', data);
      
      let filtered = data;
      if (statusFilter !== 'all') {
        filtered = data.filter((p: any) => p.status === statusFilter);
      }
      
      setPrescriptions(filtered);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (prescription: any) => {
    try {
      const response = await prescriptionService.getById(prescription._id);
      setSelectedPrescription(response?.data?.data || prescription);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching prescription details:', error);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await prescriptionService.updateStatus(id, newStatus);
      alert('Prescription status updated successfully!');
      fetchPrescriptions();
      setShowDetailsModal(false);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleReportUnavailable = async (id: string) => {
    const reason = prompt('Please provide a reason for medication unavailability:');
    if (!reason) return;
    
    try {
      await prescriptionService.updateStatus(id, 'unavailable');
      alert('Medication unavailability reported successfully!');
      fetchPrescriptions();
      setShowDetailsModal(false);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to report unavailability');
    }
  };

  const fetchDispensingHistory = async () => {
    try {
      console.log('Fetching dispensing history...');
      const response = await prescriptionService.getDispensingHistory();
      console.log('Dispensing history response:', response);
      
      // Backend returns: { data: { message, data: [...] } }
      let historyData = [];
      if (response?.data?.data?.data && Array.isArray(response.data.data.data)) {
        historyData = response.data.data.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        historyData = response.data.data;
      } else if (Array.isArray(response?.data)) {
        historyData = response.data;
      }
      
      console.log('Extracted history data:', historyData);
      
      setDispensingHistory(Array.isArray(historyData) ? historyData : []);
      setShowHistoryModal(true);
    } catch (error) {
      console.error('Error fetching dispensing history:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to fetch dispensing history');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      in_preparation: 'bg-blue-100 text-blue-800',
      ready_for_pickup: 'bg-purple-100 text-purple-800',
      dispensed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      unavailable: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: any = {
      draft: 'Draft',
      active: 'Active',
      pending: 'Pending',
      in_preparation: 'In Preparation',
      ready_for_pickup: 'Ready for Pickup',
      dispensed: 'Dispensed',
      cancelled: 'Cancelled',
      unavailable: 'Unavailable',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Prescriptions</h2>
          <p className="text-gray-600">Manage assigned prescriptions</p>
        </div>
        <Button onClick={fetchDispensingHistory} variant="outline">
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          View Dispensing History
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="in_preparation">In Preparation</option>
            <option value="ready_for_pickup">Ready for Pickup</option>
            <option value="dispensed">Dispensed</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prescription #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {prescriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No prescriptions found
                  </td>
                </tr>
              ) : (
                prescriptions.map((prescription) => (
                  <tr key={prescription._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {prescription.prescriptionNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {prescription.patientId?.fname} {prescription.patientId?.lname}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Dr. {prescription.doctorId?.fname} {prescription.doctorId?.lname}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(prescription.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(prescription.status)}`}>
                        {getStatusLabel(prescription.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(prescription)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Prescription Details"
      >
        {selectedPrescription && (
          <div className="space-y-6">
            {/* Prescription Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Prescription Number</label>
                <p className="mt-1 text-sm text-gray-900">{selectedPrescription.prescriptionNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPrescription.status)}`}>
                  {getStatusLabel(selectedPrescription.status)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Patient</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedPrescription.patientId?.fname} {selectedPrescription.patientId?.lname}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Doctor</label>
                <p className="mt-1 text-sm text-gray-900">
                  Dr. {selectedPrescription.doctorId?.fname} {selectedPrescription.doctorId?.lname}
                </p>
              </div>
            </div>

            {/* Medications */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Medications</label>
              <div className="space-y-2">
                {selectedPrescription.medications?.map((med: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-md">
                    <p className="font-medium text-gray-900">{med.name}</p>
                    <p className="text-sm text-gray-600">
                      Dosage: {med.dosage} | Frequency: {med.frequency} | Duration: {typeof med.duration === 'object' ? `${med.duration.value} ${med.duration.unit}` : med.duration}
                    </p>
                    {med.instructions && (
                      <p className="text-sm text-gray-500 mt-1">Instructions: {med.instructions}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Status Update Actions */}
            {selectedPrescription.status !== 'dispensed' && selectedPrescription.status !== 'cancelled' && selectedPrescription.status !== 'unavailable' && (
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">Update Status</label>
                <div className="flex flex-wrap gap-3">
                  {(selectedPrescription.status === 'active' || selectedPrescription.status === 'pending') && (
                    <Button
                      onClick={() => handleUpdateStatus(selectedPrescription._id, 'in_preparation')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Mark as In Preparation
                    </Button>
                  )}
                  {selectedPrescription.status === 'in_preparation' && (
                    <Button
                      onClick={() => handleUpdateStatus(selectedPrescription._id, 'ready_for_pickup')}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Mark as Ready for Pickup
                    </Button>
                  )}
                  {selectedPrescription.status === 'ready_for_pickup' && (
                    <Button
                      onClick={() => handleUpdateStatus(selectedPrescription._id, 'dispensed')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Mark as Dispensed
                    </Button>
                  )}
                  {selectedPrescription.status === 'in_preparation' && (
                    <Button
                      onClick={() => handleUpdateStatus(selectedPrescription._id, 'dispensed')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Mark as Dispensed (Direct)
                    </Button>
                  )}
                  
                  {(selectedPrescription.status === 'active' || selectedPrescription.status === 'pending' || selectedPrescription.status === 'in_preparation') && (
                    <Button
                      onClick={() => handleReportUnavailable(selectedPrescription._id)}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Report Unavailable
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Dispensing History */}
            {selectedPrescription.status === 'dispensed' && (
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">Dispensing Information</label>
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex items-center space-x-2">
                    <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium text-green-800">Successfully Dispensed</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Dispensed on: {selectedPrescription.dispensedBy?.dispensedAt ? new Date(selectedPrescription.dispensedBy.dispensedAt).toLocaleString() : new Date(selectedPrescription.updatedAt).toLocaleString()}
                  </p>
                  {selectedPrescription.dispensedBy?.pharmacistName && (
                    <p className="text-sm text-green-700 mt-1">
                      Dispensed by: {selectedPrescription.dispensedBy.pharmacistName}
                    </p>
                  )}
                  {selectedPrescription.dispensedBy?.notes && (
                    <p className="text-sm text-green-700 mt-1">
                      Notes: {selectedPrescription.dispensedBy.notes}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Unavailable Status */}
            {selectedPrescription.status === 'unavailable' && (
              <div className="border-t pt-4">
                <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                  <div className="flex items-center space-x-2">
                    <svg className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-sm font-medium text-orange-800">Medication Unavailable</span>
                  </div>
                  <p className="text-sm text-orange-700 mt-1">
                    Reported on: {selectedPrescription.updatedAt ? new Date(selectedPrescription.updatedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Dispensing History Modal */}
      <Modal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title="Dispensing History"
      >
        <div className="space-y-4">
          {dispensingHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No dispensing history found
            </div>
          ) : (
            <div className="space-y-4">
              {dispensingHistory.map((prescription) => (
                <div key={prescription._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{prescription.prescriptionNumber}</h4>
                      <p className="text-sm text-gray-600">
                        {prescription.patientId?.fname} {prescription.patientId?.lname}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Dispensed
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Doctor:</span>
                      <p className="text-gray-900">Dr. {prescription.doctorId?.fname} {prescription.doctorId?.lname}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Dispensed on:</span>
                      <p className="text-gray-900">
                        {prescription.dispensedBy?.dispensedAt 
                          ? new Date(prescription.dispensedBy.dispensedAt).toLocaleString()
                          : new Date(prescription.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    {prescription.dispensedBy?.pharmacistName && (
                      <div>
                        <span className="text-gray-500">Dispensed by:</span>
                        <p className="text-gray-900">{prescription.dispensedBy.pharmacistName}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Medications:</span>
                      <p className="text-gray-900">{prescription.medications?.length || 0} item(s)</p>
                    </div>
                  </div>
                  
                  {prescription.dispensedBy?.notes && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <span className="text-gray-500 text-sm">Notes:</span>
                      <p className="text-gray-900 text-sm">{prescription.dispensedBy.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => setShowHistoryModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
