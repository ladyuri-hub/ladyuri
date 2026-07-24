import React from 'react';
import { useAppContext } from '../store';
import { Info, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts } = useAppContext();

  return (
    <div className="fixed bottom-5 right-5 z-50 space-y-2 pointer-events-none">
      {toasts.map(toast => {
        let bgStyle = 'bg-slate-800 text-white border-white/20';
        let Icon = Info;

        if (toast.type === 'success') {
          bgStyle = 'bg-emerald-600 text-white border-white/20';
          Icon = CheckCircle;
        } else if (toast.type === 'error') {
          bgStyle = 'bg-red-600 text-white border-white/20';
          Icon = AlertCircle;
        } else if (toast.type === 'amber') {
          bgStyle = 'bg-amber-500 text-amber-950 font-bold border-amber-600/20';
          Icon = AlertTriangle;
        }

        return (
          <div key={toast.id} className={`p-3.5 px-4 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2.5 transition transform duration-300 pointer-events-auto border animate-fade-in ${bgStyle}`}>
            <Icon className="w-4 h-4" /> <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
};
