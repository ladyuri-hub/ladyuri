import React from 'react';
import { GraduationCap, Share2, Search, UserRound, Settings, SlidersHorizontal, Download, School, Pencil } from 'lucide-react';
import { useAppContext } from '../store';

interface HeaderProps {
  onOpenShare: () => void;
  onOpenLookup: () => void;
  onOpenTeacherAuth: () => void;
  onOpenAdminAuth: () => void;
  onOpenClassManage: () => void;
  onOpenPrint: () => void;
  onOpenEditTitle: () => void;
  onOpenPeriodManage: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenShare, onOpenLookup, onOpenTeacherAuth, onOpenAdminAuth, onOpenClassManage, onOpenPrint, onOpenEditTitle, onOpenPeriodManage
}) => {
  const { 
    currentClass, 
    isAdminMode, setIsAdminMode, 
    isTeacherMode, setIsTeacherMode,
    addToast, mainTitle
  } = useAppContext();

  const handleTeacherClick = () => {
    if (isTeacherMode) {
      setIsTeacherMode(false);
      addToast('담임교사 모드가 해제되었습니다.');
    } else {
      onOpenTeacherAuth();
    }
  };

  const handleAdminClick = () => {
    if (isAdminMode) {
      setIsAdminMode(false);
      addToast('관리자 모드가 해제되었습니다.');
    } else {
      onOpenAdminAuth();
    }
  };

  return (
    <>
      <header className="bg-[#0f172a] text-white shadow-md border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-white mt-0.5">
                  {mainTitle}
                </h1>
                {isAdminMode && (
                  <button onClick={onOpenEditTitle} className="p-1 hover:bg-slate-700 rounded-md transition text-slate-300 hover:text-white" title="제목 수정">
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button onClick={onOpenShare} className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
              <Share2 className="w-4 h-4" /> 학부모용 안내문/링크 공유
            </button>
            <button onClick={onOpenLookup} className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
              <Search className="w-4 h-4" /> 내 예약 조회/변경
            </button>
            <button onClick={handleTeacherClick} className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shadow-sm ${isTeacherMode ? 'bg-amber-600 text-amber-950 ring-2 ring-amber-300' : 'bg-amber-500 hover:bg-amber-600 text-amber-950'}`}>
              <UserRound className="w-4 h-4" /> {isTeacherMode ? '담임 모드 (ON)' : '담임 모드'}
            </button>
            <button onClick={handleAdminClick} className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shadow-sm border border-indigo-400/30 ${isAdminMode ? 'bg-indigo-700 text-white ring-2 ring-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
              <Settings className="w-4 h-4" /> {isAdminMode ? '관리자 모드 (ON)' : '관리자 모드'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 mt-5 space-y-5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md border border-blue-200 flex items-center gap-1">
                <School className="w-3.5 h-3.5" /> 학급 바로가기
              </span>
              <h2 className="text-lg font-black text-slate-800">
                {currentClass} 학부모 상담 보드
              </h2>
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${isAdminMode ? 'bg-indigo-100 text-indigo-900 border-indigo-300' : isTeacherMode ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                {isAdminMode ? '전체 관리자 모드' : isTeacherMode ? '담임교사 조회 모드' : '학부모 모드'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            {isAdminMode && (
              <>
                <button onClick={onOpenPeriodManage} className="px-3.5 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-900 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-indigo-300">
                  <Settings className="w-4 h-4" /> 일정/문구 설정
                </button>
                <button onClick={onOpenClassManage} className="px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-amber-300">
                  <SlidersHorizontal className="w-4 h-4" /> 학급 추가/수정/삭제
                </button>
              </>
            )}
            {(isAdminMode || isTeacherMode) && (
              <button onClick={onOpenPrint} className="px-4 py-2 bg-[#1e293b] hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
                <Download className="w-4 h-4" /> 현재 학급용 명단 인쇄/다운로드
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
