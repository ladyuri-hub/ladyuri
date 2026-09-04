import React from 'react';
import { AlertTriangle, Megaphone, CalendarCheck2, CircleDot, CalendarDays, Clock, School, ShieldCheck, Bell, Lightbulb, RefreshCw, Pencil } from 'lucide-react';
import { useAppContext } from '../store';

interface NoticeBoardProps {
  onOpenPeriodManage: () => void;
}

export const NoticeBoard: React.FC<NoticeBoardProps> = ({ onOpenPeriodManage }) => {
  const { settings, isAdminMode } = useAppContext();
  
  const handleRefresh = () => {
    window.dispatchEvent(new Event('refresh'));
  };

  const now = new Date();
  const openTime = new Date('2026-08-31T09:00:00+09:00');
  const closeTime = new Date('2026-09-08T17:00:00+09:00');

  let statusBadge = null;
  if (now.getTime() < openTime.getTime()) {
    statusBadge = (
      <span className="px-2.5 py-1 bg-amber-500 text-white font-extrabold text-[11px] rounded-full shadow-sm flex items-center gap-1">
        <CircleDot className="w-2.5 h-2.5" /> 대기중
      </span>
    );
  } else if (now.getTime() > closeTime.getTime()) {
    statusBadge = (
      <span className="px-2.5 py-1 bg-slate-500 text-white font-extrabold text-[11px] rounded-full shadow-sm flex items-center gap-1">
        <CircleDot className="w-2.5 h-2.5" /> 완료
      </span>
    );
  } else {
    statusBadge = (
      <span className="px-2.5 py-1 bg-emerald-500 text-white font-extrabold text-[11px] rounded-full shadow-sm flex items-center gap-1">
        <CircleDot className="w-2.5 h-2.5 animate-pulse" /> 진행중
      </span>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 relative overflow-hidden flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-blue-100 text-blue-800 font-bold text-xs rounded-md flex items-center gap-1">
                <Megaphone className="w-3.5 h-3.5 text-blue-600" /> 교무부장 안내문
              </span>
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                상담 주간: {settings.consultPeriodStr}
                {isAdminMode && (
                  <button onClick={onOpenPeriodManage} className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600 transition" title="일정 수정">
                    <Pencil className="w-3 h-3" />
                  </button>
                )}
              </span>
            </div>
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 text-[11px] font-bold rounded-full">선착순 실시간 매칭</span>
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-2">
            2학기 학부모 개별 상담 희망 시간 신청 안내
          </h3>

          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 mb-3">
            <h4 className="text-rose-700 font-bold text-sm mb-1 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4"/> [안내] 상담 신청 내역 확인 요청</h4>
            <p className="text-xs text-rose-800 leading-relaxed font-medium">
              시스템 오류로 인해 일부 상담 신청 데이터가 소실되었습니다.<br/>
              번거로우시겠지만 기존에 신청하신 개인 상담 내역을 다시 한번 확인해 주시고, 신청 내역이 누락된 경우 재신청해 주시기 바랍니다.<br/>
              이에 따라 상담 신청 기간을 <strong>9월 8일(화)까지 연장</strong>하였습니다.<br/>
              이용에 불편을 드려 죄송합니다.
            </p>
          </div>


          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
              <CalendarCheck2 className="w-4 h-4 text-indigo-600" /> [사전 신청 기간] {settings.applyPeriodFullStr}
              {isAdminMode && (
                <button onClick={onOpenPeriodManage} className="p-0.5 hover:bg-indigo-200 rounded text-indigo-500 hover:text-indigo-800 transition" title="일정 수정">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
            </span>
            {statusBadge}
          </div>

          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-normal">
            학생의 가정생활 및 학교생활, 성적, 진로에 대해 대화를 나누고자 합니다. <strong>14:30부터 16:30까지 15분 단위</strong>로 진행되며 선착순 접수됩니다. 신청 정보는 타인에게 비공개 처리되며 담임교사만 확인 가능합니다.
          </p>
        </div>

        <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-1 font-semibold">
            <CalendarDays className="w-3.5 h-3.5 text-amber-500" /> 신청 기간: {settings.applyPeriodShortStr}
            {isAdminMode && (
                <button onClick={onOpenPeriodManage} className="p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-amber-600 transition ml-1" title="일정 수정">
                  <Pencil className="w-3 h-3" />
                </button>
            )}
          </span>
          <span className="flex items-center gap-1 font-semibold"><Clock className="w-3.5 h-3.5 text-blue-500" /> 상담 시간: 15분 소요</span>
          <span className="flex items-center gap-1 font-semibold"><School className="w-3.5 h-3.5 text-emerald-500" /> 상담 방식: 방문 / 전화 상담 선택</span>
          <span className="flex items-center gap-1 font-bold text-indigo-700"><ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> 개인정보 보호: 타인에게 [비공개] 처리</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" /> 실시간 변경/공지 게시판
            </h4>
          </div>

          <div className="space-y-3 text-xs text-slate-600">

            <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 p-2 rounded-lg">
              <span className="font-mono text-rose-600 font-bold whitespace-nowrap mt-0.5">긴급</span>
              <div className="leading-tight">
                <p className="font-bold text-rose-700 flex items-center gap-1 mb-1">
                  <AlertTriangle className="w-3 h-3" /> [안내] 상담 신청 내역 확인 요청
                </p>
                <p className="text-rose-800 font-medium">시스템 오류로 인해 데이터가 소실되었습니다. 기존 신청 내역을 확인해 주시고 누락된 경우 재신청해 주시기 바랍니다.</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="font-mono text-blue-600 font-bold whitespace-nowrap">09:00</span>
              <p className="leading-tight"><Megaphone className="w-3 h-3 inline text-slate-400 mr-1" /> <strong>[교무부]</strong> 학부모 상담 신청 기간: {settings.applyPeriodShortStr}</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-mono text-blue-600 font-bold whitespace-nowrap">09:30</span>
              <p className="leading-tight"><Lightbulb className="w-3 h-3 inline text-amber-500 mr-1" /> <strong>[개인정보 보호]</strong> 다른 학부모님께는 신청 내역이 [비공개] 처리되어 보호됩니다.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-emerald-600 font-semibold"><CircleDot className="w-2.5 h-2.5" /> 실시간 데이터 동기화 완료</span>
          <button onClick={handleRefresh} className="text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> 새로고침
          </button>
        </div>
      </div>
    </div>
  );
};
