import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileService } from '../../core/infrastructure/api/services/profileService';
import { storageService } from '../../core/infrastructure/storage/localStorage';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
import { Modal } from '../components/molecules/Modal';
import { updateProfileSchema, changePasswordSchema, UpdateProfileFormData, ChangePasswordFormData } from '../../shared/utils/validators';

export const MyProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({ fname: '', lname: '', email: '', phone: '' });

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, reset: resetPassword } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema)
  });

  useEffect(() => {
    // Debug: Check authentication
    const token = localStorage.getItem('healthpulse_access_token');
    const user = localStorage.getItem('healthpulse_user');
    console.log('Token exists:', !!token);
    console.log('User in storage:', user);
    
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await profileService.getProfile();
      console.log('Full response:', response);
      
      // Handle different response structures
      let data = {};
      if (response?.data?.data) {
        data = response.data.data;
      } else if (response?.data) {
        data = response.data;
      } else {
        data = response || {};
      }
      
      console.log('Extracted data:', data);
      setProfile(data);
      setFormData({
        fname: data.fname || '',
        lname: data.lname || '',
        email: data.email || '',
        phone: data.phone || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      console.error('Error details:', error.response);
      
      // Fallback: Try to get user data from localStorage
      const storedUser = storageService.getUser();
      if (storedUser) {
        console.log('Using stored user data:', storedUser);
        setProfile(storedUser);
        setFormData({
          fname: storedUser.fname || '',
          lname: storedUser.lname || '',
          email: storedUser.email || '',
          phone: storedUser.phone || ''
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileService.updateProfile(formData);
      setProfile({ ...profile, ...formData });
      setEditMode(false);
      alert('Profile updated successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (data: ChangePasswordFormData) => {
    setSaving(true);
    try {
      await profileService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      resetPassword();
      setShowPasswordModal(false);
      alert('Password changed successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
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
          <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
          <p className="text-gray-600">View and manage your personal information</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setShowPasswordModal(true)}>
            Change Password
          </Button>
          {editMode ? (
            <>
              <Button variant="outline" onClick={() => { setEditMode(false); setFormData({ fname: profile?.fname || '', lname: profile?.lname || '', email: profile?.email || '', phone: profile?.phone || '' }); }}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditMode(true)}>
              Update Profile
            </Button>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        {/* Profile Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-xl font-bold">
              {profile?.fname?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {profile?.fname && profile?.lname ? `${profile.fname} ${profile.lname}` : 'User Name'}
              </h3>
              <p className="text-sm text-gray-500 capitalize">{profile?.roleId?.name || profile?.role || 'User'}</p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-6">Profile Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              {editMode ? (
                <input
                  type="text"
                  value={formData.fname}
                  onChange={(e) => setFormData({ ...formData, fname: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your first name"
                />
              ) : (
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                  {profile?.fname || 'Not provided'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              {editMode ? (
                <input
                  type="text"
                  value={formData.lname}
                  onChange={(e) => setFormData({ ...formData, lname: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your last name"
                />
              ) : (
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                  {profile?.lname || 'Not provided'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              {editMode ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your email"
                />
              ) : (
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                  {profile?.email || 'Not provided'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              {editMode ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              ) : (
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                  {profile?.phone || 'Not provided'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 capitalize">
                {profile?.roleId?.name || profile?.role || 'Not provided'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Not available'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Security */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-medium text-gray-900">Account Security</h4>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="flex items-center justify-between w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                <span className="text-gray-900">••••••••••••</span>
                <Button variant="outline" size="sm" onClick={() => setShowPasswordModal(true)}>
                  Change
                </Button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  profile?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {profile?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Login</label>
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                {profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'Not available'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Change Password">
        <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
          <Input 
            label="Current Password" 
            type="password"
            placeholder="Enter your current password"
            error={passwordErrors.currentPassword?.message} 
            {...registerPassword('currentPassword')} 
          />
          
          <Input 
            label="New Password" 
            type="password"
            placeholder="Enter your new password"
            error={passwordErrors.newPassword?.message} 
            {...registerPassword('newPassword')} 
          />
          
          <Input 
            label="Confirm New Password" 
            type="password"
            placeholder="Confirm your new password"
            error={passwordErrors.confirmPassword?.message} 
            {...registerPassword('confirmPassword')} 
          />

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">Password Requirements</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• At least 6 characters long</li>
              <li>• Should contain a mix of letters and numbers</li>
              <li>• Avoid using personal information</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowPasswordModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Changing...' : 'Change Password'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};