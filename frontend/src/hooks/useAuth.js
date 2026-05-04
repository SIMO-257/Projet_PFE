import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { login as loginThunk, logout as logoutThunk, getProfile } from '../Redux/Slices/AuthSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, status, initialized, error } = useSelector((state) => state.auth);

  const login = useCallback((credentials) => dispatch(loginThunk(credentials)), [dispatch]);
  const logout = useCallback(() => dispatch(logoutThunk()), [dispatch]);
  const refreshProfile = useCallback(() => dispatch(getProfile()), [dispatch]);

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
