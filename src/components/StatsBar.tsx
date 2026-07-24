import React from 'react';
import { CalendarDays, UserCheck, Clock } from 'lucide-react';
import { useAppContext } from '../store';

export const StatsBar = () => {
  const { bookings, currentClass, settings } = useAppContext();
  const classBookings = bookings[currentClass] || {};
  
  const totalSlots = settings.dates.length * settings.times.length;
  const bookedCount = Object.keys(classBookings).length;
  const availableSlots = totalSlots - bookedCount;

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg font-bold">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">전체 상담 슬롯</p>
            <p className="text-base font-extrabold text-slate-800">{totalSlots}개</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">신청 완료</p>
            <p className="text-base font-extrabold text-emerald-600">{bookedCount}개</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">신청 가능</p>
            <p className="text-base font-extrabold text-amber-600">{availableSlots}개</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-sm"></span> 신청 가능</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-300 inline-block shadow-sm"></span> 예약 완료</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-400 inline-block shadow-sm"></span> 상담 불가(담임)</span>
      </div>
    </div>
  );
};
