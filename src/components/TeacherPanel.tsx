import React, { useState } from 'react';
import { Key, FileSpreadsheet, Printer, Trash2, FolderOpen, Users, BookOpen, Globe , Upload } from 'lucide-react';
import { useAppContext } from '../store';

interface TeacherPanelProps {
  onChangePassword: () => void;
  onPrint: () => void;
  onPrintBriefing: () => void;
  onConfirmDelete: (slotKey: string, targetClass?: string) => void;
  onConfirmReset: () => void;
  onExport: () => void;
  onExportBriefing: () => void;
}

export const TeacherPanel: React.FC<TeacherPanelProps> = ({ onChangePassword, onPrint, onPrintBriefing, onConfirmDelete, onConfirmReset, onExport, onExportBriefing }) => {
  const { currentClass, classes, bookings, saveBookings, settings, briefingSubmissions, saveBriefingSubmissions, isAdminMode } = useAppContext();
  
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
    // Sort all entries by className first, then by date and time
    allEntries.sort((a, b) => {
        if (a.className !== b.className) return a.className.localeCompare(b.className, undefined, { numeric: true });
        if (a.dateLabel !== b.dateLabel) return a.dateLabel.localeCompare(b.dateLabel);
        return a.time.localeCompare(b.time);
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

  const allBriefings = Object.entries(briefingSubmissions || {})
    .map(([key, data]: any) => ({
      key,
      className: key.split(' ').slice(0, 2).join(' '),
      studentName: typeof data === 'string' ? '' : (data?.studentName || ''),
      status: typeof data === 'string' ? data : data?.status,
    }))
    .sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true, sensitivity: 'base' }));

  const activeConsultationEntries = isAdminMode ? allEntries : entries;
  const activeBriefingEntries = isAdminMode ? allBriefings : classBriefings;

  const handleRestoreBriefingCSV = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n').filter((line: string) => line.trim());
      
      if (lines.length < 2) {
        alert('올바른 CSV 파일이 아니거나 데이터가 없습니다.');
        return;
      }
      
      const newSubmissions = JSON.parse(JSON.stringify(briefingSubmissions));
      let rCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map((s: string) => s.replace(/^"|"$/g, '').trim());
        if (row.length < 3) continue;
        
        const classNameFull = row[0];
        const studentName = row[1];
        const status = row[2];
        
        if (classNameFull && status) {
            newSubmissions[classNameFull] = { studentName, status };
            rCount++;
        }
      }
      
      if (rCount > 0) {
        if (confirm(`총 ${rCount}건의 설명회 참석 데이터를 복구합니다.\n(현재 입력된 기존 데이터는 지워지지 않고 빈자리에 추가/병합됩니다.)\n계속하시겠습니까?`)) {
           saveBriefingSubmissions(newSubmissions);
           alert('복구가 완료되었습니다.');
        }
      } else {
        alert('복구할 데이터 형식을 찾을 수 없습니다.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleRestoreCSV = async (e: any) => {
    const files = Array.from(e.target.files) as File[];
    if (files.length === 0) return;

    let newBookings = JSON.parse(JSON.stringify(bookings));
    let totalRCount = 0;
    let totalSkipCount = 0;
    let errorFiles = 0;

    const readFile = (file: File): Promise<void> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const buffer = evt.target?.result as ArrayBuffer;
            let text = new TextDecoder('utf-8').decode(buffer);
            
            if (text.includes('\ufffd') || !/[가-힣]/.test(text)) {
              text = new TextDecoder('euc-kr').decode(buffer);
            }

            const lines = text.split('\n').filter((line: string) => line.trim());
            if (lines.length < 2) {
              errorFiles++;
              resolve();
              return;
            }

            for (let i = 1; i < lines.length; i++) {
              const row = lines[i].split(',').map((s: string) => s.replace(/^"|"$/g, '').trim());
              if (row.length < 6) continue;
              
              const className = row[0];
              const datetime = row[1];
              const studentName = row[2];
              const parentName = row[3];
              const phone = row[4];
              const type = row[5] === '방문 상담' || row[5] === '방문' ? '방문' : '전화';
              const note = row[6] || '';
              
              const dateMatch = settings.dates.find((d: any) => datetime.startsWith(d.label));
              if (dateMatch) {
                  const timePart = datetime.replace(dateMatch.label, '').trim();
                  if (settings.times.includes(timePart)) {
                      const slotKey = `${dateMatch.date}_${timePart}`;
                      
                      if (!newBookings[className]) newBookings[className] = {};
                      
                      if (newBookings[className][slotKey]) {
                          totalSkipCount++;
                          continue;
                      }
                      
                      const isStudentAlreadyBooked = Object.values(newBookings[className]).some(
                          (b: any) => b.studentName === studentName
                      );
                      
                      if (isStudentAlreadyBooked) {
                          totalSkipCount++;
                          continue;
                      }

                      newBookings[className][slotKey] = {
                         studentName, parentName, phone, type, note
                      };
                      totalRCount++;
                  }
              }
            }
          } catch(err) {
            errorFiles++;
          }
          resolve();
        };
        reader.readAsArrayBuffer(file);
      });
    };

    for (const file of files) {
      await readFile(file);
    }

    if (totalRCount > 0 || totalSkipCount > 0) {
      const msg = `총 ${files.length}개 파일 복구 분석 완료:\n\n- 새로 추가된 예약: ${totalRCount}건\n- 중복/건너뜀: ${totalSkipCount}건` + (errorFiles > 0 ? `\n- 오류/빈 파일: ${errorFiles}개` : '');
      if (confirm(msg + '\n\n계속하여 저장하시겠습니까?')) {
         saveBookings(newBookings);
         alert('적용이 완료되었습니다.');
      }
    } else {
      alert('추가할 수 있는 새로운 데이터가 없습니다.');
    }
    e.target.value = '';
  };

  const titleText = isAdminMode ? '전체 학급' : currentClass;

    
  const totalBriefingResponses = activeBriefingEntries.length;
  const totalBriefingAttending = activeBriefingEntries.filter((e: any) => e.status === '참석').length;
  const totalBriefingNotAttending = activeBriefingEntries.filter((e: any) => e.status === '불참').length;
  
  const briefingStatsByClass: Record<string, { total: number, attending: number }> = {};
  if (isAdminMode) {
     activeBriefingEntries.forEach((e: any) => {
         const cls = e.className || e.key.split(' ').slice(0, 2).join(' ');
         if (!briefingStatsByClass[cls]) {
             briefingStatsByClass[cls] = { total: 0, attending: 0 };
         }
         briefingStatsByClass[cls].total++;
         if (e.status === '참석') {
             briefingStatsByClass[cls].attending++;
         }
     });
  }

  const totalConsultationResponses = activeConsultationEntries.length;
  const consultationStatsByClass: Record<string, number> = {};
  if (isAdminMode) {
      activeConsultationEntries.forEach((e: any) => {
         if (!consultationStatsByClass[e.className]) {
             consultationStatsByClass[e.className] = 0;
         }
         consultationStatsByClass[e.className]++;
      });
  }

  return (
    <section className="bg-[#0f172a] text-white rounded-2xl shadow-xl p-5 border border-slate-800 space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-1 bg-amber-500 text-amber-950 font-black text-xs rounded-lg shadow-sm">
            {isAdminMode ? '최고 관리자 모드' : '담임 교사 모드'}
          </span>
          <h3 className="text-base md:text-lg font-extrabold tracking-tight text-white">
            <span className="text-amber-400">{titleText}</span> 통합 현황판
          </h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={onChangePassword} className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-amber-950 font-black rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm">
            <Key className="w-4 h-4" /> 담임 비번 변경
          </button>
          
                    <button onClick={onExport} className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm">
            <FileSpreadsheet className="w-4 h-4" /> 명단 Excel 다운로드
          </button>
          <button onClick={onPrint} className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm">
            <Printer className="w-4 h-4" /> 상담 명단 인쇄
          </button>
          <button onClick={onExportBriefing} className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm">
            <FileSpreadsheet className="w-4 h-4" /> 설명회 Excel 다운로드
          </button>
                    <button onClick={onPrintBriefing} className="px-3.5 py-2 bg-blue-500 hover:bg-blue-600 text-white font-extrabold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm">
            <Printer className="w-4 h-4" /> 설명회 명단 인쇄
          </button>
          {isAdminMode && (
             <label className="cursor-pointer px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm">
               <Upload className="w-4 h-4" /> 다운로드한 Excel로 복구
               <input type="file" accept=".csv" multiple className="hidden" onChange={handleRestoreCSV} />
             </label>
          )}
          <button onClick={onPrint} className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm">
            <Printer className="w-4 h-4" /> 상담 명단 인쇄
          </button>
          <button onClick={onExportBriefing} className="px-3.5 py-2 bg-blue-500 hover:bg-blue-600 text-white font-extrabold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm">
            <FileSpreadsheet className="w-4 h-4" /> 설명회 명단 다운로드
          </button>

          
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-3">
            <h4 className="text-amber-400 font-bold flex items-center gap-2"><Users className="w-4 h-4"/> 1. 학부모 상담 신청 현황</h4>
            <div className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded-lg border border-slate-600">
              총 신청: <span className="text-amber-400">{totalConsultationResponses}</span>건
            </div>
          </div>
          
          {isAdminMode && Object.keys(consultationStatsByClass).length > 0 && (
            <div className="mb-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="text-xs font-bold text-slate-400 mb-2">학급별 상담 신청 현황 (건)</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(consultationStatsByClass)
                  .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }))
                  .map(([cls, count]) => (
                  <div key={cls} className="text-[11px] bg-slate-900 px-2 py-1 rounded-md border border-slate-700">
                    <span className="font-bold text-slate-300">{cls}</span> <span className="text-amber-400">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="overflow-x-auto custom-scrollbar max-h-96 border border-slate-700 rounded-lg">
            <table className="w-full text-xs text-left text-slate-300 border-collapse">
              <thead className="sticky top-0 bg-slate-900 z-10 shadow-sm">
                <tr className="text-slate-200 border-b border-slate-700 font-bold">
                  {isAdminMode && <th className="p-3 whitespace-nowrap bg-slate-800/80">학년/반</th>}
                  <th className="p-3 whitespace-nowrap bg-slate-800/80">일시</th>
                  <th className="p-3 whitespace-nowrap bg-slate-800/80">학생 이름</th>
                  <th className="p-3 whitespace-nowrap bg-slate-800/80">보호자 성함</th>
                  <th className="p-3 whitespace-nowrap bg-slate-800/80">연락처</th>
                  <th className="p-3 whitespace-nowrap bg-slate-800/80">상담 형태</th>
                  <th className="p-3 bg-slate-800/80">주요 상담 희망 분야</th>
                  <th className="p-3 text-center whitespace-nowrap bg-slate-800/80">관리</th>
                </tr>
              </thead>
              <tbody>
                {activeConsultationEntries.length === 0 ? (
                  <tr>
                    <td colSpan={isAdminMode ? 8 : 7} className="text-center py-10 text-slate-400 font-medium">
                      <FolderOpen className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      {titleText}에 등록된 학부모 상담 예약 내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  activeConsultationEntries.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/50 transition text-xs">
                      {isAdminMode && <td className="p-3 text-slate-300 font-bold whitespace-nowrap">{item.className}</td>}
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
                      <td className="p-3 text-center whitespace-nowrap">
                        <button onClick={() => onConfirmDelete(item.slotKey, item.className || currentClass)} className="px-2.5 py-1 bg-rose-600/80 hover:bg-rose-600 text-white font-bold rounded-lg transition text-[11px] flex items-center gap-1 mx-auto">
                          <Trash2 className="w-3 h-3" /> 삭제
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-3">
            <h4 className="text-indigo-400 font-bold flex items-center gap-2"><BookOpen className="w-4 h-4"/> 2. 교육과정설명회 참석 현황</h4>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 mb-3 space-y-3">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 bg-slate-800 py-2 px-3 rounded-lg border border-slate-600/50 text-center">
                <div className="text-[11px] text-slate-400 mb-0.5">총 응답자 수</div>
                <div className="text-lg font-bold text-white">{totalBriefingResponses}<span className="text-sm font-normal text-slate-500">명</span></div>
              </div>
              <div className="flex-1 bg-indigo-900/30 py-2 px-3 rounded-lg border border-indigo-700/50 text-center">
                <div className="text-[11px] text-indigo-300 mb-0.5">총 참석 희망</div>
                <div className="text-lg font-bold text-indigo-400">{totalBriefingAttending}<span className="text-sm font-normal text-indigo-500/50">명</span></div>
              </div>
              <div className="flex-1 bg-rose-900/30 py-2 px-3 rounded-lg border border-rose-700/50 text-center">
                <div className="text-[11px] text-rose-300 mb-0.5">불참</div>
                <div className="text-lg font-bold text-rose-400">{totalBriefingNotAttending}<span className="text-sm font-normal text-rose-500/50">명</span></div>
              </div>
            </div>

            {isAdminMode && Object.keys(briefingStatsByClass).length > 0 && (
              <div className="pt-2 border-t border-slate-700">
                <div className="text-xs font-bold text-slate-400 mb-2">학급별 참석 희망 현황 (참석/응답)</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(briefingStatsByClass)
                    .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }))
                    .map(([cls, stats]) => (
                    <div key={cls} className="text-[11px] bg-slate-900 px-2 py-1 rounded-md border border-slate-700">
                      <span className="font-bold text-slate-300">{cls}</span> <span className="text-indigo-400">{stats.attending}</span><span className="text-slate-500">/{stats.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="overflow-x-auto custom-scrollbar max-h-96 border border-slate-700 rounded-lg">
            <table className="w-full text-xs text-left text-slate-300 border-collapse">
              <thead className="sticky top-0 bg-slate-900 z-10 shadow-sm">
                <tr className="text-slate-200 border-b border-slate-700 font-bold">
                  <th className="p-3 whitespace-nowrap bg-slate-800/80">소속 (학년 반 번호)</th>
                  <th className="p-3 whitespace-nowrap bg-slate-800/80">학생 이름</th>
                  <th className="p-3 whitespace-nowrap bg-slate-800/80">참석 여부</th>
                </tr>
              </thead>
              <tbody>
                {activeBriefingEntries.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-10 text-slate-400 font-medium">
                      <FolderOpen className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      {titleText}에 등록된 설명회 참석 응답 내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  activeBriefingEntries.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/50 transition text-xs">
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
          </div>
        </div>
      </div>
    </section>
  );
};
