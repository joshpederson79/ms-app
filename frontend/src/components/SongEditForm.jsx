import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../utils/api.js';
import { errorMessage, songPayload } from '../utils/songPayload.js';
import Button from './Button.jsx';
import SongFields from './SongFields.jsx';

export default function SongEditForm({ song, users, canEditLyrics, canEditCredits, onSaved, onCancel }) {
  // No tab yet, or the current tab is band-original, means it needs a credited songwriter; covers don't.
  const writersRequired = !song.latestTab || song.latestTab.sourceType === 'original';
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: song.name,
      lead_singer_id: String(song.leadSingerId ?? ''),
      is_duet: song.isDuet,
      second_singer_id: String(song.secondSingerId ?? ''),
      status: song.status,
      songwriters: song.songwriters.map(String),
      lyrics: song.lyrics ?? '',
    },
  });
  const [serverError, setServerError] = useState('');

  const onSubmit = async (values) => {
    setServerError('');
    try {
      await api.patch(`/songs/${song.id}`, songPayload(values, { canEditLyrics, canEditCredits }));
      onSaved();
    } catch (err) {
      setServerError(errorMessage(err, 'Could not save changes.'));
    }
  };

  return (
    <form className="stack" onSubmit={handleSubmit(onSubmit)}>
      <h3>Edit song</h3>
      <SongFields
        register={register}
        watch={watch}
        errors={errors}
        users={users}
        canEditLyrics={canEditLyrics}
        canEditCredits={canEditCredits}
        writersRequired={writersRequired}
      />
      {serverError && <span className="error-text">{serverError}</span>}
      <div className="row">
        <Button type="submit" disabled={isSubmitting}>Save changes</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
