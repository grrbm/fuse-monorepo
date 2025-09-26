import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { Card, CardBody, Spinner } from '@heroui/react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: ('patient' | 'doctor' | 'admin')[];
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardBody className="flex items-center justify-center p-8">
            <Spinner size="lg" />
            <p className="mt-4 text-foreground-600">Loading...</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  // If not authenticated, don't render anything (redirect is happening)
  if (!user) {
    return null;
  }

  // Check role-based access if required
  if (requiredRole && !requiredRole.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardBody className="text-center p-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">Access Denied</h2>
            <p className="text-foreground-600">You don't have permission to view this page.</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}