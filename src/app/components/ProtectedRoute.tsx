import { ReactNode } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Shield, AlertTriangle, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('citizen' | 'volunteer' | 'ngo' | 'admin')[];
  requireAuth?: boolean;
  fallback?: ReactNode;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles = ['citizen', 'volunteer', 'ngo', 'admin'],
  requireAuth = true,
  fallback 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !user) {
    return fallback || (
      <div className="max-w-2xl mx-auto p-6">
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>You need to sign in to access this feature.</span>
            <Button size="sm" onClick={() => window.dispatchEvent(new CustomEvent('open-auth-modal'))}>
              Sign In
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check role-based access
  if (user && !allowedRoles.includes(user.role)) {
    return fallback || (
      <div className="max-w-2xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>Access denied. This feature requires one of the following roles:</p>
              <div className="flex gap-2">
                {allowedRoles.map(role => (
                  <span key={role} className="px-2 py-1 bg-muted rounded text-sm">
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </span>
                ))}
              </div>
              <p className="text-sm">Your current role: <strong>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</strong></p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}

// Convenience components for specific roles
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['admin']} fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

export function VolunteerOrAdmin({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['volunteer', 'admin']} fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

export function NGOOrAdmin({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['ngo', 'admin']} fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

export function AuthenticatedOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute requireAuth={true} allowedRoles={['citizen', 'volunteer', 'ngo', 'admin']} fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}