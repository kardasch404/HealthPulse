import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../hooks/useAuth';
import { registerSchema, RegisterFormData } from '../../../shared/utils/validators';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/atoms/Card';

export const RegisterPage = () => {
  const { register: registerUser, isLoading, error, clearError } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const onSubmit = async (data: RegisterFormData) => {
    const { confirmPassword, ...registerData } = data;
    await registerUser(registerData);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            HealthPulse
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your account
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Register</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  placeholder="John"
                  error={errors.fname?.message}
                  {...register('fname')}
                />

                <Input
                  label="Last Name"
                  placeholder="Doe"
                  error={errors.lname?.message}
                  {...register('lname')}
                />
              </div>

              <Input
                label="Email"
                type="email"
                placeholder="john.doe@example.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Phone (Optional)"
                type="tel"
                placeholder="+1234567890"
                error={errors.phone?.message}
                {...register('phone')}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  {...register('roleId')}
                >
                  <option value="">Select a role</option>
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="pharmacist">Pharmacist</option>
                  <option value="lab_technician">Lab Technician</option>
                  <option value="receptionist">Receptionist</option>
                </select>
                {errors.roleId && (
                  <p className="text-sm text-red-600">{errors.roleId.message}</p>
                )}
              </div>

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
              >
                Create Account
              </Button>

              <div className="text-center text-sm">
                <span className="text-gray-600">Already have an account? </span>
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
