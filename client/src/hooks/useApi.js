import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export const useApi = () => {
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall, options = {}) => {
    const {
      showSuccessToast = false,
      successMessage = 'Operation completed successfully',
      showErrorToast = true,
      errorMessage = 'An error occurred',
      onSuccess = null,
      onError = null
    } = options;

    setLoading(true);
    setError(null);

    try {
      const response = await apiCall(api);
      
      if (showSuccessToast) {
        toast.success(successMessage);
      }

      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || errorMessage;
      setError(errorMsg);

      if (showErrorToast) {
        toast.error(errorMsg);
      }

      if (onError) {
        onError(err);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, [api]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    execute,
    loading,
    error,
    reset
  };
};

export default useApi;
