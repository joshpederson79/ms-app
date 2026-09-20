import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../utils/api.js';
import { errorMessage, tabPayload } from '../utils/songPayload.js';
import Button from './Button.jsx';
import TabFields from './TabFields.jsx';

// mode 'edit': minor edit, updates the tab in place. mode 'new': saves a new major version.
export default function TabEditForm({ mode, songId, tab, onSaved, onCancel }) {
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      chordpro: tab?.chordpro ?? '',
      key: tab?.key ?? '',
      tempo: tab?.tempo ?? '',
      capo: tab?.capo ?? '',
      tuning: tab?.tuning ?? '',
      source_type: tab?.sourceType ?? 'original',
      source_url: tab?.sourceUrl ?? '',
    },
  });
  const [serverError, setServerError] = useState('');

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const body = tabPayload(values);
      if (mode === 'edit') await api.patch(`/tabs/${tab.id}`, body);
      else await api.post(`/songs/${songId}/tabs`, body);
      onSaved();
    } catch (err) {
      setServerError(errorMessage(err, 'Could not save the tab.'));
    }
  };

  const isEdit = mode === 'edit';
  return (
    <form className="stack" onSubmit={handleSubmit(onSubmit)}>
      <h3>{isEdit ? 'Edit chords & details' : tab ? 'Upload new version' : 'Add tab'}</h3>
      <p className="muted">
        {isEdit
          ? 'Changes save in place and do not create a new version.'
          : 'Saving creates a new major version; earlier versions stay in the history.'}
      </p>
      <TabFields register={register} watch={watch} setValue={setValue} errors={errors} chordproRequired />
      {serverError && <span className="error-text">{serverError}</span>}
      <div className="row">
        <Button type="submit" disabled={isSubmitting}>{isEdit ? 'Save changes' : 'Save version'}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
