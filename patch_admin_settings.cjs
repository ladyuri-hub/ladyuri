const fs = require('fs');
let code = fs.readFileSync('src/components/AdminSettings.tsx', 'utf8');

const backupCode = `
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { History } from 'lucide-react';

const BackupManager = () => {
  const { restoreBackup, addToast } = useAppContext();
  const [backups, setBackups] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'backups'), orderBy('timestamp', 'desc'), limit(50));
      const snap = await getDocs(q);
      const arr: any[] = [];
      snap.forEach(doc => arr.push({ id: doc.id, ...doc.data() }));
      setBackups(arr);
    } catch (e) {
      addToast('백업 목록을 불러오지 못했습니다.', 'error');
    }
    setLoading(false);
  };

  const handleOpen = () => {
    setShowModal(true);
    fetchBackups();
  };

  const handleRestore = (backup: any) => {
    if (confirm(\`정말로 [\${backup.label}] 상태로 타임머신 복구를 진행하시겠습니까? 현재 데이터는 모두 사라집니다.\`)) {
      restoreBackup(backup);
      setShowModal(false);
    }
  };

  return (
    <>
      <button onClick={handleOpen} className="w-full mt-4 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm transition flex items-center justify-center gap-2">
        <History className="w-4 h-4" /> 타임머신 백업 복구
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-fade-in flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
              <h3 className="font-bold flex items-center gap-2"><History className="w-5 h-5"/> 자동 백업 목록</h3>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
              <p className="text-xs text-slate-500 mb-4 bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-700 font-medium">데이터가 변경될 때마다 1시간 단위로 자동 저장된 백업본입니다. 클릭 시 해당 시점의 데이터로 돌아갑니다.</p>
              {loading ? (
                <div className="text-center p-4 text-sm text-slate-500">불러오는 중...</div>
              ) : backups.length === 0 ? (
                <div className="text-center p-4 text-sm text-slate-500">저장된 백업이 없습니다.</div>
              ) : (
                <div className="space-y-2">
                  {backups.map(b => (
                    <div key={b.id} className="p-3 border border-slate-200 rounded-xl flex justify-between items-center bg-slate-50">
                      <div>
                        <div className="font-bold text-sm text-slate-800">{b.label}</div>
                        <div className="text-xs text-slate-500">{new Date(b.timestamp).toLocaleString('ko-KR')}</div>
                      </div>
                      <button onClick={() => handleRestore(b)} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition">복원</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
`;

code = code.replace(/import \{ X, Plus, Trash2/g, 'import { X, Plus, Trash2, History');
code = code.replace(/import \{ db \} from '\.\.\/lib\/firebase';/, "import { db } from '../lib/firebase';\nimport { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';");

code = code.replace(/export const AdminSettings = \(\{ onClose \}: any\) => \{/, backupCode + '\nexport const AdminSettings = ({ onClose }: any) => {');

code = code.replace(/<button onClick=\{handleSave\} className="w-full mt-6 p-4 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-bold shadow-lg transition">설정 저장하기<\/button>/, '<button onClick={handleSave} className="w-full mt-6 p-4 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-bold shadow-lg transition">설정 저장하기</button>\n          <BackupManager />');

fs.writeFileSync('src/components/AdminSettings.tsx', code);
