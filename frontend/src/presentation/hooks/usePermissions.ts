import { useAppSelector } from '../../core/application/stores/hooks';

export const usePermissions = () => {
  const { user } = useAppSelector((state) => state.auth);
  const permissions = user?.roleId?.permissions || {};

  const can = (resource: string, action: string): boolean => {
    const resourcePermissions = permissions[resource];
    if (!resourcePermissions) return false;
    
    const permission = resourcePermissions[action];
    return permission === true || permission === 'all';
  };

  const canRead = (resource: string): boolean => can(resource, 'read');
  const canCreate = (resource: string): boolean => can(resource, 'create');
  const canUpdate = (resource: string): boolean => can(resource, 'update');
  const canDelete = (resource: string): boolean => can(resource, 'delete');

  const isAdmin = user?.roleId?.name === 'admin';
  const isDoctor = user?.roleId?.name === 'doctor';
  const isNurse = user?.roleId?.name === 'nurse';
  const isPatient = user?.roleId?.name === 'patient';
  const isPharmacist = user?.roleId?.name === 'pharmacist';
  const isLabTech = user?.roleId?.name === 'lab_technician';
  const isReception = user?.roleId?.name === 'reception';

  return {
    can,
    canRead,
    canCreate,
    canUpdate,
    canDelete,
    isAdmin,
    isDoctor,
    isNurse,
    isPatient,
    isPharmacist,
    isLabTech,
    isReception,
    permissions,
  };
};
