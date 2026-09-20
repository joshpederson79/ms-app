import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router-dom';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { INVITE_KEY, INVITE_NAME_KEY } from './Welcome.jsx';

export default function Signup() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { name: sessionStorage.getItem(INVITE_NAME_KEY) ?? '' }, // set by the admin on the invite code
  });
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const inviteCode = sessionStorage.getItem(INVITE_KEY);

  if (!inviteCode) return <Navigate to="/onboarding/invite" replace />;

  const onSubmit = async (values) => {
    setServerError('');
    try {
      await signup({ ...values, invite_code: inviteCode });
      sessionStorage.removeItem(INVITE_KEY);
      sessionStorage.removeItem(INVITE_NAME_KEY);
      navigate('/onboarding/success');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Could not create account.');
    }
  };

  return (
    <form className="page stack" onSubmit={handleSubmit(onSubmit)}>
      <h2>Create your account</h2>
      <Input label="Full name" {...register('name', { required: 'Name is required' })} error={errors.name?.message} />
      <Input
        label="Email"
        type="email"
        {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })}
        error={errors.email?.message}
      />
      <Input
        label="Password"
        type="password"
        {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'At least 8 characters' } })}
        error={errors.password?.message}
      />
      {serverError && <span className="error-text">{serverError}</span>}
      <Button type="submit" disabled={isSubmitting}>Create account</Button>
      <Button type="button" variant="secondary" onClick={() => navigate('/onboarding/invite')}>Cancel</Button>
    </form>
  );
}
