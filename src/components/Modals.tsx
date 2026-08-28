import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../store';
import { Edit, School, Phone, Shield, ClipboardCheck, Trash2, Key, UserRound, Settings, SlidersHorizontal, Share2, Copy, FileSpreadsheet, Printer, Search, HelpCircle, X, ArrowUp, ArrowDown } from 'lucide-react';
import { DATES } from '../types';
import { exportToCSV } from '../lib/utils';

// BookingModal
const BookingModal = ({ info, onClose }: any) => {
  const { currentClass, bookings, updateBookingSlot, addToast } = useAppContext();
  const [studentName, setStudentName] = useState('');
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [type, setType] = useState('방문 상담');
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !parentName || !phone || !password) {
      addToast('필수 정보를 모두 입력해 주세요.', 'error');
      return;
    }

    const slotKey = `${info.date}_${info.time}`;
    const classBookings = bookings[currentClass] || {};
    
    if (classBookings[slotKey]) {
      addToast('아쉽게도 먼저 예약 완료된 시간대입니다.', 'error');
      onClose();
      return;
    }

    updateBookingSlot(currentClass, slotKey, { studentName, parentName, phone, password, type, note, createdAt: new Date().toLocaleString('ko-KR') });
    addToast(`[${currentClass}] ${studentName} 학생 상담 신청이 완료되었습니다.`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in border border-slate-100">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-blue-600 text-white">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2"><Edit className="w-4 h-4"/> 학부모 상담 신청서 작성</h3>
            <p className="text-xs text-blue-100 mt-0.5">{currentClass} | {info.label} {info.time}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">학생 이름 <span className="text-red-500">*</span></label>
              <input type="text" value={studentName} onChange={e=>setStudentName(e.target.value)} required placeholder="예: 김민수" className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">학부모 성함 <span className="text-red-500">*</span></label>
              <input type="text" value={parentName} onChange={e=>setParentName(e.target.value)} required placeholder="예: 김철수" className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">연락처 <span className="text-red-500">*</span></label>
              <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} required placeholder="010-0000-0000" className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">취소 비밀번호 (4자리) <span className="text-red-500">*</span></label>
              <input type="password" maxLength={4} value={password} onChange={e=>setPassword(e.target.value)} required placeholder="숫자 4자리" className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">상담 희망 방식 <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 gap-2">
              <label className={`flex items-center justify-center gap-2 p-2 border rounded-xl cursor-pointer hover:bg-slate-50 transition text-xs font-bold text-slate-700 ${type === '방문 상담' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-300'}`}>
                <input type="radio" name="consultType" value="방문 상담" checked={type === '방문 상담'} onChange={() => setType('방문 상담')} className="hidden" />
                <School className="w-4 h-4 text-blue-600" /> 대면 (방문)
              </label>
              <label className={`flex items-center justify-center gap-2 p-2 border rounded-xl cursor-pointer hover:bg-slate-50 transition text-xs font-bold text-slate-700 ${type === '전화 상담' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-300'}`}>
                <input type="radio" name="consultType" value="전화 상담" checked={type === '전화 상담'} onChange={() => setType('전화 상담')} className="hidden" />
                <Phone className="w-4 h-4 text-emerald-600" /> 비대면 (전화)
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">상담 희망 내용 (선택)</label>
            <textarea value={note} onChange={e=>setNote(e.target.value)} rows={3} placeholder="자녀의 학습, 교우관계 등 남기실 말씀을 적어주세요." className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"></textarea>
          </div>
          <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-200 text-[11px] text-blue-900 flex">
            <Shield className="w-4 h-4 text-blue-600 mr-1 shrink-0" /> 입력 정보는 타인에게 [비공개] 처리되어 안전하게 보호됩니다.
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">취소</button>
            <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md">상담 신청 완료</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// DetailModal
const DetailModal = ({ info, onClose, onConfirmDelete }: any) => {
  const { currentClass, bookings, isAdminMode, isTeacherMode, removeBookingSlot, addToast } = useAppContext();
  const [cancelPw, setCancelPw] = useState('');
  
  const slotKey = `${info.date}_${info.time}`;
  const booking = (bookings[currentClass] || {})[slotKey];

  if (!booking) {
    onClose();
    return null;
  }

  const handleCancelParent = () => {
    if (!cancelPw) {
      addToast('비밀번호를 입력해 주세요.', 'error');
      return;
    }
    if (booking.password === cancelPw) {
      if (confirm('정말로 본 상담 예약을 취소하시겠습니까?')) {
        removeBookingSlot(currentClass, slotKey);
        addToast('상담 신청이 취소되었습니다.', 'success');
        onClose();
      }
    } else {
      addToast('비밀번호가 일치하지 않습니다.', 'error');
    }
  };

  const handleCancelTeacher = () => {
    if (confirm('담임/관리자 권한으로 본 예약을 삭제하시겠습니까?')) {
      removeBookingSlot(currentClass, slotKey);
      addToast('예약 정보가 정상적으로 삭제되었습니다.', 'success');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in border border-slate-100">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-800 text-white">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2"><ClipboardCheck className="w-4 h-4 text-emerald-400"/> 상담 예약 내역 확인</h3>
            <p className="text-xs text-slate-300 mt-0.5">{currentClass} | {info.label} {info.time}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            {isAdminMode || isTeacherMode ? (
              <>
                <div className="grid grid-cols-2 gap-2 text-slate-800">
                  <div><strong>학생명:</strong> {booking.studentName}</div>
                  <div><strong>학부모명:</strong> {booking.parentName}</div>
                  <div><strong>연락처:</strong> {booking.phone}</div>
                  <div><strong>상담방식:</strong> <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-bold">{booking.type}</span></div>
                </div>
                {booking.note && (
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <strong>상담 희망 내용:</strong>
                    <p className="mt-1 text-slate-600 bg-white p-2 rounded-lg border border-slate-200">{booking.note}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-slate-600 leading-relaxed">
                선택하신 시간대는 <strong>[이미 예약 완료된 시간]</strong>입니다.<br/>
                본인이 신청하신 내역을 취소하시려면 설정하셨던 비밀번호 4자리를 아래에 입력하세요.
              </p>
            )}
          </div>

          {!(isAdminMode || isTeacherMode) && (
            <div className="border-t border-slate-200 pt-4 space-y-2">
              <label className="block text-xs font-bold text-slate-700">본인 신청 취소 (비밀번호 확인)</label>
              <div className="flex gap-2">
                <input type="password" maxLength={4} value={cancelPw} onChange={e=>setCancelPw(e.target.value)} placeholder="설정한 비밀번호 4자리" className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:outline-none" />
                <button onClick={handleCancelParent} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition">신청 취소</button>
              </div>
            </div>
          )}

          {(isAdminMode || isTeacherMode) && (
            <div className="border-t border-slate-200 pt-4 flex justify-end">
              <button onClick={handleCancelTeacher} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm">
                <Trash2 className="w-4 h-4"/> 담임/관리자 권한 삭제
              </button>
            </div>
          )}
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold">닫기</button>
        </div>
      </div>
    </div>
  );
};

// TeacherAuthModal
const TeacherAuthModal = ({ onClose }: any) => {
  const { currentClass, teacherPasswords, setIsTeacherMode, setIsAdminMode, addToast } = useAppContext();
  const [pw, setPw] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expected = teacherPasswords[currentClass] || '1234';
    if (pw === expected) {
      setIsTeacherMode(true);
      setIsAdminMode(false);
      addToast(`[${currentClass}] 담임교사 모드로 인증되었습니다.`, 'success');
      onClose();
    } else {
      addToast('비밀번호가 일치하지 않습니다.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 animate-fade-in">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-amber-500 text-amber-950">
          <h3 className="font-bold text-base flex items-center gap-2"><UserRound className="w-4 h-4"/> [{currentClass}] 담임교사 인증</h3>
          <button onClick={onClose} className="text-amber-950/80 hover:text-amber-950"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">[{currentClass}] 담임교사 비밀번호</label>
            <input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="비밀번호 입력 (기본: 1234)" className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none" required />
            <p className="text-[11px] text-slate-400 mt-1">* 해당 반의 기본 비밀번호는 <code className="bg-slate-100 px-1 py-0.5 rounded text-amber-700 font-bold">1234</code> 입니다.</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">취소</button>
            <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-amber-950 font-extrabold rounded-xl text-xs">인증 완료</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// AdminAuthModal
const AdminAuthModal = ({ onClose }: any) => {
  const { setIsAdminMode, setIsTeacherMode, addToast, adminPw } = useAppContext();
  const [pw, setPw] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === adminPw) {
      setIsAdminMode(true);
      setIsTeacherMode(false);
      addToast('시스템 관리자 모드로 로그인되었습니다.', 'amber');
      onClose();
    } else {
      addToast('관리자 비밀번호가 일치하지 않습니다.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 animate-fade-in">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
          <h3 className="font-bold text-base flex items-center gap-2"><Settings className="w-4 h-4"/> 관리자 인증</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">시스템 관리자 비밀번호</label>
            <input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="비밀번호 입력" className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" required />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">취소</button>
            <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs">관리자 로그인</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ChangePwModal
const ChangePwModal = ({ onClose }: any) => {
  const { currentClass, teacherPasswords, saveTeacherPw, addToast, isAdminMode } = useAppContext();
  const [cur, setCur] = useState('');
  const [newPw, setNewPw] = useState('');
  const [conf, setConf] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expected = teacherPasswords[currentClass] || '1234';
    if (!isAdminMode && cur !== expected) {
      addToast('현재 비밀번호가 일치하지 않습니다.', 'error');
      return;
    }
    if (newPw !== conf) {
      addToast('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.', 'error');
      return;
    }
    if (newPw.length < 4) {
      addToast('비밀번호는 최소 4자리 이상이어야 합니다.', 'error');
      return;
    }
    saveTeacherPw(currentClass, newPw);
    addToast(`[${currentClass}] 담임교사 비밀번호가 변경되었습니다.`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 animate-fade-in">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-amber-500 text-amber-950">
          <h3 className="font-bold text-base flex items-center gap-2"><Key className="w-4 h-4"/> [{currentClass}] 비밀번호 변경</h3>
          <button onClick={onClose} className="text-amber-950/80 hover:text-amber-950"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {!isAdminMode && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">현재 비밀번호</label>
              <input type="password" value={cur} onChange={e=>setCur(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none" />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">새로운 비밀번호</label>
            <input type="password" value={newPw} onChange={e=>setNewPw(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">비밀번호 확인</label>
            <input type="password" value={conf} onChange={e=>setConf(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">취소</button>
            <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-amber-950 font-extrabold rounded-xl text-xs">저장</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ClassManageModal
const ClassManageModal = ({ onClose }: any) => {
  const { classes, saveClasses, setCurrentClass, addToast, saveTeacherPw } = useAppContext();
  const [newCls, setNewCls] = useState('');

  const handleAdd = () => {
    const val = newCls.trim();
    if (!val) {
      addToast('학급명을 입력해 주세요.', 'error');
      return;
    }
    if (classes.includes(val)) {
      addToast('이미 존재하는 학급입니다.', 'error');
      return;
    }
    const newClasses = [...classes, val];
    saveClasses(newClasses);
    setCurrentClass(val);
    setNewCls('');
    addToast(`${val} 학급이 추가되었습니다.`, 'success');
  };

  const handleRemove = (idx: number) => {
    const toRemove = classes[idx];
    if (confirm(`'${toRemove}' 학급을 삭제하시겠습니까? 관련 데이터는 유지되나 탭에서 사라집니다.`)) {
      const newClasses = classes.filter((_, i) => i !== idx);
      saveClasses(newClasses);
      if (newClasses.length > 0) setCurrentClass(newClasses[0]);
      addToast('학급이 삭제되었습니다.', 'info');
    }
  };

  const handleResetPw = (cls: string) => {
    if (confirm(`'${cls}' 담임교사 비밀번호를 '1234'로 초기화하시겠습니까?`)) {
      saveTeacherPw(cls, '1234');
      addToast(`'${cls}' 비밀번호가 초기화되었습니다.`, 'info');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-fade-in">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
          <h3 className="font-bold text-base flex items-center gap-2"><SlidersHorizontal className="w-4 h-4"/> 전체 학급 관리 (관리자 권한)</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex gap-2">
            <input type="text" value={newCls} onChange={e=>setNewCls(e.target.value)} placeholder="신규 학급명 (예: 3학년 4반)" className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            <button onClick={handleAdd} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition">추가</button>
          </div>
          <div className="border border-slate-200 rounded-xl p-3 max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
            {classes.map((cls, idx) => (
              <div key={cls} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs font-bold text-slate-800">{cls}</span>
                <div className="flex gap-2">
                  <button onClick={() => handleResetPw(cls)} className="text-xs text-amber-600 hover:text-amber-800 font-bold px-2 py-1 bg-amber-50 hover:bg-amber-100 rounded-lg transition">비번 초기화</button>
                  <button onClick={() => handleRemove(idx)} className="text-xs text-red-600 hover:text-red-800 font-bold px-2 py-1 bg-red-50 hover:bg-red-100 rounded-lg transition">삭제</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold">완료</button>
        </div>
      </div>
    </div>
  );
};

// ShareModal
const ShareModal = ({ onClose }: any) => {
  const { currentClass, addToast, mainTitle, settings } = useAppContext();
  
  const shareText = `[${mainTitle} - ${currentClass} 학부모 상담 신청 안내]\n\n` +
    `안녕하십니까, ${currentClass} 담임교사입니다.\n` +
    `자녀의 성장과 즐거운 학교생활을 위한 학부모 1:1 상담을 아래와 같이 실시하고자 합니다.\n\n` +
    `1. 상담 기간: ${settings.consultPeriodStr}\n` +
    `2. 상담 시간: 14:30 ~ 16:30 (15분 단위)\n` +
    `3. 신청 방법: 아래 링크에 접속하여 원하시는 시간대의 [시간 선택]을 클릭하세요.\n` +
    `4. 신청 링크: ${window.location.href}\n\n` +
    `※ 작성하신 개인정보는 타인에게 [비공개] 처리되어 보호됩니다.`;

  const copyText = () => {
    navigator.clipboard.writeText(shareText);
    addToast('안내문과 링크가 복사되었습니다!', 'success');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-fade-in">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-emerald-600 text-white">
          <h3 className="font-bold text-base flex items-center gap-2"><Share2 className="w-4 h-4"/> 학부모용 안내문 및 링크 공유</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-xs text-slate-500">아래 안내문에는 현재 페이지 링크가 자동으로 포함되어 있습니다. 복사하여 사용하세요.</p>
          <textarea value={shareText} readOnly rows={9} className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700 resize-none leading-relaxed"></textarea>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">닫기</button>
          <button onClick={copyText} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md">
            <Copy className="w-4 h-4"/> 안내문 복사
          </button>
        </div>
      </div>
    </div>
  );
};

// PrintModal
const PrintModal = ({ onClose }: any) => {
  const { bookings, currentClass, settings, addToast } = useAppContext();
  const classBookings = bookings[currentClass] || {};
  
  const entries: any[] = [];
  settings.dates.forEach(d => {
    settings.times.forEach(t => {
      const slotKey = `${d.date}_${t}`;
      if (classBookings[slotKey]) {
        entries.push({ dateLabel: d.label, time: t, ...classBookings[slotKey] });
      }
    });
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-100 animate-fade-in">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-[#1e293b] text-white no-print">
          <h3 className="font-bold text-base flex items-center gap-2"><Printer className="w-4 h-4"/> {currentClass} 상담 예약 명단 인쇄</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar" id="printArea">
          <h2 className="text-xl font-bold mb-4 print-only hidden">{currentClass} 학부모 상담 예약 명단</h2>
          <table className="w-full text-sm text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300">
                <th className="p-2 border border-slate-300">일시</th>
                <th className="p-2 border border-slate-300">학생 이름</th>
                <th className="p-2 border border-slate-300">보호자</th>
                <th className="p-2 border border-slate-300">연락처</th>
                <th className="p-2 border border-slate-300">방식</th>
                <th className="p-2 border border-slate-300">상담내용</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-slate-500">예약 내역이 없습니다.</td>
                </tr>
              ) : (
                entries.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-300">
                    <td className="p-2 border border-slate-300">{item.dateLabel} {item.time}</td>
                    <td className="p-2 border border-slate-300 font-bold">{item.studentName}</td>
                    <td className="p-2 border border-slate-300">{item.parentName}</td>
                    <td className="p-2 border border-slate-300">{item.phone}</td>
                    <td className="p-2 border border-slate-300">{item.type}</td>
                    <td className="p-2 border border-slate-300 text-xs">{item.note}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 no-print">
          <button onClick={() => exportToCSV(bookings, currentClass, settings.dates, settings.times, (msg) => addToast(msg, 'error'))} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4"/> 엑셀 저장
          </button>
          <button onClick={() => {
            if (window !== window.parent) {
              addToast('미리보기 환경에서는 보안상 인쇄가 제한됩니다. 우측 상단 "새 탭에서 열기(↗)"를 눌러주세요.', 'error');
              return;
            }
            window.print();
          }} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5">
            <Printer className="w-4 h-4"/> 인쇄하기
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-xl text-xs font-bold">닫기</button>
        </div>
      </div>
    </div>
  );
};

// LookupModal
const LookupModal = ({ onClose }: any) => {
  const { currentClass, bookings, addToast, settings } = useAppContext();
  const [name, setName] = useState('');
  const [pw, setPw] = useState('');
  const [result, setResult] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const handleLookup = () => {
    if (!name || !pw) {
      addToast('이름과 비밀번호를 모두 입력해주세요.', 'error');
      return;
    }

    const classBookings = bookings[currentClass] || {};
    const found = [];
    
    for (const d of settings.dates) {
      for (const t of settings.times) {
        const key = `${d.date}_${t}`;
        const b = classBookings[key];
        if (b && b.studentName === name && b.password === pw) {
          found.push({ date: d.label, time: t, ...b });
        }
      }
    }

    setResult(found);
    setSearched(true);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 animate-fade-in">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-700 text-white">
          <h3 className="font-bold text-base flex items-center gap-2"><Search className="w-4 h-4"/> 내 예약 조회</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">학생 성함</label>
            <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="예: 김민수" className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-slate-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">비밀번호 (4자리)</label>
            <input type="password" value={pw} onChange={e=>setPw(e.target.value)} maxLength={4} placeholder="숫자 4자리" className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-slate-500 focus:outline-none" />
          </div>
          <button onClick={handleLookup} className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs shadow-sm transition">
            조회하기
          </button>
          
          {searched && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-2">
              {result.length > 0 ? result.map((r, i) => (
                <div key={i} className="border-b border-slate-200 pb-2 mb-2 last:border-0 last:pb-0 last:mb-0">
                  <p className="font-bold text-blue-700">{r.date} {r.time}</p>
                  <p>학생: {r.studentName} | 부모: {r.parentName}</p>
                  <p>방식: {r.type}</p>
                </div>
              )) : (
                <p className="text-slate-500 text-center py-2">일치하는 예약 내역이 없습니다.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ConfirmModal
const ConfirmModal = ({ info, onClose }: any) => {
  const { currentClass, bookings, saveBookings, removeBookingSlot, disabledSlots, saveDisabledSlots, addToast } = useAppContext();

  const handleOk = () => {
    if (info.type === 'reset') {
      const newBookings = { ...bookings };
      delete newBookings[currentClass];
      saveBookings(newBookings);
      
      const newDisabled = { ...disabledSlots };
      delete newDisabled[currentClass];
      saveDisabledSlots(newDisabled);
      
      addToast(`'${currentClass}' 데이터가 성공적으로 초기화되었습니다.`, 'amber');
    } else if (info.slotKey) {
      removeBookingSlot(currentClass, info.slotKey);
      addToast('예약 내역이 삭제되었습니다.', 'success');
    } else if (info.onOk) {
      info.onOk();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 animate-fade-in">
        <div className="p-4 border-b border-slate-100 bg-slate-800 text-white">
          <h4 className="font-bold text-sm flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400"/> {info.title || '확인'}
          </h4>
        </div>
        <div className="p-5">
          <p className="text-xs text-slate-700 leading-relaxed">
            {info.type === 'reset' ? `'${currentClass}'의 모든 예약 정보 및 상담 불가 설정을 초기화하시겠습니까?` : 
             info.message || '이 상담 예약을 삭제하시겠습니까?'}
          </p>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">취소</button>
          <button onClick={handleOk} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs">확인</button>
        </div>
      </div>
    </div>
  );
};

// EditTitleModal
const EditTitleModal = ({ onClose }: any) => {
  const { mainTitle, saveMainTitle, addToast } = useAppContext();
  const [title, setTitle] = useState(mainTitle);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast('제목을 입력해 주세요.', 'error');
      return;
    }
    saveMainTitle(title.trim());
    addToast('시스템 제목이 변경되었습니다.', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 animate-fade-in">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
          <h3 className="font-bold text-base flex items-center gap-2"><Settings className="w-4 h-4"/> 메인 타이틀 수정</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">시스템 제목</label>
            <input type="text" value={title} onChange={e=>setTitle(e.target.value)} placeholder="새로운 제목 입력" className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" required />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">취소</button>
            <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs">저장</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// PeriodManageModal
const PeriodManageModal = ({ onClose }: any) => {
  const { settings, saveSettings, addToast, adminPw, saveAdminPw } = useAppContext();
  const [consultPeriod, setConsultPeriod] = useState(settings.consultPeriodStr);
  const [applyPeriodFull, setApplyPeriodFull] = useState(settings.applyPeriodFullStr);
  const [applyPeriodShort, setApplyPeriodShort] = useState(settings.applyPeriodShortStr);
  const [dates, setDates] = useState(settings.dates);
  const [times, setTimes] = useState(settings.times || []);
  const [newAdminPw, setNewAdminPw] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAdminPw && newAdminPw.trim().length > 0) {
      if (newAdminPw.trim().length < 4) {
        addToast('관리자 비밀번호는 4자리 이상이어야 합니다.', 'error');
        return;
      }
      saveAdminPw(newAdminPw.trim());
    }
    
    saveSettings({
      consultPeriodStr: consultPeriod,
      applyPeriodFullStr: applyPeriodFull,
      applyPeriodShortStr: applyPeriodShort,
      dates,
      times
    });
    addToast('시스템 설정이 저장되었습니다.', 'success');
    onClose();
  };

  const handleDateChange = (idx: number, field: string, val: string) => {
    const newDates = [...dates];
    newDates[idx] = { ...newDates[idx], [field]: val };
    setDates(newDates);
  };

  const handleTimeChange = (idx: number, val: string) => {
    const newTimes = [...times];
    newTimes[idx] = val;
    setTimes(newTimes);
  };

  const handleAddTime = () => setTimes([...times, '00:00 ~ 00:15']);
  const handleRemoveTime = (idx: number) => setTimes(times.filter((_, i) => i !== idx));

  const handleMoveTimeUp = (idx: number) => {
    if (idx === 0) return;
    const newTimes = [...times];
    [newTimes[idx - 1], newTimes[idx]] = [newTimes[idx], newTimes[idx - 1]];
    setTimes(newTimes);
  };

  const handleMoveTimeDown = (idx: number) => {
    if (idx === times.length - 1) return;
    const newTimes = [...times];
    [newTimes[idx + 1], newTimes[idx]] = [newTimes[idx], newTimes[idx + 1]];
    setTimes(newTimes);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar border border-slate-100 animate-fade-in">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white sticky top-0 z-10">
          <h3 className="font-bold text-base flex items-center gap-2"><Settings className="w-4 h-4"/> 시스템 설정 (관리자)</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-6">
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-slate-800 border-b pb-2">안내 문구 설정</h4>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">상담 주간 (예: 2026. 09. 07(월) ~ 09. 11(금))</label>
              <input type="text" value={consultPeriod} onChange={e=>setConsultPeriod(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">사전 신청 기간 [상세] (예: 2026년 8월 31일(월) 09:00 ~ 9월 4일(금) 18:00 (5일간))</label>
              <input type="text" value={applyPeriodFull} onChange={e=>setApplyPeriodFull(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">사전 신청 기간 [요약] (예: 8.31(월) 09:00 ~ 9.04(금) 18:00)</label>
              <input type="text" value={applyPeriodShort} onChange={e=>setApplyPeriodShort(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-sm text-slate-800 border-b pb-2">상담 희망 일시 선택 날짜 설정</h4>
            <p className="text-[11px] text-slate-500 mb-2">테이블 헤더와 선택 탭에 표시될 날짜입니다.</p>
            <div className="space-y-3">
              {dates.map((d, idx) => (
                <div key={idx} className="flex gap-2 items-center p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-8 text-center text-xs font-bold text-slate-500">{idx+1}일차</div>
                  <div className="flex-1">
                    <label className="block text-[10px] text-slate-500 mb-0.5">날짜 고유값 (YYYY-MM-DD)</label>
                    <input type="text" value={d.date} onChange={e=>handleDateChange(idx, 'date', e.target.value)} required className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] text-slate-500 mb-0.5">표시 라벨 (예: 9월 7일)</label>
                    <input type="text" value={d.label} onChange={e=>handleDateChange(idx, 'label', e.target.value)} required className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] text-slate-500 mb-0.5">요일 표시 (예: 월요일 (Mon))</label>
                    <input type="text" value={d.day} onChange={e=>handleDateChange(idx, 'day', e.target.value)} required className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-bold text-sm text-slate-800">상담 시간 설정</h4>
              <button type="button" onClick={handleAddTime} className="px-2 py-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg text-xs font-bold transition flex items-center gap-1">
                + 시간 추가
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mb-2">상담 예약이 가능한 시간 슬롯들입니다.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {times.map((t, idx) => (
                <div key={idx} className="flex gap-1 items-center bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                  <input type="text" value={t} onChange={e=>handleTimeChange(idx, e.target.value)} required className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs" />
                  <div className="flex flex-col">
                    <button type="button" onClick={() => handleMoveTimeUp(idx)} disabled={idx === 0} className="p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded transition disabled:opacity-30" title="위로 이동">
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button type="button" onClick={() => handleMoveTimeDown(idx)} disabled={idx === times.length - 1} className="p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded transition disabled:opacity-30" title="아래로 이동">
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                  <button type="button" onClick={() => handleRemoveTime(idx)} className="p-1.5 text-red-400 hover:bg-red-100 hover:text-red-600 rounded-lg transition ml-1" title="시간 삭제">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-bold text-sm text-slate-800 border-b pb-2">관리자 설정</h4>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">새로운 관리자 비밀번호 (변경시에만 입력)</label>
              <input type="password" value={newAdminPw} onChange={e=>setNewAdminPw(e.target.value)} placeholder="비밀번호 변경을 원하시면 입력하세요" className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 sticky bottom-0 bg-white/90 backdrop-blur-sm p-2 border-t -mx-5 -mb-5">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">취소</button>
            <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs">변경사항 저장</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const AllModals = ({ state, onClose }: { state: any, onClose: (key: string) => void }) => {
  return (
    <>
      {state.booking && <BookingModal info={state.booking} onClose={() => onClose('booking')} />}
      {state.detail && <DetailModal info={state.detail} onClose={() => onClose('detail')} />}
      {state.teacherAuth && <TeacherAuthModal onClose={() => onClose('teacherAuth')} />}
      {state.adminAuth && <AdminAuthModal onClose={() => onClose('adminAuth')} />}
      {state.changePw && <ChangePwModal onClose={() => onClose('changePw')} />}
      {state.classManage && <ClassManageModal onClose={() => onClose('classManage')} />}
      {state.share && <ShareModal onClose={() => onClose('share')} />}
      {state.print && <PrintModal onClose={() => onClose('print')} />}
      {state.lookup && <LookupModal onClose={() => onClose('lookup')} />}
      {state.editTitle && <EditTitleModal onClose={() => onClose('editTitle')} />}
      {state.periodManage && <PeriodManageModal onClose={() => onClose('periodManage')} />}
      {state.confirm && <ConfirmModal info={state.confirm} onClose={() => onClose('confirm')} />}
    </>
  );
};
