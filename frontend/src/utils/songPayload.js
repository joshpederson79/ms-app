// Form values are strings; the API wants numbers and nulls. Empty optional fields become null.
const toInt = (value) => (value === '' || value == null || Number.isNaN(Number(value)) ? null : Number(value));
const toText = (value) => (typeof value === 'string' && value.trim() ? value.trim() : null);

export const tabPayload = (v) => ({
  chordpro: v.chordpro,
  key: toText(v.key),
  tempo: toInt(v.tempo),
  capo: toInt(v.capo),
  tuning: toText(v.tuning),
  source_type: v.source_type || 'original',
  source_url: v.source_type === 'ug_link' ? toText(v.source_url) : null,
});

// Lyrics and credits belong to the song writer; the API rejects them from anyone else,
// so leave them out of the request when the user can't edit them.
export const songPayload = (v, { canEditLyrics = true, canEditCredits = true } = {}) => {
  const body = {
    name: v.name.trim(),
    lead_singer_id: Number(v.lead_singer_id),
    is_duet: Boolean(v.is_duet),
    second_singer_id: v.is_duet ? Number(v.second_singer_id) : null,
    status: v.status,
  };
  if (canEditCredits) body.songwriters = [].concat(v.songwriters || []).filter(Boolean).map(Number);
  if (canEditLyrics) body.lyrics = v.lyrics?.trim() ? v.lyrics : null;
  return body;
};

export const errorMessage = (err, fallback) => err.response?.data?.message || fallback;
