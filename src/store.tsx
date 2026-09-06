import React, { createContext, useContext, useState, useEffect } from 'react';
import { Booking, DEFAULT_CLASSES, DATES, TIMES, NoticeItem } from './types';
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
  applyPeriodFullStr: '2026년 8월 31일(월) 09:00 ~ 9월 8일(화) 17:00',
  applyPeriodShortStr: '8.31(월) 09:00 ~ 9.08(화) 17:00',
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
  notices: NoticeItem[];
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
  
  saveBriefingSubmissions: (subs: Record<string, any>) => void;
  restoreBackup: (backup: any) => Promise<void>;
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
  const [currentClassState, setCurrentClassState] = useState<string>('1학년 1반');
  const [isAdminModeState, setIsAdminModeState] = useState(false);
  const [authTeacherClasses, setAuthTeacherClasses] = useState<string[]>([]);
  
  const currentClass = currentClassState;
  const setCurrentClass = (cls: string | ((prev: string) => string)) => {
    setCurrentClassState(prev => {
      const nextClass = typeof cls === 'function' ? cls(prev) : cls;
      if (prev !== nextClass) {
        setTimeout(() => {
          setAuthTeacherClasses([]); // 다른 반 클릭 시 담임모드 즉시 해제
          sessionStorage.removeItem('parent_conference_teacher_auth_classes');
        }, 0);
      }
      return nextClass;
    });
  };
  
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
  const defaultTeacherPasswords = {
  '1학년 1반': '2601', '1학년 2반': '2602', '1학년 3반': '2603',
  '2학년 1반': '2621', '2학년 2반': '2622', '2학년 3반': '2623', '2학년 4반': '2624',
  '3학년 1반': '2631', '3학년 2반': '2632', '3학년 3반': '2633'
};
  const [teacherPasswords, setTeacherPasswords] = useState<Record<string, string>>(defaultTeacherPasswords);
  const [searchQuery, setSearchQuery] = useState('');
  const [mainTitle, setMainTitle] = useState('2026학년도 학부모 상담주간 일정 시스템');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [adminPw, setAdminPw] = useState('dnsflawnd');
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
        if (data.teacherPasswords) { setTeacherPasswords({ ...defaultTeacherPasswords, ...data.teacherPasswords }); }
        if (data.mainTitle) setMainTitle(data.mainTitle);
        if (data.settings) setSettings(data.settings);
        if (data.notices) setNotices(data.notices);
        if (data.adminPw) {
          setAdminPw(data.adminPw);
          if (data.adminPw === 'admin1234') {
            setDoc(docRef, { adminPw: 'dnsflawnd' }, { merge: true });
            setAdminPw('dnsflawnd');
          }
        }
        if (data.briefingSubmissions) setBriefingSubmissions(data.briefingSubmissions);

// AUTO BACKUP LOGIC (Hourly snapshot - Check if exists to prevent overwriting with bad data)
        const now = new Date();
        const krTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
        const dateStr = krTime.toISOString().slice(0, 13); // "2026-09-04T09"
        const backupId = `auto_${dateStr}`;
        
        // Prevent continuous overwriting within the same hour which could capture empty states
        if (typeof window !== 'undefined') {
          const lastBackup = localStorage.getItem('last_auto_backup');
          if (lastBackup !== backupId && Object.keys(data.bookings || {}).length > 0) {
            const backupRef = doc(db, 'backups', backupId);
            // We set it only once per hour on this client, and only if we have some data (bookings)
            setDoc(backupRef, { ...data, timestamp: Date.now(), label: `자동 백업 (${dateStr}시)` }, { merge: false }).then(() => {
              localStorage.setItem('last_auto_backup', backupId);
            }).catch(() => {});
          }
        }
      } else {
        // Initialize if empty
        setDoc(docRef, { classes: DEFAULT_CLASSES, mainTitle: '2026학년도 학부모 상담주간 일정 시스템', settings: DEFAULT_SETTINGS, adminPw: 'dnsflawnd' }, { merge: true });
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
    await setDoc(docRef, { bookings: { [cls]: { [slotKey]: data } } }, { merge: true });
  };

  const removeBookingSlot = async (cls: string, slotKey: string) => {
    const docRef = doc(db, 'appData', 'global');
    await setDoc(docRef, { bookings: { [cls]: { [slotKey]: deleteField() } } }, { merge: true });
  };

  const saveBookings = (newBookings: Record<string, Record<string, Booking>>) => {
    setBookings(newBookings);
    updateGlobalDoc({ bookings: newBookings });
  };

  
  const updateDisabledSlot = async (cls: string, slotKey: string, disabled: boolean) => {
    const docRef = doc(db, 'appData', 'global');
    if (disabled) {
      await setDoc(docRef, { disabledSlots: { [cls]: { [slotKey]: true } } }, { merge: true });
    } else {
      await setDoc(docRef, { disabledSlots: { [cls]: { [slotKey]: deleteField() } } }, { merge: true });
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

  
  const saveNotice = (notice: NoticeItem) => {
    const newNotices = [notice, ...notices];
    updateGlobalDoc({ notices: newNotices });
  };
  const deleteNotice = (id: string) => {
    const newNotices = notices.filter(n => n.id !== id);
    updateGlobalDoc({ notices: newNotices });
  };

  const saveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    updateGlobalDoc({ settings: newSettings });
  };

  const saveAdminPw = (pw: string) => {
    setAdminPw(pw);
    updateGlobalDoc({ adminPw: pw });
  };

  const saveBriefingSubmissions = (subs: Record<string, any>) => {
    setBriefingSubmissions(subs);
    updateGlobalDoc({ briefingSubmissions: subs });
  };

  const saveBriefingSubmission = (grade: string, classNum: string, studentNum: string, studentName: string, status: string) => {
    const key = `${grade}학년 ${classNum}반 ${studentNum}번`;
    const newSubmissions = { ...briefingSubmissions, [key]: { studentName, status } };
    setBriefingSubmissions(newSubmissions);
    updateGlobalDoc({ briefingSubmissions: newSubmissions });
  };

  
  const restoreBackup = async (backupData: any) => {
    const docRef = doc(db, 'appData', 'global');
    const updates = {
      classes: backupData.classes || DEFAULT_CLASSES,
      bookings: backupData.bookings || {},
      disabledSlots: backupData.disabledSlots || {},
      teacherPasswords: backupData.teacherPasswords || {},
      mainTitle: backupData.mainTitle || '2026학년도 학부모 상담주간 일정 시스템',
      settings: backupData.settings || DEFAULT_SETTINGS,
      adminPw: backupData.adminPw || 'dnsflawnd',
      briefingSubmissions: backupData.briefingSubmissions || {}
    };
    await setDoc(docRef, updates);
    addToast('데이터가 성공적으로 복원되었습니다. 새로고침합니다.', 'success');
    setTimeout(() => window.location.reload(), 1500);
  };

  return (
    <AppContext.Provider value={{
      classes, currentClass, setCurrentClass,
      isAdminMode, setIsAdminMode, isTeacherMode, setIsTeacherMode,
      bookings, saveBookings, updateBookingSlot, removeBookingSlot, disabledSlots, saveDisabledSlots, updateDisabledSlot,
      teacherPasswords, saveTeacherPw, saveClasses,
      searchQuery, setSearchQuery,
      mainTitle, saveMainTitle,
      settings, saveSettings, notices, saveNotice, deleteNotice,
      adminPw, saveAdminPw,
      briefingSubmissions, saveBriefingSubmission, saveBriefingSubmissions, restoreBackup,
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
