import React, { useState } from 'react';
import { AppProvider, useAppContext } from './store';
import { Header } from './components/Header';
import { NoticeBoard } from './components/NoticeBoard';
import { StatsBar } from './components/StatsBar';
import { ScheduleGrid } from './components/ScheduleGrid';
import { TeacherPanel } from './components/TeacherPanel';
import { ToastContainer } from './components/Toast';
import { exportToCSV } from './lib/utils';
import * as Modals from './components/Modals';

function MainApp() {
  const { 
    classes, currentClass, setCurrentClass, 
    isAdminMode, isTeacherMode, bookings, settings, mainTitle
  } = useAppContext();

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
        
        {/* Class Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {classes.map(cls => (
            <button key={cls} onClick={() => setCurrentClass(cls)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap shadow-sm ${
                cls === currentClass 
                ? 'bg-blue-600 text-white shadow-blue-200' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}>
              {cls}
            </button>
          ))}
        </div>

        <NoticeBoard onOpenPeriodManage={() => openModal('periodManage')} />
        
        <StatsBar />

        <ScheduleGrid 
          onOpenBooking={(date, label, time) => openModal('booking', { date, label, time })}
          onOpenDetail={(date, label, time) => openModal('detail', { date, label, time })}
          onOpenPeriodManage={() => openModal('periodManage')}
        />

        {(isAdminMode || isTeacherMode) && (
          <TeacherPanel 
            onChangePassword={() => openModal('changePw')}
            onPrint={() => openModal('print')}
            onConfirmDelete={(slotKey) => openModal('confirm', { slotKey })}
            onConfirmReset={() => openModal('confirm', { type: 'reset' })}
            onExport={() => exportToCSV(bookings, currentClass, settings.dates, settings.times)}
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
