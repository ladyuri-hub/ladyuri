import React, { useState, useEffect } from 'react';
import { ClipboardCheck, AlertTriangle } from 'lucide-react';
import { AppProvider, useAppContext } from './store';
import { Header } from './components/Header';
import { NoticeBoard } from './components/NoticeBoard';
import { StatsBar } from './components/StatsBar';
import { ScheduleGrid } from './components/ScheduleGrid';
import { TeacherPanel } from './components/TeacherPanel';
import { ToastContainer } from './components/Toast';
import { exportToCSV, exportBriefingToCSV } from './lib/utils';
import * as Modals from './components/Modals';

function MainApp() {
  const { 
    classes, currentClass, setCurrentClass, 
    isAdminMode, isTeacherMode, bookings, settings, mainTitle,
    briefingSubmissions, saveBriefingSubmission, addToast
  } = useAppContext();

  // Briefing Attendance State
  const [briefingForm, setBriefingForm] = useState({
    grade: '',
    classNum: '',
    studentNum: '',
    studentName: '',
    attendance: ''
  });
  
  useEffect(() => {
    const saved = localStorage.getItem('parent_conference_briefing_form');
    if (saved) setBriefingForm(JSON.parse(saved));
  }, []);
  
  const handleBriefingChange = (field: string, value: string) => {
    const newForm = { ...briefingForm, [field]: value };
    if (field === 'grade') newForm.classNum = '';
    setBriefingForm(newForm);
    localStorage.setItem('parent_conference_briefing_form', JSON.stringify(newForm));
  };

  const handleBriefingSubmit = () => {
    if (!briefingForm.grade || !briefingForm.classNum || !briefingForm.studentNum || !briefingForm.studentName || !briefingForm.attendance) {
      addToast('학년, 반, 번호, 이름, 참석 여부를 모두 입력해주세요.', 'error');
      return;
    }
    saveBriefingSubmission(briefingForm.grade, briefingForm.classNum, briefingForm.studentNum, briefingForm.studentName, briefingForm.attendance);
    addToast('설명회 참석 여부가 저장되었습니다.', 'success');
  };

  const getClassesForGrade = (g: string) => {
    if (g === '1' || g === '3') return [1, 2, 3];
    if (g === '2') return [1, 2, 3, 4];
    return [];
  };

  // Modals state
  const [modalState, setModalState] = useState<{
    booking?: { date: string; label: string; time: string };
    detail?: { date: string; label: string; time: string };
    teacherAuth: boolean;
    adminAuth: boolean;
    changePw: boolean;
    classManage: boolean;
    share: boolean;
    print: boolean;
    lookup: boolean;
    editTitle: boolean;
    periodManage: boolean;
    confirm?: { title: string; message: string; onOk: () => void; slotKey?: string; type?: string };
  }>({
    teacherAuth: false,
    adminAuth: false,
    changePw: false,
    classManage: false,
    share: false,
    print: false,
    lookup: false,
    editTitle: false,
    periodManage: false
  });

  const openModal = (key: keyof typeof modalState, value: any = true) => {
    setModalState(prev => ({ ...prev, [key]: value }));
  };

  const closeModal = (key: keyof typeof modalState) => {
    setModalState(prev => ({ ...prev, [key]: false }));
  };

  const confirmDelete = (slotKey: string) => {
    openModal('confirm', {
      title: '예약 삭제',
      message: '이 상담 예약을 삭제하시겠습니까?',
      onOk: () => {
        const newBookings = { ...bookings };
        delete newBookings[currentClass][slotKey];
      }
    });
  };

  return (
    <div className="bg-slate-100 text-slate-800 min-h-screen pb-12 custom-scrollbar">
      <Header 
        onOpenShare={() => openModal('share')}
        onOpenLookup={() => openModal('lookup')}
        onOpenTeacherAuth={() => openModal('teacherAuth')}
        onOpenAdminAuth={() => openModal('adminAuth')}
        onOpenClassManage={() => openModal('classManage')}
        onOpenPrint={() => openModal('print')}
        onOpenEditTitle={() => openModal('editTitle')}
        onOpenPeriodManage={() => openModal('periodManage')}
      />

      <div className="max-w-7xl mx-auto px-4 mt-5 space-y-5">
        
                {/* Warning Banner for Parents */}
        {!isAdminMode && !isTeacherMode && (
          <div className="bg-red-500 border-4 border-red-600 p-6 rounded-2xl shadow-xl mb-6 animate-pulse flex flex-col items-center justify-center text-center space-y-2">
            <p className="text-white font-black text-xl md:text-3xl flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 md:w-10 md:h-10" />
              자녀의 [해당 학급] 탭을 반드시 먼저 클릭해주세요!
            </p>
            <p className="text-red-100 font-bold text-base md:text-lg">
              현재 선택된 학급은 <span className="bg-white text-red-600 px-2 py-0.5 rounded shadow-sm text-xl mx-1">{currentClass}</span> 입니다. 학급을 잘못 선택하시면 신청이 누락될 수 있습니다.
            </p>
          </div>
        )}

        {/* Class Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {(!isTeacherMode || isAdminMode) ? classes.map(cls => (
            <button key={cls} onClick={() => setCurrentClass(cls)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap shadow-sm ${
                cls === currentClass 
                ? 'bg-blue-600 text-white shadow-blue-200' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}>
              {cls}
            </button>
          )) : (
            <button
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap shadow-sm bg-blue-600 text-white shadow-blue-200 cursor-default">
              {currentClass}
            </button>
          )}
        </div>

        <NoticeBoard onOpenPeriodManage={() => openModal('periodManage')} />
        
        {(isAdminMode || isTeacherMode) && <StatsBar />}

        {/* Briefing Attendance Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/90 p-5 space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm sm:text-base">
            <ClipboardCheck className="w-4 h-4 text-indigo-600" />
            9/9(수) 15:30 ~ 16:30 교육과정설명회 참석 여부 조사
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <select 
              value={briefingForm.grade} 
              onChange={(e) => handleBriefingChange('grade', e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">학년 선택</option>
              <option value="1">1학년</option>
              <option value="2">2학년</option>
              <option value="3">3학년</option>
            </select>
            
            <select 
              value={briefingForm.classNum} 
              onChange={(e) => handleBriefingChange('classNum', e.target.value)}
              disabled={!briefingForm.grade}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400 bg-white"
            >
              <option value="">반 선택</option>
              {getClassesForGrade(briefingForm.grade).map(c => (
                <option key={c} value={String(c)}>{c}반</option>
              ))}
            </select>

            <select 
              value={briefingForm.studentNum} 
              onChange={(e) => handleBriefingChange('studentNum', e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">번호 선택</option>
              {Array.from({length: 30}, (_, i) => i + 1).map(n => (
                <option key={n} value={String(n)}>{n}번</option>
              ))}
            </select>
            
            <input 
              type="text" 
              value={briefingForm.studentName} 
              onChange={(e) => handleBriefingChange('studentName', e.target.value)}
              placeholder="학생 이름"
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white w-24"
            />

            <div className="flex items-center gap-4 ml-auto sm:ml-2 bg-white px-3 py-2 rounded-lg border border-slate-300">
              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input 
                  type="radio" 
                  name="attendance" 
                  value="참석" 
                  checked={briefingForm.attendance === '참석'} 
                  onChange={(e) => handleBriefingChange('attendance', e.target.value)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                />
                <span className="font-medium text-slate-700">참석</span>
              </label>
              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input 
                  type="radio" 
                  name="attendance" 
                  value="불참" 
                  checked={briefingForm.attendance === '불참'} 
                  onChange={(e) => handleBriefingChange('attendance', e.target.value)}
                  className="w-4 h-4 text-red-500 border-slate-300 focus:ring-red-500"
                />
                <span className="font-medium text-slate-700">불참</span>
              </label>
            </div>
            
            <button 
              type="button"
              onClick={handleBriefingSubmit}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm transition ml-auto sm:ml-0"
            >
              제출
            </button>
          </div>
        </div>

        <ScheduleGrid 
          onOpenBooking={(date, label, time) => openModal('booking', { date, label, time })}
          onOpenDetail={(date, label, time) => openModal('detail', { date, label, time })}
          onOpenPeriodManage={() => openModal('periodManage')}
        />

        {(isAdminMode || isTeacherMode) && (
          <TeacherPanel 
            onChangePassword={() => openModal('changePw')}
            onPrint={() => openModal('print')}
            onPrintBriefing={() => openModal('printBriefing')}
            onConfirmDelete={(slotKey, targetClass) => openModal('confirm', { slotKey, targetClass })}
            onConfirmReset={() => openModal('confirm', { type: 'reset' })}
            onExport={() => exportToCSV(bookings, isAdminMode ? 'all' : currentClass, settings.dates, settings.times, classes, (msg) => addToast(msg, 'error'))}
            onExportBriefing={() => exportBriefingToCSV(briefingSubmissions, isAdminMode ? 'all' : currentClass, (msg) => addToast(msg, 'error'))}
          />
        )}

        <footer className="text-center text-xs text-slate-400 py-6">
            <p>© {mainTitle} | 개인정보 보호 모드 작동 중</p>
        </footer>
      </div>

      <ToastContainer />

      {/* Render all Modals */}
      <Modals.AllModals state={modalState} onClose={closeModal} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
