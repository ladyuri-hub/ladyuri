import React from 'react';
import { Calendar, Search, Lock, Plus, Clock, Pencil } from 'lucide-react';
import { useAppContext } from '../store';

interface ScheduleGridProps {
  onOpenBooking: (date: string, dateLabel: string, time: string) => void;
  onOpenDetail: (date: string, dateLabel: string, time: string) => void;
  onOpenPeriodManage: () => void;
}

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({ onOpenBooking, onOpenDetail, onOpenPeriodManage }) => {
  const { currentClass, bookings, disabledSlots, isAdminMode, isTeacherMode, searchQuery, setSearchQuery, addToast, saveDisabledSlots, settings } = useAppContext();

  const classBookings = bookings[currentClass] || {};
  const classDisabled = disabledSlots[currentClass] || {};

  const toggleDisableSlot = (date: string, time: string) => {
    const slotKey = `${date}_${time}`;
    const newDisabled = {
      ...disabledSlots,
      [currentClass]: {
        ...classDisabled,
        [slotKey]: !classDisabled[slotKey]
      }
    };
    saveDisabledSlots(newDisabled);
    addToast(
      !classDisabled[slotKey] ? '해당 시간이 상담 불가로 설정되었습니다.' : '해당 시간이 신청 가능 상태로 변경되었습니다.',
      'info'
    );
  };

  return (
    <main className="bg-white rounded-2xl shadow-md border border-slate-200/90 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" /> 상담 희망 일시 선택
          {isAdminMode && (
            <button onClick={onOpenPeriodManage} className="p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-indigo-600 transition ml-1" title="일정 및 문구 설정">
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
        </h3>
        <span className="text-xs text-slate-400">원하시는 시간대의 [시간 선택] 버튼을 누르시면 입력창이 뜹니다.</span>
      </div>

      {(isAdminMode || isTeacherMode) && (
        <div className="p-3 bg-indigo-50/80 border-b border-indigo-100 flex items-center gap-2">
          <Search className="w-4 h-4 text-indigo-500 ml-2" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="담임/관리자 전용 학생 성함 검색..." 
            className="w-full max-w-xs px-3 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}

      <div className="p-4 md:p-5 overflow-x-auto custom-scrollbar">
        <div className="min-w-[800px] grid grid-cols-5 gap-3 md:gap-4">
          {settings.dates.map((d) => (
            <div key={d.date} className="space-y-2">
              <div className="p-2.5 bg-[#1e3a8a] text-white rounded-xl text-center font-bold text-xs shadow-sm relative group">
                <div className="text-[11px] opacity-90">{d.label}</div>
                <div className="text-xs font-extrabold mt-0.5">{d.day}</div>
                {isAdminMode && (
                  <button onClick={onOpenPeriodManage} className="absolute top-1 right-1 p-0.5 rounded text-white/50 hover:bg-white/20 hover:text-white opacity-0 group-hover:opacity-100 transition" title="날짜 수정">
                    <Pencil className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {settings.times.map((t) => {
                  const slotKey = `${d.date}_${t}`;
                  const booking = classBookings[slotKey];
                  const isDisabled = classDisabled[slotKey];
                  const timeLabel = t.split('~')[0].trim();

                  if (booking) {
                    const matchesSearch = (isAdminMode || isTeacherMode) && searchQuery && (
                      booking.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      booking.parentName.toLowerCase().includes(searchQuery.toLowerCase())
                    );

                    if (isAdminMode || isTeacherMode) {
                      return (
                        <div key={t} className={`p-2.5 ${matchesSearch ? 'ring-2 ring-indigo-500 bg-indigo-100' : 'bg-indigo-50 hover:bg-indigo-100'} border border-indigo-200 rounded-xl transition space-y-1`}>
                          <div className="cursor-pointer" onClick={() => onOpenDetail(d.date, d.label, t)}>
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-indigo-950">{timeLabel}</span>
                              <span className="px-1.5 py-0.5 bg-indigo-200 text-indigo-900 text-[10px] font-bold rounded">{booking.type || '방문'}</span>
                            </div>
                            <p className="text-xs font-bold text-slate-800 truncate">{booking.studentName} <span className="text-[10px] text-slate-500 font-normal">({booking.parentName})</span></p>
                            <p className="text-[10px] text-slate-500 font-mono">{booking.phone}</p>
                          </div>
                          <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer pt-1 border-t border-indigo-200/60 mt-1">
                            <input type="checkbox" checked={isDisabled || false} onChange={() => toggleDisableSlot(d.date, t)} className="rounded accent-rose-500" />
                            <span>상담 불가(비활성화)</span>
                          </label>
                        </div>
                      );
                    } else {
                      return (
                        <div key={t} onClick={() => onOpenDetail(d.date, d.label, t)} className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl opacity-90 hover:opacity-100 cursor-pointer space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-500">{timeLabel}</span>
                            <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded flex items-center gap-1">
                              <Lock className="w-2 h-2" /> 예약 완료
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-medium">상담 완료 (비공개)</p>
                        </div>
                      );
                    }
                  } else if (isDisabled) {
                    return (
                      <div key={t} className="p-2.5 bg-rose-50/80 border border-rose-200 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-rose-950 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-rose-400" /> {t.split('~')[0].trim()} ~ {t.split('~')[1].trim()}
                          </span>
                          <span className="px-1.5 py-0.5 bg-rose-200 text-rose-800 text-[10px] font-bold rounded">상담 불가</span>
                        </div>
                        <div className="py-1 text-center text-[11px] font-bold text-rose-400 bg-white/70 rounded-lg border border-rose-100">
                          신청 비활성화됨
                        </div>
                        <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer pt-0.5">
                          <input type="checkbox" checked={true} onChange={() => toggleDisableSlot(d.date, t)} className="rounded accent-rose-500" />
                          <span>상담 불가(비활성화)</span>
                        </label>
                      </div>
                    );
                  } else {
                    return (
                      <div key={t} className="p-2.5 bg-white border border-slate-200 rounded-xl flex flex-col justify-between space-y-2 hover:border-blue-400 hover:shadow-sm transition">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-slate-400" /> {t.split('~')[0].trim()} ~ {t.split('~')[1].trim()}
                          </span>
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">신청 가능</span>
                        </div>
                        <button onClick={() => onOpenBooking(d.date, `${d.label} ${d.day}`, t)} className="w-full py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-100 transition flex items-center justify-center gap-1">
                          <Plus className="w-3 h-3" /> 시간 선택
                        </button>
                        {(isAdminMode || isTeacherMode) && (
                           <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer pt-1 border-t border-slate-100 mt-1">
                             <input type="checkbox" checked={false} onChange={() => toggleDisableSlot(d.date, t)} className="rounded accent-rose-500" />
                             <span>상담 불가(비활성화)</span>
                           </label>
                        )}
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};
