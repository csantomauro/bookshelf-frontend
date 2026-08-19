import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { clearAuth, useIsAuthenticated } from '../auth/auth';

function AuthButton() {
  const authed = useIsAuthenticated();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (!authed) {
    return (
      <Button color="inherit" onClick={() => navigate('/login')}>
        Log in
      </Button>
    );
  }

  const handleLogout = () => {
    clearAuth();
    // Otherwise the next user to log in on this tab sees stale
    // per-user data (e.g. "your review") from the previous session.
    queryClient.clear();
    navigate('/books');
  };

  return (
    <Button color="inherit" onClick={handleLogout}>
      Log out
    </Button>
  );
}

export default AuthButton;
