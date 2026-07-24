export interface Booking {
  studentName: string;
  parentName: string;
  phone: string;
  password?: string;
  type: string;
  note: string;
  createdAt: string;
}

export const DEFAULT_CLASSES = [
  '1학년 1반', '1학년 2반', '1학년 3반',
  '2학년 1반', '2학년 2반', '2학년 3반', '2학년 4반',
  '3학년 1반', '3학년 2반', '3학년 3반'
];

export const DATES = [
  { date: '2026-09-07', label: '9월 7일', day: '월요일 (Mon)' },
  { date: '2026-09-08', label: '9월 8일', day: '화요일 (Tue)' },
  { date: '2026-09-09', label: '9월 9일', day: '수요일 (Wed)' },
  { date: '2026-09-10', label: '9월 10일', day: '목요일 (Thu)' },
  { date: '2026-09-11', label: '9월 11일', day: '금요일 (Fri)' }
];

export const TIMES = [
  '14:30 ~ 14:45',
  '14:45 ~ 15:00',
  '15:00 ~ 15:15',
  '15:15 ~ 15:30',
  '15:30 ~ 15:45',
  '15:45 ~ 16:00',
  '16:00 ~ 16:15',
  '16:15 ~ 16:30'
];

export const ADMIN_PW = 'admin1234';
