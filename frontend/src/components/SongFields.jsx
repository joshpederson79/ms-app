import Input from './Input.jsx';
import Select from './Select.jsx';
import Textarea from './Textarea.jsx';
import styles from './Fields.module.css';

// Shared by Upload Song and the song edit form. Lyrics and credits are locked unless the
// current user is a song writer (canEditLyrics / canEditCredits).
export default function SongFields({ register, watch, errors, users, canEditLyrics = true, canEditCredits = true, writersRequired = true }) {
  const isDuet = watch('is_duet');

  return (
    <>
      <Input label="Song name *" {...register('name', { required: 'Song name is required' })} error={errors.name?.message} />

      <Select label="Lead singer *" {...register('lead_singer_id', { required: 'Pick a lead singer' })} error={errors.lead_singer_id?.message}>
        <option value="">Select…</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>{u.name}</option>
        ))}
      </Select>

      <label className={styles.check}>
        <input type="checkbox" {...register('is_duet')} /> Duet
      </label>

      {isDuet && (
        <Select
          label="Second singer *"
          {...register('second_singer_id', {
            validate: (value, form) =>
              (value && value !== String(form.lead_singer_id)) || 'Pick a second singer other than the lead',
          })}
          error={errors.second_singer_id?.message}
        >
          <option value="">Select…</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </Select>
      )}

      <fieldset className={styles.group}>
        <legend>Status *</legend>
        {['WIP', 'Final'].map((status) => (
          <label key={status} className={styles.check}>
            <input type="radio" value={status} {...register('status', { required: true })} /> {status}
          </label>
        ))}
      </fieldset>

      <fieldset className={styles.group} disabled={!canEditCredits}>
        <legend>
          Song writer(s) {writersRequired && '*'} {!canEditCredits && '🔒 edit by song writer only'}
          {canEditCredits && !writersRequired && <span className="muted"> (optional for covers)</span>}
        </legend>
        {users.map((u) => (
          <label key={u.id} className={styles.check}>
            <input
              type="checkbox"
              value={u.id}
              {...register(
                'songwriters',
                writersRequired
                  ? { validate: (v) => [].concat(v || []).filter(Boolean).length > 0 || 'Pick at least one song writer' }
                  : {}
              )}
            />
            {u.name}
          </label>
        ))}
        {errors.songwriters && <span className="error-text">{errors.songwriters.message}</span>}
      </fieldset>

      <Textarea
        label={canEditLyrics ? 'Lyrics' : 'Lyrics 🔒 edit by song writer only'}
        rows={8}
        disabled={!canEditLyrics}
        {...register('lyrics')}
      />
    </>
  );
}
