import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import SongFields from '../components/SongFields.jsx';
import TabFields from '../components/TabFields.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useUsers } from '../hooks/useUsers.js';
import api from '../utils/api.js';
import { errorMessage, songPayload, tabPayload } from '../utils/songPayload.js';

export default function UploadSong() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: users } = useUsers();
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { status: 'WIP', source_type: 'original', songwriters: [String(user.id)], lead_singer_id: '' },
  });
  const [serverError, setServerError] = useState('');

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const body = songPayload(values);
      // The tab is optional: a song can be saved with just lyrics and add a tab later.
      if (values.chordpro?.trim()) body.tab = tabPayload(values);
      const { data } = await api.post('/songs', body);
      navigate(`/app/songs/${data.id}`);
    } catch (err) {
      setServerError(errorMessage(err, 'Could not save the song.'));
    }
  };

  return (
    <form className="stack" onSubmit={handleSubmit(onSubmit)}>
      <h2>Upload song</h2>
      <SongFields register={register} watch={watch} errors={errors} users={users} />
      <h3>Tab</h3>
      <TabFields register={register} watch={watch} setValue={setValue} errors={errors} />
      {serverError && <span className="error-text">{serverError}</span>}
      <div className="row">
        <Button type="submit" disabled={isSubmitting}>Save song</Button>
        <Button type="button" variant="secondary" onClick={() => navigate('/app/songs')}>Cancel</Button>
      </div>
    </form>
  );
}
