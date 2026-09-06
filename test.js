const datetime = "9월 7일 14:30 ~ 14:45";
const settings = {
  dates: [
    { date: '2026-09-07', label: '9월 7일', day: '월요일 (Mon)' }
  ],
  times: [
    '14:30 ~ 14:45'
  ]
};
const dateMatch = settings.dates.find(d => datetime.startsWith(d.label));
if (dateMatch) {
  const timePart = datetime.replace(dateMatch.label, '').trim();
  console.log(timePart);
  console.log(settings.times.includes(timePart));
}
