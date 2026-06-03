import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { getWalletData } from '../Redux/Slices/WalletSlice';

export const useWallet = () => {
  const dispatch = useDispatch();
  const { balance, transactions, status, error } = useSelector((state) => state.wallet);

  const refreshWallet = useCallback(() => {
    dispatch(getWalletData());
  }, [dispatch]);

  return {
    balance,
    transactions,
    isLoading: status === 'loading',
    error,
    refreshWallet,
  };
};
