
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';

export const useAuthRedirect = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Checks if user is authenticated before navigating.
   * @param {string} targetPath - The path to navigate to if authenticated.
   * @param {string} fallbackReturnPath - The path to return to after login (defaults to current path).
   * @returns {boolean} - True if authenticated and navigated, false if redirected to login.
   */
  const requireAuth = (targetPath, fallbackReturnPath = location.pathname) => {
    if (!isAuthenticated) {
      navigate(`/login?returnTo=${encodeURIComponent(fallbackReturnPath)}`);
      return false;
    }
    
    if (targetPath) {
      navigate(targetPath);
    }
    return true;
  };

  return { requireAuth };
};
