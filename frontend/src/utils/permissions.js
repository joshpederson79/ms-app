// UI-only gating; the API enforces the same rules. Admins can do everything a gig lead can.
export const canManageGigs = (user) => Boolean(user && (user.isAdmin || user.role === 'gig_lead'));

export const ROLE_LABELS = { member: 'Band Member', gig_lead: 'Gig Lead', songwriter: 'Song Writer' };
