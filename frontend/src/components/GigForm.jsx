import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from './Button.jsx';
import Input from './Input.jsx';
import api from '../utils/api.js';
import { errorMessage } from '../utils/songPayload.js';

// Create or edit a gig. The setlist is built on the gig's detail page after saving.
export default function GigForm({ gig, onSaved, onCancel }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { venue: gig?.venue ?? '', date: gig?.date ?? '', time: gig?.time ?? '', name: gig?.name ?? '' },
  });
  const [serverError, setServerError] = useState('');

  const onSubmit = async (values) => {
    setServerError('');
    const body = {
      venue: values.venue.trim(),
      date: values.date,
      time: values.time || null,
      name: values.name.trim() || null,
    };
    try {
      const { data } = gig ? await api.patch(`/gigs/${gig.id}`, body) : await api.post('/gigs', body);
      onSaved(data);
    } catch (err) {
      setServerError(errorMessage(err, 'Could not save the gig.'));
    }
  };

  return (
    <form className="stack" onSubmit={handleSubmit(onSubmit)}>
      <h2>{gig ? 'Edit gig' : 'New gig'}</h2>
      <Input label="Venue *" {...register('venue', { required: 'Venue is required' })} error={errors.venue?.message} />
      <Input label="Date *" type="date" {...register('date', { required: 'Date is required' })} error={errors.date?.message} />
      <Input label="Time" type="time" {...register('time')} />
      <Input label="Name (optional)" placeholder="Fall Kickoff" {...register('name')} />
      {serverError && <span className="error-text">{serverError}</span>}
      <div className="row">
        <Button type="submit" disabled={isSubmitting}>Save gig</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
      {!gig && <p className="muted">You'll add songs to the setlist on the next screen.</p>}
    </form>
  );
}
