'use client';
import { createContext, useContext, useState, useCallback } from 'react';
import Snackbar from '../components/Snackbar';

type SnackbarContextType = {
  showSnackbar: (opts: { success?: boolean; err?: string | null }) => void;
};

const SnackbarContext = createContext<SnackbarContextType | null>(null);

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [snackbarProps, setSnackbarProps] = useState<{
    success?: boolean;
    err?: string | null;
  } | null>(null);

  const showSnackbar = useCallback((opts: { success?: boolean; err?: string | null }) => {
    setSnackbarProps(opts);
  }, []);

  return (
    <SnackbarContext.Provider value= {{ showSnackbar }
}>
  { children }
{
  snackbarProps && (
    <Snackbar
          success={ snackbarProps.success }
  err = { snackbarProps.err }
  onClose = {() => setSnackbarProps(null)
}
        />
      )}
</SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error('useSnackbar must be used within SnackbarProvider');
  return ctx;
}
