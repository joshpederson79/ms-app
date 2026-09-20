// Gig dates arrive as 'YYYY-MM-DD' and times as 'HH:MM'. Build local dates from the parts so
// the day never shifts with the viewer's timezone.
export const formatDate = (date) => {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatTime = (time) => {
  if (!time) return '';
  const [h, min] = time.split(':').map(Number);
  return new Date(2000, 0, 1, h, min).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

const pad = (n) => String(n).padStart(2, '0');

// A gig today still counts as upcoming.
export const isUpcoming = (date) => {
  const now = new Date();
  return date >= `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

export const whenLabel = (gig) => [formatDate(gig.date), formatTime(gig.time)].filter(Boolean).join(', ');
