// "Save for offline": stage-view packs (a gig's or setlist's songs with their tabs) kept in localStorage.
// Tabs are small text, so a whole setlist is a few KB; localStorage's ~5MB is plenty.
const STORE_KEY = 'ms_offline_packs';

const readAll = () => {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) ?? {};
  } catch {
    return {};
  }
};

const key = (kind, id) => `${kind}:${id}`;

// Returns { savedAt, pack } or null.
export const getPack = (kind, id) => readAll()[key(kind, id)] ?? null;

// Throws if storage is full or blocked (e.g. private browsing); callers show a message.
export const savePack = (kind, id, pack) => {
  const all = readAll();
  all[key(kind, id)] = { savedAt: new Date().toISOString(), pack };
  localStorage.setItem(STORE_KEY, JSON.stringify(all));
};

export const removePack = (kind, id) => {
  const all = readAll();
  delete all[key(kind, id)];
  localStorage.setItem(STORE_KEY, JSON.stringify(all));
};

export const listPacks = (kind) =>
  Object.entries(readAll())
    .filter(([k]) => k.startsWith(`${kind}:`))
    .map(([k, value]) => ({ id: k.split(':')[1], title: value.pack.title, savedAt: value.savedAt, count: value.pack.entries.length }));
