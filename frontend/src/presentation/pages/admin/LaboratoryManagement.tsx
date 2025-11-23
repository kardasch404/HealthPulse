import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { laboratoryService } from '../../../core/infrastructure/api/services/laboratoryService';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/atoms/Card';
import { Modal } from '../../components/molecules/Modal';

const laboratorySchema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^(\+212|0)[5-7]\d{8}$/, 'Invalid Moroccan phone'),
  licenseNumber: z.string().min(5, 'License number required'),
  address: z.string().min(10, 'Full address required'),
  accreditation: z.string().min(2, 'Accreditation required'),
});

type LaboratoryFormData = z.infer<typeof laboratorySchema>;

export const LaboratoryManagement = () => {
  const [laboratories, setLaboratories] = useState<any[]>([]);
  const [filteredLaboratories, setFilteredLaboratories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLaboratory, setSelectedLaboratory] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<LaboratoryFormData>({
    resolver: zodResolver(laboratorySchema),
  });

  useEffect(() => {
    fetchLaboratories();
  }, []);

  useEffect(() => {
    let filtered = laboratories;

    if (searchTerm) {
      filtered = filtered.filter(lab =>
        lab.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lab.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lab.phone?.includes(searchTerm) ||
        lab.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(lab =>
        statusFilter === 'active' ? lab.isActive : !lab.isActive
      );
    }

    setFilteredLaboratories(filtered);
  }, [searchTerm, statusFilter, laboratories]);

  const fetchLaboratories = async () => {
    setLoading(true);
    try {
      const response = await laboratoryService.getAll();
      console.log('Full Response:', response);
      console.log('response.data:', response?.data);
      console.log('response.data.data:', response?.data?.data);
      const data = response?.data?.data || [];
      console.log('Extracted Data:', data);
      setLaboratories(Array.isArray(data) ? data : []);
      setFilteredLaboratories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching laboratories:', error);
      setLaboratories([]);
      setFilteredLaboratories([]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: LaboratoryFormData) => {
    try {
      const payload = {
        name: data.name,
        licenseNumber: data.licenseNumber,
        address: data.address,
        phone: data.phone,
        email: data.email,
        accreditation: data.accreditation,
      };
      await laboratoryService.create(payload);
      reset();
      setShowCreateModal(false);
      fetchLaboratories();
      alert('Laboratory registered successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to register laboratory');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await laboratoryService.activate(id);
      fetchLaboratories();
      alert('Laboratory activated successfully');
    } catch (error) {
      alert('Failed to activate laboratory');
    }
  };

  const handleSuspend = async (id: string) => {
    if (!confirm('Are you sure you want to suspend this laboratory?')) return;
    try {
      await laboratoryService.suspend(id);
      fetchLaboratories();
      alert('Laboratory suspended successfully');
    } catch (error) {
      alert('Failed to suspend laboratory');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this laboratory?')) return;
    try {
      await laboratoryService.delete(id);
      fetchLaboratories();
      alert('Laboratory deleted successfully');
    } catch (error) {
      alert('Failed to delete laboratory');
    }
  };

  const viewDetails = async (lab: any) => {
    try {
      const response = await laboratoryService.getById(lab._id);
      setSelectedLaboratory(response?.data?.data || response?.data || lab);
      setShowDetailsModal(true);
    } catch (error) {
      setSelectedLaboratory(lab);
      setShowDetailsModal(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Laboratory Management</h2>
          <p className="text-gray-600">Register and manage partner laboratories</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Register Laboratory
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <Input
                placeholder="Search by name, email, phone, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Suspended</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Laboratories ({filteredLaboratories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading laboratories...</div>
          ) : filteredLaboratories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No laboratories found</div>
          ) : (
            <div className="space-y-3">
              {filteredLaboratories.map((lab) => (
                <div key={lab._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        lab.isActive ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{lab.name}</h4>
                      <p className="text-sm text-gray-600">{lab.email}</p>
                      <p className="text-xs text-gray-500">{lab.address}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                        lab.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {lab.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => viewDetails(lab)}>Details</Button>
                    {lab.isActive ? (
                      <Button variant="outline" size="sm" onClick={() => handleSuspend(lab._id)}>Suspend</Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => handleActivate(lab._id)}>Activate</Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleDelete(lab._id)} className="text-red-600">Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); reset(); }} title="Register New Laboratory">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Laboratory Name" placeholder="Advanced Diagnostics Lab" error={errors.name?.message} {...register('name')} />
          <Input label="License Number" placeholder="LAB-2024-001" error={errors.licenseNumber?.message} {...register('licenseNumber')} />
          <Input label="Address" placeholder="456 Science Boulevard, Medical District, Casablanca 20250" error={errors.address?.message} {...register('address')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" type="tel" placeholder="0522123459" error={errors.phone?.message} {...register('phone')} />
            <Input label="Email" type="email" placeholder="info@lab.ma" error={errors.email?.message} {...register('email')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Accreditation</label>
            <select
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              {...register('accreditation')}
            >
              <option value="">Select accreditation</option>
              <option value="CAP">CAP</option>
              <option value="ISO15189">ISO 15189</option>
              <option value="CLIA">CLIA</option>
              <option value="JCI">JCI</option>
              <option value="NABL">NABL</option>
              <option value="other">Other</option>
            </select>
            {errors.accreditation && <p className="text-sm text-red-600 mt-1">{errors.accreditation.message}</p>}
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { setShowCreateModal(false); reset(); }}>Cancel</Button>
            <Button type="submit">Register Laboratory</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Laboratory Details">
        {selectedLaboratory && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Name</h4>
              <p className="text-base text-gray-900">{selectedLaboratory.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Email</h4>
                <p className="text-base text-gray-900">{selectedLaboratory.email}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                <p className="text-base text-gray-900">{selectedLaboratory.phone}</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">License Number</h4>
              <p className="text-base text-gray-900">{selectedLaboratory.licenseNumber}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Accreditation</h4>
              <p className="text-base text-gray-900">{selectedLaboratory.accreditation}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Address</h4>
              <p className="text-base text-gray-900">{selectedLaboratory.address}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Status</h4>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                selectedLaboratory.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {selectedLaboratory.isActive ? 'Active' : 'Suspended'}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
