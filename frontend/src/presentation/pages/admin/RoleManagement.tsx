import { useState, useEffect } from 'react';
import { roleService } from '../../../core/infrastructure/api/services/roleService';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/atoms/Card';
import { Modal } from '../../components/molecules/Modal';

export const RoleManagement = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', permissions: {} });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await roleService.getAll();
      const rolesData = response?.data?.data || response?.data || [];
      setRoles(Array.isArray(rolesData) ? rolesData : []);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await roleService.create(formData);
      setShowCreateModal(false);
      setFormData({ name: '', description: '', permissions: {} });
      fetchRoles();
      alert('Role created successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create role');
    }
  };

  const handleUpdate = async () => {
    if (!selectedRole) return;
    try {
      await roleService.update(selectedRole._id, formData);
      setShowEditModal(false);
      setSelectedRole(null);
      setFormData({ name: '', description: '', permissions: {} });
      fetchRoles();
      alert('Role updated successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    try {
      await roleService.delete(id);
      fetchRoles();
      alert('Role deleted successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete role');
    }
  };

  const openEditModal = (role: any) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || {},
    });
    setShowEditModal(true);
  };

  const permissionCategories = [
    { key: 'users', label: 'Users', actions: ['create', 'read', 'update', 'delete'] },
    { key: 'patients', label: 'Patients', actions: ['create', 'read', 'update', 'delete'] },
    { key: 'appointments', label: 'Appointments', actions: ['create', 'read', 'update', 'delete'] },
    { key: 'consultations', label: 'Consultations', actions: ['create', 'read', 'update', 'delete'] },
    { key: 'prescriptions', label: 'Prescriptions', actions: ['create', 'read', 'update', 'delete'] },
    { key: 'lab_orders', label: 'Lab Orders', actions: ['create', 'read', 'update', 'delete'] },
  ];

  const togglePermission = (category: string, action: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [category]: {
          ...prev.permissions[category as keyof typeof prev.permissions],
          [action]: !prev.permissions[category as keyof typeof prev.permissions]?.[action],
        },
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Role Management</h2>
          <p className="text-gray-600">Manage roles and permissions</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Role
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Roles ({roles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading roles...</div>
          ) : roles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No roles found</div>
          ) : (
            <div className="space-y-3">
              {roles.map((role) => (
                <div key={role._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 capitalize">
                      {role.name.replace('_', ' ')}
                    </h4>
                    <p className="text-sm text-gray-600">{role.description || 'No description'}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                      role.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {role.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditModal(role)}>
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(role._id)} className="text-red-600">
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
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Role">
        <div className="space-y-4">
          <Input
            label="Role Name"
            placeholder="e.g., custom_role"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Description"
            placeholder="Role description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {permissionCategories.map((category) => (
                <div key={category.key} className="border rounded-lg p-3">
                  <h5 className="font-medium text-gray-900 mb-2">{category.label}</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {category.actions.map((action) => (
                      <label key={action} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions[category.key as keyof typeof formData.permissions]?.[action] || false}
                          onChange={() => togglePermission(category.key, action)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700 capitalize">{action}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Role</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Role">
        <div className="space-y-4">
          <Input
            label="Role Name"
            placeholder="e.g., custom_role"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Description"
            placeholder="Role description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {permissionCategories.map((category) => (
                <div key={category.key} className="border rounded-lg p-3">
                  <h5 className="font-medium text-gray-900 mb-2">{category.label}</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {category.actions.map((action) => (
                      <label key={action} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions[category.key as keyof typeof formData.permissions]?.[action] || false}
                          onChange={() => togglePermission(category.key, action)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700 capitalize">{action}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button onClick={handleUpdate}>Update Role</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
