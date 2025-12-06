import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { documentService } from '../../../core/infrastructure/api/services/documentService';
import { patientService } from '../../../core/infrastructure/api/services/patientService';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/atoms/Card';
import { Modal } from '../../components/molecules/Modal';
import { documentSchema, updateDocumentSchema, DocumentFormData, UpdateDocumentFormData } from '../../../shared/utils/validators';

export const MyDocuments = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [patientFilter, setPatientFilter] = useState('all');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema)
  });

  const { register: registerUpdate, handleSubmit: handleUpdateSubmit, formState: { errors: updateErrors }, reset: resetUpdate } = useForm<UpdateDocumentFormData>({
    resolver: zodResolver(updateDocumentSchema)
  });

  useEffect(() => {
    fetchDocuments();
    fetchPatients();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await documentService.getAll();
      const data = response?.data?.data?.data?.documents || response?.data?.data?.documents || response?.data?.data || response?.data || [];
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
      setDocuments([]);
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

  const onUpload = async (data: DocumentFormData) => {
    try {
      const formData = new FormData();
      formData.append('patientId', data.patientId);
      formData.append('title', data.title);
      formData.append('documentType', data.documentType);
      formData.append('category', data.category);
      if (data.description) formData.append('description', data.description);
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput?.files?.[0]) {
        formData.append('file', fileInput.files[0]);
      }

      await documentService.upload(formData);
      reset();
      setShowUploadModal(false);
      fetchDocuments();
      alert('Document uploaded successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to upload document');
    }
  };

  const onUpdate = async (data: UpdateDocumentFormData) => {
    try {
      const fileInput = document.querySelector('#updateFileInput') as HTMLInputElement;
      
      if (fileInput?.files?.[0]) {
        // If new file is selected, use upload endpoint to replace file
        const formData = new FormData();
        formData.append('patientId', selectedDocument.patientId._id || selectedDocument.patientId);
        formData.append('title', data.title);
        formData.append('documentType', data.documentType);
        formData.append('category', data.category);
        if (data.description) formData.append('description', data.description);
        formData.append('file', fileInput.files[0]);
        
        // Delete old document and upload new one
        await documentService.delete(selectedDocument._id);
        await documentService.upload(formData);
      } else {
        // Just update metadata
        await documentService.update(selectedDocument._id, data);
      }
      
      resetUpdate();
      setShowUpdateModal(false);
      fetchDocuments();
      alert('Document updated successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update document');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await documentService.delete(id);
      fetchDocuments();
      alert('Document deleted successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete document');
    }
  };

  const handleDownload = async (doc: any) => {
    try {
      const response = await documentService.download(doc._id);
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.fileName || `document-${doc._id}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to download document');
    }
  };

  const viewDetails = async (document: any) => {
    try {
      const response = await documentService.getById(document._id);
      setSelectedDocument(response?.data?.data?.data || response?.data?.data || response?.data || document);
      setShowDetailsModal(true);
    } catch (error) {
      setSelectedDocument(document);
      setShowDetailsModal(true);
    }
  };

  const openUpdateModal = (document: any) => {
    setSelectedDocument(document);
    resetUpdate({
      title: document.title,
      description: document.description,
      documentType: document.documentType,
      category: document.category,
    });
    setShowUpdateModal(true);
  };

  const filteredDocuments = documents.filter(doc => 
    patientFilter === 'all' || doc.patientId?._id === patientFilter
  );

  const getDocumentIcon = (type: string) => {
    const icons: Record<string, string> = {
      medical_record: '📋',
      lab_report: '🧪',
      prescription: '💊',
      imaging: '🩻',
      consultation_note: '📝',
      other: '📄',
    };
    return icons[type] || '📄';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Medical Documents</h2>
          <p className="text-gray-600">Manage patient medical documents</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)}>
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Upload Document
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Patient</label>
            <select
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              value={patientFilter}
              onChange={(e) => setPatientFilter(e.target.value)}
            >
              <option value="all">All Patients</option>
              {patients.map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.fname} {patient.lname}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Documents ({filteredDocuments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No documents found</div>
          ) : (
            <div className="space-y-3">
              {filteredDocuments.map((doc) => (
                <div key={doc._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                        <span className="text-xl">{getDocumentIcon(doc.documentType)}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{doc.title}</h4>
                      <p className="text-sm text-gray-600">
                        {doc.patientId?.fname} {doc.patientId?.lname} • {doc.documentType}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                          {doc.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => viewDetails(doc)}>Details</Button>
                    <Button variant="outline" size="sm" onClick={() => handleDownload(doc)}>Download</Button>
                    <Button variant="outline" size="sm" onClick={() => openUpdateModal(doc)}>Edit</Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(doc._id)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Modal */}
      <Modal isOpen={showUploadModal} onClose={() => { setShowUploadModal(false); reset(); }} title="Upload Document">
        <form onSubmit={handleSubmit(onUpload)} className="space-y-4">
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

          <Input label="Document Title" placeholder="Lab Results - CBC" error={errors.title?.message} {...register('title')} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
            <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" {...register('documentType')}>
              <option value="">Select type</option>
              <option value="lab_report">Lab Report</option>
              <option value="prescription">Prescription</option>
              <option value="consultation_note">Consultation Note</option>
              <option value="imaging_scan">Imaging Scan</option>
              <option value="discharge_summary">Discharge Summary</option>
              <option value="medical_certificate">Medical Certificate</option>
              <option value="referral_letter">Referral Letter</option>
              <option value="insurance_claim">Insurance Claim</option>
              <option value="consent_form">Consent Form</option>
              <option value="other">Other</option>
            </select>
            {errors.documentType && <p className="text-sm text-red-600 mt-1">{errors.documentType.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" {...register('category')}>
              <option value="">Select category</option>
              <option value="diagnostic">Diagnostic</option>
              <option value="treatment">Treatment</option>
              <option value="administrative">Administrative</option>
              <option value="legal">Legal</option>
              <option value="clinical">Clinical</option>
              <option value="radiology">Radiology</option>
              <option value="laboratory">Laboratory</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="other">Other</option>
            </select>
            {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" placeholder="Additional notes..." {...register('description')} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select File</label>
            <input type="file" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { setShowUploadModal(false); reset(); }}>Cancel</Button>
            <Button type="submit">Upload Document</Button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Document Details">
        {selectedDocument && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Patient</h4>
              <p className="text-base text-gray-900">
                {selectedDocument.patientId?.fname} {selectedDocument.patientId?.lname}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Title</h4>
              <p className="text-base text-gray-900">{selectedDocument.title}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Type</h4>
              <p className="text-base text-gray-900">{selectedDocument.documentType}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Category</h4>
              <p className="text-base text-gray-900">{selectedDocument.category}</p>
            </div>

            {selectedDocument.description && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Description</h4>
                <p className="text-base text-gray-900">{selectedDocument.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <h4 className="text-sm font-medium text-gray-500">File Size</h4>
                <p className="text-sm text-gray-900">{selectedDocument.fileSize ? `${(selectedDocument.fileSize / 1024).toFixed(1)} KB` : 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Uploaded</h4>
                <p className="text-sm text-gray-900">{selectedDocument.createdAt ? new Date(selectedDocument.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Button onClick={() => handleDownload(selectedDocument)} className="w-full">
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Document
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Update Modal */}
      <Modal isOpen={showUpdateModal} onClose={() => setShowUpdateModal(false)} title="Update Document">
        <form onSubmit={handleUpdateSubmit(onUpdate)} className="space-y-4">
          <Input label="Document Title" error={updateErrors.title?.message} {...registerUpdate('title')} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
            <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" {...registerUpdate('documentType')}>
              <option value="lab_report">Lab Report</option>
              <option value="prescription">Prescription</option>
              <option value="consultation_note">Consultation Note</option>
              <option value="imaging_scan">Imaging Scan</option>
              <option value="discharge_summary">Discharge Summary</option>
              <option value="medical_certificate">Medical Certificate</option>
              <option value="referral_letter">Referral Letter</option>
              <option value="insurance_claim">Insurance Claim</option>
              <option value="consent_form">Consent Form</option>
              <option value="other">Other</option>
            </select>
            {updateErrors.documentType && <p className="text-sm text-red-600 mt-1">{updateErrors.documentType.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" {...registerUpdate('category')}>
              <option value="diagnostic">Diagnostic</option>
              <option value="treatment">Treatment</option>
              <option value="administrative">Administrative</option>
              <option value="legal">Legal</option>
              <option value="clinical">Clinical</option>
              <option value="radiology">Radiology</option>
              <option value="laboratory">Laboratory</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="other">Other</option>
            </select>
            {updateErrors.category && <p className="text-sm text-red-600 mt-1">{updateErrors.category.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" {...registerUpdate('description')} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current File</label>
            <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-xl">{getDocumentIcon(selectedDocument?.documentType)}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedDocument?.originalFileName || selectedDocument?.fileName}</p>
                  <p className="text-xs text-gray-500">
                    {selectedDocument?.fileSize ? `${(selectedDocument.fileSize / 1024).toFixed(1)} KB` : 'Unknown size'}
                  </p>
                </div>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => handleDownload(selectedDocument)}
              >
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View
              </Button>
            </div>
            
            <label className="block text-sm font-medium text-gray-700 mb-2">Replace File (Optional)</label>
            <input 
              id="updateFileInput"
              type="file" 
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" 
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
            />
            <p className="text-xs text-gray-500 mt-1">Select a new file to replace the current one</p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowUpdateModal(false)}>Cancel</Button>
            <Button type="submit">Update Document</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};