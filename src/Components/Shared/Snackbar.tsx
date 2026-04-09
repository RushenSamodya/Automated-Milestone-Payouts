import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/app/store';
import { hideSnackbar } from '@/features/snackbar/snackbarSlice';
import { CircleCheck, XCircle, Info, X } from 'lucide-react';

export default function Snackbar(): JSX.Element | null {
  const dispatch = useDispatch();
  const snackbar = useSelector((s: RootState) => s.snackbar);

  useEffect(() => {
    if (snackbar.open) {
      const t = setTimeout(() => dispatch(hideSnackbar()), 3000);
      return () => clearTimeout(t);
    }
  }, [snackbar.open, dispatch]);

  if (!snackbar.open) return null;

  const Icon = snackbar.type === 'success' ? CircleCheck : snackbar.type === 'error' ? XCircle : Info;
  const color = snackbar.type === 'success' ? 'bg-emerald-600' : snackbar.type === 'error' ? 'bg-rose-600' : 'bg-gray-800';

  return (
    <div className={`fixed bottom-6 right-6 rounded-lg shadow-lg px-4 py-3 text-white flex items-center gap-3 ${color}`}>
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{snackbar.message}</span>
      <button onClick={() => dispatch(hideSnackbar())} className="ml-2 hover:opacity-80">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
