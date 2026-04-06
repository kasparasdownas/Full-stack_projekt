import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ApiError } from '../api/client';
import { useCurrentUserQuery } from '../features/auth/useAuth';

export function ProtectedRoute() {
  const location = useLocation();
  const currentUserQuery = useCurrentUserQuery();

  if (currentUserQuery.isLoading) {
    return <div className="panel">Checking your session...</div>;
  }

  if (currentUserQuery.data) {
    return <Outlet />;
  }

  if (currentUserQuery.error instanceof ApiError && currentUserQuery.error.status === 401) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <div className="panel error-panel">Unable to verify your session right now.</div>;
}

