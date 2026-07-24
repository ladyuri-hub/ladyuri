export function exportToCSV(bookings: Record<string, Record<string, any>>, currentClass: string, DATES: any[], TIMES: string[]) {
    const classBookings = bookings[currentClass] || {};
    const entries = [];

    DATES.forEach(d => {
        TIMES.forEach(t => {
            const slotKey = `${d.date}_${t}`;
            if (classBookings[slotKey]) {
                entries.push({
                    dateLabel: d.label,
                    time: t,
                    slotKey,
                    ...classBookings[slotKey]
                });
            }
        });
    });

    if (entries.length === 0) {
        alert('다운로드할 데이터가 없습니다.');
        return;
    }

    let csvContent = "일시,학생 이름,학년/반,보호자 성함,연락처,상담 형태,주요 상담 희망 분야\n";
    entries.forEach(item => {
        const row = [
            `"${item.dateLabel} ${item.time}"`,
            `"${item.studentName}"`,
            `"${currentClass}"`,
            `"${item.parentName}"`,
            `"${item.phone}"`,
            `"${item.type}"`,
            `"${item.note ? item.note.replace(/"/g, '""').replace(/\n/g, ' ') : ''}"`
        ];
        csvContent += row.join(",") + "\n";
    });

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${currentClass}_학부모상담명단.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
