export const initials = (name = '') =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('');

// Today: just the time. Otherwise: short date and time.
export const formatMessageTime = (iso) => {
  const date = new Date(iso);
  const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return date.toDateString() === new Date().toDateString()
    ? time
    : `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, ${time}`;
};
