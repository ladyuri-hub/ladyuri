import React, { createContext, useContext, useState, useEffect } from 'react';
import { Booking, DEFAULT_CLASSES, DATES, TIMES } from './types';
import { db } from './lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc, deleteField } from 'firebase/firestore';

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
  updateBookingSlot: (cls: string, slotKey: string, data: Booking) => void;
  removeBookingSlot: (cls: string, slotKey: string) => void;
  saveDisabledSlots: (newSlots: Record<string, Record<string, boolean>>) => void;
  updateDisabledSlot: (cls: string, slotKey: string, disabled: boolean) => void;
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
    const loadedAdminAuth = sessionStorage.getItem('parent_conference_admin_auth') === 'true';
    setIsAdminModeState(loadedAdminAuth);
    
    const loadedTeacherAuth = JSON.parse(sessionStorage.getItem('parent_conference_teacher_auth_classes') || '[]');
    setAuthTeacherClasses(loadedTeacherAuth);

    const docRef = doc(db, 'appData', 'global');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.classes) {
          setClasses(data.classes);
          setCurrentClass(prev => data.classes.includes(prev) ? prev : (data.classes[data.classes.length - 1] || ''));
        }
        if (data.bookings) setBookings(data.bookings);
        if (data.disabledSlots) setDisabledSlots(data.disabledSlots);
        if (data.teacherPasswords) setTeacherPasswords(data.teacherPasswords);
        if (data.mainTitle) setMainTitle(data.mainTitle);
        if (data.settings) setSettings(data.settings);
        if (data.adminPw) setAdminPw(data.adminPw);
        if (data.briefingSubmissions) setBriefingSubmissions(data.briefingSubmissions);
      } else {
        // Initialize if empty
        setDoc(docRef, {
          classes: DEFAULT_CLASSES,
          bookings: {},
          disabledSlots: {},
          teacherPasswords: {},
          mainTitle: '2026학년도 학부모 상담주간 일정 시스템',
          settings: DEFAULT_SETTINGS,
          adminPw: 'admin1234',
          briefingSubmissions: {}
        });
      }
    });

    return () => unsubscribe();
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

  const updateGlobalDoc = async (updates: any) => {
    const docRef = doc(db, 'appData', 'global');
    await setDoc(docRef, updates, { merge: true });
  };

  
  const updateBookingSlot = async (cls: string, slotKey: string, data: Booking) => {
    const docRef = doc(db, 'appData', 'global');
    await updateDoc(docRef, {
      [`bookings.${cls}.${slotKey}`]: data
    });
  };

  const removeBookingSlot = async (cls: string, slotKey: string) => {
    const docRef = doc(db, 'appData', 'global');
    // We need deleteField from firestore
    
    await updateDoc(docRef, {
      [`bookings.${cls}.${slotKey}`]: deleteField()
    });
  };

  const saveBookings = (newBookings: Record<string, Record<string, Booking>>) => {
    setBookings(newBookings);
    updateGlobalDoc({ bookings: newBookings });
  };

  
  const updateDisabledSlot = async (cls: string, slotKey: string, disabled: boolean) => {
    const docRef = doc(db, 'appData', 'global');
    if (disabled) {
      await updateDoc(docRef, {
        [`disabledSlots.${cls}.${slotKey}`]: true
      });
    } else {
      await updateDoc(docRef, {
        [`disabledSlots.${cls}.${slotKey}`]: deleteField()
      });
    }
  };

  const saveDisabledSlots = (newSlots: Record<string, Record<string, boolean>>) => {
    setDisabledSlots(newSlots);
    updateGlobalDoc({ disabledSlots: newSlots });
  };

  const saveClasses = (newClasses: string[]) => {
    setClasses(newClasses);
    updateGlobalDoc({ classes: newClasses });
  };

  const saveTeacherPw = (cls: string, pw: string) => {
    const newPws = { ...teacherPasswords, [cls]: pw };
    setTeacherPasswords(newPws);
    updateGlobalDoc({ teacherPasswords: newPws });
  };

  const saveMainTitle = (newTitle: string) => {
    setMainTitle(newTitle);
    updateGlobalDoc({ mainTitle: newTitle });
  };

  const saveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    updateGlobalDoc({ settings: newSettings });
  };

  const saveAdminPw = (pw: string) => {
    setAdminPw(pw);
    updateGlobalDoc({ adminPw: pw });
  };

  const saveBriefingSubmission = (grade: string, classNum: string, studentNum: string, studentName: string, status: string) => {
    const key = `${grade}학년 ${classNum}반 ${studentNum}번`;
    const newSubmissions = { ...briefingSubmissions, [key]: { studentName, status } };
    setBriefingSubmissions(newSubmissions);
    updateGlobalDoc({ briefingSubmissions: newSubmissions });
  };

  return (
    <AppContext.Provider value={{
      classes, currentClass, setCurrentClass,
      isAdminMode, setIsAdminMode, isTeacherMode, setIsTeacherMode,
      bookings, saveBookings, updateBookingSlot, removeBookingSlot, disabledSlots, saveDisabledSlots, updateDisabledSlot,
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
