import React, { createContext, useContext, useState, useEffect } from 'react';
import { Booking, DEFAULT_CLASSES, DATES, TIMES } from './types';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error' | 'amber';
}

export interface AppSettings {
  consultPeriodStr: string;
  applyPeriodFullStr: string;
  applyPeriodShortStr: string;
  dates: { date: string, label: string, day: string }[];
  times: string[];
}

export const DEFAULT_SETTINGS: AppSettings = {
  consultPeriodStr: '2026. 09. 07(월) ~ 09. 11(금)',
  applyPeriodFullStr: '2026년 8월 31일(월) 09:00 ~ 9월 4일(금) 18:00 (5일간)',
  applyPeriodShortStr: '8.31(월) 09:00 ~ 9.04(금) 18:00',
  dates: DATES,
  times: TIMES
};

interface AppContextType {
  classes: string[];
  currentClass: string;
  isAdminMode: boolean;
  isTeacherMode: boolean;
  bookings: Record<string, Record<string, Booking>>;
  disabledSlots: Record<string, Record<string, boolean>>;
  teacherPasswords: Record<string, string>;
  searchQuery: string;
  toasts: ToastMessage[];
  
  mainTitle: string;
  settings: AppSettings;
  adminPw: string;
  briefingSubmissions: Record<string, any>;
  
  setCurrentClass: (cls: string) => void;
  setIsAdminMode: (val: boolean) => void;
  setIsTeacherMode: (val: boolean) => void;
  setSearchQuery: (val: string) => void;
  saveMainTitle: (val: string) => void;
  saveSettings: (settings: AppSettings) => void;
  saveAdminPw: (pw: string) => void;
  saveBriefingSubmission: (grade: string, classNum: string, studentNum: string, studentName: string, status: string) => void;
  
  addToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: number) => void;
  
  saveBookings: (newBookings: Record<string, Record<string, Booking>>) => void;
  saveDisabledSlots: (newSlots: Record<string, Record<string, boolean>>) => void;
  saveClasses: (newClasses: string[]) => void;
  saveTeacherPw: (cls: string, pw: string) => void;
}


const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [classes, setClasses] = useState<string[]>(DEFAULT_CLASSES);
  const [currentClass, setCurrentClass] = useState<string>('3학년 3반');
  const [isAdminModeState, setIsAdminModeState] = useState(false);
  const [authTeacherClasses, setAuthTeacherClasses] = useState<string[]>([]);
  
  const isAdminMode = isAdminModeState;
  const isTeacherMode = authTeacherClasses.includes(currentClass);

  const setIsAdminMode = (val: boolean) => {
    setIsAdminModeState(val);
    sessionStorage.setItem('parent_conference_admin_auth', val ? 'true' : 'false');
  };

  const setIsTeacherMode = (val: boolean) => {
    setAuthTeacherClasses(prev => {
      let next;
      if (val) {
        next = Array.from(new Set([...prev, currentClass]));
      } else {
        next = prev.filter(c => c !== currentClass);
      }
      sessionStorage.setItem('parent_conference_teacher_auth_classes', JSON.stringify(next));
      return next;
    });
  };

  const [bookings, setBookings] = useState<Record<string, Record<string, Booking>>>({});
  const [disabledSlots, setDisabledSlots] = useState<Record<string, Record<string, boolean>>>({});
  const [teacherPasswords, setTeacherPasswords] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [mainTitle, setMainTitle] = useState('2026학년도 학부모 상담주간 일정 시스템');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [adminPw, setAdminPw] = useState('admin1234');
  const [briefingSubmissions, setBriefingSubmissions] = useState<Record<string, string>>({});
  
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const loadedClasses = JSON.parse(localStorage.getItem('parent_conference_classes') || 'null') || DEFAULT_CLASSES;
    setClasses(loadedClasses);
    setCurrentClass(loadedClasses[loadedClasses.length - 1] || '3학년 3반');
    setBookings(JSON.parse(localStorage.getItem('parent_conference_bookings') || '{}'));
    setDisabledSlots(JSON.parse(localStorage.getItem('parent_conference_disabled_slots') || '{}'));
    setTeacherPasswords(JSON.parse(localStorage.getItem('parent_conference_teacher_pws') || '{}'));
    const loadedTitle = localStorage.getItem('parent_conference_main_title');
    if (loadedTitle) setMainTitle(loadedTitle);
    const loadedSettings = JSON.parse(localStorage.getItem('parent_conference_settings') || 'null');
    if (loadedSettings) setSettings({ ...DEFAULT_SETTINGS, ...loadedSettings });
    const loadedAdminPw = localStorage.getItem('parent_conference_admin_pw');
    if (loadedAdminPw) setAdminPw(loadedAdminPw);
    
    const loadedBriefing = JSON.parse(localStorage.getItem('parent_conference_briefing_submissions') || '{}');
    setBriefingSubmissions(loadedBriefing);

    const loadedAdminAuth = sessionStorage.getItem('parent_conference_admin_auth') === 'true';
    setIsAdminModeState(loadedAdminAuth);
    
    const loadedTeacherAuth = JSON.parse(sessionStorage.getItem('parent_conference_teacher_auth_classes') || '[]');
    setAuthTeacherClasses(loadedTeacherAuth);
  }, []);

  const addToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const saveBookings = (newBookings: Record<string, Record<string, Booking>>) => {
    setBookings(newBookings);
    localStorage.setItem('parent_conference_bookings', JSON.stringify(newBookings));
  };

  const saveDisabledSlots = (newSlots: Record<string, Record<string, boolean>>) => {
    setDisabledSlots(newSlots);
    localStorage.setItem('parent_conference_disabled_slots', JSON.stringify(newSlots));
  };

  const saveClasses = (newClasses: string[]) => {
    setClasses(newClasses);
    localStorage.setItem('parent_conference_classes', JSON.stringify(newClasses));
  };

  const saveTeacherPw = (cls: string, pw: string) => {
    const newPws = { ...teacherPasswords, [cls]: pw };
    setTeacherPasswords(newPws);
    localStorage.setItem('parent_conference_teacher_pws', JSON.stringify(newPws));
  };

  const saveMainTitle = (newTitle: string) => {
    setMainTitle(newTitle);
    localStorage.setItem('parent_conference_main_title', newTitle);
  };

  const saveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('parent_conference_settings', JSON.stringify(newSettings));
  };

  const saveAdminPw = (pw: string) => {
    setAdminPw(pw);
    localStorage.setItem('parent_conference_admin_pw', pw);
  };

  const saveBriefingSubmission = (grade: string, classNum: string, studentNum: string, studentName: string, status: string) => {
    const key = `${grade}학년 ${classNum}반 ${studentNum}번`;
    const newSubmissions = { ...briefingSubmissions, [key]: { studentName, status } };
    setBriefingSubmissions(newSubmissions);
    localStorage.setItem('parent_conference_briefing_submissions', JSON.stringify(newSubmissions));
  };

  return (
    <AppContext.Provider value={{
      classes, currentClass, setCurrentClass,
      isAdminMode, setIsAdminMode, isTeacherMode, setIsTeacherMode,
      bookings, saveBookings, disabledSlots, saveDisabledSlots,
      teacherPasswords, saveTeacherPw, saveClasses,
      searchQuery, setSearchQuery,
      mainTitle, saveMainTitle,
      settings, saveSettings,
      adminPw, saveAdminPw,
      briefingSubmissions, saveBriefingSubmission,
      toasts, addToast, removeToast
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};
