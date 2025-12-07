import { useState, useEffect } from 'react';
import { labOrderService } from '../../../core/infrastructure/api/services/labOrderService';
import { Button } from '../../components/atoms/Button';
import { Modal } from '../../components/molecules/Modal';

export const MyLabOrders = () => {
  const [labOrders, setLabOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [resultHistory, setResultHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchLabOrders();
  }, [statusFilter]);

  const fetchLabOrders = async () => {
    setLoading(true);
    try {
      const response = await labOrderService.getMyLabOrders();
      
      let data = [];
      if (response?.data?.data?.data?.orders && Array.isArray(response.data.data.data.orders)) {
        data = response.data.data.data.orders;
      } else if (response?.data?.data?.orders && Array.isArray(response.data.data.orders)) {
        data = response.data.data.orders;
      } else if (response?.data?.data?.data && Array.isArray(response.data.data.data)) {
        data = response.data.data.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      }
      
      let filtered = data;
      if (statusFilter !== 'all') {
        filtered = data.filter((order: any) => order.status === statusFilter);
      }
      
      if (searchTerm) {
        filtered = filtered.filter((order: any) => 
          order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.patientId?.fname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.patientId?.lname?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setLabOrders(filtered);
    } catch (error) {
      console.error('Error fetching lab orders:', error);
      setLabOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (order: any) => {
    try {
      console.log('Viewing details for order:', order);
      // Fetch fresh order data from API to get latest uploads
      const response = await labOrderService.getById(order._id);
      console.log('API response:', response);
      console.log('Response data:', response?.data);
      
      let freshOrder = order; // fallback
      if (response?.data?.data?.data) {
        freshOrder = response.data.data.data;
      } else if (response?.data?.data) {
        freshOrder = response.data.data;
      } else if (response?.data) {
        freshOrder = response.data;
      }
      
      console.log('Fresh order data:', freshOrder);
      setSelectedOrder(freshOrder);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching fresh order details:', error);
      // Fallback to using the order data directly
      console.log('Using fallback order data:', order);
      setSelectedOrder(order);
      setShowDetailsModal(true);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await labOrderService.updateStatus(id, status);
      alert('Order status updated successfully!');
      fetchLabOrders();
      setShowDetailsModal(false);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleValidateOrder = async (id: string) => {
    const notes = prompt('Validation notes (optional):');
    try {
      await labOrderService.validateOrder(id, notes || '');
      alert('Order validated successfully!');
      fetchLabOrders();
      setShowDetailsModal(false);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to validate order');
    }
  };

  const fetchResultHistory = async () => {
    try {
      const response = await labOrderService.getResultHistory();
      let historyData = [];
      if (response?.data?.data?.data && Array.isArray(response.data.data.data)) {
        historyData = response.data.data.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        historyData = response.data.data;
      }
      setResultHistory(historyData);
      setShowHistoryModal(true);
    } catch (error) {
      console.error('Error fetching result history:', error);
      alert('Failed to fetch result history');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-800',
      sample_collected: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      partial_results: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: any = {
      pending: 'Pending',
      sample_collected: 'Sample Collected',
      in_progress: 'In Progress',
      partial_results: 'Partial Results',
      completed: 'Completed',
      cancelled: 'Cancelled',
      rejected: 'Rejected',
    };
    return labels[status] || status;
  };

  const getUrgencyColor = (urgency: string) => {
    const colors: any = {
      routine: 'bg-gray-100 text-gray-800',
      urgent: 'bg-orange-100 text-orange-800',
      stat: 'bg-red-100 text-red-800',
    };
    return colors[urgency] || 'bg-gray-100 text-gray-800';
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
          <h2 className="text-2xl font-bold text-gray-900">My Lab Orders</h2>
          <p className="text-gray-600">Manage laboratory orders and results</p>
        </div>
        <Button onClick={fetchResultHistory} variant="outline">
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          View Result History
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="ml-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="sample_collected">Sample Collected</option>
              <option value="in_progress">In Progress</option>
              <option value="partial_results">Partial Results</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Search:</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Order number, patient name..."
              className="ml-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button onClick={fetchLabOrders} variant="outline" size="sm">
            Search
          </Button>
        </div>
      </div>

      {/* Lab Orders List */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tests</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Urgency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {labOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No lab orders found
                  </td>
                </tr>
              ) : (
                labOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.patientId?.fname} {order.patientId?.lname}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Dr. {order.doctorId?.fname} {order.doctorId?.lname}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.tests?.length || 0} test(s)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getUrgencyColor(order.urgency)}`}>
                        {order.urgency?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(order)}
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
        title="Lab Order Details"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Order Number</label>
                <p className="mt-1 text-sm text-gray-900">{selectedOrder.orderNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusLabel(selectedOrder.status)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Patient</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedOrder.patientId?.fname} {selectedOrder.patientId?.lname}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Doctor</label>
                <p className="mt-1 text-sm text-gray-900">
                  Dr. {selectedOrder.doctorId?.fname} {selectedOrder.doctorId?.lname}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Urgency</label>
                <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(selectedOrder.urgency)}`}>
                  {selectedOrder.urgency?.toUpperCase()}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Clinical Indication</label>
                <p className="mt-1 text-sm text-gray-900">{selectedOrder.clinicalIndication}</p>
              </div>
            </div>

            {/* Tests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tests</label>
              <div className="space-y-2">
                {selectedOrder.tests?.map((test: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{test.name}</p>
                        <p className="text-sm text-gray-600">Code: {test.code} | Category: {test.category}</p>
                        <p className="text-sm text-gray-500">Status: {test.status}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(test.status)}`}>
                        {getStatusLabel(test.status)}
                      </span>
                    </div>
                    {test.results && (
                      <div className="mt-2 p-2 bg-white rounded border">
                        <p className="text-sm font-medium text-gray-700">Results:</p>
                        <pre className="text-xs text-gray-600 mt-1">{JSON.stringify(test.results, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Uploaded Reports & Results */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Uploaded Reports & Results</label>
              {console.log('Upload debug:', {
                uploadedReports: selectedOrder.uploadedReports,
                uploadedResults: selectedOrder.uploadedResults,
                overallResults: selectedOrder.overallResults,
                reportUrl: selectedOrder.reportUrl
              })}
              <div className="space-y-2">
                {/* Uploaded PDF Reports */}
                {selectedOrder.uploadedReports && selectedOrder.uploadedReports.length > 0 && selectedOrder.uploadedReports.map((report: any, index: number) => (
                  <div key={index} className="p-3 bg-red-50 rounded-md border border-red-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="font-medium text-red-900">{report.fileName}</p>
                          <p className="text-sm text-red-700">
                            Uploaded {new Date(report.uploadedAt).toLocaleDateString()} • {Math.round(report.fileSize / 1024)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // For now, show a message since the file URLs require authentication
                          alert('PDF viewing requires authentication setup. File: ' + report.fileName);
                          // TODO: Implement authenticated file viewing
                        }}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        View PDF
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Uploaded JSON Results */}
                {selectedOrder.uploadedResults && selectedOrder.uploadedResults.length > 0 && selectedOrder.uploadedResults.map((result: any, index: number) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-md border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <p className="font-medium text-blue-900">Lab Results ({result.type?.toUpperCase()})</p>
                          <p className="text-sm text-blue-700">
                            Uploaded {new Date(result.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const jsonStr = JSON.stringify(result.data, null, 2);
                          const blob = new Blob([jsonStr], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `lab-results-${selectedOrder.orderNumber}.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        Download JSON
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Overall Results */}
                {selectedOrder.overallResults && (
                  <div className="p-3 bg-green-50 rounded-md border border-green-200">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-green-600 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p className="font-medium text-green-900">Overall Results Summary</p>
                        <p className="text-sm text-green-700 mt-1">{selectedOrder.overallResults}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Legacy PDF Report */}
                {selectedOrder.reportUrl && (
                  <div className="p-3 bg-purple-50 rounded-md border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <p className="font-medium text-purple-900">Lab Report (Legacy)</p>
                          <p className="text-sm text-purple-700">Generated: {selectedOrder.reportGeneratedAt ? new Date(selectedOrder.reportGeneratedAt).toLocaleString() : 'N/A'}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          try {
                            const response = await labOrderService.downloadReport(selectedOrder._id);
                            const blob = new Blob([response.data], { type: 'application/pdf' });
                            const url = URL.createObjectURL(blob);
                            window.open(url, '_blank');
                            URL.revokeObjectURL(url);
                          } catch (error: any) {
                            alert(error.message || 'Failed to download report');
                          }
                        }}
                        className="text-purple-600 border-purple-600 hover:bg-purple-50"
                      >
                        View Report
                      </Button>
                    </div>
                  </div>
                )}

                {/* No Reports Message */}
                {(!selectedOrder.uploadedReports || selectedOrder.uploadedReports.length === 0) && 
                 (!selectedOrder.uploadedResults || selectedOrder.uploadedResults.length === 0) && 
                 !selectedOrder.overallResults && !selectedOrder.reportUrl && (
                  <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm text-gray-500">No reports or results uploaded yet</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Update Actions */}
            {selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && (
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">Update Status</label>
                <div className="flex flex-wrap gap-3">
                  {selectedOrder.status === 'pending' && (
                    <Button
                      onClick={() => handleUpdateStatus(selectedOrder._id, 'in_progress')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Start Processing
                    </Button>
                  )}
                  {(selectedOrder.status === 'in_progress' || selectedOrder.status === 'partial_results') && (
                    <Button
                      onClick={() => handleValidateOrder(selectedOrder._id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Mark as Validated
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      if (selectedOrder?._id) {
                        setShowResultsModal(true);
                      } else {
                        alert('Please refresh and try again');
                      }
                    }}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Upload Results
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button 
                variant="outline" 
                onClick={() => handleViewDetails(selectedOrder)}
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Data
              </Button>
              <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Results Upload Modal */}
      <ResultsUploadModal
        isOpen={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        selectedOrder={selectedOrder}
        onSuccess={() => {
          fetchLabOrders();
          setShowResultsModal(false);
        }}
      />

      {/* Result History Modal */}
      <Modal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title="Result History"
      >
        <div className="space-y-4">
          {resultHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No result history found
            </div>
          ) : (
            <div className="space-y-4">
              {resultHistory.map((record) => (
                <div key={record._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{record.orderNumber}</h4>
                      <p className="text-sm text-gray-600">
                        {record.patientId?.fname} {record.patientId?.lname}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Completed
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Completed on: {new Date(record.completedAt).toLocaleString()}
                  </div>
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

// Results Upload Modal Component
const ResultsUploadModal = ({ isOpen, onClose, selectedOrder, onSuccess }: any) => {
  const [uploadType, setUploadType] = useState('json');
  const [jsonResults, setJsonResults] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUploadJSON = async () => {
    console.log('Selected order:', selectedOrder);
    console.log('Order ID:', selectedOrder?._id);
    
    if (!selectedOrder?._id) {
      alert('No order selected');
      return;
    }
    
    if (!jsonResults.trim()) {
      alert('Please enter JSON results');
      return;
    }

    try {
      setUploading(true);
      const resultsData = JSON.parse(jsonResults);
      console.log('Uploading results for order:', selectedOrder._id);
      await labOrderService.uploadResultsJSON(selectedOrder._id, resultsData);
      alert('Results uploaded successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Upload error:', error);
      console.error('Error response:', error.response);
      alert(error.response?.data?.message || error.message || 'Failed to upload results');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadPDF = async () => {
    console.log('Selected order:', selectedOrder);
    console.log('Order ID:', selectedOrder?._id);
    
    if (!selectedOrder?._id) {
      alert('No order selected');
      return;
    }
    
    if (!pdfFile) {
      alert('Please select a PDF file');
      return;
    }

    try {
      setUploading(true);
      console.log('Uploading PDF for order:', selectedOrder._id);
      await labOrderService.uploadReportPDF(selectedOrder._id, pdfFile);
      alert('Report uploaded successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Upload error:', error);
      console.error('Error response:', error.response);
      
      const errorMsg = error.response?.data?.message || error.message || 'Failed to upload report';
      
      if (errorMsg.includes('Storage is full') || errorMsg.includes('minimum free drive threshold')) {
        alert('⚠️ Storage Full\n\nThe system storage is full. Please contact the system administrator to free up space before uploading files.');
      } else if (errorMsg.includes('STORAGE_FULL')) {
        alert('⚠️ Storage Full\n\nThe system storage has reached capacity. Please contact the system administrator.');
      } else {
        alert(`Upload failed: ${errorMsg}`);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Test Results">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">Upload results for lab order: {selectedOrder?.orderNumber}</p>
        {!selectedOrder?._id && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">Error: No order selected. Please close and try again.</p>
          </div>
        )}
        
        {/* Upload Type Selection */}
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="json"
              checked={uploadType === 'json'}
              onChange={(e) => setUploadType(e.target.value)}
              className="mr-2"
            />
            JSON Results
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="pdf"
              checked={uploadType === 'pdf'}
              onChange={(e) => setUploadType(e.target.value)}
              className="mr-2"
            />
            PDF Report
          </label>
        </div>

        {uploadType === 'json' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">JSON Results</label>
            <textarea
              value={jsonResults}
              onChange={(e) => setJsonResults(e.target.value)}
              placeholder={`{
  "tests": [
    {
      "testId": "test_id_here",
      "results": {
        "value": "10.5",
        "unit": "mg/dL",
        "referenceRange": "8.5-10.5"
      },
      "interpretation": "Normal",
      "resultNotes": "Within normal limits"
    }
  ],
  "overallResults": "All tests completed successfully"
}`}
              className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">PDF Report</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button
            onClick={uploadType === 'json' ? handleUploadJSON : handleUploadPDF}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};