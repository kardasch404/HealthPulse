import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { pharmacyService } from '../../../core/infrastructure/api/services/pharmacyService';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/atoms/Card';
import { Modal } from '../../components/molecules/Modal';

const pharmacySchema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^(\+212|0)[5-7]\d{8}$/, 'Invalid Moroccan phone (e.g., +212612345678 or 0612345678)'),
  licenseNumber: z.string().min(5, 'License number required'),
  street: z.string().min(5, 'Street required'),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  zipCode: z.string().min(4, 'Zip code required'),
  country: z.string().min(2, 'Country required'),
});

type PharmacyFormData = z.infer<typeof pharmacySchema>;

export const PharmacyManagement = () => {
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PharmacyFormData>({
    resolver: zodResolver(pharmacySchema),
  });

  useEffect(() => {
    fetchPharmacies();
  }, []);

  useEffect(() => {
    let filtered = pharmacies;

    if (searchTerm) {
      filtered = filtered.filter(pharmacy =>
        pharmacy.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pharmacy.contact?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pharmacy.contact?.phone?.includes(searchTerm) ||
        pharmacy.address?.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(pharmacy =>
        statusFilter === 'active' ? pharmacy.isActive : !pharmacy.isActive
      );
    }

    setFilteredPharmacies(filtered);
  }, [searchTerm, statusFilter, pharmacies]);

  const fetchPharmacies = async () => {
    setLoading(true);
    try {
      const response = await pharmacyService.getAll();
      const data = response?.data?.data || [];
      setPharmacies(Array.isArray(data) ? data : []);
      setFilteredPharmacies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
      setPharmacies([]);
      setFilteredPharmacies([]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: PharmacyFormData) => {
    try {
      const payload = {
        name: data.name,
        licenseNumber: data.licenseNumber,
        contact: {
          phone: data.phone,
          email: data.email,
        },
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
        },
      };
      await pharmacyService.create(payload);
      reset();
      setShowCreateModal(false);
      fetchPharmacies();
      alert('Pharmacy registered successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to register pharmacy');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await pharmacyService.activate(id);
      fetchPharmacies();
      alert('Pharmacy activated successfully');
    } catch (error) {
      alert('Failed to activate pharmacy');
    }
  };

  const handleSuspend = async (id: string) => {
    if (!confirm('Are you sure you want to suspend this pharmacy?')) return;
    try {
      await pharmacyService.suspend(id);
      fetchPharmacies();
      alert('Pharmacy suspended successfully');
    } catch (error) {
      alert('Failed to suspend pharmacy');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pharmacy? This action cannot be undone.')) return;
    try {
      await pharmacyService.delete(id);
      fetchPharmacies();
      alert('Pharmacy deleted successfully');
    } catch (error) {
      alert('Failed to delete pharmacy');
    }
  };

  const viewDetails = async (pharmacy: any) => {
    try {
      const response = await pharmacyService.getById(pharmacy._id);
      setSelectedPharmacy(response?.data?.data || response?.data || pharmacy);
      setShowDetailsModal(true);
    } catch (error) {
      setSelectedPharmacy(pharmacy);
      setShowDetailsModal(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pharmacy Management</h2>
          <p className="text-gray-600">Register and manage partner pharmacies</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Register Pharmacy
        </Button>
      </div>

      {/* Filters */}
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

      {/* Pharmacies List */}
      <Card>
        <CardHeader>
          <CardTitle>All Pharmacies ({filteredPharmacies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading pharmacies...</div>
          ) : filteredPharmacies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No pharmacies found</div>
          ) : (
            <div className="space-y-3">
              {filteredPharmacies.map((pharmacy) => (
                <div key={pharmacy._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        pharmacy.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{pharmacy.name}</h4>
                      <p className="text-sm text-gray-600">{pharmacy.contact?.email}</p>
                      <p className="text-xs text-gray-500">{pharmacy.address?.city}, {pharmacy.address?.state}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          pharmacy.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {pharmacy.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => viewDetails(pharmacy)}>
                      Details
                    </Button>
                    {pharmacy.isActive ? (
                      <Button variant="outline" size="sm" onClick={() => handleSuspend(pharmacy._id)}>
                        Suspend
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => handleActivate(pharmacy._id)}>
                        Activate
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleDelete(pharmacy._id)} className="text-red-600">
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); reset(); }} title="Register New Pharmacy">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Pharmacy Name" placeholder="ABC Pharmacy" error={errors.name?.message} {...register('name')} />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" type="email" placeholder="pharmacy@example.com" error={errors.email?.message} {...register('email')} />
            <Input label="Phone" type="tel" placeholder="+1234567890" error={errors.phone?.message} {...register('phone')} />
          </div>

          <Input label="License Number" placeholder="LIC-12345" error={errors.licenseNumber?.message} {...register('licenseNumber')} />

          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Address</h4>
            <div className="space-y-3">
              <Input label="Street" placeholder="123 Main St" error={errors.street?.message} {...register('street')} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="City" placeholder="New York" error={errors.city?.message} {...register('city')} />
                <Input label="State" placeholder="NY" error={errors.state?.message} {...register('state')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Zip Code" placeholder="10001" error={errors.zipCode?.message} {...register('zipCode')} />
                <Input label="Country" placeholder="USA" error={errors.country?.message} {...register('country')} />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { setShowCreateModal(false); reset(); }}>
              Cancel
            </Button>
            <Button type="submit">Register Pharmacy</Button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Pharmacy Details">
        {selectedPharmacy && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Name</h4>
              <p className="text-base text-gray-900">{selectedPharmacy.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Email</h4>
                <p className="text-base text-gray-900">{selectedPharmacy.contact?.email}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                <p className="text-base text-gray-900">{selectedPharmacy.contact?.phone}</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">License Number</h4>
              <p className="text-base text-gray-900">{selectedPharmacy.licenseNumber}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Address</h4>
              <p className="text-base text-gray-900">
                {selectedPharmacy.address?.street}<br />
                {selectedPharmacy.address?.city}, {selectedPharmacy.address?.state} {selectedPharmacy.address?.zipCode}<br />
                {selectedPharmacy.address?.country}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Status</h4>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                selectedPharmacy.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {selectedPharmacy.isActive ? 'Active' : 'Suspended'}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
