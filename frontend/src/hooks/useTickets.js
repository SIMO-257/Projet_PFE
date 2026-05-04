import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { getTicketsData, purchaseTicket as purchaseThunk, validateTicket as validateThunk } from '../Redux/Slices/TicketsSlice';

export const useTickets = () => {
  const dispatch = useDispatch();
  const { items, availableTypes, status, error } = useSelector((state) => state.tickets);

  const refreshTickets = useCallback(() => {
    dispatch(getTicketsData());
  }, [dispatch]);
  const purchaseTicket = useCallback((payload) => {
    dispatch(purchaseThunk(payload));
  }, [dispatch]);
  const validateTicket = useCallback((payload) => {
    dispatch(validateThunk(payload));
  }, [dispatch]);

  return {
    tickets: items,
    availableTypes,
    isLoading: status === 'loading',
    error,
    refreshTickets,
    purchaseTicket,
    validateTicket,
  };
};
