import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { userService } from '../../../core/infrastructure/api/services/userService';
import { pharmacyService } from '../../../core/infrastructure/api/services/pharmacyService';
import { laboratoryService } from '../../../core/infrastructure/api/services/laboratoryService';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/atoms/Card';
import { Modal } from '../../components/molecules/Modal';

const createUserSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fname: z.string().min(2, 'First name required'),
  lname: z.string().min(2, 'Last name required'),
  phone: z.string().optional(),
  roleId: z.string().min(1, 'Role is required'),
  pharmacyId: z.string().optional(),
  laboratoryId: z.string().optional(),
});

type CreateUserForm = z.infer<typeof createUserSchema>;

export const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [laboratories, setLaboratories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { register, handleSubmit, formState: { errors }, reset, control } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
  });

  const watchedRoleId = useWatch({ control, name: 'roleId' });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchPharmacies();
    fetchLaboratories();
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.fname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm)
      );
    }

    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.roleId?._id === selectedRole || user.roleId === selectedRole);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.isActive : !user.isActive
      );
    }

    setFilteredUsers(filtered);
  }, [searchTerm, selectedRole, statusFilter, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getAll();
      const usersData = response?.data?.data?.users || [];
      setUsers(Array.isArray(usersData) ? usersData : []);
      setFilteredUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await userService.getRoles();
      const rolesData = response?.data?.data || response?.data || response;
      setRoles(Array.isArray(rolesData) ? rolesData : []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setRoles([]);
    }
  };

  const fetchPharmacies = async () => {
    try {
      const response = await pharmacyService.getAll();
      const pharmaciesData = response?.data?.data || [];
      setPharmacies(Array.isArray(pharmaciesData) ? pharmaciesData : []);
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
      setPharmacies([]);
    }
  };

  const fetchLaboratories = async () => {
    try {
      const response = await laboratoryService.getAll();
      const laboratoriesData = response?.data?.data?.data || [];
      setLaboratories(Array.isArray(laboratoriesData) ? laboratoriesData : []);
    } catch (error) {
      console.error('Error fetching laboratories:', error);
      setLaboratories([]);
    }
  };

  const onSubmit = async (data: CreateUserForm) => {
    try {
      const payload = { ...data };
      if (!payload.phone) delete payload.phone;
      if (!payload.pharmacyId) delete payload.pharmacyId;
      if (!payload.laboratoryId) delete payload.laboratoryId;
      await userService.create(payload);
      reset();
      setShowCreateForm(false);
      fetchUsers();
      alert('User created successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleSuspend = async (id: string) => {
    if (!confirm('Are you sure you want to suspend this user?')) return;
    try {
      await userService.suspend(id);
      fetchUsers();
      alert('User suspended successfully');
    } catch (error) {
      alert('Failed to suspend user');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await userService.activate(id);
      fetchUsers();
      alert('User activated successfully');
    } catch (error) {
      alert('Failed to activate user');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await userService.delete(id);
      fetchUsers();
      alert('User deleted successfully');
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  const getRoleIcon = (roleName: string) => {
    const icons: Record<string, JSX.Element> = {
      doctor: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      nurse: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      reception: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      patient: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      pharmacist: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      lab_technician: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      ),
      admin: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    };
    return icons[roleName] || icons.patient;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Create and manage system users</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create User
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
              <select
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                {roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.name.charAt(0).toUpperCase() + role.name.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
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
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={showCreateForm}
        onClose={() => {
          setShowCreateForm(false);
          reset();
        }}
        title="Create New User"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" placeholder="John" error={errors.fname?.message} {...register('fname')} />
            <Input label="Last Name" placeholder="Doe" error={errors.lname?.message} {...register('lname')} />
          </div>

          <Input label="Email" type="email" placeholder="user@example.com" error={errors.email?.message} {...register('email')} />
          <Input label="Phone (Optional)" type="tel" placeholder="+1234567890" error={errors.phone?.message} {...register('phone')} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              {...register('roleId')}
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role._id} value={role._id}>
                  {role.name.charAt(0).toUpperCase() + role.name.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
            {errors.roleId && <p className="text-sm text-red-600 mt-1">{errors.roleId.message}</p>}
          </div>

          {/* Pharmacy Selection for Pharmacist */}
          {watchedRoleId && roles.find(r => r._id === watchedRoleId)?.name === 'pharmacist' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pharmacy</label>
              <select
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                {...register('pharmacyId')}
              >
                <option value="">Select a pharmacy</option>
                {pharmacies.map((pharmacy) => (
                  <option key={pharmacy._id} value={pharmacy._id}>
                    {pharmacy.name}
                  </option>
                ))}
              </select>
              {errors.pharmacyId && <p className="text-sm text-red-600 mt-1">{errors.pharmacyId.message}</p>}
            </div>
          )}

          {/* Laboratory Selection for Lab Technician */}
          {watchedRoleId && roles.find(r => r._id === watchedRoleId)?.name === 'lab_technician' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Laboratory</label>
              <select
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                {...register('laboratoryId')}
              >
                <option value="">Select a laboratory</option>
                {laboratories.map((laboratory) => (
                  <option key={laboratory._id} value={laboratory._id}>
                    {laboratory.name}
                  </option>
                ))}
              </select>
              {errors.laboratoryId && <p className="text-sm text-red-600 mt-1">{errors.laboratoryId.message}</p>}
            </div>
          )}

          <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { setShowCreateForm(false); reset(); }}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No users found</div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        user.isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {getRoleIcon(user.roleId?.name || 'patient')}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        {user.fname} {user.lname}
                      </h4>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {user.roleId?.name?.replace('_', ' ').toUpperCase() || 'N/A'}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {user.isActive ? (
                      <Button variant="outline" size="sm" onClick={() => handleSuspend(user._id)}>
                        Suspend
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => handleActivate(user._id)}>
                        Activate
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleDelete(user._id)} className="text-red-600 hover:text-red-700">
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
