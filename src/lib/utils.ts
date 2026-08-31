export function exportToCSV(bookings: Record<string, Record<string, any>>, targetClass: string, DATES: any[], TIMES: string[], classes: string[], onError?: (msg: string) => void) {
    const entries: any[] = [];
    const targetClasses = targetClass === 'all' ? classes : [targetClass];

    targetClasses.forEach(cls => {
        const classBookings = bookings[cls] || {};
        DATES.forEach(d => {
            TIMES.forEach(t => {
                const slotKey = `${d.date}_${t}`;
                if (classBookings[slotKey]) {
                    entries.push({
                        className: cls,
                        dateLabel: d.label,
                        time: t,
                        slotKey,
                        ...classBookings[slotKey]
                    });
                }
            });
        });
    });

    if (entries.length === 0) {
        if (onError) onError('다운로드할 데이터가 없습니다.');
        else alert('다운로드할 데이터가 없습니다.');
        return;
    }

    if (window !== window.parent) {
        if (onError) onError('미리보기 환경에서는 보안상 다운로드가 제한됩니다. 우측 상단 "새 탭에서 열기(↗)"를 눌러주세요.');
        return;
    }

    let csvContent = "소속(학년/반),일시,학생 이름,보호자 성함,연락처,상담 형태,주요 상담 희망 분야\r\n";
    entries.forEach(item => {
        const row = [
            `"${item.className}"`,
            `"${item.dateLabel} ${item.time}"`,
            `"${item.studentName}"`,
            `"${item.parentName}"`,
            `"${item.phone}"`,
            `"${item.type}"`,
            `"${item.note || ''}"`
        ];
        csvContent += row.join(",") + "\r\n";
    });

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${targetClass === 'all' ? '전체학급' : targetClass}_학부모상담신청현황.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function exportBriefingToCSV(briefingSubmissions: Record<string, any>, targetClass: string, onError?: (msg: string) => void) {
    let entries = Object.entries(briefingSubmissions);
    
    if (targetClass !== 'all') {
        entries = entries.filter(([key]) => key.startsWith(targetClass));
    }

    if (entries.length === 0) {
        if (onError) onError('다운로드할 교육과정설명회 데이터가 없습니다.');
        else alert('다운로드할 교육과정설명회 데이터가 없습니다.');
        return;
    }
    
    if (window !== window.parent) {
        if (onError) onError('미리보기 환경에서는 보안상 다운로드가 제한됩니다. 우측 상단 "새 탭에서 열기(↗)"를 눌러주세요.');
        return;
    }
    
    // Sort by Grade, Class, Number
    entries.sort((a, b) => {
        const keyA = a[0];
        const keyB = b[0];
        return keyA.localeCompare(keyB, undefined, { numeric: true, sensitivity: 'base' });
    });

    let csvContent = "소속(학년 반 번호),학생 이름,참석 여부\r\n";
    entries.forEach(([studentInfo, data]) => {
        const status = typeof data === 'string' ? data : data.status;
        const studentName = typeof data === 'string' ? '' : (data.studentName || '');
        
        const row = [
            `"${studentInfo}"`,
            `"${studentName}"`,
            `"${status}"`
        ];
        csvContent += row.join(",") + "\r\n";
    });

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${targetClass === 'all' ? '전체학급' : targetClass}_교육과정설명회참석명단.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
