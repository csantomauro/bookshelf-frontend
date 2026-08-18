import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../auth/auth';

function RequireAuth() {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
}

export default RequireAuth;
