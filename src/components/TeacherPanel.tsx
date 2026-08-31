import React, { useState } from 'react';
import { Key, FileSpreadsheet, Printer, Trash2, FolderOpen, Users, BookOpen, Globe } from 'lucide-react';
import { useAppContext } from '../store';

interface TeacherPanelProps {
  onChangePassword: () => void;
  onPrint: () => void;
  onConfirmDelete: (slotKey: string) => void;
  onConfirmReset: () => void;
  onExport: () => void;
  onExportBriefing: () => void;
}

export const TeacherPanel: React.FC<TeacherPanelProps> = ({ onChangePassword, onPrint, onConfirmDelete, onConfirmReset, onExport, onExportBriefing }) => {
  const { currentClass, bookings, settings, briefingSubmissions } = useAppContext();
  const [activeTab, setActiveTab] = useState<'consultation' | 'briefing'>('consultation');
  
    const classBookings = bookings[currentClass] || {};
  const entries: any[] = [];
  settings.dates.forEach(d => {
      settings.times.forEach(t => {
          const slotKey = `${d.date}_${t}`;
          if (classBookings[slotKey]) {
              entries.push({
                  dateLabel: d.label,
                  time: t,
                  slotKey,
                  ...classBookings[slotKey]
              });
          }
      });
  });

  const allEntries: any[] = [];
  if (isAdminMode) {
    classes.forEach(cls => {
      const clsBookings = bookings[cls] || {};
      settings.dates.forEach(d => {
        settings.times.forEach(t => {
            const slotKey = `${d.date}_${t}`;
            if (clsBookings[slotKey]) {
                allEntries.push({
                    className: cls,
                    dateLabel: d.label,
                    time: t,
                    slotKey,
                    ...clsBookings[slotKey]
                });
            }
        });
      });
    });
  }

  const classBriefings = Object.entries(briefingSubmissions || {})
    .filter(([key]) => key.startsWith(currentClass))
    .map(([key, data]: any) => ({
      key,
      studentName: typeof data === 'string' ? '' : (data?.studentName || ''),
      status: typeof data === 'string' ? data : data?.status,
    }))
    .sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true, sensitivity: 'base' }));

  return (
    <section className="bg-[#0f172a] text-white rounded-2xl shadow-xl p-5 border border-slate-800 space-y-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-1 bg-amber-500 text-amber-950 font-black text-xs rounded-lg shadow-sm">
            담임/관리자 모드
          </span>
          <h3 className="text-base md:text-lg font-extrabold tracking-tight text-white">
            <span className="text-amber-400">{activeTab === 'allConsultation' ? '전체 학급' : currentClass}</span> {activeTab === 'consultation' ? '상담 신청 현황 대장' : activeTab === 'allConsultation' ? '상담 신청 전체 현황' : '설명회 참석 현황'}
          </h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={onChangePassword} className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-amber-950 font-black rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm">
            <Key className="w-4 h-4" /> 담임 비번 변경
          </button>
          
          {activeTab === 'consultation' && (
            <>
              <button onClick={onExport} className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm">
                <FileSpreadsheet className="w-4 h-4" /> 명단 Excel 다운로드
              </button>
              <button onClick={onPrint} className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm">
                <Printer className="w-4 h-4" /> 상담 명단 인쇄
              </button>
            </>
          )}

          {activeTab === 'briefing' && (
            <button onClick={onExportBriefing} className="px-3.5 py-2 bg-blue-500 hover:bg-blue-600 text-white font-extrabold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm">
              <FileSpreadsheet className="w-4 h-4" /> 설명회 명단 다운로드
            </button>
          )}

          <button onClick={onConfirmReset} className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm">
            <Trash2 className="w-4 h-4" /> 학급 데이터 초기화
          </button>
        </div>
      </div>

            <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button 
          onClick={() => setActiveTab('consultation')}
          className={`px-4 py-2 text-sm font-bold rounded-t-lg transition ${activeTab === 'consultation' ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
        >
          <span className="flex items-center gap-2"><Users className="w-4 h-4"/> 학부모 상담 신청 현황</span>
        </button>
        <button 
          onClick={() => setActiveTab('briefing')}
          className={`px-4 py-2 text-sm font-bold rounded-t-lg transition ${activeTab === 'briefing' ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
        >
          <span className="flex items-center gap-2"><BookOpen className="w-4 h-4"/> 교육과정설명회 참석 현황</span>
        </button>
        {isAdminMode && (
          <button 
            onClick={() => setActiveTab('allConsultation')}
            className={`px-4 py-2 text-sm font-bold rounded-t-lg transition ${activeTab === 'allConsultation' ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
          >
            <span className="flex items-center gap-2"><Globe className="w-4 h-4"/> [전체] 학급 상담 신청 현황</span>
          </button>
        )}
      </div>

            <div className="overflow-x-auto custom-scrollbar">
        {activeTab === 'allConsultation' && isAdminMode ? (
          <table className="w-full text-xs text-left text-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-800/80 text-slate-200 border-b border-slate-700 font-bold">
                <th className="p-3 whitespace-nowrap">학년/반</th>
                <th className="p-3 whitespace-nowrap">일시</th>
                <th className="p-3 whitespace-nowrap">학생 이름</th>
                <th className="p-3 whitespace-nowrap">보호자 성함</th>
                <th className="p-3 whitespace-nowrap">연락처</th>
                <th className="p-3 whitespace-nowrap">상담 형태</th>
                <th className="p-3">주요 상담 희망 분야</th>
              </tr>
            </thead>
            <tbody>
              {allEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 font-medium">
                    <FolderOpen className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    전체 학급에 등록된 학부모 상담 예약 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                allEntries.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/50 transition text-xs">
                    <td className="p-3 text-slate-300 font-bold whitespace-nowrap">{item.className}</td>
                    <td className="p-3 font-bold text-amber-400 whitespace-nowrap">{item.dateLabel} {item.time}</td>
                    <td className="p-3 font-bold text-white whitespace-nowrap">{item.studentName}</td>
                    <td className="p-3 text-slate-300 whitespace-nowrap">{item.parentName}</td>
                    <td className="p-3 font-mono text-slate-300 whitespace-nowrap">{item.phone}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${item.type === '방문 상담' ? 'bg-blue-900/80 text-blue-200 border border-blue-700' : 'bg-emerald-900/80 text-emerald-200 border border-emerald-700'}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300 max-w-xs truncate">{item.note || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : activeTab === 'consultation' ? (
          <table className="w-full text-xs text-left text-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-800/80 text-slate-200 border-b border-slate-700 font-bold">
                <th className="p-3 whitespace-nowrap">일시</th>
                <th className="p-3 whitespace-nowrap">학생 이름</th>
                <th className="p-3 whitespace-nowrap">학년/반</th>
                <th className="p-3 whitespace-nowrap">보호자 성함</th>
                <th className="p-3 whitespace-nowrap">연락처</th>
                <th className="p-3 whitespace-nowrap">상담 형태</th>
                <th className="p-3">주요 상담 희망 분야</th>
                <th className="p-3 text-center whitespace-nowrap">관리</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400 font-medium">
                    <FolderOpen className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    {currentClass}에 등록된 학부모 상담 예약 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                entries.map(item => (
                  <tr key={item.slotKey} className="border-b border-slate-800 hover:bg-slate-800/50 transition text-xs">
                    <td className="p-3 font-bold text-amber-400 whitespace-nowrap">{item.dateLabel} {item.time}</td>
                    <td className="p-3 font-bold text-white whitespace-nowrap">{item.studentName}</td>
                    <td className="p-3 text-slate-300 whitespace-nowrap">{currentClass}</td>
                    <td className="p-3 text-slate-300 whitespace-nowrap">{item.parentName}</td>
                    <td className="p-3 font-mono text-slate-300 whitespace-nowrap">{item.phone}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${item.type === '방문 상담' ? 'bg-blue-900/80 text-blue-200 border border-blue-700' : 'bg-emerald-900/80 text-emerald-200 border border-emerald-700'}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300 max-w-xs truncate">{item.note || '-'}</td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <button onClick={() => onConfirmDelete(item.slotKey)} className="px-2.5 py-1 bg-rose-600/80 hover:bg-rose-600 text-white font-bold rounded-lg transition text-[11px] flex items-center gap-1 mx-auto">
                        <Trash2 className="w-3 h-3" /> 삭제
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-xs text-left text-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-800/80 text-slate-200 border-b border-slate-700 font-bold">
                <th className="p-3 whitespace-nowrap">소속 (학년 반 번호)</th>
                <th className="p-3 whitespace-nowrap">학생 이름</th>
                <th className="p-3 whitespace-nowrap">참석 여부</th>
              </tr>
            </thead>
            <tbody>
              {classBriefings.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-10 text-slate-400 font-medium">
                    <FolderOpen className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    {currentClass}에 등록된 설명회 참석 응답 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                classBriefings.map(item => (
                  <tr key={item.key} className="border-b border-slate-800 hover:bg-slate-800/50 transition text-xs">
                    <td className="p-3 font-bold text-white whitespace-nowrap">{item.key}</td>
                    <td className="p-3 text-slate-300 whitespace-nowrap">{item.studentName || '-'}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${item.status === '참석' ? 'bg-indigo-900/80 text-indigo-200 border border-indigo-700' : 'bg-rose-900/80 text-rose-200 border border-rose-700'}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};
