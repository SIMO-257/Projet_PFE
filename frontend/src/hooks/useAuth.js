import { useSelector, useDispatch } from 'react-redux';
import { login as loginThunk, logout as logoutThunk, getProfile } from '../Redux/Slices/AuthSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, status, initialized, error } = useSelector((state) => state.auth);

  const login = (credentials) => dispatch(loginThunk(credentials));
  const logout = () => dispatch(logoutThunk());
  const refreshProfile = () => dispatch(getProfile());

  return {
    user,
    isAuthenticated,
    isLoading: status === 'loading',
    isAuthChecked: initialized,
    error,
    login,
    logout,
    refreshProfile,
  };
};
