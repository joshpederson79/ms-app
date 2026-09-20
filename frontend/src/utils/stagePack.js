import api from './api.js';

const COLLECTION = { gig: 'gigs', setlist: 'setlists' };

// Normalises a song (GET /songs/:id) into the same entry shape the gig/setlist stage endpoints return.
const entryFromSong = (song) => ({
  position: 1,
  songId: song.id,
  songName: song.name,
  isDuet: song.isDuet,
  leadSingerName: song.leadSingerName,
  secondSingerName: song.secondSingerName,
  tab: song.latestTab && {
    id: song.latestTab.id,
    versionNumber: song.latestTab.versionNumber,
    capo: song.latestTab.capo,
    tuning: song.latestTab.tuning,
    key: song.latestTab.key,
    tempo: song.latestTab.tempo,
    displayFormat: song.latestTab.displayFormat,
  },
});

// kind: 'song' | 'gig' | 'setlist'. Returns { title, entries }. `timeout` in ms (0 = wait as long as it takes).
export async function fetchPack(kind, id, timeout = 0) {
  if (kind === 'song') {
    const { data } = await api.get(`/songs/${id}`, { timeout });
    return { title: data.name, entries: [entryFromSong(data)] };
  }
  return (await api.get(`/${COLLECTION[kind]}/${id}/stage`, { timeout })).data;
}
